const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Resolve persistent storage directory (outside git working tree on Linux/Hostinger to survive auto-deploys)
function resolveStorageDir() {
  if (process.env.STORAGE_DIR) {
    try {
      if (!fs.existsSync(process.env.STORAGE_DIR)) {
        fs.mkdirSync(process.env.STORAGE_DIR, { recursive: true });
      }
      const probe = path.join(process.env.STORAGE_DIR, '.probe_' + Date.now());
      fs.writeFileSync(probe, '1', 'utf8');
      fs.unlinkSync(probe);
      return process.env.STORAGE_DIR;
    } catch (e) {
      console.warn('Configured STORAGE_DIR unusable:', e.message);
    }
  }

  const candidates = [];
  if (process.platform === 'linux') {
    // 1. Hostinger root domain directory (outside hbuilds version tree! e.g. /home/u234223111/domains/skylinemoneychanger.com/skyline_storage)
    const hbuildsIdx = __dirname.indexOf('/hbuilds');
    if (hbuildsIdx !== -1) {
      const domainRoot = __dirname.substring(0, hbuildsIdx);
      candidates.push(path.join(domainRoot, 'skyline_storage'));
    }
    // 2. User home directory: ~/skyline_storage (e.g. /home/u234223111/skyline_storage)
    if (process.env.HOME) {
      try {
        candidates.push(path.join(process.env.HOME, 'skyline_storage'));
      } catch (e) {}
    }
    // 3. One level above web root
    try {
      candidates.push(path.resolve(__dirname, '..', 'skyline_storage'));
    } catch (e) {}
  }
  // 4. Fallback to local skyline_storage subfolder inside project
  candidates.push(path.join(__dirname, 'skyline_storage'));

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const probe = path.join(dir, '.probe_' + Date.now());
      fs.writeFileSync(probe, '1', 'utf8');
      fs.unlinkSync(probe);
      return dir;
    } catch (err) {
      // Continue testing next candidate
    }
  }

  return __dirname;
}

const storageDir = resolveStorageDir();

// Resolve persistent database path
function resolveDbPath() {
  if (process.env.DB_PATH) return process.env.DB_PATH;

  const persistentPath = path.join(storageDir, 'database.sqlite');
  const localPath = path.join(__dirname, 'database.sqlite');
  const projectStoragePath = path.join(__dirname, 'skyline_storage', 'database.sqlite');

  // Auto-migrate from any previous location if target does not exist yet
  if (!fs.existsSync(persistentPath)) {
    const candidateSources = [projectStoragePath, localPath];
    for (const src of candidateSources) {
      if (src !== persistentPath && fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, persistentPath);
          console.log(`Migrated database.sqlite from ${src} to persistent ${persistentPath}`);
          break;
        } catch (e) {
          console.warn('Database migration copy failed:', e.message);
        }
      }
    }
  }

  return persistentPath;
}

const dbPath = resolveDbPath();
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high reliability and concurrency
db.exec('PRAGMA foreign_keys = ON;');
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch (e) {}

// Initialize Tables
db.exec(`
CREATE TABLE IF NOT EXISTS rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  buy_rate REAL NOT NULL,
  sell_rate REAL NOT NULL,
  denomination TEXT DEFAULT 'All',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_no TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('BELI', 'JUAL')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  customer_id_no TEXT DEFAULT '',
  customer_npwp TEXT DEFAULT '',
  customer_nationality TEXT DEFAULT '',
  customer_job TEXT DEFAULT '',
  customer_gender TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  is_pep INTEGER DEFAULT 0,
  pep_institution TEXT DEFAULT '',
  source_of_funds TEXT DEFAULT '',
  transaction_purpose TEXT DEFAULT '',
  is_underlying INTEGER DEFAULT 0,
  underlying_type TEXT DEFAULT '',
  underlying_doc_no TEXT DEFAULT '',
  dttot_check_status TEXT DEFAULT 'CLEARED',
  teller_name TEXT NOT NULL,
  total_idr REAL NOT NULL,
  paid_amount REAL NOT NULL,
  change_amount REAL NOT NULL,
  is_delivery INTEGER DEFAULT 0,
  delivery_address TEXT DEFAULT '',
  delivery_time TEXT DEFAULT '',
  delivery_status TEXT DEFAULT 'COMPLETED' CHECK(delivery_status IN ('PENDING', 'ON_THE_WAY', 'COMPLETED', 'CANCELLED')),
  courier_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  currency_code TEXT NOT NULL,
  amount REAL NOT NULL,
  rate REAL NOT NULL,
  subtotal_idr REAL NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'TELLER' CHECK(role IN ('ADMIN', 'TELLER')),
  created_at TEXT NOT NULL
);
`);

