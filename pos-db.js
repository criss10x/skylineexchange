const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'database.sqlite');
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

// Seed Default Rates if empty
const countRates = db.prepare('SELECT COUNT(*) as count FROM rates').get();
if (countRates.count === 0) {
  const defaultRates = [
    { code: 'USD', name: 'US Dollar (100)', buy: 16250, sell: 16380, denomination: '100' },
    { code: 'USD-S', name: 'US Dollar (1-50)', buy: 15950, sell: 16250, denomination: '1-50' },
    { code: 'AUD', name: 'Australian Dollar', buy: 10450, sell: 10600, denomination: 'All' },
    { code: 'SGD', name: 'Singapore Dollar', buy: 12400, sell: 12520, denomination: 'All' },
    { code: 'EUR', name: 'Euro', buy: 17650, sell: 17850, denomination: 'All' },
    { code: 'GBP', name: 'British Pound', buy: 21100, sell: 21350, denomination: 'All' },
    { code: 'JPY', name: 'Japanese Yen (x100)', buy: 107.5, sell: 109.8, denomination: '1000+' },
    { code: 'MYR', name: 'Malaysian Ringgit', buy: 3680, sell: 3760, denomination: 'All' },
    { code: 'CNY', name: 'Chinese Yuan', buy: 2240, sell: 2310, denomination: 'All' },
    { code: 'SAR', name: 'Saudi Riyal', buy: 4320, sell: 4420, denomination: 'All' },
    { code: 'THB', name: 'Thai Baht', buy: 475, sell: 495, denomination: 'All' },
    { code: 'HKD', name: 'Hong Kong Dollar', buy: 2070, sell: 2120, denomination: 'All' },
    { code: 'KRW', name: 'South Korean Won (x100)', buy: 11.8, sell: 12.6, denomination: 'All' }
  ];

  const now = new Date().toISOString();
  const insertRate = db.prepare('INSERT INTO rates (code, name, buy_rate, sell_rate, denomination, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (const r of defaultRates) {
    insertRate.run(r.code, r.name, r.buy, r.sell, r.denomination, now);
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

// Seed Super Admin Krisna if not exists
const checkAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('Krisna');
if (!checkAdmin) {
  const { hash, salt } = hashPassword('Skyline#2026');
  db.prepare(`
    INSERT INTO users (username, password_hash, salt, display_name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Krisna', hash, salt, 'Krisna (Owner)', 'ADMIN', new Date().toISOString());
  console.log('Default Admin user "Krisna" initialized.');
}

db.hashPassword = hashPassword;
db.verifyPassword = verifyPassword;
db.createToken = createToken;
db.verifyToken = verifyToken;

module.exports = db;
