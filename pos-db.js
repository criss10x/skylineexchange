const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Resolve persistent database path (stored outside git working tree on Linux/Hostinger to survive auto-deploys)
function resolveDbPath() {
  if (process.env.DB_PATH) return process.env.DB_PATH;

  if (process.platform === 'linux') {
    try {
      const parentDir = path.resolve(__dirname, '..');
      const storageDir = path.join(parentDir, 'skyline_storage');
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      const persistentPath = path.join(storageDir, 'database.sqlite');
      const localPath = path.join(__dirname, 'database.sqlite');
      // If local db existed previously and persistent doesn't, migrate it
      if (fs.existsSync(localPath) && !fs.existsSync(persistentPath)) {
        try {
          fs.copyFileSync(localPath, persistentPath);
        } catch (e) {
          console.warn('Migration copy failed:', e.message);
        }
      }
      return persistentPath;
    } catch (err) {
      console.warn('Could not initialize external storage directory:', err.message);
    }
  }

  return path.join(__dirname, 'database.sqlite');
}

const dbPath = resolveDbPath();
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high reliability
db.exec('PRAGMA foreign_keys = ON;');

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

// Seed Default Settings
const defaultSettings = [
  { key: 'store_name', value: 'Skyline Exchange' },
  { key: 'store_address', value: 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali' },
  { key: 'store_phone', value: '+6285-122-777-970' },
  { key: 'store_permit', value: '' },
  { key: 'show_permit', value: '0' },
  { key: 'default_teller', value: 'TELLER 01' },
  { key: 'brand_color', value: '#00E2DE' },
  { key: 'paper_size', value: '80' },
  { key: 'disclaimer_1', value: 'Periksa fisik uang sebelum meninggalkan kasir.' },
  { key: 'disclaimer_2', value: 'Uang yang sudah ditukar tidak dapat dikembalikan.' },
  { key: 'google_sheets_url', value: '' },
  { key: 'google_sheets_auto_sync', value: '1' },
  { key: 'google_sheets_id', value: '15lmFybUAOq4M8qpza8fPKWS-OfwWwck5L_b45eZ3oBo' }
];

const insertSettingStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const s of defaultSettings) {
  insertSettingStmt.run(s.key, s.value);
}

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
  { code: 'MYR s', name: 'Malaysian Ringgit (Small)', buy: 3500, sell: 3720, denomination: 'Small' },
  { code: 'HKD', name: 'Hong Kong Dollar', buy: 2070, sell: 2120, denomination: '1000, 500' },
  { code: 'HKD s', name: 'Hong Kong Dollar (Small)', buy: 1950, sell: 2100, denomination: 'Small' },
  { code: 'THB', name: 'Thai Baht', buy: 475, sell: 495, denomination: '1000, 500' },
  { code: 'THB s', name: 'Thai Baht (Small)', buy: 440, sell: 485, denomination: 'Small' },
  { code: 'NTD', name: 'New Taiwan Dollar', buy: 495, sell: 520, denomination: '1000, 500' },
  { code: 'NTD s', name: 'New Taiwan Dollar (Small)', buy: 460, sell: 510, denomination: 'Small' },
  { code: 'PHP', name: 'Philippine Peso', buy: 275, sell: 295, denomination: '1000, 500' },
  { code: 'PHP s', name: 'Philippine Peso (Small)', buy: 250, sell: 290, denomination: 'Small' },
  { code: 'INR', name: 'Indian Rupee', buy: 180, sell: 198, denomination: '500' },
  { code: 'INR s', name: 'Indian Rupee (Small)', buy: 160, sell: 195, denomination: 'Small' },
  { code: 'CNY', name: 'Chinese Yuan', buy: 2240, sell: 2310, denomination: '100' },
  { code: 'CNY s', name: 'Chinese Yuan (Small)', buy: 2100, sell: 2280, denomination: 'Small' },
  { code: 'SAR', name: 'Saudi Riyal', buy: 4320, sell: 4420, denomination: 'All' },
  { code: 'KRW', name: 'South Korean Won (x100)', buy: 11.8, sell: 12.6, denomination: 'All' }
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

// Auto Backup & Restore for users to guarantee persistence across deployments
function getBackupFilePath() {
  try {
    const parentDir = path.resolve(__dirname, '..');
    const storageDir = path.join(parentDir, 'skyline_storage');
    if (fs.existsSync(storageDir)) {
      return path.join(storageDir, 'skyline_users_backup.json');
    }
  } catch (e) {}
  return path.join(__dirname, 'skyline_users_backup.json');
}

function backupUsersToFile() {
  try {
    const users = db.prepare('SELECT id, username, password_hash, salt, display_name, role, created_at FROM users').all();
    const backupFile = getBackupFilePath();
    fs.writeFileSync(backupFile, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('User backup write failed:', err.message);
  }
}

function restoreUsersFromFile() {
  try {
    const backupFile = getBackupFilePath();
    if (!fs.existsSync(backupFile)) return;
    const raw = fs.readFileSync(backupFile, 'utf8');
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

// Auto Backup & Restore for settings to guarantee persistence (including Google Sheets Web App URL)
function getSettingsBackupFilePath() {
  try {
    const parentDir = path.resolve(__dirname, '..');
    const storageDir = path.join(parentDir, 'skyline_storage');
    if (fs.existsSync(storageDir)) {
      return path.join(storageDir, 'skyline_settings_backup.json');
    }
  } catch (e) {}
  return path.join(__dirname, 'skyline_settings_backup.json');
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
    if (!fs.existsSync(backupFile)) return;
    const raw = fs.readFileSync(backupFile, 'utf8');
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

// Auto Backup & Restore for rates to guarantee persistence across deployments
function getRatesBackupFilePath() {
  try {
    const parentDir = path.resolve(__dirname, '..');
    const storageDir = path.join(parentDir, 'skyline_storage');
    if (fs.existsSync(storageDir)) {
      return path.join(storageDir, 'skyline_rates_backup.json');
    }
  } catch (e) {}
  return path.join(__dirname, 'skyline_rates_backup.json');
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
    if (!fs.existsSync(backupFile)) return;
    const raw = fs.readFileSync(backupFile, 'utf8');
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

// Restore any additional cashiers, persistent settings, and rates from backup files
restoreUsersFromFile();
restoreSettingsFromFile();
restoreRatesFromFile();

// Save updated backup files
backupUsersToFile();
backupSettingsToFile();
backupRatesToFile();

db.hashPassword = hashPassword;
db.verifyPassword = verifyPassword;
db.createToken = createToken;
db.verifyToken = verifyToken;
db.backupUsersToFile = backupUsersToFile;
db.backupSettingsToFile = backupSettingsToFile;
db.restoreSettingsFromFile = restoreSettingsFromFile;
db.backupRatesToFile = backupRatesToFile;
db.restoreRatesFromFile = restoreRatesFromFile;

module.exports = db;