// Safe migrations for customer fields in transactions
try { db.prepare("ALTER TABLE transactions ADD COLUMN customer_npwp TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN customer_nationality TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN customer_job TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN customer_gender TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN customer_address TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN is_pep INTEGER DEFAULT 0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN pep_institution TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN source_of_funds TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN transaction_purpose TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN is_underlying INTEGER DEFAULT 0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN underlying_type TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN underlying_doc_no TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("ALTER TABLE transactions ADD COLUMN dttot_check_status TEXT DEFAULT 'CLEARED'").run(); } catch (e) {}
// Idempotency key generated by the cashier device, so a retried or re-synced
// transaction is recognised even when its receipt number collides with another one
try { db.prepare("ALTER TABLE transactions ADD COLUMN client_tx_id TEXT DEFAULT ''").run(); } catch (e) {}
try { db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_client_tx_id ON transactions(client_tx_id) WHERE client_tx_id <> ''").run(); } catch (e) {}

// Table for DTTOT & DPPSPM Compliance Screening
db.exec(`
CREATE TABLE IF NOT EXISTS dttot_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE,
  aliases TEXT DEFAULT '',
  nationality TEXT DEFAULT 'INDONESIA',
  date_of_birth TEXT DEFAULT '',
  list_type TEXT DEFAULT 'DTTOT' CHECK(list_type IN ('DTTOT', 'DPPSPM', 'INTERNAL')),
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
`);

try { db.prepare("ALTER TABLE dttot_list ADD COLUMN ref_code TEXT DEFAULT ''").run(); } catch (e) {}

// Official DTTOT list: data/dttot-list.json (built by tools/dttot-xlsx-to-json.py).
// Re-synced on start whenever the file changes. Only rows with a Kode Densus (ref_code)
// are replaced, so entries added by hand in the POS stay.
const LEGACY_DTTOT_SEED = ['SANTOSO', 'ALI KALORA', 'BAHRUN NAIM', 'AMAN ABDURRAHMAN', 'DULMATIN', 'HAMBALI',
  'ABU BAKAR BAASYIR', 'UMAR PATEK', 'NOORDIN MOHAMMAD TOP', 'AZAHARI HUSIN', 'ZULKARNAEN', 'UPIK LAWANGA',
  'JAMAAH ISLAMIYAH', 'JAMAAH ANSHARUT DAULAH', 'MUJAHIDIN INDONESIA TIMUR', 'AL QAEDA', 'ISIS'];

function syncOfficialDttot() {
  const file = path.join(__dirname, 'data', 'dttot-list.json');
  if (!fs.existsSync(file)) return;
  const raw = fs.readFileSync(file, 'utf8');
  const version = require('node:crypto').createHash('sha256').update(raw).digest('hex').slice(0, 16);
  const current = db.prepare("SELECT value FROM settings WHERE key = 'dttot_dataset_version'").get();
  if (current && current.value === version) return;

  const { entries } = JSON.parse(raw);
  if (!Array.isArray(entries) || entries.length === 0 || entries.some(e => !e.name || !e.ref_code)) {
    throw new Error('data/dttot-list.json is empty or has entries without name/ref_code');
  }
  const ins = db.prepare(`
    INSERT INTO dttot_list (name, aliases, nationality, date_of_birth, list_type, notes, created_at, ref_code)
    VALUES (?, ?, ?, ?, 'DTTOT', ?, ?, ?)
  `);
  const now = new Date().toISOString();
  db.exec('BEGIN');
  try {
    db.prepare("DELETE FROM dttot_list WHERE ref_code <> ''").run();
    const delLegacy = db.prepare("DELETE FROM dttot_list WHERE ref_code = '' AND list_type = 'DTTOT' AND name = ?");
    for (const n of LEGACY_DTTOT_SEED) delLegacy.run(n);
    for (const e of entries) {
      ins.run(e.name, e.aliases || '', e.nationality || '', e.date_of_birth || '', e.notes || '', now, e.ref_code);
    }
    db.prepare("INSERT INTO settings (key, value) VALUES ('dttot_dataset_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(version);
    db.exec('COMMIT');
    console.log(`DTTOT list synced: ${entries.length} official entries (version ${version}).`);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
try { syncOfficialDttot(); } catch (e) { console.error('DTTOT sync failed, keeping the existing list:', e.message); }

// Seed Default Settings
const defaultSettings = [
  { key: 'store_name', value: 'Skyline Exchange' },
  { key: 'store_company', value: 'PT. Skyline Indonesia' },
  { key: 'store_address', value: 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali' },
  { key: 'store_phone', value: '+6285-122-777-970' },
  { key: 'store_permit', value: '' },
  { key: 'show_permit', value: '0' },
  { key: 'default_teller', value: 'TELLER 01' },
  { key: 'brand_color', value: '#00E2DE' },
  { key: 'paper_size', value: '76' },
  { key: 'disclaimer_1', value: 'Periksa fisik uang sebelum meninggalkan kasir.' },
  { key: 'disclaimer_2', value: 'Uang yang sudah ditukar tidak dapat dikembalikan.' },
  { key: 'google_sheets_url', value: '' },
  { key: 'google_sheets_auto_sync', value: '1' },
  { key: 'google_sheets_id', value: '15lmFybUAOq4M8qpza8fPKWS-OfwWwck5L_b45eZ3oBo' },
  { key: 'store_logo', value: '' },
  { key: 'store_show_rcpt_logo', value: '1' },
  { key: 'store_rcpt_logo_size', value: 'medium' }
];

const insertSettingStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const s of defaultSettings) {
  insertSettingStmt.run(s.key, s.value);
}

// Ensure receipt logo defaults are present in settings table
insertSettingStmt.run('store_show_rcpt_logo', '1');
insertSettingStmt.run('store_rcpt_logo_size', 'medium');
insertSettingStmt.run('store_logo', '');

// Seed Default Rates & Currencies (both normal and small "s" denominations)
const defaultRates = [
  { code: 'USD', name: 'US Dollar (100)', buy: 16250, sell: 16380, denomination: '100' },
  { code: 'USD 20, 10, 5', name: 'US Dollar (20, 10, 5)', buy: 15900, sell: 16250, denomination: '20, 10, 5' },
  { code: 'USD 2, 1', name: 'US Dollar (2, 1)', buy: 15300, sell: 15950, denomination: '2, 1' },
  { code: 'AUD', name: 'Australian Dollar', buy: 10450, sell: 10600, denomination: 'All' },
  { code: 'SGD', name: 'Singapore Dollar', buy: 12400, sell: 12520, denomination: 'All' },
  { code: 'EUR', name: 'Euro', buy: 17650, sell: 17850, denomination: 'All' },
  { code: 'GBP', name: 'British Pound', buy: 21100, sell: 21350, denomination: 'All' },
  { code: 'JPY', name: 'Japanese Yen (x100)', buy: 107.5, sell: 109.8, denomination: '1000+' },
  { code: 'MYR', name: 'Malaysian Ringgit', buy: 3680, sell: 3760, denomination: '100, 50' },
  { code: 'MYRs', name: 'Malaysian Ringgit (Small)', buy: 3500, sell: 3720, denomination: 'Small' },
  { code: 'HKD', name: 'Hong Kong Dollar', buy: 2070, sell: 2120, denomination: '1000, 500' },
  { code: 'HKDs', name: 'Hong Kong Dollar (Small)', buy: 1950, sell: 2100, denomination: 'Small' },
  { code: 'THB', name: 'Thai Baht', buy: 475, sell: 495, denomination: '1000, 500' },
  { code: 'THBs', name: 'Thai Baht (Small)', buy: 440, sell: 485, denomination: 'Small' },
  { code: 'NTD', name: 'New Taiwan Dollar', buy: 495, sell: 520, denomination: '1000, 500' },
  { code: 'NTDs', name: 'New Taiwan Dollar (Small)', buy: 460, sell: 510, denomination: 'Small' },
  { code: 'PHP', name: 'Philippine Peso', buy: 275, sell: 295, denomination: '1000, 500' },
  { code: 'PHPs', name: 'Philippine Peso (Small)', buy: 250, sell: 290, denomination: 'Small' },
  { code: 'INR', name: 'Indian Rupee', buy: 180, sell: 198, denomination: '500' },
  { code: 'INRs', name: 'Indian Rupee (Small)', buy: 160, sell: 195, denomination: 'Small' },
  { code: 'CNY', name: 'Chinese Yuan', buy: 2240, sell: 2310, denomination: '100' },
  { code: 'CNYs', name: 'Chinese Yuan (Small)', buy: 2100, sell: 2280, denomination: 'Small' },
  { code: 'SAR', name: 'Saudi Riyal', buy: 4320, sell: 4420, denomination: 'All' },
  { code: 'KRW', name: 'South Korean Won (x100)', buy: 11.8, sell: 12.6, denomination: 'All' },
  { code: 'KRWs', name: 'South Korean Won (Small)', buy: 11.8, sell: 12.6, denomination: 'Small' }
];

// Migrate legacy 'USD-S' if present to 'USD 20, 10, 5'
try {
  const checkLegacyUsdS = db.prepare('SELECT id FROM rates WHERE code = ?').get('USD-S');
  if (checkLegacyUsdS) {
    const checkTargetExists = db.prepare('SELECT id FROM rates WHERE code = ?').get('USD 20, 10, 5');
    if (!checkTargetExists) {
      db.prepare(`UPDATE rates SET code = 'USD 20, 10, 5', name = 'US Dollar (20, 10, 5)', denomination = '20, 10, 5' WHERE id = ?`).run(checkLegacyUsdS.id);
    } else {
      db.prepare('DELETE FROM rates WHERE id = ?').run(checkLegacyUsdS.id);
    }
  }
} catch (e) {}

const checkRateStmt = db.prepare('SELECT id FROM rates WHERE code = ?');
const insertRateStmt = db.prepare('INSERT INTO rates (code, name, buy_rate, sell_rate, denomination, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
const nowIso = new Date().toISOString();
for (const r of defaultRates) {
  if (!checkRateStmt.get(r.code)) {
    insertRateStmt.run(r.code, r.name, r.buy, r.sell, r.denomination, nowIso);
  }
}

// ==================== AUTH & USER HELPERS ====================
const crypto = require('node:crypto');
const AUTH_SECRET = process.env.AUTH_SECRET || 'skyline-exchange-pos-secret-2026';

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

function createToken(user, remember = false) {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    displayName: user.display_name,
    exp: Date.now() + (remember ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000)
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [str, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// ==================== PERSISTENT STORAGE HELPERS ====================
function getStorageFilePath(filename) {
  const target = path.join(storageDir, filename);
  if (!fs.existsSync(target)) {
    const candidateSources = [
      path.join(__dirname, 'skyline_storage', filename),
      path.join(__dirname, filename)
    ];
    for (const src of candidateSources) {
      if (src !== target && fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, target);
          console.log(`Auto-migrated ${filename} to storage directory.`);
          break;
        } catch (e) {}
      }
    }
  }
  return target;
}

// Auto Backup & Restore for users
function getUsersBackupFilePath() {
  return getStorageFilePath('skyline_users_backup.json');
}

function backupUsersToFile() {
  try {
    const users = db.prepare('SELECT id, username, password_hash, salt, display_name, role, created_at FROM users').all();
    const backupFile = getUsersBackupFilePath();
    fs.writeFileSync(backupFile, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('User backup write failed:', err.message);
  }
}

function restoreUsersFromFile() {
  try {
    const backupFile = getUsersBackupFilePath();
    let sourceFile = null;
    if (fs.existsSync(backupFile)) {
      sourceFile = backupFile;
    } else {
      const legacy = path.join(__dirname, 'skyline_users_backup.json');
      if (fs.existsSync(legacy)) sourceFile = legacy;
    }
    if (!sourceFile) return;

    const raw = fs.readFileSync(sourceFile, 'utf8');
    const users = JSON.parse(raw);
    if (!Array.isArray(users)) return;

    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const insertStmt = db.prepare(`
      INSERT INTO users (username, password_hash, salt, display_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const u of users) {
      if (!checkStmt.get(u.username)) {
        insertStmt.run(u.username, u.password_hash, u.salt, u.display_name, u.role, u.created_at || new Date().toISOString());
        console.log(`User @${u.username} restored from backup.`);
      }
    }
  } catch (err) {
    console.warn('User restore failed:', err.message);
  }
}

// Auto Backup & Restore for settings
function getSettingsBackupFilePath() {
  return getStorageFilePath('skyline_settings_backup.json');
}

function backupSettingsToFile() {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const backupFile = getSettingsBackupFilePath();
    fs.writeFileSync(backupFile, JSON.stringify(rows, null, 2), 'utf8');
  } catch (err) {
    console.warn('Settings backup write failed:', err.message);
  }
}

function restoreSettingsFromFile() {
  try {
    const backupFile = getSettingsBackupFilePath();
    let sourceFile = null;
    if (fs.existsSync(backupFile)) {
      sourceFile = backupFile;
    } else {
      const legacy = path.join(__dirname, 'skyline_settings_backup.json');
      if (fs.existsSync(legacy)) sourceFile = legacy;
    }
    if (!sourceFile) return;

    const raw = fs.readFileSync(sourceFile, 'utf8');
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) return;

    const upsertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const r of rows) {
      if (r.key && r.value !== undefined) {
        upsertStmt.run(r.key, String(r.value));
      }
    }
    console.log('Persistent settings restored from backup.');
  } catch (err) {
    console.warn('Settings restore failed:', err.message);
  }
}

// Auto Backup & Restore for rates
function getRatesBackupFilePath() {
  return getStorageFilePath('skyline_rates_backup.json');
}

function backupRatesToFile() {
  try {
    const rates = db.prepare('SELECT id, code, name, buy_rate, sell_rate, denomination, updated_at FROM rates').all();
    const backupFile = getRatesBackupFilePath();
    fs.writeFileSync(backupFile, JSON.stringify(rates, null, 2), 'utf8');
  } catch (err) {
    console.warn('Rates backup write failed:', err.message);
  }
}

function restoreRatesFromFile() {
  try {
    const backupFile = getRatesBackupFilePath();
    let sourceFile = null;
    if (fs.existsSync(backupFile)) {
      sourceFile = backupFile;
    } else {
      const legacy = path.join(__dirname, 'skyline_rates_backup.json');
      if (fs.existsSync(legacy)) sourceFile = legacy;
    }
    if (!sourceFile) return;

    const raw = fs.readFileSync(sourceFile, 'utf8');
    const rates = JSON.parse(raw);
    if (!Array.isArray(rates)) return;

    const upsertStmt = db.prepare(`
      INSERT INTO rates (code, name, buy_rate, sell_rate, denomination, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        name = excluded.name,
        buy_rate = excluded.buy_rate,
        sell_rate = excluded.sell_rate,
        denomination = excluded.denomination,
        updated_at = excluded.updated_at
    `);
    for (const r of rates) {
      if (r.code && r.name && r.buy_rate != null && r.sell_rate != null) {
        upsertStmt.run(r.code, r.name, Number(r.buy_rate), Number(r.sell_rate), r.denomination || 'All', r.updated_at || new Date().toISOString());
      }
    }
    console.log('Persistent rates restored from backup.');
  } catch (err) {
    console.warn('Rates restore failed:', err.message);
  }
}

// Auto Backup & Restore for transactions
function getTransactionsBackupFilePath() {
  return getStorageFilePath('skyline_transactions_backup.json');
}

function backupTransactionsToFile() {
  try {
    const txs = db.prepare('SELECT * FROM transactions ORDER BY id ASC').all();
    const items = db.prepare('SELECT * FROM transaction_items ORDER BY id ASC').all();
    const backupFile = getTransactionsBackupFilePath();
    const payload = {
      version: 1,
      saved_at: new Date().toISOString(),
      transactions_count: txs.length,
      items_count: items.length,
      transactions: txs,
      transaction_items: items
    };
    fs.writeFileSync(backupFile, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.warn('Transactions backup write failed:', err.message);
  }
}

function restoreTransactionsFromFile() {
  try {
    const backupFile = getTransactionsBackupFilePath();
    let sourceFile = null;
    if (fs.existsSync(backupFile)) {
      sourceFile = backupFile;
    } else {
      const legacyFile = path.join(__dirname, 'skyline_transactions_backup.json');
      if (fs.existsSync(legacyFile)) sourceFile = legacyFile;
    }
    if (!sourceFile) return;

    const raw = fs.readFileSync(sourceFile, 'utf8');
    const parsed = JSON.parse(raw);
    const txList = Array.isArray(parsed) ? parsed : (parsed.transactions || []);
    const itemsList = parsed.transaction_items || [];
    if (!Array.isArray(txList) || txList.length === 0) return;

    const checkStmt = db.prepare('SELECT id FROM transactions WHERE receipt_no = ?');
    const insertTx = db.prepare(`
      INSERT INTO transactions (
        receipt_no, type, customer_name, customer_phone, customer_id_no,
        customer_npwp, customer_nationality, customer_job, customer_gender, customer_address,
        is_pep, pep_institution, source_of_funds, transaction_purpose,
        is_underlying, underlying_type, underlying_doc_no, dttot_check_status,
        teller_name, total_idr, paid_amount, change_amount, is_delivery,
        delivery_address, delivery_time, delivery_status, courier_name, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, currency_code, amount, rate, subtotal_idr)
      VALUES (?, ?, ?, ?, ?)
    `);

    let restoredTxCount = 0;
    const oldToNewTxId = new Map();

    for (const tx of txList) {
      if (!tx.receipt_no) continue;
      const existing = checkStmt.get(tx.receipt_no);
      if (!existing) {
        const info = insertTx.run(
          tx.receipt_no,
          tx.type || 'BELI',
          tx.customer_name || 'Pelanggan',
          tx.customer_phone || '',
          tx.customer_id_no || '',
          tx.customer_npwp || '',
          tx.customer_nationality || '',
          tx.customer_job || '',
          tx.customer_gender || '',
          tx.customer_address || '',
          tx.is_pep ? 1 : 0,
          tx.pep_institution || '',
          tx.source_of_funds || '',
          tx.transaction_purpose || '',
          tx.is_underlying ? 1 : 0,
          tx.underlying_type || '',
          tx.underlying_doc_no || '',
          tx.dttot_check_status || 'CLEARED',
          tx.teller_name || 'TELLER',
          Number(tx.total_idr) || 0,
          Number(tx.paid_amount) || 0,
          Number(tx.change_amount) || 0,
          tx.is_delivery ? 1 : 0,
          tx.delivery_address || '',
          tx.delivery_time || '',
          tx.delivery_status || 'COMPLETED',
          tx.courier_name || '',
          tx.notes || '',
          tx.created_at || new Date().toISOString()
        );
        restoredTxCount++;
        if (tx.id && info.lastInsertRowid) {
          oldToNewTxId.set(tx.id, info.lastInsertRowid);
        }
      } else {
        oldToNewTxId.set(tx.id, existing.id);
      }
    }

    if (itemsList.length > 0) {
      const checkItem = db.prepare('SELECT id FROM transaction_items WHERE transaction_id = ? AND currency_code = ? AND amount = ?');
      for (const item of itemsList) {
        const newTxId = oldToNewTxId.get(item.transaction_id);
        if (newTxId) {
          const itemExists = checkItem.get(newTxId, item.currency_code, item.amount);
          if (!itemExists) {
            insertItem.run(
              newTxId,
              item.currency_code,
              Number(item.amount) || 0,
              Number(item.rate) || 0,
              Number(item.subtotal_idr) || 0
            );
          }
        }
      }
    }

    if (restoredTxCount > 0) {
      console.log(`Restored ${restoredTxCount} persistent transactions from backup.`);
    }
  } catch (err) {
    console.warn('Transactions restore failed:', err.message);
  }
}

// Full Snapshot for 1-click Download / Restore
function getAllDataSnapshot() {
  const users = db.prepare('SELECT id, username, password_hash, salt, display_name, role, created_at FROM users ORDER BY id ASC').all();
  const rates = db.prepare('SELECT id, code, name, buy_rate, sell_rate, denomination, updated_at FROM rates ORDER BY id ASC').all();
  const settings = db.prepare('SELECT key, value FROM settings ORDER BY key ASC').all();
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY id ASC').all();
  const items = db.prepare('SELECT * FROM transaction_items ORDER BY id ASC').all();

  return {
    meta: {
      appName: 'Skyline Exchange POS',
      version: '2.5.0',
      exported_at: new Date().toISOString(),
      storage_dir: storageDir,
      db_path: dbPath
    },
    counts: {
      users: users.length,
      rates: rates.length,
      settings: settings.length,
      transactions: transactions.length,
      transaction_items: items.length
    },
    users,
    rates,
    settings,
    transactions,
    transaction_items: items
  };
}

function restoreAllDataSnapshot(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Format data backup tidak valid.');
  }

  let restoredUsers = 0;
  let restoredRates = 0;
  let restoredSettings = 0;
  let restoredTxs = 0;

  // 1. Users
  if (Array.isArray(data.users)) {
    const checkUser = db.prepare('SELECT id FROM users WHERE username = ?');
    const insertUser = db.prepare('INSERT INTO users (username, password_hash, salt, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    for (const u of data.users) {
      if (!checkUser.get(u.username)) {
        insertUser.run(u.username, u.password_hash, u.salt, u.display_name, u.role, u.created_at || new Date().toISOString());
        restoredUsers++;
      }
    }
    backupUsersToFile();
  }

  // 2. Settings
  if (Array.isArray(data.settings)) {
    const upsertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const s of data.settings) {
      if (s.key && s.value !== undefined) {
        upsertSetting.run(s.key, String(s.value));
        restoredSettings++;
      }
    }
    backupSettingsToFile();
  }

  // 3. Rates
  if (Array.isArray(data.rates)) {
    const upsertRate = db.prepare(`
      INSERT INTO rates (code, name, buy_rate, sell_rate, denomination, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        name = excluded.name,
        buy_rate = excluded.buy_rate,
        sell_rate = excluded.sell_rate,
        denomination = excluded.denomination,
        updated_at = excluded.updated_at
    `);
    for (const r of data.rates) {
      if (r.code && r.name && r.buy_rate != null && r.sell_rate != null) {
        upsertRate.run(r.code, r.name, Number(r.buy_rate), Number(r.sell_rate), r.denomination || 'All', r.updated_at || new Date().toISOString());
        restoredRates++;
      }
    }
    backupRatesToFile();
  }

  // 4. Transactions
  if (Array.isArray(data.transactions)) {
    const checkTx = db.prepare('SELECT id FROM transactions WHERE receipt_no = ?');
    const insertTx = db.prepare(`
      INSERT INTO transactions (
        receipt_no, type, customer_name, customer_phone, customer_id_no,
        customer_npwp, customer_nationality, customer_job, customer_gender, customer_address,
        is_pep, pep_institution, source_of_funds, transaction_purpose,
        is_underlying, underlying_type, underlying_doc_no, dttot_check_status,
        teller_name, total_idr, paid_amount, change_amount, is_delivery,
        delivery_address, delivery_time, delivery_status, courier_name, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, currency_code, amount, rate, subtotal_idr)
      VALUES (?, ?, ?, ?, ?)
    `);

    const oldToNew = new Map();
    for (const t of data.transactions) {
      if (!t.receipt_no) continue;
      const existing = checkTx.get(t.receipt_no);
      if (!existing) {
        const info = insertTx.run(
          t.receipt_no, t.type || 'BELI', t.customer_name || 'Pelanggan',
          t.customer_phone || '', t.customer_id_no || '',
          t.customer_npwp || '', t.customer_nationality || '', t.customer_job || '',
          t.customer_gender || '', t.customer_address || '',
          t.is_pep ? 1 : 0, t.pep_institution || '', t.source_of_funds || '', t.transaction_purpose || '',
          t.is_underlying ? 1 : 0, t.underlying_type || '', t.underlying_doc_no || '', t.dttot_check_status || 'CLEARED',
          t.teller_name || 'TELLER',
          Number(t.total_idr) || 0, Number(t.paid_amount) || 0, Number(t.change_amount) || 0,
          t.is_delivery ? 1 : 0, t.delivery_address || '', t.delivery_time || '',
          t.delivery_status || 'COMPLETED', t.courier_name || '', t.notes || '',
          t.created_at || new Date().toISOString()
        );
        restoredTxs++;
        if (t.id && info.lastInsertRowid) oldToNew.set(t.id, info.lastInsertRowid);
      } else {
        oldToNew.set(t.id, existing.id);
      }
    }

    if (Array.isArray(data.transaction_items)) {
      const checkItem = db.prepare('SELECT id FROM transaction_items WHERE transaction_id = ? AND currency_code = ? AND amount = ?');
      for (const item of data.transaction_items) {
        const newTxId = oldToNew.get(item.transaction_id);
        if (newTxId && !checkItem.get(newTxId, item.currency_code, item.amount)) {
          insertItem.run(newTxId, item.currency_code, Number(item.amount) || 0, Number(item.rate) || 0, Number(item.subtotal_idr) || 0);
        }
      }
    }
    backupTransactionsToFile();
  }

  return {
    success: true,
    restored: {
      users: restoredUsers,
      rates: restoredRates,
      settings: restoredSettings,
      transactions: restoredTxs
    }
  };
}

// Seed Super Admin Krisna if not exists
const checkAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('Krisna');
if (!checkAdmin) {
  const { hash, salt } = hashPassword('Skyline#2026');
  db.prepare(`
    INSERT INTO users (username, password_hash, salt, display_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Krisna', hash, salt, 'Krisna (Owner)', 'ADMIN', '2026-10-16T09:48:52.701Z');
  console.log('Default Admin user "Krisna" initialized.');
}

// Seed Registered Teller Fanny if not exists
const checkFanny = db.prepare('SELECT id FROM users WHERE username = ?').get('Fanny');
if (!checkFanny) {
  const { hash, salt } = hashPassword('Skyline#2026');
  db.prepare(`
    INSERT INTO users (username, password_hash, salt, display_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Fanny', hash, salt, 'Stephanie mau bere', 'TELLER', '2026-10-18T03:50:21.858Z');
  console.log('Registered Teller user "Fanny" initialized.');
}

// Restore any additional cashiers, persistent settings, rates, and transactions from backup files
restoreUsersFromFile();
restoreSettingsFromFile();
restoreRatesFromFile();
restoreTransactionsFromFile();

// Shop's currency codes for small notes: MYRs, HKDs, THBs, ... (USD 20, 10, 5 and USD 2, 1 keep their names)
// Runs after the backup restore so a backup with the old codes is renamed too; the backup written below then has the new ones.
// Rates and history stay as they are (old transactions keep the code they were saved with).
const RATE_CODE_RENAMES = [
  ['MYR s', 'MYRs'], ['HKD s', 'HKDs'], ['THB s', 'THBs'], ['NTD s', 'NTDs'],
  ['PHP s', 'PHPs'], ['INR s', 'INRs'], ['CNY s', 'CNYs'], ['KRW s', 'KRWs']
];
for (const [oldCode, newCode] of RATE_CODE_RENAMES) {
  if (!db.prepare('SELECT 1 FROM rates WHERE code = ?').get(oldCode)) continue;
  // a row with the new code can only be the fresh seed here: the old row holds the real rates
  db.prepare('DELETE FROM rates WHERE code = ?').run(newCode);
  db.prepare('UPDATE rates SET code = ? WHERE code = ?').run(newCode, oldCode);
}
// KRWs is new: start from the KRW rates until the cashier sets its own
if (!db.prepare("SELECT 1 FROM rates WHERE code = 'KRWs'").get()) {
  const krw = db.prepare("SELECT buy_rate, sell_rate FROM rates WHERE code = 'KRW'").get() || { buy_rate: 11.8, sell_rate: 12.6 };
  db.prepare('INSERT INTO rates (code, name, buy_rate, sell_rate, denomination, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('KRWs', 'South Korean Won (Small)', krw.buy_rate, krw.sell_rate, 'Small', new Date().toISOString());
}

// One-time switch to the 76 mm dot-matrix default (iWare DM-76H). The marker row keeps a later 80 mm choice from Pengaturan.
if (db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('paper_size_76_default', '1')").run().changes) {
  db.prepare("UPDATE settings SET value = '76' WHERE key = 'paper_size' AND value = '80'").run();
}

// Save updated backup files
backupUsersToFile();
backupSettingsToFile();
backupRatesToFile();
backupTransactionsToFile();

db.storageDir = storageDir;
db.dbPath = dbPath;
db.hashPassword = hashPassword;
db.verifyPassword = verifyPassword;
db.createToken = createToken;
db.verifyToken = verifyToken;
db.backupUsersToFile = backupUsersToFile;
db.restoreUsersFromFile = restoreUsersFromFile;
db.backupSettingsToFile = backupSettingsToFile;
// Display order of the rate board, POS pickers and TV sync (codes not listed follow, A-Z)
db.RATE_ORDER = ['USD', 'USD 20, 10, 5', 'USD 2, 1', 'AUD', 'EUR', 'GBP', 'CHF', 'JPY', 'SGD', 'CAD', 'MYR', 'MYRs', 'NZD', 'HKD', 'HKDs',
  'CNY', 'CNYs', 'BND', 'SAR', 'AED', 'THB', 'THBs', 'PHP', 'PHPs', 'KRW', 'KRWs', 'INR', 'INRs', 'NTD', 'NTDs'];
db.restoreSettingsFromFile = restoreSettingsFromFile;
db.backupRatesToFile = backupRatesToFile;
db.restoreRatesFromFile = restoreRatesFromFile;
db.backupTransactionsToFile = backupTransactionsToFile;
db.restoreTransactionsFromFile = restoreTransactionsFromFile;
db.getAllDataSnapshot = getAllDataSnapshot;
db.restoreAllDataSnapshot = restoreAllDataSnapshot;

module.exports = db;
