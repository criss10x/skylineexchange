/**
 * SKYLINE EXCHANGE - GOOGLE APPS SCRIPT WEBHOOK SINKRONISASI
 * 
 * Script ini dipasang di Google Sheets (Extensions -> Apps Script).
 * Menerima data transaksi dari POS Skyline Exchange dan mencatatnya
 * otomatis ke tab sheet sesuai tanggal (misal tab "1", "2", ..., "6", ..., "31").
 * 
 * Struktur Kolom Beli (BUY):
 * [A] DATE | [B] NAME | [C] CURRENCY | [D] RATE | [E] AMOUNT | [F] TOTAL (RP) | [G] NOTES | [H] KOMISI
 * 
 * Struktur Kolom Jual (SELL):
 * Terletak di bawah baris "SELL FOREIGN CURRENCY"
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    status: 'ONLINE',
    spreadsheet_title: ss.getName(),
    spreadsheet_id: ss.getId(),
    available_tabs: sheets,
    message: 'Skyline Exchange POS Webhook siap menerima sinkronisasi.'
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

    var totalRowsProcessed = 0;
    var tabsAffected = {};

    for (var i = 0; i < txList.length; i++) {
      var tx = txList[i];
      var count = processSingleTransaction(ss, tx);
      totalRowsProcessed += count.processed;
      if (count.tab) {
        tabsAffected[count.tab] = (tabsAffected[count.tab] || 0) + count.processed;
      }
    }

    var tabSummary = Object.keys(tabsAffected).map(function(t) {
      return 'Tab "' + t + '": ' + tabsAffected[t] + ' baris';
    }).join(', ');

    return jsonResponse({
      success: true,
      processed: totalRowsProcessed,
      tabs_summary: tabSummary,
      message: 'Berhasil mencatat ' + totalRowsProcessed + ' baris valas ke Google Sheets (' + tabSummary + ').'
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Error Google Apps Script: ' + error.toString()
    });
  }
}

/**
 * Memproses 1 transaksi (bisa berisi multi-valas items)
 */
function processSingleTransaction(ss, tx) {
  var createdAt = tx.created_at ? new Date(tx.created_at) : new Date();
  if (isNaN(createdAt.getTime())) {
    createdAt = new Date();
  }

  // Tanggal sebagai nama tab: "1", "2", ..., "6", ..., "31"
  var dayNumber = String(createdAt.getDate());
  var sheet = ss.getSheetByName(dayNumber);

  // Jika tab belum ada, buat dari template atau inisialisasi baru
  if (!sheet) {
    sheet = createDateTab(ss, dayNumber);
  }

  // Format tanggal Indonesia: DD/MM/YYYY
  var dd = ('0' + createdAt.getDate()).slice(-2);
  var mm = ('0' + (createdAt.getMonth() + 1)).slice(-2);
  var yyyy = createdAt.getFullYear();
  var dateStr = dd + '/' + mm + '/' + yyyy;

  // Nama Customer + Passport/ID
  var customerDisplay = (tx.customer_name || 'CASH').trim();
  if (tx.customer_id_no && tx.customer_id_no.trim() !== '') {
    customerDisplay += ' (' + tx.customer_id_no.trim() + ')';
  }

  var isBuy = (tx.type === 'BELI');
  var items = tx.items || [];
  if (items.length === 0 && tx.currency_code) {
    items = [{
      currency_code: tx.currency_code,
      amount: tx.amount,
      rate: tx.rate,
      subtotal_idr: tx.subtotal_idr || tx.total_idr
    }];
  }

  var rowsWritten = 0;

  for (var j = 0; j < items.length; j++) {
    var item = items[j];
    // User requested: NOTES column is left blank (no receipt number or teller)
    var notesStr = (tx.notes || '').trim();

    var rowData = {
      date: dateStr,
      name: customerDisplay,
      currency: item.currency_code,
      rate: Number(item.rate) || 0,
      amount: Number(item.amount) || 0,
      total_rp: Number(item.subtotal_idr) || 0,
      notes: notesStr,
      receipt_no: tx.receipt_no || '',
      komisi: ''
    };

    if (isBuy) {
      writeBuyRow(sheet, rowData);
    } else {
      writeSellRow(sheet, rowData);
    }
    rowsWritten++;
  }

  return { processed: rowsWritten, tab: dayNumber };
}

/**
 * Menulis baris pada bagian BUY (BELI)
 */
