/* Boot & Bloom API. Merge doGet/doPost with existing handlers before deployment.
 * Requires Bcrypt.gs (bcryptjs 3.0.3), V8. Run setupBootBloom once; no manual Script Properties needed.
 * No password, session, or raw request may be logged.
 */
// Edit these settings here, then deploy a new version. Never put secrets in source.
var BB_CONFIG = {
  SHEET_ID: '1Jr1oHNkKg3kCP171JEqd6BRlDig6KRDoPDRAI3rgXrA',
  ALLOW_REGISTRATION: true,
  // Admins may open the teacher console AND change other accounts' roles. Accounts listed here are
  // always admin and cannot be demoted from the web, so at least one name keeps the console reachable.
  ADMINS: [],
  // Default role for accounts that have no role in the sheet yet. An admin can override it from the web.
  TEACHERS: []
};
// 'role' is an optional 11th column of BB_Accounts added by setupBootBloom. The header check below
// only reads the first ten columns, so an older sheet without it keeps working (everyone is a student).
var BB_ROLE_COL = 11;
var BB_ROLES = ['student', 'teacher', 'admin'];
var BB_SCHEMA = {
  BB_Accounts: ['uid', 'username', 'passwordHash', 'googleSub', 'name', 'email', 'createdAt', 'disabled', 'failures', 'lockedUntil'],
  BB_Sessions: ['tokenHash', 'uid', 'expiresAt'],
  BB_Saves: ['uid', 'revision', 'updatedAt', 'coins', 'completedJobs', 'stars', 'requestId', 'digest', 'json1', 'json2', 'json3', 'json4']
};
function bbConfig_() {
  var secret = PropertiesService.getScriptProperties().getProperty('BB_SESSION_SECRET_V2');
  if (!secret || secret.length < 43) bbFail_('SETUP');
  return { SHEET_ID: BB_CONFIG.SHEET_ID, ALLOW_REGISTRATION: BB_CONFIG.ALLOW_REGISTRATION, SESSION_SECRET: secret };
}
function bbBook_() {
  return SpreadsheetApp.openById(bbConfig_().SHEET_ID || '1Jr1oHNkKg3kCP171JEqd6BRlDig6KRDoPDRAI3rgXrA');
}
function setupBootBloom() {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var properties = PropertiesService.getScriptProperties();
    if (!properties.getProperty('BB_SESSION_SECRET_V2')) {
      properties.setProperty('BB_SESSION_SECRET_V2', Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''));
    }
    bbSetupTables_();
  } finally { lock.releaseLock(); }
}
function bbSetupTables_() {
  var book = bbBook_();
  Object.keys(BB_SCHEMA).forEach(function (name) {
    var sheet = book.getSheetByName(name);
    if (!sheet) { sheet = book.insertSheet(name); sheet.appendRow(BB_SCHEMA[name]); sheet.setFrozenRows(1); }
    bbTable_(name);
  });
  // Adds the optional role column. Existing rows stay empty, which reads as 'student'.
  if (!bbHasRoles_()) bbTable_('BB_Accounts').getRange(1, BB_ROLE_COL).setValue('role');
}
function bbTable_(name) {
  var sheet = bbBook_().getSheetByName(name);
  if (!sheet || JSON.stringify(sheet.getRange(1, 1, 1, BB_SCHEMA[name].length).getValues()[0]) !== JSON.stringify(BB_SCHEMA[name])) bbFail_('SETUP');
  return sheet;
}
function bbRows_(name, width) {
  var s = bbTable_(name);
  width = width || BB_SCHEMA[name].length;
  return s.getLastRow() < 2 ? [] : s.getRange(2, 1, s.getLastRow() - 1, width).getValues();
}
/** true once setupBootBloom has added the optional 'role' column */
function bbHasRoles_() {
  var s = bbTable_('BB_Accounts');
  return s.getLastColumn() >= BB_ROLE_COL && String(s.getRange(1, BB_ROLE_COL).getValue()).trim() === 'role';
}
/** account rows including the role column when the sheet has one */
function bbAccounts_() {
  return bbRows_('BB_Accounts', bbHasRoles_() ? BB_ROLE_COL : BB_SCHEMA.BB_Accounts.length);
}
function bbFail_(code) { var e = new Error(code); e.bbCode = code; throw e; }
function bbJSON_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function doGet() {
  try {
    var p = bbConfig_();
    Object.keys(BB_SCHEMA).forEach(bbTable_);
    return bbJSON_({ protocol: 'boot-bloom-v1', ok: true, data: {
      registration: p.ALLOW_REGISTRATION === true
    }});
  } catch (e) { return bbJSON_({ protocol: 'boot-bloom-v1', ok: false, error: 'SETUP' }); }
}
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || e.postData.contents.length > 150000) bbFail_('INVALID');
    var q = JSON.parse(e.postData.contents);
    if (!q || typeof q !== 'object' || Array.isArray(q)) bbFail_('INVALID');
    bbConfig_();
    if (!lock.tryLock(10000)) bbFail_('BUSY');
    var data = bbDispatch_(q);
    return bbJSON_({ protocol: 'boot-bloom-v1', ok: true, data: data });
  } catch (e) {
    return bbJSON_({ protocol: 'boot-bloom-v1', ok: false, error: e.bbCode || 'SERVER' });
  } finally { if (lock.hasLock()) lock.releaseLock(); }
}
function bbDigest_(text) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8));
}
function bbToken_() {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(Utilities.getUuid() + Utilities.getUuid() + Date.now(), bbConfig_().SESSION_SECRET));
}
function bbText_(text, max) {
  if (typeof text !== 'string' || !text.trim() || text.length > max || /[\x00-\x1f]/.test(text)) bbFail_('INVALID');
  return text.trim();
}
function bbCell_(text) { return /^[=+\-@']/.test(text) ? "'" + text : text; }
function bbUsername_(text) {
  text = bbText_(text, 32).toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(text)) bbFail_('INVALID');
  return text;
}
function bbPassword_(p) {
  if (typeof p !== 'string' || p.length < 10 || bcrypt.truncates(p)) bbFail_('PASSWORD');
  return p;
}
function bbHashPassword_(p) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid()).slice(0, 16).map(function (n) { return n & 255; });
  return bcrypt.hashSync(bbPassword_(p), '$2b$12$' + bcrypt.encodeBase64(bytes, 16));
}
function bbLimit_(key, max, seconds) {
  var cache = CacheService.getScriptCache(), k = 'bb-rate-' + bbDigest_(key), n = Number(cache.get(k) || 0);
  if (n >= max) bbFail_('RATE');
  cache.put(k, String(n + 1), seconds);
}
function bbList_(value) {
  return (Array.isArray(value) ? value : [])
    .filter(function (u) { return typeof u === 'string' && u.trim(); })
    .map(function (u) { return u.trim().toLowerCase(); });
}
/** admins named in Code.gs are fixed: the web may not demote them, so nobody can lock the console out */
function bbFixedAdmin_(a) { return bbList_(BB_CONFIG.ADMINS).indexOf(String(a[1]).toLowerCase()) >= 0; }
/**
 * Code.gs admins win over everything; otherwise the sheet's role column decides; TEACHERS in Code.gs
 * is only the default for accounts an admin has not set a role for yet.
 */
