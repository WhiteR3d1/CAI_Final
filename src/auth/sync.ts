import type { SaveData } from '../game/types.ts'

export interface Draft { revision: number; save: SaveData; requestId: string }
export type SyncStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict'
// Each instance belongs to one authenticated session. The sender closes over that token.
export class SaveQueue {
  revision: number
  status: SyncStatus = 'saved'
  error: unknown
  private pending?: SaveData
  private active?: Draft
  private running?: Promise<void>
  private timer?: ReturnType<typeof setTimeout>
  private disposed = false
  private send: (draft: Draft) => Promise<{ revision: number }>
  private persist: (draft: Draft | null) => void
  private changed: () => void
  constructor(revision: number, send: (draft: Draft) => Promise<{ revision: number }>, persist: (draft: Draft | null) => void, changed: () => void, draft?: Draft) {
    this.send = send; this.persist = persist; this.changed = changed
    this.revision = revision
    if (draft) { this.active = draft; this.status = 'pending' }
  }
  enqueue(save: SaveData) {
    if (this.disposed) return
    this.pending = save
    this.persist({ revision: this.active?.revision ?? this.revision, requestId: this.active?.requestId ?? crypto.randomUUID(), save })
    if (this.status !== 'conflict' && this.status !== 'error') {
      this.status = 'pending'
      clearTimeout(this.timer)
      this.timer = setTimeout(() => { void this.flush() }, 1000)
    }
    this.changed()
  }
  flush(): Promise<void> {
    clearTimeout(this.timer)
    if (this.running) return this.running
    if (this.disposed || this.status === 'conflict') return Promise.resolve()
    this.running = this.drain().finally(() => { this.running = undefined })
    return this.running
  }
  private async drain() {
    while (!this.disposed && (this.active || this.pending)) {
      if (!this.active) {
        this.active = { revision: this.revision, save: this.pending!, requestId: crypto.randomUUID() }; this.pending = undefined
        this.persist(this.active)
      }
      this.status = 'saving'; this.error = undefined; this.changed()
      try {
        const result = await this.send(this.active)
        this.revision = result.revision; this.active = undefined
        if (this.disposed) return
        if (this.pending) this.persist({ revision: this.revision, requestId: crypto.randomUUID(), save: this.pending })
        else { this.persist(null); this.status = 'saved'; this.changed() }
      } catch (e) {
        if (this.disposed) return
        this.error = e
        this.status = e instanceof Error && e.message === 'CONFLICT' ? 'conflict' : 'error'
        this.changed(); return
      }
    }
  }
  dispose() { this.disposed = true; clearTimeout(this.timer) }
}
