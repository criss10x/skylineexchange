/**
 * SKYLINE EXCHANGE - GOOGLE APPS SCRIPT WEBHOOK SINKRONISASI
 * 
 * Script ini dipasang di Google Sheets (Extensions -> Apps Script).
 * Menerima data transaksi dari POS Skyline Exchange dan mencatatnya
 * otomatis ke spreadsheet sesuai format standar 14 kolom lengkap:
 * 
 * [A] DATE
 * [B] CUSTOMER NAME
 * [C] PHONE NUMBER
 * [D] ID NUMBER
 * [E] NPWP
 * [F] COUNTRY
 * [G] OCCUPATION
 * [H] GENDER
 * [I] ADDRESS
 * [J] INVOICE NUMBER
 * [K] CURRENCY
 * [L] AMOUNT
 * [M] BUY RATE
 * [N] TOTAL IDR
 * [O] TYPE (Tambahan Audit)
 * [P] TELLER (Tambahan Audit)
 * [Q] NOTES (Tambahan Audit)
 */

var CORE_HEADERS = [
  'DATE',
  'CUSTOMER NAME',
  'PHONE NUMBER',
  'ID NUMBER',
  'NPWP',
  'COUNTRY',
  'OCCUPATION',
  'GENDER',
  'ADDRESS',
  'INVOICE NUMBER',
  'CURRENCY',
  'AMOUNT',
  'BUY RATE',
  'TOTAL IDR',
  'TYPE',
  'TELLER',
  'NOTES'
];

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    status: 'ONLINE',
    spreadsheet_title: ss.getName(),
    spreadsheet_id: ss.getId(),
    available_tabs: sheets,
    message: 'Skyline Exchange POS Webhook siap menerima sinkronisasi database.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, message: 'Tidak ada data POST yang diterima.' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'sync';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. PING / TEST CONNECTION
    if (action === 'ping' || action === 'test') {
      var sheets = ss.getSheets().map(function(s) { return s.getName(); });
      return jsonResponse({
        success: true,
        status: 'CONNECTED',
        spreadsheet_title: ss.getName(),
        spreadsheet_id: ss.getId(),
        total_tabs: sheets.length,
        tabs: sheets.slice(0, 10),
        message: 'Koneksi ke Google Sheets "' + ss.getName() + '" Berhasil!'
      });
    }

    // 2. SINKRONISASI TRANSAKSI
    var txList = [];
    if (payload.transactions && Array.isArray(payload.transactions)) {
      txList = payload.transactions;
    } else if (payload.transaction) {
      txList = [payload.transaction];
    } else if (payload.items && payload.receipt_no) {
      txList = [payload];
    }

    if (txList.length === 0) {
      return jsonResponse({ success: false, message: 'Daftar transaksi kosong.' });
    }

    // Tentukan sheet target: gunakan sheet aktif atau sheet pertama
    var sheet = getTargetSheet(ss);
    ensureHeaderRow(sheet);

    var rowsProcessed = 0;
    for (var i = 0; i < txList.length; i++) {
      rowsProcessed += processSingleTransaction(sheet, txList[i]);
    }

    return jsonResponse({
      success: true,
      processed: rowsProcessed,
      sheet_name: sheet.getName(),
      message: 'Berhasil mencatat ' + rowsProcessed + ' baris transaksi ke sheet "' + sheet.getName() + '".'
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Error Google Apps Script: ' + error.toString()
    });
  }
}

/**
 * Mencari atau menentukan sheet tempat data dicatat
 */
function getTargetSheet(ss) {
  // Cek sheet aktif terlebih dahulu
  var active = ss.getActiveSheet();
  if (active) return active;
  var sheets = ss.getSheets();
  return sheets[0];
}

/**
 * Memastikan baris header tersedia
 */
function ensureHeaderRow(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.appendRow(CORE_HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, CORE_HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#134E4A'); // Dark Teal / Navy
    headerRange.setFontColor('#FFFFFF');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
}

/**
 * Format tanggal: 11-Aug-2026
 */
var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatSheetDate(isoString) {
  var d = isoString ? new Date(isoString) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  var dd = ('0' + d.getDate()).slice(-2);
  var mmm = MONTH_NAMES[d.getMonth()];
  var yyyy = d.getFullYear();
  return dd + '-' + mmm + '-' + yyyy;
}

/**
 * Memproses 1 transaksi (bisa memiliki 1 atau lebih valas items)
 */
function processSingleTransaction(sheet, tx) {
  var items = tx.items || [];
  if (items.length === 0 && tx.currency_code) {
    items = [{
      currency_code: tx.currency_code,
      amount: tx.amount,
      rate: tx.rate,
      subtotal_idr: tx.subtotal_idr || tx.total_idr
    }];
  }

  // POS sends the store day (WITA) in tx.date; created_at fallback for older POS versions
  var dateFormatted = tx.date || formatSheetDate(tx.created_at);
  var customerName = (tx.customer_name || 'CASH').toUpperCase().trim();
  var phone = String(tx.customer_phone || '').trim();
  var idNo = String(tx.customer_id_no || '').trim();
  var npwp = String(tx.customer_npwp || '').trim();
  var country = (tx.customer_nationality || 'INDONESIA').toUpperCase().trim();
  var job = (tx.customer_job || '').toUpperCase().trim();
  var gender = (tx.customer_gender || '').toUpperCase().trim();
  var address = (tx.customer_address || '').toUpperCase().trim();
  var invoiceNo = String(tx.receipt_no || '').trim();
  var txType = String(tx.type || 'BELI').toUpperCase().trim();
  var teller = String(tx.teller_name || '').trim();
  var notes = String(tx.notes || '').trim();

  // Dapatkan seluruh data yang sudah ada untuk cek duplikasi
  var lastRow = sheet.getLastRow();
  var existingData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, Math.min(sheet.getLastColumn(), 17)).getValues() : [];

  var count = 0;

  for (var j = 0; j < items.length; j++) {
    var item = items[j];
    var curr = String(item.currency_code || '').toUpperCase().trim();
    var amount = Number(item.amount) || 0;
    var rate = Number(item.rate) || 0;
    var totalIdr = Number(item.subtotal_idr || (amount * rate)) || 0;

    var rowValues = [
      dateFormatted,
      customerName,
      phone,
      idNo,
      npwp,
      country,
      job,
      gender,
      address,
      invoiceNo,
      curr,
      amount,
      rate,
      totalIdr,
      txType,
      teller,
      notes
    ];

    // Cek apakah invoice + currency ini sudah pernah dicatat sebelumnya
    var duplicateRowIndex = -1;
    for (var r = 0; r < existingData.length; r++) {
      var rowInv = String(existingData[r][9] || '').trim(); // Kolom J (INVOICE NUMBER)
      var rowCurr = String(existingData[r][10] || '').trim(); // Kolom K (CURRENCY)
      if (invoiceNo && rowInv === invoiceNo && rowCurr === curr) {
        duplicateRowIndex = r + 2; // baris di spreadsheet (1-indexed + header)
        break;
      }
    }

    if (duplicateRowIndex > 0) {
      // Update baris yang sudah ada
      sheet.getRange(duplicateRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Tambah baris baru
      sheet.appendRow(rowValues);
      var newRowIdx = sheet.getLastRow();

      // Format kolom angka
      sheet.getRange(newRowIdx, 12).setNumberFormat('#,##0.00'); // Amount
      sheet.getRange(newRowIdx, 13).setNumberFormat('#,##0');    // Rate
      sheet.getRange(newRowIdx, 14).setNumberFormat('#,##0');    // Total IDR
    }

    count++;
  }

  return count;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
