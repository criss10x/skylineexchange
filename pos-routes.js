/* Skyline Exchange POS API & Routing Module */
"use strict";

const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const db = require('./pos-db.js');

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
async function sendToGoogleSheets(url, payload) {
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
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePrefix = `SE-${yyyy}${mm}${dd}`;

  const row = db.prepare(`
    SELECT receipt_no FROM transactions 
    WHERE receipt_no LIKE ? 
    ORDER BY id DESC LIMIT 1
  `).get(`${datePrefix}-%`);

  let nextSeq = 1;
  if (row && row.receipt_no) {
    const parts = row.receipt_no.split('-');
    if (parts.length === 3) {
      const currentSeq = parseInt(parts[2], 10);
      if (!isNaN(currentSeq)) {
        nextSeq = currentSeq + 1;
      }
    }
  }
  return `${datePrefix}-${String(nextSeq).padStart(4, '0')}`;
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
    const { date, type, delivery, limit = 50 } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (date) {
      query += ' AND created_at LIKE ?';
      params.push(`${date}%`);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (delivery === '1') {
      query += ' AND is_delivery = 1';
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

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

    const finalReceiptNo = receipt_no || generateReceiptNo();
    const now = created_at || new Date().toISOString();

    const insertTx = db.prepare(`
      INSERT INTO transactions (
        receipt_no, type, customer_name, customer_phone, customer_id_no,
        teller_name, total_idr, paid_amount, change_amount,
        is_delivery, delivery_address, delivery_time, delivery_status,
        courier_name, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertTx.run(
      finalReceiptNo,
      type,
      customer_name.trim(),
      customer_phone ? customer_phone.trim() : '',
      customer_id_no ? customer_id_no.trim() : '',
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
      now
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

// ==================== BATCH OFFLINE SYNC API ====================
router.post('/api/sync', requireAuth, (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.json({ success: true, synced: 0 });
    }

    let syncedCount = 0;
    const checkReceipt = db.prepare('SELECT id FROM transactions WHERE receipt_no = ?');
    const insertTx = db.prepare(`
      INSERT INTO transactions (
        receipt_no, type, customer_name, customer_phone, customer_id_no,
        teller_name, total_idr, paid_amount, change_amount,
        is_delivery, delivery_address, delivery_time, delivery_status,
        courier_name, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO transaction_items (transaction_id, currency_code, amount, rate, subtotal_idr)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const tx of transactions) {
      const exists = checkReceipt.get(tx.receipt_no);
      if (!exists) {
        const result = insertTx.run(
          tx.receipt_no,
          tx.type,
          tx.customer_name,
          tx.customer_phone || '',
          tx.customer_id_no || '',
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
          tx.created_at
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
    }

    // Auto-sync to Google Sheets in background if enabled
    const autoSync = getSetting('google_sheets_auto_sync');
    const sheetsUrl = getSetting('google_sheets_url');
    if (autoSync === '1' && sheetsUrl && sheetsUrl.trim() !== '' && transactions.length > 0) {
      sendToGoogleSheets(sheetsUrl, { action: 'sync', transactions: transactions })
        .then(r => console.log(`[Google Sheets Batch Sync]:`, r.message || 'OK'))
        .catch(e => console.error(`[Google Sheets Batch Sync Error]:`, e.message));
    }

    res.json({ success: true, synced: syncedCount });
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
router.get('/api/reports/summary', requireAuth, (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const totals = db.prepare(`
      SELECT 
        type, 
        COUNT(*) as count, 
        SUM(total_idr) as sum_idr 
      FROM transactions 
      WHERE created_at LIKE ? 
      GROUP BY type
    `).all(`${targetDate}%`);

    const currencies = db.prepare(`
      SELECT 
        ti.currency_code, 
        t.type,
        SUM(ti.amount) as total_valas, 
        SUM(ti.subtotal_idr) as total_idr
      FROM transaction_items ti
      JOIN transactions t ON t.id = ti.transaction_id
      WHERE t.created_at LIKE ?
      GROUP BY ti.currency_code, t.type
    `).all(`${targetDate}%`);

    res.json({
      success: true,
      data: {
        date: targetDate,
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

    let txQuery = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (transaction_id) {
      txQuery += ' AND id = ?';
      params.push(transaction_id);
    } else if (date) {
      txQuery += ' AND created_at LIKE ?';
      params.push(`${date}%`);
    } else if (!all) {
      const today = new Date().toISOString().split('T')[0];
      txQuery += ' AND created_at LIKE ?';
      params.push(`${today}%`);
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

// Export CSV formatted for Google Sheets import
router.get('/api/sheets/export-csv', requireAuth, (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const txList = db.prepare(`
      SELECT t.*, ti.currency_code, ti.amount, ti.rate, ti.subtotal_idr
      FROM transactions t
      JOIN transaction_items ti ON ti.transaction_id = t.id
      WHERE t.created_at LIKE ?
      ORDER BY t.type ASC, t.id ASC
    `).all(`${targetDate}%`);

    let csv = 'DATE,NAME,CURRENCY,RATE,AMOUNT,TOTAL (RP),NOTES,KOMISI\r\n';
    for (const r of txList) {
      const d = new Date(r.created_at);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const dateStr = `${dd}/${mm}/${yyyy}`;
      const name = `"${(r.customer_name + (r.customer_id_no ? ' (' + r.customer_id_no + ')' : '')).replace(/"/g, '""')}"`;
      const curr = r.currency_code;
      const rate = r.rate;
      const amount = r.amount;
      const total = r.subtotal_idr;
      const notes = `"${(r.notes || '').replace(/"/g, '""')}"`;
      csv += `${dateStr},${name},${curr},${rate},${amount},${total},${notes},\r\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Skyline_POS_${targetDate}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ==================== SYSTEM & DATABASE DIAGNOSTICS / BACKUP API ====================

// Get database storage info and stats
router.get('/api/system/db-info', requireAuth, (req, res) => {
  try {
    const usersCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const ratesCount = db.prepare('SELECT COUNT(*) as c FROM rates').get().c;
    const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
    const txCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c;
    const itemsCount = db.prepare('SELECT COUNT(*) as c FROM transaction_items').get().c;

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
          transaction_items: itemsCount
        },
        backups: backupFiles,
        server_time: new Date().toISOString()
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
    const dateStr = new Date().toISOString().split('T')[0];
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
