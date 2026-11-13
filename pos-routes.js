/* Skyline Exchange POS API & Routing Module */
"use strict";

const express = require('express');
const { dttotRowMatches } = require('./dttot-match');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const db = require('./pos-db.js');
const ExcelJS = require('exceljs');

const router = express.Router();

// Helper: Read a single setting
function getSetting(key) {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  } catch (e) {
    return null;
  }
}

// Helper: Send payload to Google Apps Script Web App with validation & timeout
// The store is in Bali (WITA, UTC+8). created_at is stored in UTC, so "which day" must be computed
// in store time or anything between 00:00 and 08:00 WITA lands on the previous day.
const STORE_TZ = 'Asia/Makassar';
const STORE_DAY_SQL = "date(created_at, '+8 hours')";
const STORE_DAY_SQL_T = "date(t.created_at, '+8 hours')";
const SHEET_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// YYYY-MM-DD of the store day
function storeDate(value = new Date()) {
  return new Date(value).toLocaleDateString('en-CA', { timeZone: STORE_TZ });
}

// Store wall-clock time without offset, e.g. 2026-11-13T07:30:00
function storeWallClock(value) {
  return new Date(value).toLocaleString('sv-SE', { timeZone: STORE_TZ }).replace(' ', 'T');
}

// Google Sheets rows: "date" is the store day (13-Nov-2026). created_at goes as store wall-clock time, so
// an Apps Script that still formats created_at itself (any script time zone) also lands on the right day.
function forSheets(tx) {
  if (!tx || !tx.created_at || isNaN(new Date(tx.created_at).getTime())) return tx;
  const [y, m, d] = storeDate(tx.created_at).split('-');
  return { ...tx, date: `${d}-${SHEET_MONTHS[Number(m) - 1]}-${y}`, created_at: storeWallClock(tx.created_at) };
}

async function sendToGoogleSheets(url, payload) {
  if (payload && payload.transaction) payload = { ...payload, transaction: forSheets(payload.transaction) };
  if (payload && Array.isArray(payload.transactions)) payload = { ...payload, transactions: payload.transactions.map(forSheets) };
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    throw new Error('URL Web App Google Sheets belum diatur atau tidak valid.');
  }

  const cleanUrl = url.trim();

  // Validate URL format to prevent common user configuration errors
  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    throw new Error('URL yang dimasukkan adalah link Google Sheets biasa, bukan URL Web App Apps Script. Silakan buka Extensions -> Apps Script -> Deploy -> New deployment -> Web app.');
  }
  if (cleanUrl.endsWith('/dev')) {
    throw new Error('URL berakhiran /dev (Test Deployment) memerlukan otentikasi login Google. Harap gunakan URL Web App dari Deploy -> New deployment yang berakhiran /exec.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const text = await response.text();

    // Check for Google login redirect HTML (caused when "Who has access" is not set to "Anyone")
    if (text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error('Google meminta login akun (Akses Ditolak). Solusi: Di Google Sheets, buka Extensions -> Apps Script -> Deploy -> Manage deployments -> klik ikon Edit (pensil) -> Ubah opsi "Who has access" menjadi "Anyone" (Siapa saja) -> klik Deploy ulang.');
    }

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      if (response.ok) {
        return { success: true, message: 'Respons Google Sheets diterima: ' + text.substring(0, 100) };
      }
      throw new Error('Respons tidak dikenal dari Google Sheets: ' + text.substring(0, 150));
    }
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    if (fetchErr.name === 'AbortError') {
      throw new Error('Koneksi ke Google Sheets timeout (melebihi 15 detik). Periksa koneksi internet atau script Google.');
    }
    throw fetchErr;
  }
}

// Helper: Generate Sequential Receipt Number
function generateReceiptNo() {
  const datePrefix = `SE-${storeDate().replace(/-/g, '')}`;

  const rows = db.prepare('SELECT receipt_no FROM transactions WHERE receipt_no LIKE ?').all(`${datePrefix}-%`);
  let maxSeq = 0;
  for (const row of rows) {
    const m = /^SE-\d{8}-(\d+)$/.exec(row.receipt_no);
    if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
  }
  const exists = db.prepare('SELECT 1 FROM transactions WHERE receipt_no = ?');
  let seq = maxSeq + 1;
  while (exists.get(`${datePrefix}-${String(seq).padStart(4, '0')}`)) seq++;
  return `${datePrefix}-${String(seq).padStart(4, '0')}`;
}

// A receipt number already printed on an offline receipt is kept when possible;
// if it is taken by a different transaction, a suffixed number is assigned instead.
function resolveReceiptNo(requested) {
  if (!requested) return generateReceiptNo();
  const exists = db.prepare('SELECT 1 FROM transactions WHERE receipt_no = ?');
  if (!exists.get(requested)) return requested;
  let n = 1;
  while (exists.get(`${requested}-R${n}`)) n++;
  return `${requested}-R${n}`;
}

// ==================== AUTH MIDDLEWARE ====================
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Autentikasi dibutuhkan. Silakan login terlebih dahulu.' });
  }

  const payload = db.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Sesi login telah berakhir atau tidak valid. Silakan login kembali.' });
  }

  req.user = payload;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Fitur ini hanya untuk Administrator.' });
  }
  next();
}

// ==================== POS ENTRY POINT ====================
router.get(['/pos', '/pos/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'pos', 'index.html'));
});