function writeBuyRow(sheet, data) {
  var lastRow = sheet.getLastRow();
  var dataRange = sheet.getRange(1, 1, Math.max(lastRow, 30), 8).getValues();

  var totalRowIdx = -1;
  for (var r = 0; r < dataRange.length; r++) {
    var colA = String(dataRange[r][0] || '').trim().toUpperCase();
    if (colA === 'TOTAL') {
      totalRowIdx = r + 1; // 1-indexed
      break;
    }
  }

  // Jika tidak ditemukan tulisan TOTAL, fallback ke row sebelum SELL FOREIGN CURRENCY
  if (totalRowIdx === -1) {
    for (var r2 = 0; r2 < dataRange.length; r2++) {
      var colA2 = String(dataRange[r2][0] || '').trim().toUpperCase();
      if (colA2.indexOf('SELL FOREIGN') !== -1) {
        totalRowIdx = r2 + 1;
        break;
      }
    }
  }

  // 1. Cek apakah transaksi ini sudah pernah ditulis sebelumnya (hindari duplikasi)
  var searchEnd = totalRowIdx > 0 ? totalRowIdx - 1 : Math.min(lastRow, 25);
  for (var i = 1; i < searchEnd; i++) {
    var existingNotes = String(dataRange[i][6] || '');
    var existingCurr = String(dataRange[i][2] || '');
    var existingName = String(dataRange[i][1] || '').trim();
    var existingAmount = Number(dataRange[i][4]) || 0;
    var cellNote = sheet.getRange(i + 1, 1).getNote();

    var isDuplicate = (cellNote && data.receipt_no && cellNote.indexOf(data.receipt_no) !== -1 && existingCurr === data.currency) ||
                      (existingNotes && data.receipt_no && existingNotes.indexOf(data.receipt_no) !== -1 && existingCurr === data.currency) ||
                      (existingName === data.name && existingCurr === data.currency && existingAmount === data.amount);

    if (isDuplicate) {
      // Update row yang sudah ada
      var targetRow = i + 1;
      sheet.getRange(targetRow, 1, 1, 8).setValues([[
        data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes, data.komisi
      ]]);
      if (data.receipt_no) {
        sheet.getRange(targetRow, 1).setNote(data.receipt_no);
      }
      return;
    }
  }

  // 2. Cari baris kosong di bagian BUY sebelum baris TOTAL
  var emptyRowIdx = -1;
  if (totalRowIdx > 0) {
    for (var k = 1; k < totalRowIdx - 1; k++) {
      var currVal = String(dataRange[k][2] || '').trim();
      var nameVal = String(dataRange[k][1] || '').trim();
      if (currVal === '' && nameVal === '') {
        emptyRowIdx = k + 1; // 1-indexed
        break;
      }
    }
  }

  if (emptyRowIdx > 0) {
    // Tulis ke slot kosong yang sudah tersedia
    sheet.getRange(emptyRowIdx, 1, 1, 8).setValues([[
      data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes, data.komisi
    ]]);
    if (data.receipt_no) {
      sheet.getRange(emptyRowIdx, 1).setNote(data.receipt_no);
    }
  } else if (totalRowIdx > 0) {
    // Sisipkan baris baru tepat di atas baris TOTAL (formula SUM akan otomatis menyesuaikan)
    sheet.insertRowBefore(totalRowIdx);
    sheet.getRange(totalRowIdx, 1, 1, 8).setValues([[
      data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes, data.komisi
    ]]);
    if (data.receipt_no) {
      sheet.getRange(totalRowIdx, 1).setNote(data.receipt_no);
    }
  } else {
    // Fallback jika format sheet bebas
    sheet.appendRow([data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes, data.komisi]);
    if (data.receipt_no) {
      sheet.getRange(sheet.getLastRow(), 1).setNote(data.receipt_no);
    }
  }
}

/**
 * Menulis baris pada bagian SELL (JUAL)
 */
