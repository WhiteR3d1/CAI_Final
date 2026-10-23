import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { defaultSave } from '../src/game/progress.ts'
import { SaveQueue, type Draft } from '../src/auth/sync.ts'

type Cell = string | number | boolean
class Sheet {
  rows: Cell[][] = []
  appendRow(row: Cell[]) { this.rows.push([...row]) }
  setFrozenRows() {}
  getLastRow() { return this.rows.length }
  deleteRow(row: number) { this.rows.splice(row - 1, 1) }
  getRange(row: number, col: number, height: number, width: number) {
    return {
      getValues: () => Array.from({ length: height }, (_, i) => Array.from({ length: width }, (_, j) => this.rows[row + i - 1]?.[col + j - 1] ?? '')),
      setNumberFormat: () => {},
      setValues: (values: Cell[][]) => { values.forEach((r, i) => { this.rows[row + i - 1] ??= []; r.forEach((v, j) => { this.rows[row + i - 1][col + j - 1] = v }) }) },
    }
  }
}
interface Result { ok: boolean; error?: string; data: { token?: string; user?: { uid: string }; revision?: number; snapshot?: { revision: number; save: ReturnType<typeof defaultSave> | null } } }
function backend() {
  const sheets = new Map<string, Sheet>(), cache = new Map<string, string>()
  const properties: Record<string, string> = {}
  const context = vm.createContext({
    console: { warn() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => properties[k], setProperty: (k: string, v: string) => { properties[k] = v } }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: (n: string) => sheets.get(n), insertSheet: (n: string) => { const s = new Sheet(); sheets.set(n, s); return s } }) },
    CacheService: { getScriptCache: () => ({ get: (k: string) => cache.get(k), put: (k: string, v: string) => cache.set(k, v), remove: (k: string) => cache.delete(k) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, hasLock: () => true, releaseLock() {} }) },
    Utilities: {
      getUuid: randomUUID, DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (_: string, text: string) => [...createHash('sha256').update(text).digest()],
      computeHmacSha256Signature: (text: string, key: string) => [...createHmac('sha256', key).update(text).digest()],
      base64EncodeWebSafe: (bytes: number[]) => Buffer.from(bytes).toString('base64url'),
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text: string) => ({ setMimeType: () => text }) },
  })
  // Run the exact GAS vendor build without Node crypto/timers, like the Apps Script V8 runtime.
  vm.runInContext(readFileSync(new URL('../apps-script/Bcrypt.gs', import.meta.url), 'utf8'), context)
  vm.runInContext(readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8'), context)
  vm.runInContext('setupBootBloom()', context)
  const post = (body: Record<string, unknown>): Result => {
    context.request = { postData: { contents: JSON.stringify(body) } }
    return JSON.parse(vm.runInContext('doPost(request)', context))
  }
  return { post, sheets, cache, properties, configure: (enabled: boolean) => { context.enabled = enabled; vm.runInContext('BB_CONFIG.ALLOW_REGISTRATION = enabled', context) }, setup: () => vm.runInContext('setupBootBloom()', context) }
}

test('setup creates and preserves its private secret without manually entered properties', () => {
  const { properties, setup } = backend()
  const secret = properties.BB_SESSION_SECRET_V2
  assert.equal(secret.length, 64)
  setup()
  assert.equal(properties.BB_SESSION_SECRET_V2, secret)
})

test('Sheets auth: bcrypt, wrong passwords, lockout, isolated saves, replay, conflict, logout', () => {
  const { post, sheets } = backend()
  const a = post({ action: 'register', username: 'student01', name: '=IMPORTXML("x")', password: 'a-strong-password' })
  const b = post({ action: 'register', username: 'student02', name: 'B', password: 'another-password' })
  assert.equal(a.ok, true); assert.equal(b.ok, true)
  const rows = sheets.get('BB_Accounts')!.rows
  assert.match(String(rows[1][2]), /^\$2b\$12\$/)
  assert.notEqual(rows[1][2], 'a-strong-password')
  assert.ok(String(rows[1][4]).startsWith("'="))
  assert.equal(post({ action: 'login', username: 'student01', password: 'wrong-password' }).error, 'AUTH')
  assert.equal(post({ action: 'login', username: 'student01', password: 'a-strong-password' }).ok, true)
  const save = { ...defaultSave(), coins: 42 }
  const request = { action: 'save', token: a.data.token, userId: b.data.user!.uid, revision: 0, requestId: randomUUID(), save }
  assert.equal(post(request).data.revision, 1)
  assert.equal(post(request).data.revision, 1, 'same request after lost response is idempotent')
  assert.equal(post({ ...request, requestId: randomUUID() }).error, 'CONFLICT')
  assert.equal(post({ action: 'load', token: b.data.token, userId: a.data.user!.uid }).data.snapshot!.save, null)
  assert.equal(post({ action: 'load', token: a.data.token }).data.snapshot!.save!.coins, 42)
  assert.equal(post({ action: 'load' }).error, 'AUTH')
  assert.equal(post({ ...request, revision: 1, requestId: randomUUID(), save: { ...save, coins: -1 } }).error, 'INVALID')
  for (let i = 0; i < 5; i++) assert.equal(post({ action: 'login', username: 'student02', password: 'wrong-password' }).error, 'AUTH')
  assert.equal(post({ action: 'login', username: 'student02', password: 'another-password' }).error, 'AUTH')
  assert.equal(post({ action: 'logout', token: a.data.token }).ok, true)
  assert.equal(post({ action: 'load', token: a.data.token }).error, 'AUTH')
  sheets.get('BB_Sessions')!.rows.find(r => r[1] === b.data.user!.uid)![2] = 1
  assert.equal(post({ action: 'load', token: b.data.token }).error, 'AUTH')
})