function bbRoleOf_(a) {
  if (bbFixedAdmin_(a)) return 'admin';
  var stored = String(a[BB_ROLE_COL - 1] || '').trim().toLowerCase();
  if (BB_ROLES.indexOf(stored) >= 0) return stored;
  return bbList_(BB_CONFIG.TEACHERS).indexOf(String(a[1]).toLowerCase()) >= 0 ? 'teacher' : 'student';
}
function bbCanTeach_(a) { var r = bbRoleOf_(a); return r === 'teacher' || r === 'admin'; }
function bbPublic_(a) {
  var role = bbRoleOf_(a);
  return { uid: a[0], name: a[4], username: a[1], role: role, teacher: role !== 'student', admin: role === 'admin' };
}
/** Dates written as ISO text may come back as Date objects when the sheet formats them. */
function bbWhen_(v) { return v instanceof Date ? v.toISOString() : String(v == null ? '' : v); }
function bbIssue_(a) {
  if (a[7] === true || a[7] === 'true') bbFail_('AUTH');
  var token = bbToken_(), expires = Date.now() + 8 * 3600000;
  bbTable_('BB_Sessions').appendRow([bbDigest_(token), a[0], expires]);
  return { token: token, user: bbPublic_(a), expiresAt: expires };
}
function bbAuth_(token) {
  if (typeof token !== 'string' || token.length > 200 || token.length < 32) bbFail_('AUTH');
  var hash = bbDigest_(token), s = bbRows_('BB_Sessions').find(function (r) { return r[0] === hash && Number(r[2]) > Date.now(); });
  var a = s && bbAccounts_().find(function (r) { return r[0] === s[1]; });
  if (!a || a[7] === true || a[7] === 'true') bbFail_('AUTH');
  return a;
}
function bbSaveRow_(uid) {
  return bbRows_('BB_Saves').find(function (r) { return r[0] === uid; });
}
function bbSaveOf_(row) {
  return JSON.parse(row.slice(8, 12).map(function (v) { return String(v).slice(2); }).join(''));
}
function bbSnapshot_(uid) {
  var row = bbSaveRow_(uid);
  return row ? { revision: Number(row[1]), save: bbSaveOf_(row) } : { revision: 0, save: null };
}
/** One line of the teacher's class list. Never includes the password hash or session data. */
function bbSummary_(a, row) {
  return {
    uid: a[0], username: String(a[1]), name: String(a[4]), createdAt: bbWhen_(a[6]), role: bbRoleOf_(a),
    disabled: a[7] === true || a[7] === 'true',
    revision: row ? Number(row[1]) : 0, updatedAt: row ? bbWhen_(row[2]) : '',
    coins: row ? Number(row[3]) : 0, completedJobs: row ? Number(row[4]) : 0, stars: row ? Number(row[5]) : 0
  };
}
function bbValidateSave_(s) {
  if (!s || s.version !== 4 || !Number.isSafeInteger(s.coins) || s.coins < 0 || s.coins > 10000000) bbFail_('INVALID');
  ['inventory', 'decor', 'jobs', 'settings'].forEach(function (k) { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) bbFail_('INVALID'); });
  if (Object.keys(s).sort().join(',') !== 'coins,decor,inventory,jobs,settings,version') bbFail_('INVALID');
  if (!Array.isArray(s.decor.placed) || s.decor.placed.length > 500 || typeof s.settings.playerName !== 'string' || s.settings.playerName.length > 100) bbFail_('INVALID');
  if (typeof s.settings.sfx !== 'boolean' || typeof s.settings.unlockAll !== 'boolean') bbFail_('INVALID');
  ['wall', 'floor', 'sign', 'signText'].forEach(function (k) { if (typeof s.decor[k] !== 'string' || s.decor[k].length > 200) bbFail_('INVALID'); });
  s.decor.placed.forEach(function (p) {
    if (!p || typeof p.uid !== 'string' || p.uid.length > 100 || typeof p.item !== 'string' || p.item.length > 100 || typeof p.flip !== 'boolean' || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) bbFail_('INVALID');
  });
  Object.keys(s.inventory).forEach(function (k) { if (!Number.isSafeInteger(s.inventory[k]) || s.inventory[k] < 0) bbFail_('INVALID'); });
  Object.keys(s.jobs).forEach(function (k) {
    var j = s.jobs[k];
    if (!j || !Number.isSafeInteger(j.attempts) || j.attempts < 0 || !Number.isSafeInteger(j.completions) || j.completions < 0 || !Number.isFinite(j.paid) || j.paid < 0) bbFail_('INVALID');
    ['last', 'best'].forEach(function (r) {
      var v = j[r]; if (v === undefined) return;
      if (!v || !Number.isFinite(v.score) || v.score < 0 || v.score > 100 || !Number.isInteger(v.stars) || v.stars < 1 || v.stars > 3 || typeof v.finishedAt !== 'string' || v.finishedAt.length > 40) bbFail_('INVALID');
      if (!Number.isSafeInteger(v.hintsUsed) || v.hintsUsed < 0 || !Number.isFinite(v.coinsEarned) || v.coinsEarned < 0 || !v.criteria || typeof v.criteria !== 'object' || Array.isArray(v.criteria)) bbFail_('INVALID');
      Object.keys(v.criteria).forEach(function (c) { if (['accuracy', 'reasoning', 'dataSafety', 'testing'].indexOf(c) < 0 || !Number.isFinite(v.criteria[c]) || v.criteria[c] < 0 || v.criteria[c] > 100) bbFail_('INVALID'); });
      if (!Array.isArray(v.objectives) || v.objectives.some(function (o) { return !o || typeof o.id !== 'string' || o.id.length > 100 || typeof o.passed !== 'boolean'; })) bbFail_('INVALID');
      if (!Array.isArray(v.mistakes) || v.mistakes.some(function (m) { return typeof m !== 'string' || m.length > 100; })) bbFail_('INVALID');
    });
  });
  var json = JSON.stringify(s);
  if (json.length > 120000) bbFail_('SIZE');
  return json;
}
function bbDispatch_(q) {
  if (['register', 'login'].indexOf(q.action) >= 0) bbLimit_('auth-global', 100, 60);
  if (q.action === 'register') {
    if (bbConfig_().ALLOW_REGISTRATION !== true) bbFail_('CLOSED');
    bbLimit_('register-global', 30, 3600);
    var username = bbUsername_(q.username), name = bbText_(q.name, 80);
    if (bbRows_('BB_Accounts').some(function (r) { return r[1] === username; })) bbFail_('USERNAME');
    var a = [Utilities.getUuid(), username, bbHashPassword_(q.password), '', bbCell_(name), '', new Date().toISOString(), false, 0, 0];
    bbTable_('BB_Accounts').appendRow(a);
    return bbIssue_(a);
  }
  if (q.action === 'login') {
    var username = bbUsername_(q.username);
    bbLimit_('login-' + username, 8, 900);
    var rows = bbAccounts_(), index = rows.findIndex(function (r) { return r[1] === username; }), a = rows[index];
    if (typeof q.password !== 'string' || q.password.length > 72 || bcrypt.truncates(q.password)) bbFail_('AUTH');
    if (!a || Number(a[9]) > Date.now()) bbFail_('AUTH');
    if (!bcrypt.compareSync(q.password, a[2])) {
      a[8] = Number(a[8] || 0) + 1; a[9] = a[8] >= 5 ? Date.now() + 900000 : 0;
      bbTable_('BB_Accounts').getRange(index + 2, 9, 1, 2).setValues([[a[8], a[9]]]);
      console.warn('BootBloom: login rejected'); bbFail_('AUTH');
    }
    bbTable_('BB_Accounts').getRange(index + 2, 9, 1, 2).setValues([[0, 0]]);
    return bbIssue_(a);
  }
  var user = bbAuth_(q.token);
  if (q.action === 'load') return { user: bbPublic_(user), snapshot: bbSnapshot_(user[0]) };
  // ---- teacher console (read-only). Students can never reach these: the username must be in BB_CONFIG.TEACHERS.
  if (['roster', 'shops', 'student'].indexOf(q.action) >= 0) {
    if (!bbCanTeach_(user)) bbFail_('AUTH');
    bbLimit_('teacher-' + user[0], 300, 3600);
  }
  if (q.action === 'roster') {
    var saveRows = {};
    bbRows_('BB_Saves').forEach(function (r) { saveRows[r[0]] = r; });
    return { students: bbAccounts_()
      .filter(function (r) { return bbRoleOf_(r) === 'student'; })
      .map(function (r) { return bbSummary_(r, saveRows[r[0]]); }) };
  }
  if (q.action === 'shops') {
    // Decorations only, read in small batches so one class list never times out.
    if (!Array.isArray(q.uids) || !q.uids.length || q.uids.length > 12) bbFail_('INVALID');
    var want = {};
    q.uids.forEach(function (u) { if (typeof u !== 'string' || !u || u.length > 60) bbFail_('INVALID'); want[u] = true; });
    var shops = [];
    bbRows_('BB_Saves').forEach(function (r) {
      if (!want[r[0]]) return;
      var save = bbSaveOf_(r);
      shops.push({
        uid: r[0], inventory: save.inventory || {}, decor: save.decor || null,
        playerName: save.settings && typeof save.settings.playerName === 'string' ? save.settings.playerName : ''
      });
    });
    return { shops: shops };
  }
  // ---- admin only: who may do what, and which accounts are switched off
  if (['accounts', 'setRole', 'setDisabled'].indexOf(q.action) >= 0) {
    if (bbRoleOf_(user) !== 'admin') bbFail_('AUTH');
    bbLimit_('admin-' + user[0], 300, 3600);
  }
  if (q.action === 'accounts') {
    return { roles: BB_ROLES, editable: bbHasRoles_(), accounts: bbAccounts_().map(function (r) {
      return {
        uid: r[0], username: String(r[1]), name: String(r[4]), createdAt: bbWhen_(r[6]), role: bbRoleOf_(r),
        disabled: r[7] === true || r[7] === 'true', locked: Number(r[9]) > Date.now(),
        fixed: bbFixedAdmin_(r), self: r[0] === user[0]
      };
    }) };
  }
  if (q.action === 'setRole' || q.action === 'setDisabled') {
    if (!bbHasRoles_() && q.action === 'setRole') bbFail_('ROLES');
    var target = bbText_(q.uid, 60);
    var all = bbAccounts_(), at = all.findIndex(function (r) { return r[0] === target; });
    if (at < 0) bbFail_('INVALID');
    // An admin may not change their own account, and Code.gs admins are fixed: both rules keep a way back in.
    if (all[at][0] === user[0]) bbFail_('SELF');
    if (bbFixedAdmin_(all[at])) bbFail_('FIXED');
    if (q.action === 'setRole') {
      var role = typeof q.role === 'string' ? q.role.trim().toLowerCase() : '';
      if (BB_ROLES.indexOf(role) < 0) bbFail_('INVALID');
      bbTable_('BB_Accounts').getRange(at + 2, BB_ROLE_COL).setValue(role);
      all[at][BB_ROLE_COL - 1] = role;
    } else {
      if (typeof q.disabled !== 'boolean') bbFail_('INVALID');
      bbTable_('BB_Accounts').getRange(at + 2, 8).setValue(q.disabled);
      all[at][7] = q.disabled;
      // A disabled account is refused by bbAuth_ at once; its sessions stop working without being deleted.
    }
    return { uid: target, role: bbRoleOf_(all[at]), disabled: all[at][7] === true || all[at][7] === 'true' };
  }
  if (q.action === 'student') {
    var uid = bbText_(q.uid, 60);
    var account = bbAccounts_().find(function (r) { return r[0] === uid; });
    if (!account) bbFail_('INVALID');
    var row = bbSaveRow_(uid);
    return { student: bbSummary_(account, row), save: row ? bbSaveOf_(row) : null };
  }
  if (q.action === 'logout') {
    var i = bbRows_('BB_Sessions').findIndex(function (r) { return r[0] === bbDigest_(q.token); });
    bbTable_('BB_Sessions').deleteRow(i + 2); return {};
  }
  if (q.action === 'save') {
    var json = bbValidateSave_(q.save), id = bbText_(q.requestId, 80);
    if (!Number.isSafeInteger(q.revision) || q.revision < 0) bbFail_('INVALID');
    var rows = bbRows_('BB_Saves'), index = rows.findIndex(function (r) { return r[0] === user[0]; }), prev = rows[index], digest = bbDigest_(json);
    if (prev && prev[6] === id && prev[7] === digest) return { revision: Number(prev[1]) };
    if ((prev ? Number(prev[1]) : 0) !== q.revision) bbFail_('CONFLICT');
    var jobs = Object.values(q.save.jobs), next = q.revision + 1;
    var row = [user[0], next, new Date().toISOString(), q.save.coins, jobs.filter(function (j) { return j.completions > 0; }).length, jobs.reduce(function (n, j) { return n + (j.best ? j.best.stars : 0); }, 0), bbCell_(id), digest];
    for (var c = 0; c < 4; c++) row.push('j:' + json.slice(c * 30000, (c + 1) * 30000));
    // Plain-text format prevents a JSON continuation beginning '=' being interpreted as a formula.
    var range = bbTable_('BB_Saves').getRange(index >= 0 ? index + 2 : rows.length + 2, 1, 1, 12);
    range.setNumberFormat('@'); range.setValues([row]);
    return { revision: next };
  }
  bbFail_('INVALID');
}
// Optional daily time trigger. Never deletes accounts or saves.
function cleanupBootBloomSessions() {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { var rows = bbRows_('BB_Sessions'), s = bbTable_('BB_Sessions');
    for (var i = rows.length - 1; i >= 0; i--) if (Number(rows[i][2]) <= Date.now()) s.deleteRow(i + 2);
  } finally { lock.releaseLock(); }
}