function writeSellRow(sheet, data) {
  var lastRow = sheet.getLastRow();
  var maxScan = Math.max(lastRow, 50);
  var dataRange = sheet.getRange(1, 1, maxScan, 8).getValues();

  var sellHeaderIdx = -1;
  var sellDataStartIdx = -1;
  var sellEndIdx = -1;

  for (var r = 0; r < dataRange.length; r++) {
    var colA = String(dataRange[r][0] || '').trim().toUpperCase();
    if (colA.indexOf('SELL FOREIGN') !== -1) {
      sellHeaderIdx = r + 1; // 1-indexed
      sellDataStartIdx = sellHeaderIdx + 2; // Lewati judul dan baris sub-header
      continue;
    }
    if (sellHeaderIdx !== -1 && (colA.indexOf('MODAL AWAL') !== -1 || colA === 'TOTAL')) {
      sellEndIdx = r + 1;
      break;
    }
  }

  // Jika tidak ada seksi SELL, buat atau append
  if (sellHeaderIdx === -1) {
    sheet.appendRow(['SELL FOREIGN CURRENCY']);
    sheet.appendRow(['DATE', 'NAME', 'CURRENCY', 'RATE', 'AMOUNT', 'TOTAL (RP)', 'NOTES']);
    sheet.appendRow([data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes]);
    if (data.receipt_no) {
      sheet.getRange(sheet.getLastRow(), 1).setNote(data.receipt_no);
    }
    return;
  }

  if (sellEndIdx === -1) {
    sellEndIdx = lastRow + 1;
  }

  // 1. Cek duplikasi di seksi SELL
  for (var i = sellDataStartIdx - 1; i < sellEndIdx - 1; i++) {
    if (i < dataRange.length) {
      var existingNotes = String(dataRange[i][6] || '');
      var existingCurr = String(dataRange[i][2] || '');
      var existingName = String(dataRange[i][1] || '').trim();
      var existingAmount = Number(dataRange[i][4]) || 0;
      var cellNote = sheet.getRange(i + 1, 1).getNote();

      var isDuplicate = (cellNote && data.receipt_no && cellNote.indexOf(data.receipt_no) !== -1 && existingCurr === data.currency) ||
                        (existingNotes && data.receipt_no && existingNotes.indexOf(data.receipt_no) !== -1 && existingCurr === data.currency) ||
                        (existingName === data.name && existingCurr === data.currency && existingAmount === data.amount);

      if (isDuplicate) {
        var targetRow = i + 1;
        sheet.getRange(targetRow, 1, 1, 7).setValues([[
          data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes
        ]]);
        if (data.receipt_no) {
          sheet.getRange(targetRow, 1).setNote(data.receipt_no);
        }
        return;
      }
    }
  }

  // 2. Cari slot kosong di seksi SELL
  var emptySlotIdx = -1;
  for (var k = sellDataStartIdx - 1; k < sellEndIdx - 1; k++) {
    if (k < dataRange.length) {
      var cVal = String(dataRange[k][2] || '').trim();
      var nVal = String(dataRange[k][1] || '').trim();
      if (cVal === '' && nVal === '') {
        emptySlotIdx = k + 1;
        break;
      }
    }
  }

  if (emptySlotIdx > 0) {
    sheet.getRange(emptySlotIdx, 1, 1, 7).setValues([[
      data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes
    ]]);
    if (data.receipt_no) {
      sheet.getRange(emptySlotIdx, 1).setNote(data.receipt_no);
    }
  } else {
    // Sisipkan tepat sebelum MODAL AWAL
    sheet.insertRowBefore(sellEndIdx);
    sheet.getRange(sellEndIdx, 1, 1, 7).setValues([[
      data.date, data.name, data.currency, data.rate, data.amount, data.total_rp, data.notes
    ]]);
    if (data.receipt_no) {
      sheet.getRange(sellEndIdx, 1).setNote(data.receipt_no);
    }
  }
}

/**
 * Membuat tab baru untuk tanggal tertentu jika belum ada
 */
function createDateTab(ss, dayNumber) {
  // Coba salin dari tab "1" atau tab pertama yang ada
  var template = ss.getSheetByName('1') || ss.getSheetByName('6') || ss.getSheets()[0];
  if (template) {
    var newSheet = template.copyTo(ss);
    newSheet.setName(dayNumber);
    // Bersihkan data transaksi yang ada di template agar tab baru siap pakai
    cleanTemplateSheet(newSheet);
    return newSheet;
  }

  // Buat lembar kerja baru dasar
  var created = ss.insertSheet(dayNumber);
  created.getRange(1, 1, 1, 8).setValues([[
    'DATE', 'NAME', 'CURRENCY', 'RATE', 'AMOUNT', 'TOTAL (RP)', 'NOTES', 'KOMISI'
  ]]);
  created.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E0F2FE');
  return created;
}

/**
 * Membersihkan data lama pada tab hasil duplikasi
 */
function cleanTemplateSheet(sheet) {
  try {
    var data = sheet.getRange(1, 1, Math.min(sheet.getLastRow(), 40), 8).getValues();
    var inBuy = true;
    for (var r = 1; r < data.length; r++) {
      var colA = String(data[r][0] || '').trim().toUpperCase();
      if (colA === 'TOTAL' || colA.indexOf('SELL FOREIGN') !== -1) {
        inBuy = false;
      }
      if (colA.indexOf('MODAL AWAL') !== -1) {
        break;
      }
      // Bersihkan baris transaksi
      if (inBuy && r >= 1) {
        sheet.getRange(r + 1, 2, 1, 7).clearContent(); // Bersihkan nama, curr, rate, amount, total, notes, komisi
      } else if (!inBuy && colA.indexOf('SELL FOREIGN') === -1 && colA !== 'DATE') {
        sheet.getRange(r + 1, 2, 1, 6).clearContent();
      }
    }
  } catch (err) {
    // Abaikan error minor pembersihan
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