test('Sheets rejects oversized/invalid saves and disabled accounts; JSON chunks round trip safely', () => {
  const { post, sheets } = backend()
  const a = post({ action: 'register', username: 'large-test', name: 'Test', password: 'long-enough-pass' })
  const save = defaultSave()
  for (let i = 0; i < 1100; i++) save.inventory[`item-${i}-${'x'.repeat(24)}`] = 1
  const request = { action: 'save', token: a.data.token, revision: 0, requestId: randomUUID(), save }
  assert.equal(post(request).ok, true)
  assert.deepEqual(post({ action: 'load', token: a.data.token }).data.snapshot!.save, save)
  assert.ok(sheets.get('BB_Saves')!.rows[1].slice(8).every(c => String(c).startsWith('j:')))
  assert.equal(post({ ...request, save: { ...save, inventory: { ['x'.repeat(120000)]: 1 } } }).error, 'SIZE')
  sheets.get('BB_Accounts')!.rows[1][7] = true
  assert.equal(post({ action: 'load', token: a.data.token }).error, 'AUTH')
})

test('registration switch, password byte limit, and auth rate limit fail closed', () => {
  const { post, configure } = backend()
  assert.equal(post({ action: 'register', username: 'test-user', name: 'Test', password: 'ก'.repeat(30) }).error, 'PASSWORD')
  configure(false)
  assert.equal(post({ action: 'register', username: 'test-user', name: 'Test', password: 'strong-password' }).error, 'CLOSED')
  for (let i = 0; i < 8; i++) post({ action: 'login', username: 'unknown', password: 'wrong-password' })
  assert.equal(post({ action: 'login', username: 'unknown', password: 'wrong-password' }).error, 'RATE')
  assert.equal(post({ action: 'googleChallenge', origin: 'https://evil.example' }).error, 'AUTH')
})

test('queue serializes saves and sends newest pending state after the active write', async () => {
  const sent: Draft[] = [], resolves: ((value: { revision: number }) => void)[] = []
  let cached: Draft | null = null
  const queue = new SaveQueue(0, d => { sent.push(d); return new Promise(r => resolves.push(r)) }, d => { cached = d }, () => {})
  queue.enqueue(defaultSave()); const flush = queue.flush()
  queue.enqueue({ ...defaultSave(), coins: 1 }); queue.enqueue({ ...defaultSave(), coins: 2 })
  assert.equal(sent.length, 1)
  resolves[0]({ revision: 1 }); await Promise.resolve(); await Promise.resolve()
  assert.equal(sent.length, 2); assert.equal(sent[1].revision, 1); assert.equal(sent[1].save.coins, 2)
  resolves[1]({ revision: 2 }); await flush
  assert.equal(queue.status, 'saved'); assert.equal(cached, null); queue.dispose()
})

test('queue retains exact operation for retry and stops on revision conflict', async () => {
  const sent: Draft[] = []; let attempt = 0
  const queue = new SaveQueue(5, async d => { sent.push(d); if (++attempt === 1) throw new Error('NETWORK'); return { revision: 6 } }, () => {}, () => {})
  queue.enqueue(defaultSave()); await queue.flush(); assert.equal(queue.status, 'error')
  await queue.flush(); assert.deepEqual(sent[0], sent[1]); assert.equal(queue.status, 'saved'); queue.dispose()
  let calls = 0
  const conflict = new SaveQueue(1, async () => { calls++; throw new Error('CONFLICT') }, () => {}, () => {})
  conflict.enqueue(defaultSave()); await conflict.flush(); conflict.enqueue({ ...defaultSave(), coins: 9 }); await conflict.flush()
  assert.equal(conflict.status, 'conflict'); assert.equal(calls, 1); conflict.dispose()
})

test('disposing an account queue never sends its pending state after logout', async () => {
  let done!: (r: { revision: number }) => void; let calls = 0
  const queue = new SaveQueue(0, () => { calls++; return new Promise(resolve => { done = resolve }) }, () => {}, () => {})
  queue.enqueue(defaultSave()); const running = queue.flush()
  queue.enqueue({ ...defaultSave(), coins: 4 }); queue.dispose(); done({ revision: 1 }); await running
  assert.equal(calls, 1)
})