// ==================== AUTH API ====================
router.post('/api/auth/login', (req, res) => {
  try {
    const { username, password, remember } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const isValid = db.verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const token = db.createToken(user, !!remember);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/api/auth/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, display_name, role, created_at FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        display_name: user.display_name,
        role: user.role,
        createdAt: user.created_at,
        created_at: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public list of registered cashiers/tellers for login selector & UI (safe: no passwords or salts)
router.get('/api/auth/cashiers', (req, res) => {
  try {
    const cashiers = db.prepare('SELECT id, username, display_name, role FROM users ORDER BY id ASC').all();
    res.json({
      success: true,
      data: cashiers.map(c => ({
        id: c.id,
        username: c.username,
        displayName: c.display_name,
        display_name: c.display_name,
        role: c.role
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/api/auth/change-password', requireAuth, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    if (!user || !db.verifyPassword(oldPassword, user.password_hash, user.salt)) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
    }

    const { hash, salt } = db.hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, user.id);
    if (db.backupUsersToFile) db.backupUsersToFile();
    res.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/api/auth/users', requireAuth, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, display_name, role, created_at FROM users ORDER BY id ASC').all();
    res.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        display_name: u.display_name,
        role: u.role,
        created_at: u.created_at
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/api/auth/users', requireAuth, requireAdmin, (req, res) => {
  try {
    const { username, password, displayName, role } = req.body;
    if (!username || !password || !displayName) {
      return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi.' });
    }
    const cleanUser = username.trim();
    if (cleanUser.length < 3) {
      return res.status(400).json({ success: false, message: 'Username minimal 3 karakter.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUser);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
    }

    const validRole = role === 'ADMIN' ? 'ADMIN' : 'TELLER';
    const { hash, salt } = db.hashPassword(password);
    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, salt, display_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(cleanUser, hash, salt, displayName.trim(), validRole, now);

    if (db.backupUsersToFile) db.backupUsersToFile();

    res.json({
      success: true,
      message: 'Akun kasir berhasil didaftarkan.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/api/auth/users/:id/reset-password', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const { hash, salt } = db.hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, id);
    if (db.backupUsersToFile) db.backupUsersToFile();
    res.json({ success: true, message: 'Password kasir berhasil direset.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/api/auth/users/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === Number(req.user.userId)) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif.' });
    }

    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (db.backupUsersToFile) db.backupUsersToFile();
    res.json({ success: true, message: 'Akun berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== RATES API ====================
router.get('/api/rates', requireAuth, (req, res) => {
  try {
    const rates = db.prepare(`
      SELECT * FROM rates 
      ORDER BY 
        CASE 
          WHEN code = 'USD' THEN 1
          WHEN code = 'USD 20, 10, 5' THEN 2
          WHEN code = 'USD 2, 1' THEN 3
          WHEN code LIKE 'USD%' THEN 4
          WHEN code = 'AUD' THEN 10
          WHEN code = 'SGD' THEN 11
          WHEN code = 'EUR' THEN 12
          WHEN code = 'GBP' THEN 13
          WHEN code = 'JPY' THEN 14
          WHEN code = 'MYR' THEN 20
          WHEN code = 'MYR s' THEN 21
          WHEN code LIKE 'MYR%' THEN 22
          WHEN code = 'HKD' THEN 30
          WHEN code = 'HKD s' THEN 31
          WHEN code LIKE 'HKD%' THEN 32
          WHEN code = 'THB' THEN 40
          WHEN code = 'THB s' THEN 41
          WHEN code LIKE 'THB%' THEN 42
          WHEN code = 'NTD' THEN 50
          WHEN code = 'NTD s' THEN 51
          WHEN code LIKE 'NTD%' THEN 52
          WHEN code = 'PHP' THEN 60
          WHEN code = 'PHP s' THEN 61
          WHEN code LIKE 'PHP%' THEN 62
          WHEN code = 'INR' THEN 70
          WHEN code = 'INR s' THEN 71
          WHEN code LIKE 'INR%' THEN 72
          WHEN code = 'CNY' THEN 80
          WHEN code = 'CNY s' THEN 81
          WHEN code LIKE 'CNY%' THEN 82
          WHEN code = 'SAR' THEN 90
          WHEN code = 'KRW' THEN 91
          ELSE 100
        END ASC,
        code ASC
    `).all();
    res.json({ success: true, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public, read-only buy rates for the TV board (public/pos/display.html).
// No login: the same numbers are shown on the shop TV anyway.
function displayBrand() {
  const get = key => (db.prepare('SELECT value FROM settings WHERE key = ?').get(key) || {}).value || '';
  const logo = get('store_logo');
  return {
    name: get('store_name'),
    company: get('store_company'),
    // The logo can be a large data URL: the TV only downloads it again when this changes
    logo_version: logo ? crypto.createHash('sha1').update(logo).digest('hex').slice(0, 12) : ''
  };
}

router.get('/api/display/rates', (req, res) => {
  try {
    const rates = db.prepare('SELECT code, buy_rate, updated_at FROM rates').all();
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: rates, brand: displayBrand() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/api/display/logo', (req, res) => {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'store_logo'").get();
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, logo: (row && row.value) || '' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/api/rates', requireAuth, (req, res) => {
  try {
    const { code, name, buy_rate, sell_rate, denomination } = req.body;
    if (!code || !name || buy_rate == null || sell_rate == null) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    const cleanCode = code.trim();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO rates (code, name, buy_rate, sell_rate, denomination, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(cleanCode, name.trim(), Number(buy_rate), Number(sell_rate), denomination || 'All', now);
    if (db.backupRatesToFile) db.backupRatesToFile();
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update many buy rates at once (owner edits the whole board each morning).
router.post('/api/rates/bulk-buy', requireAuth, (req, res) => {
  const items = Array.isArray(req.body && req.body.rates) ? req.body.rates : null;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Tidak ada kurs yang diubah' });
  }
  const bad = items.find(it => !it || !it.id || !Number.isFinite(Number(it.buy_rate)) || Number(it.buy_rate) <= 0);
  if (bad) {
    return res.status(400).json({ success: false, message: 'Kurs beli harus angka lebih dari 0' });
  }
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE rates SET buy_rate = ?, updated_at = ? WHERE id = ?');
  db.exec('BEGIN');
  try {
    let updated = 0;
    for (const it of items) updated += stmt.run(Number(it.buy_rate), now, it.id).changes;
    db.exec('COMMIT');
    if (db.backupRatesToFile) db.backupRatesToFile();
    res.json({ success: true, updated });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/api/rates/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, buy_rate, sell_rate, denomination } = req.body;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE rates 
      SET name = ?, buy_rate = ?, sell_rate = ?, denomination = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(name, Number(buy_rate), Number(sell_rate), denomination || 'All', now, id);
    if (db.backupRatesToFile) db.backupRatesToFile();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/api/rates/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM rates WHERE id = ?').run(id);
    if (db.backupRatesToFile) db.backupRatesToFile();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== TRANSACTIONS API ====================
router.get('/api/transactions', requireAuth, (req, res) => {
  try {
    const { date, startDate, endDate, start_date, end_date, date_from, date_to, all, type, delivery, limit = 100 } = req.query;
    const isAll = all === '1' || all === 'true';
    const s = startDate || start_date || date_from;
    const e = endDate || end_date || date_to;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (!isAll) {
      if (s && e) {
        const start = s < e ? s : e;
        const end = s < e ? e : s;
        query += ` AND ${STORE_DAY_SQL} BETWEEN ? AND ?`;
        params.push(start, end);
      } else if (s || e) {
        const target = s || e;
        query += ` AND ${STORE_DAY_SQL} = ?`;
        params.push(target);
      } else if (date) {
        query += ` AND ${STORE_DAY_SQL} = ?`;
        params.push(date);
      }
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (delivery === '1') {
      query += ' AND is_delivery = 1';
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 5000);
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(safeLimit);

    const transactions = db.prepare(query).all(...params);

    const getItems = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?');
    const enriched = transactions.map(t => ({
      ...t,
      items: getItems.all(t.id)
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/api/transactions/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }
    transaction.items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(id);
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/api/transactions', requireAuth, (req, res) => {
  try {
    const {
      receipt_no,
      type,
      customer_name,
      customer_phone,
      customer_id_no,
      customer_npwp,
      customer_nationality,
      customer_job,
      customer_gender,
      customer_address,
      is_pep,
      pep_institution,
      source_of_funds,
      transaction_purpose,
      is_underlying,
      underlying_type,
      underlying_doc_no,
      dttot_check_status,
      teller_name,
      total_idr,
      paid_amount,
      change_amount,
      is_delivery,
      delivery_address,
      delivery_time,
      delivery_status,
      courier_name,
      notes,
      items,
      created_at
    } = req.body;

    if (!type || !customer_name || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Data transaksi tidak lengkap' });
    }

    // Bank Indonesia Compliance Check: DTTOT Real-Time Enforcement (Freeze Without Delay)
    const dttotMatch = findDttotMatch(customer_name);
    if (dttotMatch) {
      return res.status(403).json({
        success: false,
        error: 'TRANSAKSI DIBEKUKAN: Nama nasabah terindikasi dalam Daftar Terduga Teroris / Organisasi Teroris (DTTOT/DPPSPM). Sesuai regulasi Bank Indonesia (PBI APU PPT), transaksi wajib DIBEKUKAN serta-merta tanpa penundaan (Freeze Without Delay).',
        dttot_match: {
          name: dttotMatch.name,
          aliases: dttotMatch.aliases,
          list_type: dttotMatch.list_type
        }
      });
    }

    // Retried request (e.g. response lost on a flaky connection): return the saved transaction
    const clientTxId = typeof req.body.client_tx_id === 'string' ? req.body.client_tx_id.trim() : '';
    if (clientTxId) {
      const existing = db.prepare('SELECT id, receipt_no, created_at FROM transactions WHERE client_tx_id = ?').get(clientTxId);
      if (existing) {
        return res.json({ success: true, duplicate: true, data: existing });
      }
    }

    const finalReceiptNo = resolveReceiptNo(receipt_no);
    const now = created_at || new Date().toISOString();

    const insertTx = db.prepare(`
      INSERT INTO transactions (
        receipt_no, type, customer_name, customer_phone, customer_id_no,
        customer_npwp, customer_nationality, customer_job, customer_gender, customer_address,
        is_pep, pep_institution, source_of_funds, transaction_purpose,
        is_underlying, underlying_type, underlying_doc_no, dttot_check_status,
        teller_name, total_idr, paid_amount, change_amount,
        is_delivery, delivery_address, delivery_time, delivery_status,
        courier_name, notes, created_at, client_tx_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertTx.run(
      finalReceiptNo,
      type,
      customer_name.trim(),
      customer_phone ? customer_phone.trim() : '',
      customer_id_no ? customer_id_no.trim() : '',
      customer_npwp ? customer_npwp.trim() : '',
      customer_nationality ? customer_nationality.trim() : '',
      customer_job ? customer_job.trim() : '',
      customer_gender ? customer_gender.trim() : '',
      customer_address ? customer_address.trim() : '',
      is_pep ? 1 : 0,
      pep_institution ? pep_institution.trim() : '',
      source_of_funds ? source_of_funds.trim() : '',
      transaction_purpose ? transaction_purpose.trim() : '',
      is_underlying ? 1 : 0,
      underlying_type ? underlying_type.trim() : '',
      underlying_doc_no ? underlying_doc_no.trim() : '',
      'CLEARED',
      teller_name || 'TELLER',
      Number(total_idr) || 0,
      Number(paid_amount) || 0,
      Number(change_amount) || 0,
      is_delivery ? 1 : 0,
      delivery_address || '',
      delivery_time || '',
      delivery_status || (is_delivery ? 'PENDING' : 'COMPLETED'),
      courier_name || '',
      notes || '',
      now,
      clientTxId
    );

    const txId = result.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, currency_code, amount, rate, subtotal_idr)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(
        txId,
        item.currency_code,
        Number(item.amount),
        Number(item.rate),
        Number(item.subtotal_idr)
      );
    }

    if (db.backupTransactionsToFile) {
      try { db.backupTransactionsToFile(); } catch (e) {}
    }

    // Auto-sync to Google Sheets in background if enabled
    const autoSync = getSetting('google_sheets_auto_sync');
    const sheetsUrl = getSetting('google_sheets_url');
    if (autoSync === '1' && sheetsUrl && sheetsUrl.trim() !== '') {
      const enrichedTx = {
        receipt_no: finalReceiptNo,
        type,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone ? customer_phone.trim() : '',
        customer_id_no: customer_id_no ? customer_id_no.trim() : '',
        customer_npwp: customer_npwp ? customer_npwp.trim() : '',
        customer_nationality: customer_nationality ? customer_nationality.trim() : '',
        customer_job: customer_job ? customer_job.trim() : '',
        customer_gender: customer_gender ? customer_gender.trim() : '',
        customer_address: customer_address ? customer_address.trim() : '',
        is_pep: is_pep ? 1 : 0,
        pep_institution: pep_institution ? pep_institution.trim() : '',
        source_of_funds: source_of_funds ? source_of_funds.trim() : '',
        transaction_purpose: transaction_purpose ? transaction_purpose.trim() : '',
        is_underlying: is_underlying ? 1 : 0,
        underlying_type: underlying_type ? underlying_type.trim() : '',
        underlying_doc_no: underlying_doc_no ? underlying_doc_no.trim() : '',
        dttot_check_status: 'CLEARED',
        teller_name: teller_name || 'TELLER',
        total_idr: Number(total_idr) || 0,
        paid_amount: Number(paid_amount) || 0,
        change_amount: Number(change_amount) || 0,
        is_delivery: is_delivery ? 1 : 0,
        notes: notes || '',
        created_at: now,
        items: items.map(item => ({
          currency_code: item.currency_code,
          amount: Number(item.amount),
          rate: Number(item.rate),
          subtotal_idr: Number(item.subtotal_idr)
        }))
      };
      sendToGoogleSheets(sheetsUrl, { action: 'sync', transaction: enrichedTx })
        .then(r => console.log(`[Google Sheets Auto-Sync] ${finalReceiptNo}:`, r.message || 'OK'))
        .catch(e => console.error(`[Google Sheets Auto-Sync Error] ${finalReceiptNo}:`, e.message));
    }

    res.json({
      success: true,
      data: {
        id: txId,
        receipt_no: finalReceiptNo,
        created_at: now
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Delivery Status
router.patch('/api/transactions/:id/delivery', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status, courier_name } = req.body;
    const stmt = db.prepare(`
      UPDATE transactions 
      SET delivery_status = COALESCE(?, delivery_status),
          courier_name = COALESCE(?, courier_name)
      WHERE id = ?
    `);
    stmt.run(delivery_status, courier_name, id);
    if (db.backupTransactionsToFile) {
      try { db.backupTransactionsToFile(); } catch (e) {}
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DTTOT screening shared by live POST and offline sync
function findDttotMatch(customerName) {
  return db.prepare('SELECT * FROM dttot_list').all().find(row => dttotRowMatches(customerName, row)) || null;
}

// ==================== BATCH OFFLINE SYNC API ====================
router.post('/api/sync', requireAuth, (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.json({ success: true, synced: 0 });
    }

    let syncedCount = 0;
    const flagged = [];
    const findByClientId = db.prepare('SELECT id FROM transactions WHERE client_tx_id = ?');
    const findByReceipt = db.prepare('SELECT id, created_at, total_idr, customer_name FROM transactions WHERE receipt_no = ?');
    const renamed = [];
    const insertTx = db.prepare(`
      INSERT INTO transactions (
        receipt_no, type, customer_name, customer_phone, customer_id_no,
        customer_npwp, customer_nationality, customer_job, customer_gender, customer_address,
        is_pep, pep_institution, source_of_funds, transaction_purpose,
        is_underlying, underlying_type, underlying_doc_no, dttot_check_status,
        teller_name, total_idr, paid_amount, change_amount,
        is_delivery, delivery_address, delivery_time, delivery_status,
        courier_name, notes, created_at, client_tx_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, currency_code, amount, rate, subtotal_idr)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const tx of transactions) {
      // Same device transaction already stored (re-sent queue): skip
      const clientTxId = typeof tx.client_tx_id === 'string' ? tx.client_tx_id.trim() : '';
      if (clientTxId && findByClientId.get(clientTxId)) continue;

      // Older queued items have no client_tx_id: treat as the same transaction only if it matches exactly
      const sameReceipt = findByReceipt.get(tx.receipt_no);
      if (sameReceipt && !clientTxId
        && sameReceipt.created_at === tx.created_at
        && Number(sameReceipt.total_idr) === Number(tx.total_idr)
        && sameReceipt.customer_name === tx.customer_name) continue;

      // A different transaction holds this number: keep the data, assign a new number
      const finalReceiptNo = resolveReceiptNo(tx.receipt_no);
      if (finalReceiptNo !== tx.receipt_no) renamed.push({ from: tx.receipt_no, to: finalReceiptNo });
      tx.receipt_no = finalReceiptNo;

      if (findDttotMatch(tx.customer_name)) flagged.push(tx.receipt_no);
      const result = insertTx.run(
        tx.receipt_no,
        tx.type,
        tx.customer_name,
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
        findDttotMatch(tx.customer_name) ? 'FLAGGED_ON_SYNC' : 'CLEARED_ON_SYNC',
        tx.teller_name || 'TELLER',
        Number(tx.total_idr),
        Number(tx.paid_amount),
        Number(tx.change_amount),
        tx.is_delivery ? 1 : 0,
        tx.delivery_address || '',
        tx.delivery_time || '',
        tx.delivery_status || 'COMPLETED',
        tx.courier_name || '',
        tx.notes || '',
        tx.created_at,
        clientTxId
      );
      const newId = result.lastInsertRowid;
      if (Array.isArray(tx.items)) {
        for (const item of tx.items) {
          insertItem.run(newId, item.currency_code, Number(item.amount), Number(item.rate), Number(item.subtotal_idr));
        }
      }
      syncedCount++;
    }

    if (syncedCount > 0 && db.backupTransactionsToFile) {
      try { db.backupTransactionsToFile(); } catch (e) {}
    }

    // Auto-sync to Google Sheets in background if enabled
    const autoSync = getSetting('google_sheets_auto_sync');
    const sheetsUrl = getSetting('google_sheets_url');
    if (autoSync === '1' && sheetsUrl && sheetsUrl.trim() !== '' && transactions.length > 0) {
      sendToGoogleSheets(sheetsUrl, { action: 'sync', transactions: transactions })
        .then(r => console.log(`[Google Sheets Batch Sync]:`, r.message || 'OK'))
        .catch(e => console.error(`[Google Sheets Batch Sync Error]:`, e.message));
    }

    res.json({ success: true, synced: syncedCount, flagged, renamed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== SETTINGS API ====================
router.get('/api/settings', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7) : (req.query && req.query.token);
    const isAuthenticated = !!(token && db.verifyToken(token));

    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const r of rows) {
      if (!isAuthenticated && (r.key.startsWith('google_sheets_') || r.key === 'store_permit')) {
        continue;
      }
      settings[r.key] = r.value;
    }
    res.json({ success: true, data: settings, authenticated: isAuthenticated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/api/settings', requireAuth, (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const settings = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(settings)) {
      // Cashiers/tellers can configure Google Sheets integration; general store settings require Admin
      if (!isAdmin && !key.startsWith('google_sheets_') && !key.startsWith('store_') && key !== 'default_teller' && !key.startsWith('disclaimer_')) {
        continue;
      }
      stmt.run(key, String(value));
    }
    if (db.backupSettingsToFile) db.backupSettingsToFile();
    res.json({ success: true, message: 'Pengaturan berhasil disimpan secara permanen.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dedicated Google Sheets Configuration Endpoint (available to all authenticated users)
router.post('/api/sheets/config', requireAuth, (req, res) => {
  try {
    const { url, auto_sync } = req.body;
    if (url !== undefined) {
      const cleanUrl = String(url).trim();
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('google_sheets_url', cleanUrl);
    }
    if (auto_sync !== undefined) {
      const syncVal = (auto_sync === true || auto_sync === '1' || auto_sync === 1) ? '1' : '0';
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('google_sheets_auto_sync', syncVal);
    }
    if (db.backupSettingsToFile) db.backupSettingsToFile();

    res.json({
      success: true,
      message: 'URL dan konfigurasi Google Sheets berhasil disimpan secara permanen.',
      data: {
        google_sheets_url: getSetting('google_sheets_url'),
        google_sheets_auto_sync: getSetting('google_sheets_auto_sync')
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== REPORTS SUMMARY ====================

// ==================== DTTOT & COMPLIANCE API ====================

// Real-time screening against DTTOT & DPPSPM list
router.post('/api/dttot/check', requireAuth, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.json({ success: true, match: false });
    }

    const match = findDttotMatch(name);
    if (match) {
      return res.json({
        success: true,
        match: true,
        data: {
          id: match.id,
          ref_code: match.ref_code,
          name: match.name,
          aliases: match.aliases,
          nationality: match.nationality,
          list_type: match.list_type,
          notes: match.notes
        }
      });
    }

    res.json({ success: true, match: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List DTTOT entries with optional search & pagination
router.get('/api/dttot', requireAuth, (req, res) => {
  try {
    const { q, list_type, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM dttot_list WHERE 1=1';
    const params = [];

    if (q && q.trim()) {
      const term = `%${q.trim().toUpperCase()}%`;
      query += ' AND (UPPER(name) LIKE ? OR UPPER(aliases) LIKE ? OR UPPER(notes) LIKE ? OR UPPER(ref_code) LIKE ?)';
      params.push(term, term, term, term);
    }

    if (list_type && list_type !== 'ALL') {
      query += ' AND list_type = ?';
      params.push(list_type);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const entries = db.prepare(query).all(...params);
    const totalCount = db.prepare('SELECT COUNT(*) as c FROM dttot_list').get().c;

    res.json({ success: true, data: entries, total: totalCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new DTTOT / DPPSPM entry
router.post('/api/dttot', requireAuth, requireAdmin, (req, res) => {
  try {
    const { name, aliases, nationality, date_of_birth, list_type, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama terduga teroris / entitas wajib diisi.' });
    }

    const type = list_type || 'DTTOT';
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO dttot_list (name, aliases, nationality, date_of_birth, list_type, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name.trim().toUpperCase(),
      (aliases || '').trim(),
      (nationality || 'INDONESIA').trim().toUpperCase(),
      (date_of_birth || '').trim(),
      type,
      (notes || '').trim(),
      now
    );

    res.json({ success: true, id: result.lastInsertRowid, message: 'Data kepatuhan DTTOT berhasil ditambahkan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete DTTOT entry
router.delete('/api/dttot/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT ref_code FROM dttot_list WHERE id = ?').get(id);
    if (row && row.ref_code) {
      return res.status(400).json({ success: false, message: 'Data resmi DTTOT (kode ' + row.ref_code + ') tidak bisa dihapus. Perbarui lewat file data DTTOT terbaru.' });
    }
    db.prepare('DELETE FROM dttot_list WHERE id = ?').run(id);
    res.json({ success: true, message: 'Data kepatuhan DTTOT berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BI "Laporan Summary Valas [By Currency]": per currency (all note sizes together, e.g. USD + USD 20, 10, 5 = BN-USD)
// opening balance, buy and sell volume in the period, closing balance at moving average cost (kurs tengah).
// Opening stock comes only from transactions recorded before the period; there is no separate stock input.
function buildBiSummary(start, end) {
  const lines = db.prepare(`
    SELECT t.type, ${STORE_DAY_SQL_T} AS day, ti.currency_code, ti.amount, ti.subtotal_idr
    FROM transactions t JOIN transaction_items ti ON ti.transaction_id = t.id
    WHERE ${STORE_DAY_SQL_T} <= ?
    ORDER BY t.created_at, t.id, ti.id
  `).all(end);

  const book = new Map();
  for (const l of lines) {
    const cur = String(l.currency_code || '').trim().slice(0, 3).toUpperCase();
    if (!cur) continue;
    if (!book.has(cur)) book.set(cur, { qty: 0, cost: 0, open: null, buyQty: 0, buyIdr: 0, sellQty: 0, sellIdr: 0 });
    const b = book.get(cur);
    if (l.day >= start && !b.open) b.open = { qty: b.qty, cost: b.cost };
    const qty = Number(l.amount) || 0;
    const idr = Number(l.subtotal_idr) || 0;
    if (l.type === 'BELI') {
      b.qty += qty;
      b.cost += idr;
    } else {
      // stock leaves at the current average cost, not at the selling rate
      const avg = b.qty > 0 ? b.cost / b.qty : 0;
      b.qty -= qty;
      b.cost = Math.abs(b.qty) < 1e-9 ? 0 : b.cost - qty * avg;
    }
    if (l.day >= start) {
      if (l.type === 'BELI') { b.buyQty += qty; b.buyIdr += idr; } else { b.sellQty += qty; b.sellIdr += idr; }
    }
  }

  const rows = [...book.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([cur, b]) => {
    const open = b.open || { qty: b.qty, cost: b.cost };
    return {
      currency: `BN-${cur}`,
      open_qty: open.qty, open_idr: open.cost,
      buy_qty: b.buyQty, buy_idr: b.buyIdr,
      sell_qty: b.sellQty, sell_idr: b.sellIdr,
      close_qty: b.qty, close_rate: b.qty > 0 ? b.cost / b.qty : 0, close_idr: b.cost
    };
  }).filter(r => r.open_qty || r.buy_qty || r.sell_qty || r.close_qty);

  const sum = key => rows.reduce((a, r) => a + r[key], 0);
  return { rows, totals: { open_idr: sum('open_idr'), buy_idr: sum('buy_idr'), sell_idr: sum('sell_idr'), close_idr: sum('close_idr') } };
}

router.get('/api/reports/bi-summary', requireAuth, (req, res) => {
  try {
    const { startDate, endDate, date, all } = req.query;
    let start = startDate || date || storeDate();
    let end = endDate || startDate || date || storeDate();
    if (all === '1' || all === 'true') {
      const first = db.prepare(`SELECT MIN(${STORE_DAY_SQL}) AS d FROM transactions`).get().d;
      start = first || storeDate();
      end = storeDate();
    }
    if (start > end) [start, end] = [end, start];
    const company = (db.prepare("SELECT value FROM settings WHERE key = 'store_company'").get() || {}).value || '';
    res.json({ success: true, data: { company, startDate: start, endDate: end, ...buildBiSummary(start, end) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/api/reports/summary', requireAuth, (req, res) => {
  try {
    const { date, startDate, endDate, start_date, end_date, date_from, date_to, all } = req.query;
    const isAll = all === '1' || all === 'true';
    const s = startDate || start_date || date_from;
    const e = endDate || end_date || date_to;

    let whereClause = '';
    let whereParams = [];
    let period = {};

    if (isAll) {
      whereClause = '1=1';
      period = { isAll: true, isRange: false, label: 'Semua Riwayat' };
    } else if (s && e) {
      const start = s < e ? s : e;
      const end = s < e ? e : s;
      whereClause = `${STORE_DAY_SQL} BETWEEN ? AND ?`;
      whereParams = [start, end];
      period = { startDate: start, endDate: end, isRange: start !== end, label: start === end ? start : `${start} s/d ${end}` };
    } else if (s || e) {
      const target = s || e;
      whereClause = `${STORE_DAY_SQL} = ?`;
      whereParams = [target];
      period = { startDate: target, endDate: target, isRange: false, label: target };
    } else if (date) {
      whereClause = `${STORE_DAY_SQL} = ?`;
      whereParams = [date];
      period = { startDate: date, endDate: date, isRange: false, label: date };
    } else {
      const today = storeDate();
      whereClause = `${STORE_DAY_SQL} = ?`;
      whereParams = [today];
      period = { startDate: today, endDate: today, isRange: false, label: today };
    }

    const totals = db.prepare(`
      SELECT 
        type, 
        COUNT(*) as count, 
        SUM(total_idr) as sum_idr 
      FROM transactions 
      WHERE ${whereClause} 
      GROUP BY type
    `).all(...whereParams);

    const currencies = db.prepare(`
      SELECT 
        ti.currency_code, 
        t.type,
        SUM(ti.amount) as total_valas, 
        SUM(ti.subtotal_idr) as total_idr
      FROM transaction_items ti
      JOIN transactions t ON t.id = ti.transaction_id
      WHERE ${whereClause.replace(/created_at/g, 't.created_at')}
      GROUP BY ti.currency_code, t.type
    `).all(...whereParams);

    res.json({
      success: true,
      data: {
        date: period.startDate || period.label,
        period,
        totals,
        currencies
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== GOOGLE SHEETS SYNC API ====================

// Test Connection (Ping)
router.post('/api/sheets/test', requireAuth, async (req, res) => {
  try {
    const rawUrl = req.body.url || getSetting('google_sheets_url');
    if (!rawUrl || rawUrl.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'URL Web App Google Sheets belum diisi. Masukkan URL Apps Script terlebih dahulu.'
      });
    }
    const cleanUrl = rawUrl.trim();
    const result = await sendToGoogleSheets(cleanUrl, { action: 'ping' });
    if (result && result.success) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('google_sheets_url', cleanUrl);
      if (db.backupSettingsToFile) db.backupSettingsToFile();
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal terhubung ke Google Sheets: ' + err.message
    });
  }
});

// Trigger Manual / Batch Sync to Google Sheets
router.post('/api/sheets/sync', requireAuth, async (req, res) => {
  try {
    const { date, transaction_id, all, url: overrideUrl } = req.body;
    const targetUrl = overrideUrl || getSetting('google_sheets_url');
    if (!targetUrl || targetUrl.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'URL Web App Google Sheets belum diatur di menu Pengaturan.'
      });
    }

    const { startDate, endDate, start_date, end_date } = req.body;
    let txQuery = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    const isAll = all === '1' || all === 'true' || all === true;
    const s = startDate || start_date;
    const e = endDate || end_date;

    if (transaction_id) {
      txQuery += ' AND id = ?';
      params.push(transaction_id);
    } else if (isAll) {
      // Sync all recorded
    } else if (s && e) {
      const start = s < e ? s : e;
      const end = s < e ? e : s;
      txQuery += ` AND ${STORE_DAY_SQL} BETWEEN ? AND ?`;
      params.push(start, end);
    } else if (s || e) {
      txQuery += ` AND ${STORE_DAY_SQL} = ?`;
      params.push(s || e);
    } else if (date) {
      txQuery += ` AND ${STORE_DAY_SQL} = ?`;
      params.push(date);
    } else {
      const today = storeDate();
      txQuery += ` AND ${STORE_DAY_SQL} = ?`;
      params.push(today);
    }

    txQuery += ' ORDER BY id ASC';
    const txList = db.prepare(txQuery).all(...params);

    if (txList.length === 0) {
      return res.json({
        success: true,
        processed: 0,
        message: 'Tidak ada data transaksi yang perlu disinkronkan.'
      });
    }

    const getItems = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?');
    const enrichedList = txList.map(t => ({
      ...t,
      items: getItems.all(t.id)
    }));

    const result = await sendToGoogleSheets(targetUrl, {
      action: 'sync',
      transactions: enrichedList
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal sinkronisasi ke Google Sheets: ' + err.message
    });
  }
});

// Get Apps Script code for 1-click copy
router.get('/api/sheets/script', requireAuth, (req, res) => {
  try {
    const scriptPath = path.join(__dirname, 'google-apps-script.js');
    if (fs.existsSync(scriptPath)) {
      const code = fs.readFileSync(scriptPath, 'utf8');
      res.type('text/plain').send(code);
    } else {
      res.status(404).send('File google-apps-script.js tidak ditemukan.');
    }
  } catch (err) {
    res.status(500).send('Error membaca script: ' + err.message);
  }
});

// Helper: Format export dates as DD-MMM-YYYY (e.g. 11-Aug-2026)
const EXPORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatExportDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString).split('T')[0];
  const [yyyy, mm, dd] = storeDate(d).split('-');
  return `${dd}-${EXPORT_MONTHS[Number(mm) - 1]}-${yyyy}`;
}

// Helper: Query transactions with item lines for export (single date or date range)
function getTransactionsForExport({ date, startDate, endDate, isAll } = {}) {
  let query = `
    SELECT 
      t.id, t.receipt_no, t.type, t.customer_name, t.customer_phone, t.customer_id_no,
      t.customer_npwp, t.customer_nationality, t.customer_job, t.customer_gender,
      t.customer_address, t.is_pep, t.pep_institution, t.source_of_funds,
      t.transaction_purpose, t.is_underlying, t.underlying_type, t.underlying_doc_no,
      t.dttot_check_status, t.teller_name, t.total_idr, t.paid_amount, t.change_amount,
      t.notes, t.created_at,
      ti.currency_code, ti.amount, ti.rate, ti.subtotal_idr
    FROM transactions t
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
  `;
  const params = [];
  if (!isAll) {
    const s = startDate;
    const e = endDate;
    if (s && e) {
      const start = s < e ? s : e;
      const end = s < e ? e : s;
      query += ` WHERE ${STORE_DAY_SQL_T} BETWEEN ? AND ?`;
      params.push(start, end);
    } else if (s || e) {
      query += ` WHERE ${STORE_DAY_SQL_T} = ?`;
      params.push(s || e);
    } else {
      const targetDate = date || storeDate();
      query += ` WHERE ${STORE_DAY_SQL_T} = ?`;
      params.push(targetDate);
    }
  }
  query += ' ORDER BY t.id ASC, ti.id ASC';
  return db.prepare(query).all(...params);
}

// Helper: Build CSV matching the 14 Google Sheets template columns + extended columns
function buildTransactionsCsvString(rows) {
  // UTF-8 BOM so Excel & Google Sheets open cleanly with proper accents & delimiters
  let csv = '\uFEFFDATE,CUSTOMER NAME,PHONE NUMBER,ID NUMBER,NPWP,COUNTRY,OCCUPATION,GENDER,ADDRESS,INVOICE NUMBER,CURRENCY,AMOUNT,BUY RATE,TOTAL IDR,TRANSACTION TYPE,TELLER,PEP,UNDERLYING,NOTES\r\n';
  
  function esc(val) {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  }

  for (const r of rows) {
    const dateStr = formatExportDate(r.created_at);
    const name = esc((r.customer_name || 'CASH').toUpperCase());
    const phone = esc(r.customer_phone || '');
    const idNo = esc(r.customer_id_no || '');
    const npwp = esc(r.customer_npwp || '');
    const country = esc((r.customer_nationality || 'INDONESIA').toUpperCase());
    const job = esc((r.customer_job || '').toUpperCase());
    const gender = esc((r.customer_gender || '').toUpperCase());
    const address = esc((r.customer_address || '').toUpperCase());
    const invoiceNo = esc(r.receipt_no || '');
    const currency = esc(r.currency_code || '');
    const amount = Number(r.amount) || 0;
    const rate = Number(r.rate) || 0;
    const totalIdr = Number(r.subtotal_idr || r.total_idr) || 0;
    const type = esc(r.type || 'BELI');
    const teller = esc(r.teller_name || '');
    const pep = esc(r.is_pep ? 'YA' : 'TIDAK');
    const underlying = esc(r.is_underlying ? (r.underlying_type || 'YA') : 'TIDAK');
    const notes = esc(r.notes || '');

    csv += `${dateStr},${name},${phone},${idNo},${npwp},${country},${job},${gender},${address},${invoiceNo},${currency},${amount},${rate},${totalIdr},${type},${teller},${pep},${underlying},${notes}\r\n`;
  }
  return csv;
}

// Helper: Build native Excel .xlsx file matching the 14 columns + styling & formulas
async function buildTransactionsExcelBuffer(rows, periodTitle) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Skyline Exchange POS';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Transactions', {
    pageSetup: { orientation: 'landscape', paperSize: 9 } // A4 Landscape
  });

  // Title Banner
  worksheet.mergeCells('A1:S1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'PT SKYLINE VALAS MANDIRI - REKAP TRANSAKSI VALUTA ASING (KUPVA BB)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2135' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 32;

  // Subtitle Banner
  worksheet.mergeCells('A2:S2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Periode: ${periodTitle} | Format Database Transaksi Standar KUPVA BB Bank Indonesia`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  // 14 Core Template Columns + Extended Compliance Columns
  const headers = [
    { header: 'DATE', key: 'date', width: 14 },
    { header: 'CUSTOMER NAME', key: 'customer_name', width: 26 },
    { header: 'PHONE NUMBER', key: 'phone', width: 18 },
    { header: 'ID NUMBER', key: 'id_no', width: 20 },
    { header: 'NPWP', key: 'npwp', width: 20 },
    { header: 'COUNTRY', key: 'country', width: 16 },
    { header: 'OCCUPATION', key: 'job', width: 18 },
    { header: 'GENDER', key: 'gender', width: 12 },
    { header: 'ADDRESS', key: 'address', width: 26 },
    { header: 'INVOICE NUMBER', key: 'invoice_no', width: 20 },
    { header: 'CURRENCY', key: 'currency', width: 12 },
    { header: 'AMOUNT', key: 'amount', width: 16 },
    { header: 'BUY RATE', key: 'rate', width: 16 },
    { header: 'TOTAL IDR', key: 'total_idr', width: 22 },
    { header: 'TYPE', key: 'type', width: 12 },
    { header: 'TELLER', key: 'teller', width: 16 },
    { header: 'PEP', key: 'pep', width: 10 },
    { header: 'UNDERLYING', key: 'underlying', width: 16 },
    { header: 'NOTES', key: 'notes', width: 24 }
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;
  headers.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF134E4A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };
    worksheet.getColumn(idx + 1).width = col.width;
  });

  let rowIdx = 5;
  rows.forEach((r, i) => {
    const dRow = worksheet.getRow(rowIdx);
    dRow.height = 20;
    const isEven = i % 2 === 0;
    const bg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    dRow.values = [
      formatExportDate(r.created_at),
      (r.customer_name || 'CASH').toUpperCase(),
      r.customer_phone || '',
      r.customer_id_no || '',
      r.customer_npwp || '',
      (r.customer_nationality || 'INDONESIA').toUpperCase(),
      (r.customer_job || '').toUpperCase(),
      (r.customer_gender || '').toUpperCase(),
      (r.customer_address || '').toUpperCase(),
      r.receipt_no || '',
      r.currency_code || '',
      Number(r.amount) || 0,
      Number(r.rate) || 0,
      Number(r.subtotal_idr || r.total_idr) || 0,
      r.type || 'BELI',
      r.teller_name || '',
      r.is_pep ? 'YA' : 'TIDAK',
      r.is_underlying ? (r.underlying_type || 'YA') : 'TIDAK',
      r.notes || ''
    ];

    for (let c = 1; c <= headers.length; c++) {
      const cell = dRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      if (c === 1 || c === 8 || c === 11 || c === 15 || c === 17) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (c === 12) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.00';
      } else if (c === 13) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      } else if (c === 14) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = 'Rp #,##0';
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    }
    rowIdx++;
  });

  // Summary calculation row
  if (rows.length > 0) {
    const sumRow = worksheet.getRow(rowIdx);
    sumRow.height = 24;
    sumRow.getCell(1).value = 'TOTAL KESELURUHAN';
    worksheet.mergeCells(`A${rowIdx}:K${rowIdx}`);
    const mergedSumLabel = sumRow.getCell(1);
    mergedSumLabel.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    mergedSumLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    mergedSumLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    const sumAmountCell = sumRow.getCell(12);
    sumAmountCell.value = { formula: `SUM(L5:L${rowIdx - 1})` };
    sumAmountCell.numFmt = '#,##0.00';
    sumAmountCell.font = { name: 'Calibri', size: 11, bold: true };
    sumAmountCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    const emptyM = sumRow.getCell(13);
    emptyM.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    const sumIdrCell = sumRow.getCell(14);
    sumIdrCell.value = { formula: `SUM(N5:N${rowIdx - 1})` };
    sumIdrCell.numFmt = 'Rp #,##0';
    sumIdrCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF047857' } };
    sumIdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    for (let c = 15; c <= headers.length; c++) {
      const cell = sumRow.getCell(c);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    }
  }

  return await workbook.xlsx.writeBuffer();
}

// Export CSV handler (Google Sheets template compatible)
const handleExportCsv = (req, res) => {
  try {
    const isAll = req.query.all === '1' || req.query.all === 'true';
    const s = req.query.startDate || req.query.start_date || req.query.date_from;
    const e = req.query.endDate || req.query.end_date || req.query.date_to;
    const date = req.query.date;

    const rows = getTransactionsForExport({ date, startDate: s, endDate: e, isAll });
    const csvData = buildTransactionsCsvString(rows);

    let filename = 'Skyline_POS_Transactions_ALL.csv';
    if (!isAll) {
      if (s && e && s !== e) {
        filename = `Skyline_POS_${s}_sd_${e}.csv`;
      } else {
        const targetDate = s || e || date || storeDate();
        filename = `Skyline_POS_${targetDate}.csv`;
      }
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor CSV: ' + err.message });
  }
};

// Export Excel handler (.xlsx native)
const handleExportExcel = async (req, res) => {
  try {
    const isAll = req.query.all === '1' || req.query.all === 'true';
    const s = req.query.startDate || req.query.start_date || req.query.date_from;
    const e = req.query.endDate || req.query.end_date || req.query.date_to;
    const date = req.query.date;

    const rows = getTransactionsForExport({ date, startDate: s, endDate: e, isAll });

    let periodTitle = 'Semua Riwayat Database';
    let filename = 'Skyline_POS_Transactions_ALL.xlsx';

    if (!isAll) {
      if (s && e && s !== e) {
        periodTitle = `Periode: ${s} s/d ${e}`;
        filename = `Skyline_POS_${s}_sd_${e}.xlsx`;
      } else {
        const targetDate = s || e || date || storeDate();
        periodTitle = `Periode: ${targetDate}`;
        filename = `Skyline_POS_${targetDate}.xlsx`;
      }
    }

    const buffer = await buildTransactionsExcelBuffer(rows, periodTitle);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor Excel: ' + err.message });
  }
};

// Register export endpoints with aliases
router.get('/api/sheets/export-csv', requireAuth, handleExportCsv);
router.get('/api/transactions/export/csv', requireAuth, handleExportCsv);
router.get('/api/sheets/export-excel', requireAuth, handleExportExcel);
router.get('/api/transactions/export/excel', requireAuth, handleExportExcel);



// ==================== SYSTEM & DATABASE DIAGNOSTICS / BACKUP API ====================

// Get database storage info and stats
router.get('/api/system/db-info', requireAuth, (req, res) => {
  try {
    const usersCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const ratesCount = db.prepare('SELECT COUNT(*) as c FROM rates').get().c;
    const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
    const txCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c;
    const itemsCount = db.prepare('SELECT COUNT(*) as c FROM transaction_items').get().c;
    let dttotCount = 0; try { dttotCount = db.prepare('SELECT COUNT(*) as c FROM dttot_list').get().c; } catch (e) {}

    const storageDir = db.storageDir || path.resolve(__dirname, '..', 'skyline_storage');
    const dbPath = db.dbPath || path.join(storageDir, 'database.sqlite');

    let dbFileSize = 0;
    try {
      if (fs.existsSync(dbPath)) {
        dbFileSize = fs.statSync(dbPath).size;
      }
    } catch (e) {}

    const backupFiles = [
      'skyline_users_backup.json',
      'skyline_rates_backup.json',
      'skyline_settings_backup.json',
      'skyline_transactions_backup.json'
    ].map(name => {
      const p = path.join(storageDir, name);
      const exists = fs.existsSync(p);
      let size = 0;
      let mtime = null;
      if (exists) {
        const stat = fs.statSync(p);
        size = stat.size;
        mtime = stat.mtime.toISOString();
      }
      return { name, exists, size, mtime };
    });

    // Diagnostics for Hostinger storage
    let versionsList = [];
    try {
      const parent = path.resolve(__dirname, '..');
      versionsList = fs.readdirSync(parent).map(v => {
        const vPath = path.join(parent, v);
        const hasDb = fs.existsSync(path.join(vPath, 'skyline_storage', 'database.sqlite')) || fs.existsSync(path.join(vPath, 'database.sqlite'));
        return { name: v, hasDb, isCurrent: vPath === __dirname };
      });
    } catch (e) {}

    const candidateTests = [];
    const testDirs = [
      path.resolve(__dirname, '..', '..', 'skyline_storage'),
      path.resolve(__dirname, '..', 'skyline_storage'),
      process.env.HOME ? path.join(process.env.HOME, 'skyline_storage') : null,
      path.join(__dirname, 'skyline_storage')
    ].filter(Boolean);

    for (const td of testDirs) {
      let writable = false;
      let errStr = null;
      try {
        if (!fs.existsSync(td)) fs.mkdirSync(td, { recursive: true });
        const pt = path.join(td, '.test_' + Date.now());
        fs.writeFileSync(pt, '1');
        fs.unlinkSync(pt);
        writable = true;
      } catch (err) {
        errStr = err.message;
      }
      candidateTests.push({ dir: td, writable, error: errStr });
    }

    res.json({
      success: true,
      data: {
        platform: process.platform,
        storage_dir: storageDir,
        db_path: dbPath,
        db_file_size: dbFileSize,
        is_external_storage: !storageDir.startsWith(__dirname),
        counts: {
          users: usersCount,
          rates: ratesCount,
          settings: settingsCount,
          transactions: txCount,
          transaction_items: itemsCount,
        dttot_records: dttotCount
        },
        backups: backupFiles,
        server_time: new Date().toISOString(),
        hostinger_diagnostics: {
          dirname: __dirname,
          cwd: process.cwd(),
          home: process.env.HOME,
          versions: versionsList,
          candidate_tests: candidateTests
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Download complete JSON backup of all tables (Users, Rates, Settings, Transactions)
router.get('/api/system/backup/download', requireAuth, requireAdmin, (req, res) => {
  try {
    if (!db.getAllDataSnapshot) {
      return res.status(500).json({ success: false, message: 'Fungsi snapshot tidak tersedia.' });
    }
    const snapshot = db.getAllDataSnapshot();
    const dateStr = storeDate();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="Skyline_POS_FullBackup_${dateStr}.json"`);
    res.send(JSON.stringify(snapshot, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Restore database from complete JSON backup
router.post('/api/system/backup/restore', requireAuth, requireAdmin, (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, message: 'Data backup tidak valid atau kosong.' });
    }
    if (!db.restoreAllDataSnapshot) {
      return res.status(500).json({ success: false, message: 'Fungsi restore tidak tersedia.' });
    }
    const result = db.restoreAllDataSnapshot(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
