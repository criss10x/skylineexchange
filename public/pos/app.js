/**
 * Skyline Exchange POS Application Logic
 * Supports: Dual Language (ID / EN), Offline-first IndexedDB, Web Bluetooth 58mm Thermal Printer, Delivery Mode, Rates & KYC
 */

// Dual Language Translations Dictionary
const i18n = {
  id: {
    // Header & Navigation
    appBadge: 'POS Valas',
    online: 'Online',
    offline: 'Offline (Lokal)',
    syncQueueText: 'antrean offline',
    connectBt: 'Hubungkan Printer BT',
    tabPos: 'Kasir Transaksi',
    tabRates: 'Papan Kurs',
    tabDelivery: 'Delivery Valas',
    tabHistory: 'Riwayat & Laporan',
    tabSettings: 'Pengaturan',
    tabSheets: 'Google Sheets',
    subtabSheets: 'Integrasi Google Sheets',
    subtabStore: 'Profil Toko',

    // POS Cashier Form
    btnBeli: 'BELI VALAS (BUY)',
    btnJual: 'JUAL VALAS (SELL)',
    modeDelivery: 'Mode Delivery',
    expBeli: 'Kasir membeli valas dari customer. Customer menyerahkan Valas dan menerima Rupiah (IDR).',
    expJual: 'Kasir menjual valas ke customer. Customer membeli Valas dan menyerahkan Rupiah (IDR).',
    deliveryAddrLabel: 'Alamat Pengantaran / Hotel / Villa *',
    deliveryAddrPlaceholder: 'Contoh: Hotel Grand Bali Villa No. 12, Kuta',
    deliveryTimeLabel: 'Jadwal Pengantaran',
    deliveryTimePlaceholder: 'Contoh: Hari ini, Pukul 15:30 WITA',
    deliveryCourierLabel: 'Nama Kurir / Petugas',
    deliveryCourierPlaceholder: 'Nama petugas pengantar',
    custTitle: 'Data Pelanggan (Customer)',
    custNameLabel: 'Nama Customer *',
    custNamePlaceholder: 'Nama Lengkap Customer',
    custPhoneLabel: 'No. Telepon / WhatsApp',
    custIdLabel: 'No. ID KTP / Paspor',
    custIdPlaceholder: 'Nomor KTP atau Paspor',
    addValasTitle: 'Tambah Rincian Valas',
    addValasSub: 'Pilih mata uang & isi nominal',
    currLabel: 'Mata Uang (Valas)',
    amountLabel: 'Jumlah Valas',
    amountPlaceholder: 'Contoh: 100',
    rateLabel: 'Kurs (Rate)',
    btnAdd: 'Tambah',
    quickPick: 'Pilihan cepat:',
    customCurrencyTitle: 'Mata Uang Kustom (Custom Currency)',
    saveCustomRateLabel: 'Simpan ke Papan Kurs',
    customCodeLabel: 'Kode Valas (contoh: VND, AED, CHF, NZD)',
    customNameLabel: 'Nama Mata Uang',
    customOptionLabel: '+ Kustom / Valas Lain (+ Custom)',

    // Cart 4 Columns Table
    cartTitle: 'Tabel Rincian Valas (4 Kolom Struk)',
    cartItemsCount: 'Item',
    cartItemsEmpty: 'Belum ada valas yang ditambahkan.<br>Silakan pilih mata uang dan klik tombol Tambah.',
    colValas: 'Valas',
    colAmount: 'Jumlah',
    colRate: 'Kurs',
    colSubtotal: 'Sub Total',
    colAction: 'Aksi',

    // Financial Totals
    totalIdr: 'TOTAL (IDR)',
    paymentIdr: 'PEMBAYARAN (IDR)',
    changeIdr: 'KEMBALIAN (IDR)',
    exactCash: 'Uang Pas',
    btnSubmitTx: 'Proses Transaksi & Cetak Struk',
    btnReset: 'Reset',

    // Thermal Receipt Preview
    receiptPreviewTitle: 'Pratinjau Struk 80mm',
    receiptLangTag: 'Struk:',
    rcptNoLabel: 'No. Struk',
    rcptDateLabel: 'Tgl & Jam',
    rcptTypeLabel: 'Tipe',
    rcptTypeBeli: 'BELI VALAS (BUY)',
    rcptTypeJual: 'JUAL VALAS (SELL)',
    rcptTellerLabel: 'Teller',
    rcptCustLabel: 'Customer',
    rcptPhoneLabel: 'No. Telp',
    rcptIdLabel: 'No. ID',
    rcptServiceLabel: 'Layanan',
    rcptDeliveryVal: 'DELIVERY (ANTAR)',
    rcptColValas: 'VALAS',
    rcptColQty: 'JML',
    rcptColRate: 'KURS',
    rcptColSub: 'SUBTOTAL',
    rcptItemsEmpty: 'Belum ada item',
    rcptTotal: 'TOTAL IDR',
    rcptPayment: 'PEMBAYARAN',
    rcptChange: 'KEMBALIAN',
    rcptSignTeller: 'Teller',
    rcptSignCustomer: 'Customer',
    rcptSignNamePrompt: 'Nama TTD Customer:',
    rcptSignPlaceholder: 'NAMA TTD',
    rcptDisclaimer1: '* Periksa fisik uang sebelum meninggalkan kasir.',
    rcptDisclaimer2: '* Uang yang sudah ditukar tidak dapat dikembalikan.',
    rcptThanks: 'TERIMA KASIH ATAS KUNJUNGAN ANDA',
    btnPrintBt: 'Cetak BT',
    btnPrintBrowser: 'Cetak Browser',
    btnShareWa: 'Kirim WA',

    // Tab Rates
    ratesTitle: 'Papan Kurs Harian Skyline Exchange',
    ratesSub: 'Atur harga Kurs Beli (We Buy) dan Kurs Jual (We Sell). Perubahan langsung berlaku di kasir.',
    btnAddRate: 'Tambah Mata Uang',
    thCurr: 'Mata Uang',
    thDenom: 'Pecahan',
    thBuy: 'Kurs Beli (We Buy)',
    thSell: 'Kurs Jual (We Sell)',
    thSpread: 'Spread (Selisih)',
    thAction: 'Aksi',
    btnEditRate: 'Edit Kurs',

    // Rate Modal
    modalRateTitleAdd: 'Tambah Mata Uang Baru',
    modalRateTitleEdit: 'Edit Kurs: ',
    modalCode: 'Kode Valas (3 Huruf)',
    modalName: 'Nama Mata Uang',
    modalDenom: 'Pecahan / Catatan',
    modalBuy: 'Kurs Beli (We Buy)',
    modalSell: 'Kurs Jual (We Sell)',
    btnCancelModalRate: 'Batal',
    btnSaveRate: 'Simpan Kurs',

    // Tab Delivery
    deliveryTitle: 'Manajemen Pengantaran Valas (Delivery)',
    deliverySub: 'Lacak pesanan valas yang diantar ke hotel, villa, atau kantor pelanggan.',
    statusAll: 'Semua Status',
    statusPending: 'Menunggu Kurir',
    statusOnTheWay: 'Dalam Pengantaran',
    statusCompleted: 'Selesai',
    statusCancelled: 'Batal',
    btnReprintDelivery: 'Struk',
    statusCompletedFull: 'Selesai (Sudah Serah Terima)',

    // Tab History & Summary
    histBuyToday: 'Total Beli Hari Ini (Kasir Beli)',
    histSellToday: 'Total Jual Hari Ini (Kasir Jual)',
    histTurnoverToday: 'Perputaran Total Hari Ini',
    histTitle: 'Riwayat Transaksi',
    histSearchPlaceholder: 'Cari no struk / nama customer...',
    thHistNo: 'No. Struk',
    thHistTime: 'Waktu',
    thHistType: 'Tipe',
    thHistCust: 'Customer',
    thHistItems: 'Rincian Valas',
    thHistTotal: 'Total IDR',
    thHistAction: 'Aksi',
    btnHistoryReprint: 'Cetak',

    // Tab Settings
    settingsTitle: 'Pengaturan Toko & Struk',
    settingStoreName: 'Nama Money Changer',
    settingStoreAddr: 'Alamat Outlet / Counter',
    settingStorePhone: 'No. WhatsApp & Telepon',
    settingPaperSize: 'Ukuran Kertas Thermal Printer',
    paper80Title: '80 mm (Standar Kasir)',
    paper80Desc: 'Lebar 48 kolom, tampilan lega & auto-cutter',
    paper58Title: '58 mm (Printer Mini / Mobile)',
    paper58Desc: 'Lebar 32 kolom, compact untuk printer Bluetooth kecil',
    settingPermit: 'Nomor Izin KUPVA / Bank Indonesia',
    settingShowPermit: 'Tampilkan di Struk (Saat ini disembunyikan)',
    settingTeller: 'Nama Teller Aktif di Kasir',
    settingDisc1: 'Catatan Disclaimer 1 Struk',
    settingDisc2: 'Catatan Disclaimer 2 Struk',
    btnSaveSettings: 'Simpan Pengaturan',

    // Integrasi Google Sheets
    sheetsCardTitle: 'Integrasi Google Sheets (Pencatatan Cloud Otomatis)',
    sheetsCardSubtitle: 'Mencatat data transaksi langsung ke tab tanggal pada spreadsheet Anda',
    sheetsTargetDoc: 'Spreadsheet Target:',
    sheetsRuleMapping: 'Sistem Tab:',
    setSheetsUrl: 'URL Web App Google Apps Script',
    setSheetsAutoSync: 'Otomatis kirim transaksi ke Google Sheets setiap kali transaksi disimpan atau dicetak',
    btnSheetsTest: 'Tes Koneksi Google Sheets',
    btnSheetsSyncToday: 'Backup Hari Ini ke Google Sheets',
    btnSheetsGuide: 'Panduan 1 Menit & Salin Script',
    btnHistSync: 'Sync Sheets',
    btnHistCsv: 'Export CSV',
    modalGuideTitle: 'Panduan Integrasi Google Sheets (1 Menit Siap)',
    btnCopyScript: 'Salin Kode Script (1-Click)'
  },
  en: {
    // Header & Navigation
    appBadge: 'Forex POS',
    online: 'Online',
    offline: 'Offline (Local)',
    syncQueueText: 'offline queued',
    connectBt: 'Connect BT Printer',
    tabPos: 'Cashier POS',
    tabRates: 'Exchange Rates',
    tabDelivery: 'Currency Delivery',
    tabHistory: 'History & Reports',
    tabSettings: 'Settings',
    tabSheets: 'Google Sheets',
    subtabSheets: 'Google Sheets Integration',
    subtabStore: 'Store Profile',

    // POS Cashier Form
    btnBeli: 'BUY CURRENCY (WE BUY)',
    btnJual: 'SELL CURRENCY (WE SELL)',
    modeDelivery: 'Delivery Mode',
    expBeli: 'We buy foreign currency from customer. Customer receives Rupiah (IDR).',
    expJual: 'We sell foreign currency to customer. Customer pays Rupiah (IDR).',
    deliveryAddrLabel: 'Delivery Address / Hotel / Villa *',
    deliveryAddrPlaceholder: 'e.g. Grand Bali Villa Room 12, Kuta',
    deliveryTimeLabel: 'Delivery Schedule',
    deliveryTimePlaceholder: 'e.g. Today at 15:30 WITA',
    deliveryCourierLabel: 'Courier / Staff Name',
    deliveryCourierPlaceholder: 'Staff in charge',
    custTitle: 'Customer Information (KYC)',
    custNameLabel: 'Customer Name *',
    custNamePlaceholder: 'Full Customer Name',
    custPhoneLabel: 'Phone / WhatsApp',
    custIdLabel: 'Passport / ID No.',
    custIdPlaceholder: 'Passport or National ID',
    addValasTitle: 'Add Currency Item',
    addValasSub: 'Select currency & enter amount',
    currLabel: 'Currency (Forex)',
    amountLabel: 'Amount',
    amountPlaceholder: 'e.g. 100',
    rateLabel: 'Rate (IDR)',
    btnAdd: 'Add Item',
    quickPick: 'Quick select:',
    customCurrencyTitle: 'Custom Currency (Valas Kustom)',
    saveCustomRateLabel: 'Save to Rates Board',
    customCodeLabel: 'Currency Code (e.g. VND, AED, CHF, NZD)',
    customNameLabel: 'Currency Name',
    customOptionLabel: '+ Custom Currency (+ Valas Kustom)',

    // Cart 4 Columns Table
    cartTitle: 'Exchange Items Table (4 Columns)',
    cartItemsCount: 'Items',
    cartItemsEmpty: 'No currency added yet.<br>Select a currency and click Add Item.',
    colValas: 'Currency',
    colAmount: 'Amount',
    colRate: 'Rate',
    colSubtotal: 'Sub Total',
    colAction: 'Action',

    // Financial Totals
    totalIdr: 'TOTAL (IDR)',
    paymentIdr: 'PAYMENT (IDR)',
    changeIdr: 'CHANGE (IDR)',
    exactCash: 'Exact Cash',
    btnSubmitTx: 'Process Transaction & Print Receipt',
    btnReset: 'Reset Form',

    // Thermal Receipt Preview
    receiptPreviewTitle: '80mm Receipt Preview',
    receiptLangTag: 'Receipt:',
    rcptNoLabel: 'Receipt No',
    rcptDateLabel: 'Date & Time',
    rcptTypeLabel: 'Type',
    rcptTypeBeli: 'BUY CURRENCY (BUY)',
    rcptTypeJual: 'SELL CURRENCY (SELL)',
    rcptTellerLabel: 'Teller',
    rcptCustLabel: 'Customer',
    rcptPhoneLabel: 'Phone No',
    rcptIdLabel: 'Passport / ID',
    rcptServiceLabel: 'Service',
    rcptDeliveryVal: 'DELIVERY SERVICE',
    rcptColValas: 'CURR',
    rcptColQty: 'QTY',
    rcptColRate: 'RATE',
    rcptColSub: 'SUB TOTAL',
    rcptItemsEmpty: 'No items',
    rcptTotal: 'TOTAL IDR',
    rcptPayment: 'PAYMENT',
    rcptChange: 'CHANGE',
    rcptSignTeller: 'Teller',
    rcptSignCustomer: 'Customer',
    rcptSignNamePrompt: 'Customer Sign Name:',
    rcptSignPlaceholder: 'SIGN NAME',
    rcptDisclaimer1: '* Please check your banknotes before leaving the counter.',
    rcptDisclaimer2: '* Exchanged currency cannot be returned or refunded.',
    rcptThanks: 'THANK YOU FOR YOUR VISIT',
    btnPrintBt: 'Print BT',
    btnPrintBrowser: 'System Print',
    btnShareWa: 'Share WA',

    // Tab Rates
    ratesTitle: 'Skyline Exchange Daily Rates Board',
    ratesSub: 'Configure Buy Rate (We Buy) and Sell Rate (We Sell). Changes take effect instantly in POS.',
    btnAddRate: 'Add Currency',
    thCurr: 'Currency',
    thDenom: 'Denomination',
    thBuy: 'Buy Rate (We Buy)',
    thSell: 'Sell Rate (We Sell)',
    thSpread: 'Spread (Margin)',
    thAction: 'Action',
    btnEditRate: 'Edit Rate',

    // Rate Modal
    modalRateTitleAdd: 'Add New Currency',
    modalRateTitleEdit: 'Edit Rate: ',
    modalCode: 'Currency Code (3 Letters)',
    modalName: 'Currency Name',
    modalDenom: 'Denomination / Note',
    modalBuy: 'Buy Rate (We Buy)',
    modalSell: 'Sell Rate (We Sell)',
    btnCancelModalRate: 'Cancel',
    btnSaveRate: 'Save Rate',

    // Tab Delivery
    deliveryTitle: 'Currency Delivery Management',
    deliverySub: 'Track foreign currency orders delivered to customer hotels, villas, or offices.',
    statusAll: 'All Statuses',
    statusPending: 'Awaiting Courier',
    statusOnTheWay: 'On The Way',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    btnReprintDelivery: 'Receipt',
    statusCompletedFull: 'Completed (Handover Done)',

    // Tab History & Summary
    histBuyToday: 'Today Buy Volume (Cashier Buy)',
    histSellToday: 'Today Sell Volume (Cashier Sell)',
    histTurnoverToday: 'Total Daily Turnover',
    histTitle: 'Transaction History',
    histSearchPlaceholder: 'Search receipt no / customer...',
    thHistNo: 'Receipt No',
    thHistTime: 'Time',
    thHistType: 'Type',
    thHistCust: 'Customer',
    thHistItems: 'Currency Details',
    thHistTotal: 'Total IDR',
    thHistAction: 'Action',
    btnHistoryReprint: 'Print',

    // Tab Settings
    settingsTitle: 'Store & Receipt Settings',
    settingStoreName: 'Money Changer Name',
    settingStoreAddr: 'Outlet / Counter Address',
    settingStorePhone: 'WhatsApp & Phone Number',
    settingPaperSize: 'Thermal Receipt Paper Size',
    paper80Title: '80 mm (Standard POS)',
    paper80Desc: '48 columns wide, spacious layout & auto-cutter',
    paper58Title: '58 mm (Mini / Mobile Printer)',
    paper58Desc: '32 columns wide, compact for mini Bluetooth printers',
    settingPermit: 'License Number (KUPVA / Bank Indonesia)',
    settingShowPermit: 'Show on Receipt (Currently hidden)',
    settingTeller: 'Active Teller Name',
    settingDisc1: 'Receipt Disclaimer 1',
    settingDisc2: 'Receipt Disclaimer 2',
    btnSaveSettings: 'Save Settings',

    // Google Sheets Integration
    sheetsCardTitle: 'Google Sheets Integration (Auto Cloud Backup)',
    sheetsCardSubtitle: 'Automatically logs transactions into date-based tabs in your spreadsheet',
    sheetsTargetDoc: 'Target Spreadsheet:',
    sheetsRuleMapping: 'Tab System:',
    setSheetsUrl: 'Google Apps Script Web App URL',
    setSheetsAutoSync: 'Auto-sync transaction to Google Sheets whenever transaction is saved or printed',
    btnSheetsTest: 'Test Google Sheets Connection',
    btnSheetsSyncToday: 'Backup Today to Google Sheets',
    btnSheetsGuide: '1-Minute Guide & Copy Script',
    btnHistSync: 'Sync Sheets',
    btnHistCsv: 'Export CSV',
    modalGuideTitle: 'Google Sheets Integration Guide (Ready in 1 Min)',
    btnCopyScript: 'Copy Script Code (1-Click)'
  }
};

// Application State
const state = {
  token: localStorage.getItem('skyline_pos_token') || sessionStorage.getItem('skyline_pos_token') || null,
  user: JSON.parse(localStorage.getItem('skyline_pos_user') || sessionStorage.getItem('skyline_pos_user') || 'null'),
  isOnline: navigator.onLine,
  appLang: localStorage.getItem('skyline_lang') || 'id',
  receiptLang: localStorage.getItem('skyline_rcpt_lang') || 'id',
  rates: [],
  cart: [],
  txType: 'BELI',
  isDelivery: false,
  settings: {
    store_name: 'Skyline Exchange',
    store_address: 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali',
    store_phone: '+6285-122-777-970',
    store_permit: '',
    show_permit: '0',
    default_teller: 'TELLER 01',
    disclaimer_1: 'Periksa fisik uang sebelum meninggalkan kasir.',
    disclaimer_2: 'Uang yang sudah ditukar tidak dapat dikembalikan.',
    google_sheets_url: '',
    google_sheets_auto_sync: '1',
    google_sheets_id: '15lmFybUAOq4M8qpza8fPKWS-OfwWwck5L_b45eZ3oBo'
  },
  offlineQueue: [],
  currentReceipt: null,
  activeTab: 'tab-pos'
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Auth Fetch Helper: Automatically attaches Authorization Bearer header
async function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (state.token) {
    if (options.headers instanceof Headers) {
      options.headers.set('Authorization', `Bearer ${state.token}`);
    } else {
      options.headers['Authorization'] = `Bearer ${state.token}`;
    }
  }
  const res = await fetch(url, options);
  if (res.status === 401 && !url.includes('/api/auth/login')) {
    handleLogout(true);
  }
  return res;
}

// Initialize Printer Instance
const printer = new window.BluetoothPrinter();

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    info: 'bg-navy-800 border-navy-600 text-slate-100',
    success: 'bg-emerald-950 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-950 border-rose-500/50 text-rose-200',
    warning: 'bg-amber-950 border-amber-500/50 text-amber-200'
  };

  toast.className = `p-3 rounded-xl border shadow-xl text-xs font-medium max-w-sm transition-all transform translate-y-2 opacity-0 pointer-events-auto ${bgColors[type] || bgColors.info}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== INDEXEDDB LOCAL STORAGE ====================
const DB_NAME = 'SkylineExchangeDB';
const DB_VERSION = 1;

function openLocalDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'receipt_no' });
      }
      if (!db.objectStoreNames.contains('cached_rates')) {
        db.createObjectStore('cached_rates', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('local_transactions')) {
        db.createObjectStore('local_transactions', { keyPath: 'receipt_no' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToOfflineQueue(tx) {
  try {
    const db = await openLocalDB();
    const t = db.transaction('offline_queue', 'readwrite');
    t.objectStore('offline_queue').put(tx);
    await new Promise((res, rej) => { t.oncomplete = res; t.onerror = rej; });
    await updateOfflineQueueBadge();
  } catch (err) {
    console.error('Failed to save to offline queue', err);
  }
}

async function getOfflineQueue() {
  try {
    const db = await openLocalDB();
    const t = db.transaction('offline_queue', 'readonly');
    const req = t.objectStore('offline_queue').getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function clearOfflineQueueItem(receiptNo) {
  try {
    const db = await openLocalDB();
    const t = db.transaction('offline_queue', 'readwrite');
    t.objectStore('offline_queue').delete(receiptNo);
    await new Promise((res, rej) => { t.oncomplete = res; t.onerror = rej; });
  } catch (err) {
    console.error('Error clearing queue item', err);
  }
}

async function updateOfflineQueueBadge() {
  const queue = await getOfflineQueue();
  state.offlineQueue = queue;
  const btn = document.getElementById('btn-sync-queue');
  const countText = document.getElementById('sync-count-text');
  const t = i18n[state.appLang];
  if (queue.length > 0) {
    btn.classList.remove('hidden');
    btn.classList.add('flex');
    countText.textContent = `${queue.length} ${t.syncQueueText}`;
  } else {
    btn.classList.add('hidden');
    btn.classList.remove('flex');
  }
}

// ==================== ONLINE SYNC ENGINE ====================
async function checkOnlineStatus() {
  try {
    const res = await authFetch('/api/settings', { cache: 'no-store' });
    if (res.ok) {
      setOnlineStatus(true);
      if (state.offlineQueue.length > 0) {
        await syncOfflineTransactions();
      }
    } else {
      setOnlineStatus(false);
    }
  } catch {
    setOnlineStatus(false);
  }
}

function setOnlineStatus(online) {
  state.isOnline = online;
  const badge = document.getElementById('connection-badge');
  const text = document.getElementById('connection-status-text');
  const dot = badge?.querySelector('span');
  const t = i18n[state.appLang];

  if (online) {
    if (badge) badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
    if (text) text.textContent = t.online;
  } else {
    if (badge) badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30';
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400';
    if (text) text.textContent = t.offline;
  }
}

async function syncOfflineTransactions() {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return;

  const t = i18n[state.appLang];
  showToast(state.appLang === 'en' ? `Syncing ${queue.length} offline transactions...` : `Menyinkronkan ${queue.length} transaksi offline ke server...`, 'info');
  try {
    const res = await authFetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: queue })
    });
    const result = await res.json();
    if (result.success) {
      for (const item of queue) {
        await clearOfflineQueueItem(item.receipt_no);
      }
      await updateOfflineQueueBadge();
      showToast(state.appLang === 'en' ? `${result.synced} transactions synced!` : `${result.synced} transaksi berhasil tersinkron!`, 'success');
      loadHistory();
      loadReportsSummary();
    }
  } catch (err) {
    console.error('Sync failed', err);
    showToast(state.appLang === 'en' ? 'Failed to sync offline data. Will retry.' : 'Gagal menyinkronkan data offline. Mencoba lagi nanti.', 'warning');
  }
}

// ==================== DUAL LANGUAGE ENGINE ====================
function setAppLanguage(lang) {
  state.appLang = lang;
  localStorage.setItem('skyline_lang', lang);

  // Update Header Button Styles
  const btnId = document.getElementById('btn-lang-id');
  const btnEn = document.getElementById('btn-lang-en');
  if (lang === 'id') {
    btnId.className = 'px-2 py-0.5 rounded text-[11px] bg-brand text-navy-950 font-bold transition-all';
    btnEn.className = 'px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white transition-all';
  } else {
    btnEn.className = 'px-2 py-0.5 rounded text-[11px] bg-brand text-navy-950 font-bold transition-all';
    btnId.className = 'px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white transition-all';
  }

  const t = i18n[lang];
  const safeSet = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const safePlaceholder = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  };

  // Header & Tabs
  safeSet('i18n-tab-pos', t.tabPos);
  safeSet('i18n-tab-rates', t.tabRates);
  safeSet('i18n-tab-delivery', t.tabDelivery);
  safeSet('i18n-tab-history', t.tabHistory);
  safeSet('i18n-tab-sheets', t.tabSheets);
  safeSet('i18n-tab-settings', t.tabSettings);
  safeSet('lbl-subtab-sheets', t.subtabSheets);
  safeSet('lbl-subtab-store', t.subtabStore);

  // POS Cashier Form
  safeSet('lbl-type-beli', t.btnBeli);
  safeSet('lbl-type-jual', t.btnJual);
  safeSet('lbl-mode-delivery', t.modeDelivery);
  safeSet('lbl-delivery-addr', t.deliveryAddrLabel);
  safePlaceholder('delivery-address', t.deliveryAddrPlaceholder);
  safeSet('lbl-delivery-time', t.deliveryTimeLabel);
  safePlaceholder('delivery-time', t.deliveryTimePlaceholder);
  safeSet('lbl-delivery-courier', t.deliveryCourierLabel);
  safePlaceholder('delivery-courier', t.deliveryCourierPlaceholder);

  safeSet('lbl-cust-title', t.custTitle);
  safeSet('lbl-cust-name', t.custNameLabel);
  safePlaceholder('cust-name', t.custNamePlaceholder);
  safeSet('lbl-cust-phone', t.custPhoneLabel);
  safeSet('lbl-cust-id', t.custIdLabel);
  safePlaceholder('cust-id', t.custIdPlaceholder);

  safeSet('lbl-add-valas-title', t.addValasTitle);
  safeSet('lbl-add-valas-sub', t.addValasSub);
  safeSet('lbl-curr-select', t.currLabel);
  safeSet('lbl-amount', t.amountLabel);
  safePlaceholder('item-amount', t.amountPlaceholder);
  safeSet('lbl-rate', t.rateLabel);
  safeSet('lbl-btn-add-item', t.btnAdd);
  safeSet('lbl-quick-curr', t.quickPick);
  safeSet('chip-custom-curr', lang === 'en' ? '+ Custom' : '+ Kustom');

  safeSet('lbl-custom-curr-title', t.customCurrencyTitle);
  safeSet('lbl-save-custom-rate', t.saveCustomRateLabel);
  safeSet('lbl-custom-code', t.customCodeLabel);
  safeSet('lbl-custom-name', t.customNameLabel);

  safeSet('lbl-cart-title', t.cartTitle);
  safeSet('lbl-th-valas', t.colValas);
  safeSet('lbl-th-amount', t.colAmount);
  safeSet('lbl-th-rate', t.colRate);
  safeSet('lbl-th-subtotal', t.colSubtotal);
  safeSet('lbl-th-action', t.colAction);

  safeSet('lbl-total-idr', t.totalIdr);
  safeSet('lbl-payment-idr', t.paymentIdr);
  safeSet('lbl-exact-cash', t.exactCash);
  safeSet('lbl-change-idr', t.changeIdr);
  safeSet('lbl-btn-submit-tx', t.btnSubmitTx);
  safeSet('lbl-btn-reset', t.btnReset);

  // Tab Rates
  safeSet('lbl-rates-title', t.ratesTitle);
  safeSet('lbl-rates-sub', t.ratesSub);
  safeSet('lbl-btn-add-rate', t.btnAddRate);
  safeSet('lbl-th-curr', t.thCurr);
  safeSet('lbl-th-denom', t.thDenom);
  safeSet('lbl-th-buy', t.thBuy);
  safeSet('lbl-th-sell', t.thSell);
  safeSet('lbl-th-spread', t.thSpread);
  safeSet('lbl-th-action-rates', t.thAction);

  // Tab Delivery
  safeSet('lbl-delivery-title', t.deliveryTitle);
  safeSet('lbl-delivery-sub', t.deliverySub);
  safeSet('opt-delivery-all', t.statusAll);
  safeSet('opt-delivery-pending', t.statusPending);
  safeSet('opt-delivery-ontheway', t.statusOnTheWay);
  safeSet('opt-delivery-completed', t.statusCompleted);

  // Tab History
  safeSet('lbl-hist-buy-card', t.histBuyToday);
  safeSet('lbl-hist-sell-card', t.histSellToday);
  safeSet('lbl-hist-turnover-card', t.histTurnoverToday);
  safeSet('lbl-hist-title', t.histTitle);
  safePlaceholder('history-search-input', t.histSearchPlaceholder);
  safeSet('lbl-th-hist-no', t.thHistNo);
  safeSet('lbl-th-hist-time', t.thHistTime);
  safeSet('lbl-th-hist-type', t.thHistType);
  safeSet('lbl-th-hist-cust', t.thHistCust);
  safeSet('lbl-th-hist-items', t.thHistItems);
  safeSet('lbl-th-hist-total', t.thHistTotal);
  safeSet('lbl-th-hist-action', t.thHistAction);

  // Tab Settings
  safeSet('lbl-settings-title', t.settingsTitle);
  safeSet('lbl-set-store-name', t.settingStoreName);
  safeSet('lbl-set-store-addr', t.settingStoreAddr);
  safeSet('lbl-set-store-phone', t.settingStorePhone);
  safeSet('lbl-set-paper-size', t.settingPaperSize);
  safeSet('lbl-paper-80-title', t.paper80Title);
  safeSet('lbl-paper-80-desc', t.paper80Desc);
  safeSet('lbl-paper-58-title', t.paper58Title);
  safeSet('lbl-paper-58-desc', t.paper58Desc);
  safeSet('lbl-set-permit', t.settingPermit);
  safeSet('lbl-set-show-permit', t.settingShowPermit);
  safeSet('lbl-set-teller', t.settingTeller);
  safeSet('lbl-set-disc1', t.settingDisc1);
  safeSet('lbl-set-disc2', t.settingDisc2);
  safeSet('lbl-btn-save-settings', t.btnSaveSettings);

  // Google Sheets Card & Guide Modal
  safeSet('lbl-sheets-card-title', t.sheetsCardTitle);
  safeSet('lbl-sheets-card-subtitle', t.sheetsCardSubtitle);
  safeSet('lbl-sheets-target-doc', t.sheetsTargetDoc);
  safeSet('lbl-sheets-rule-mapping', t.sheetsRuleMapping);
  safeSet('lbl-set-sheets-url', t.setSheetsUrl);
  safeSet('lbl-set-sheets-auto-sync', t.setSheetsAutoSync);
  safeSet('lbl-btn-sheets-test', t.btnSheetsTest);
  safeSet('lbl-btn-sheets-sync-today', t.btnSheetsSyncToday);
  safeSet('lbl-btn-sheets-guide', t.btnSheetsGuide);
  safeSet('lbl-btn-hist-sync', t.btnHistSync);
  safeSet('lbl-btn-hist-csv', t.btnHistCsv);
  safeSet('lbl-modal-guide-title', t.modalGuideTitle);
  safeSet('lbl-btn-copy-script', t.btnCopyScript);

  // Rate Modal
  safeSet('lbl-modal-code', t.modalCode);
  safeSet('lbl-modal-name', t.modalName);
  safeSet('lbl-modal-denom', t.modalDenom);
  safeSet('lbl-modal-buy', t.modalBuy);
  safeSet('lbl-modal-sell', t.modalSell);
  safeSet('btn-cancel-modal-rate', t.btnCancelModalRate);
  safeSet('lbl-btn-save-rate', t.btnSaveRate);

  // Online / Offline Status Badge Text
  setOnlineStatus(state.isOnline);
  updateOfflineQueueBadge();
  applyPaperSize(state.settings.paper_size || '80');

  // Transaction Types Explanation
  setTransactionType(state.txType);

  // Synchronize receipt language to match app language
  setReceiptLanguage(lang, false);

  // Re-render components with language text
  renderRatesSelect();
  renderCart();
  renderRatesTable();
  loadDeliveryOrders();
  loadHistory();
  loadReportsSummary();

  showToast(lang === 'en' ? 'Language switched to English' : 'Bahasa diubah ke Bahasa Indonesia', 'info');
}

function setReceiptLanguage(lang, showToastNotification = true) {
  state.receiptLang = lang;
  localStorage.setItem('skyline_rcpt_lang', lang);

  const btnId = document.getElementById('btn-rcpt-lang-id');
  const btnEn = document.getElementById('btn-rcpt-lang-en');
  if (lang === 'id') {
    btnId.className = 'px-1.5 py-0.5 rounded bg-brand text-navy-950 font-bold transition-all';
    btnEn.className = 'px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-all';
  } else {
    btnEn.className = 'px-1.5 py-0.5 rounded bg-brand text-navy-950 font-bold transition-all';
    btnId.className = 'px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-all';
  }

  const t = i18n[lang];
  const safeSet = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const safePlaceholder = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  };

  // Preview Card Header
  safeSet('lbl-receipt-preview-title', t.receiptPreviewTitle);
  safeSet('lbl-receipt-lang-tag', t.receiptLangTag);

  // Live Receipt Labels
  safeSet('lbl-rcpt-no', t.rcptNoLabel);
  safeSet('lbl-rcpt-datetime', t.rcptDateLabel);
  safeSet('lbl-rcpt-type', t.rcptTypeLabel);
  safeSet('lbl-rcpt-teller', t.rcptTellerLabel);
  safeSet('lbl-rcpt-cust', t.rcptCustLabel);
  safeSet('lbl-rcpt-phone', t.rcptPhoneLabel);
  safeSet('lbl-rcpt-id', t.rcptIdLabel);
  safeSet('lbl-rcpt-delivery', t.rcptServiceLabel);
  safeSet('rcpt-delivery-val', t.rcptDeliveryVal);

  // 4 Columns Header
  safeSet('lbl-col-curr', t.rcptColValas);
  safeSet('lbl-col-qty', t.rcptColQty);
  safeSet('lbl-col-rate', t.rcptColRate);
  safeSet('lbl-col-sub', t.rcptColSub);

  // Financial Summary
  safeSet('lbl-rcpt-total', t.rcptTotal);
  safeSet('lbl-rcpt-payment', t.rcptPayment);
  safeSet('lbl-rcpt-change', t.rcptChange);

  // Signatures
  safeSet('lbl-sign-teller', t.rcptSignTeller);
  safeSet('lbl-sign-customer', t.rcptSignCustomer);
  safeSet('lbl-sign-prompt', t.rcptSignNamePrompt);
  safePlaceholder('input-signature-customer', t.rcptSignPlaceholder);

  // Disclaimers & Thanks
  safeSet('lbl-disclaimer-1', t.rcptDisclaimer1);
  safeSet('lbl-disclaimer-2', t.rcptDisclaimer2);
  safeSet('lbl-disclaimer-thanks', t.rcptThanks);

  // Print Buttons below receipt
  safeSet('lbl-btn-print-bt', t.btnPrintBt);
  safeSet('lbl-btn-print-browser', t.btnPrintBrowser);
  safeSet('lbl-btn-share-wa', t.btnShareWa);

  // Update permit display text
  const permitEl = document.getElementById('rcpt-store-permit');
  if (state.settings.show_permit === '1' && state.settings.store_permit) {
    permitEl.textContent = `${lang === 'en' ? 'License' : 'Izin KUPVA'}: ${state.settings.store_permit}`;
    permitEl.classList.remove('hidden');
  }

  updateLiveReceiptMetadata();
  renderCart();

  if (showToastNotification) {
    showToast(lang === 'en' ? 'Receipt language set to English' : 'Bahasa struk disetel ke Bahasa Indonesia', 'info');
  }
}

// ==================== SETTINGS & RATES LOADING ====================
async function loadSettings() {
  try {
    const res = await authFetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data) {
      state.settings = { ...state.settings, ...data.data };
      applySettingsToUI();
    }
  } catch {
    applySettingsToUI();
  }
}

function applySettingsToUI() {
  const s = state.settings;
  document.getElementById('rcpt-store-name').textContent = s.store_name || 'SKYLINE EXCHANGE';
  document.getElementById('rcpt-store-address').textContent = s.store_address || 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali';
  document.getElementById('rcpt-store-phone').textContent = `WA: ${s.store_phone || '+6285-122-777-970'}`;
  document.getElementById('rcpt-teller').textContent = s.default_teller || 'TELLER 01';
  document.getElementById('rcpt-sign-teller').textContent = `( ${(s.default_teller || 'TELLER').toUpperCase()} )`;

  const permitEl = document.getElementById('rcpt-store-permit');
  if (s.show_permit === '1' && s.store_permit) {
    permitEl.textContent = `${state.receiptLang === 'en' ? 'License' : 'Izin KUPVA'}: ${s.store_permit}`;
    permitEl.classList.remove('hidden');
  } else {
    permitEl.classList.add('hidden');
  }

  document.getElementById('setting-store-name').value = s.store_name || '';
  document.getElementById('setting-store-address').value = s.store_address || '';
  document.getElementById('setting-store-phone').value = s.store_phone || '';
  document.getElementById('setting-store-permit').value = s.store_permit || '';
  document.getElementById('setting-show-permit').checked = s.show_permit === '1';
  document.getElementById('setting-default-teller').value = s.default_teller || 'TELLER 01';
  document.getElementById('setting-disclaimer-1').value = s.disclaimer_1 || '';
  document.getElementById('setting-disclaimer-2').value = s.disclaimer_2 || '';

  const sheetsUrlInput = document.getElementById('setting-sheets-url');
  if (sheetsUrlInput) sheetsUrlInput.value = s.google_sheets_url || '';
  const sheetsAutoSyncCheck = document.getElementById('setting-sheets-auto-sync');
  if (sheetsAutoSyncCheck) sheetsAutoSyncCheck.checked = s.google_sheets_auto_sync !== '0';

  const paperSize = s.paper_size || '80';
  const r80 = document.getElementById('setting-paper-80');
  const r58 = document.getElementById('setting-paper-58');
  if (r80 && r58) {
    if (paperSize === '58') {
      r58.checked = true;
    } else {
      r80.checked = true;
    }
  }
  applyPaperSize(paperSize);
}

function applyPaperSize(size) {
  const is80 = size === '80';
  state.settings.paper_size = is80 ? '80' : '58';
  document.body.classList.toggle('paper-80mm', is80);
  document.body.classList.toggle('paper-58mm', !is80);

  const receiptEl = document.getElementById('printable-receipt');
  if (receiptEl) {
    if (is80) {
      receiptEl.classList.remove('max-w-[280px]', 'text-[11px]');
      receiptEl.classList.add('max-w-[380px]', 'text-[12px]');
    } else {
      receiptEl.classList.remove('max-w-[380px]', 'text-[12px]');
      receiptEl.classList.add('max-w-[280px]', 'text-[11px]');
    }
  }

  const isEn = state.appLang === 'en';
  const titleEl = document.getElementById('lbl-receipt-preview-title');
  if (titleEl) {
    titleEl.textContent = isEn ? `${is80 ? '80mm' : '58mm'} Receipt Preview` : `Pratinjau Struk ${is80 ? '80mm' : '58mm'}`;
  }
  const badgeEl = document.getElementById('receipt-col-badge');
  if (badgeEl) {
    badgeEl.textContent = is80 ? (isEn ? '80mm (48 Cols)' : '80mm (48 Kolom)') : (isEn ? '58mm (32 Cols)' : '58mm (32 Kolom)');
  }
  const settingsTitle = document.getElementById('lbl-settings-title');
  if (settingsTitle) {
    settingsTitle.textContent = isEn ? `Store & ${is80 ? '80mm' : '58mm'} Receipt Settings` : `Pengaturan Toko & Struk ${is80 ? '80mm' : '58mm'}`;
  }

  const dashLine = is80 ? '------------------------------------------------' : '--------------------------------';
  const doubleLine = is80 ? '================================================' : '================================';
  document.querySelectorAll('.rcpt-div-dash').forEach(el => el.textContent = dashLine);
  document.querySelectorAll('.rcpt-div-double').forEach(el => el.textContent = doubleLine);
}

async function loadRates() {
  try {
    const res = await authFetch('/api/rates');
    const data = await res.json();
    if (data.success && data.data) {
      state.rates = data.data;
      renderRatesSelect();
      renderRatesTable();
    }
  } catch {
    try {
      const db = await openLocalDB();
      const t = db.transaction('cached_rates', 'readonly');
      const req = t.objectStore('cached_rates').getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          state.rates = req.result;
          renderRatesSelect();
          renderRatesTable();
        }
      };
    } catch (e) {
      console.error(e);
    }
  }
}

function renderRatesSelect() {
  const select = document.getElementById('item-currency');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '';

  state.rates.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = r.code;
    const denom = r.denomination && r.denomination !== 'All' ? ` (${r.denomination})` : '';
    opt.textContent = `${r.code} - ${r.name}${denom}`;
    select.appendChild(opt);
  });

  // Append Custom Currency Option
  const customOpt = document.createElement('option');
  customOpt.value = '__CUSTOM__';
  customOpt.textContent = state.appLang === 'en' 
    ? '+ Custom Currency (+ Valas Kustom)' 
    : '+ Kustom / Valas Lain (+ Custom)';
  select.appendChild(customOpt);

  if (currentVal && (state.rates.some(r => r.code === currentVal) || currentVal === '__CUSTOM__')) {
    select.value = currentVal;
  } else if (state.rates.length > 0) {
    select.value = state.rates[0].code;
  }

  handleCurrencyChange();
}

function handleCurrencyChange() {
  const select = document.getElementById('item-currency');
  const customBox = document.getElementById('custom-currency-box');
  const customCodeInput = document.getElementById('custom-curr-code');
  const rateInput = document.getElementById('item-rate');
  if (!select) return;

  if (select.value === '__CUSTOM__') {
    if (customBox) customBox.classList.remove('hidden');
    if (rateInput) {
      rateInput.value = '';
      rateInput.placeholder = '0';
    }
    if (customCodeInput) {
      customCodeInput.focus();
    }
  } else {
    if (customBox) customBox.classList.add('hidden');
    updateItemRateInput();
  }
}

function updateItemRateInput() {
  const select = document.getElementById('item-currency');
  const rateInput = document.getElementById('item-rate');
  if (!select || !rateInput) return;

  const code = select.value;
  if (code === '__CUSTOM__') return;

  const rateObj = state.rates.find(r => r.code === code);
  if (rateObj) {
    const activeRate = state.txType === 'BELI' ? rateObj.buy_rate : rateObj.sell_rate;
    rateInput.value = activeRate;
  }
}

function renderRatesTable() {
  const tbody = document.getElementById('rates-table-body');
  if (!tbody) return;

  const isEn = state.appLang === 'en';
  tbody.innerHTML = '';
  state.rates.forEach((r) => {
    const spread = (r.sell_rate - r.buy_rate);
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-navy-700/40 transition-colors';
    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
        <span class="w-7 h-7 rounded bg-navy-700 border border-navy-600 flex items-center justify-center text-xs font-mono text-brand">${r.code.slice(0, 3)}</span>
        <div>
          <div>${r.code}</div>
          <div class="text-[11px] font-sans text-slate-400 font-normal">${r.name}</div>
        </div>
      </td>
      <td class="py-3 px-3 text-slate-300 font-mono text-xs">${r.denomination || 'All'}</td>
      <td class="py-3 px-4 text-right text-emerald-400 font-bold">Rp ${r.buy_rate.toLocaleString('id-ID')}</td>
      <td class="py-3 px-4 text-right text-amber-400 font-bold">Rp ${r.sell_rate.toLocaleString('id-ID')}</td>
      <td class="py-3 px-4 text-right text-slate-400 text-xs">Rp ${spread.toLocaleString('id-ID')}</td>
      <td class="py-3 px-4 text-center">
        <button type="button" class="btn-edit-rate px-2.5 py-1 rounded bg-navy-700 hover:bg-navy-600 text-brand text-xs font-sans font-medium transition-colors" data-id="${r.id}">
          ${isEn ? 'Edit Rate' : 'Edit Kurs'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-edit-rate').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = state.rates.find(r => String(r.id) === String(id));
      if (item) openEditRateModal(item);
    });
  });
}

function openEditRateModal(rate = null) {
  const modal = document.getElementById('modal-rate');
  const title = document.getElementById('modal-rate-title');
  const idInput = document.getElementById('edit-rate-id');
  const codeInput = document.getElementById('edit-rate-code');
  const nameInput = document.getElementById('edit-rate-name');
  const denomInput = document.getElementById('edit-rate-denom');
  const buyInput = document.getElementById('edit-rate-buy');
  const sellInput = document.getElementById('edit-rate-sell');
  const isEn = state.appLang === 'en';

  if (rate) {
    title.textContent = isEn ? `Edit Rate: ${rate.code}` : `Edit Kurs: ${rate.code}`;
    idInput.value = rate.id;
    codeInput.value = rate.code;
    codeInput.disabled = true;
    nameInput.value = rate.name;
    denomInput.value = rate.denomination || 'All';
    buyInput.value = rate.buy_rate;
    sellInput.value = rate.sell_rate;
  } else {
    title.textContent = isEn ? 'Add New Currency' : 'Tambah Mata Uang Baru';
    idInput.value = '';
    codeInput.value = '';
    codeInput.disabled = false;
    nameInput.value = '';
    denomInput.value = 'All';
    buyInput.value = '';
    sellInput.value = '';
  }

  modal.classList.remove('hidden');
}

function closeEditRateModal() {
  document.getElementById('modal-rate').classList.add('hidden');
}

// ==================== POS CART & 4-COLUMN RECEIPT LOGIC ====================

function setTransactionType(type) {
  state.txType = type;
  const btnBeli = document.getElementById('btn-type-beli');
  const btnJual = document.getElementById('btn-type-jual');
  const expText = document.getElementById('type-explanation-text');
  const rcptType = document.getElementById('rcpt-type');
  const isAppEn = state.appLang === 'en';
  const isRcptEn = state.receiptLang === 'en';

  if (type === 'BELI') {
    btnBeli.className = 'type-btn py-2 px-3 rounded-md transition-all text-center flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow font-bold';
    btnJual.className = 'type-btn py-2 px-3 rounded-md transition-all text-center flex items-center justify-center gap-1.5 text-slate-400 hover:text-white font-medium';
    expText.textContent = isAppEn 
      ? 'We buy foreign currency from customer. Customer receives Rupiah (IDR).' 
      : 'Kasir membeli valas dari customer. Customer menyerahkan Valas dan menerima Rupiah (IDR).';
    rcptType.textContent = isRcptEn ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)';
    rcptType.className = 'font-bold text-black';
  } else {
    btnJual.className = 'type-btn py-2 px-3 rounded-md transition-all text-center flex items-center justify-center gap-1.5 bg-amber-600 text-white shadow font-bold';
    btnBeli.className = 'type-btn py-2 px-3 rounded-md transition-all text-center flex items-center justify-center gap-1.5 text-slate-400 hover:text-white font-medium';
    expText.textContent = isAppEn 
      ? 'We sell foreign currency to customer. Customer pays Rupiah (IDR).' 
      : 'Kasir menjual valas ke customer. Customer membeli Valas dan menyerahkan Rupiah (IDR).';
    rcptType.textContent = isRcptEn ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)';
    rcptType.className = 'font-bold text-black';
  }

  updateItemRateInput();
  state.cart.forEach(item => {
    if (!item.is_custom) {
      const rateObj = state.rates.find(r => r.code === item.currency_code);
      if (rateObj) {
        item.rate = state.txType === 'BELI' ? rateObj.buy_rate : rateObj.sell_rate;
        item.subtotal_idr = item.amount * item.rate;
      }
    }
  });
  renderCart();
}

function addItemToCart() {
  const currSelect = document.getElementById('item-currency');
  const amountInput = document.getElementById('item-amount');
  const rateInput = document.getElementById('item-rate');
  const isEn = state.appLang === 'en';

  let code = currSelect.value;
  const isCustom = code === '__CUSTOM__';
  let name = '';

  if (isCustom) {
    const customCodeInput = document.getElementById('custom-curr-code');
    const customNameInput = document.getElementById('custom-curr-name');
    code = customCodeInput.value.trim().toUpperCase();

    if (!code) {
      showToast(isEn ? 'Please enter currency code (e.g. VND, AED)' : 'Masukkan kode valas kustom (contoh: VND, AED)', 'warning');
      customCodeInput.focus();
      return;
    }

    name = customNameInput.value.trim() || code;
  } else {
    const rateObj = state.rates.find(r => r.code === code);
    name = rateObj ? rateObj.name : code;
  }

  const amount = parseFloat(amountInput.value);
  const rate = parseFloat(rateInput.value);

  if (!code) {
    showToast(isEn ? 'Please select a currency first' : 'Pilih mata uang terlebih dahulu', 'warning');
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showToast(isEn ? 'Please enter a valid amount' : 'Masukkan jumlah nominal valas yang valid', 'warning');
    amountInput.focus();
    return;
  }
  if (isNaN(rate) || rate <= 0) {
    showToast(isEn ? 'Exchange rate cannot be empty or zero' : 'Kurs tidak boleh kosong atau nol', 'warning');
    rateInput.focus();
    return;
  }

  const subtotal = Math.round(amount * rate);

  state.cart.push({
    currency_code: code,
    name: name,
    amount: amount,
    rate: rate,
    subtotal_idr: subtotal,
    is_custom: isCustom
  });

  // If user selected to save this custom rate to the Rates Board:
  const saveCheck = document.getElementById('check-save-custom-rate');
  if (isCustom && saveCheck && saveCheck.checked && state.isOnline) {
    const customBuy = state.txType === 'BELI' ? rate : Math.round(rate * 0.98);
    const customSell = state.txType === 'JUAL' ? rate : Math.round(rate * 1.02);
    authFetch('/api/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        name: name,
        denomination: 'All',
        buy_rate: customBuy,
        sell_rate: customSell
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        loadRates();
      }
    }).catch(console.error);
  }

  amountInput.value = '';
  showToast(`${isEn ? 'Added' : 'Ditambahkan'}: ${amount.toLocaleString(isEn ? 'en-US' : 'id-ID')} ${code}`, 'success');

  // Reset custom form if custom was selected
  if (isCustom) {
    document.getElementById('custom-curr-code').value = '';
    document.getElementById('custom-curr-name').value = '';
    document.getElementById('custom-currency-box').classList.add('hidden');
    if (state.rates.length > 0) {
      currSelect.value = state.rates[0].code;
      updateItemRateInput();
    }
  }

  renderCart();
  amountInput.focus();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  renderCart();
}

function calculateTotals() {
  const total = state.cart.reduce((sum, item) => sum + item.subtotal_idr, 0);
  const paymentInput = document.getElementById('input-payment');
  let payment = parseFloat(paymentInput.value);

  if (isNaN(payment)) {
    payment = 0;
  }

  const change = Math.max(0, payment - total);
  return { total, payment, change };
}

function renderCart() {
  const tbody = document.getElementById('cart-table-body');
  const rcptItemsBody = document.getElementById('rcpt-items-body');
  const badge = document.getElementById('items-count-badge');
  const { total, payment, change } = calculateTotals();
  const isAppEn = state.appLang === 'en';
  const isRcptEn = state.receiptLang === 'en';

  badge.textContent = `${state.cart.length} ${isAppEn ? 'Items' : 'Item'}`;

  // 1. Screen Cart Table
  if (state.cart.length === 0) {
    tbody.innerHTML = `
      <tr id="empty-cart-row">
        <td colspan="5" class="py-8 text-center text-slate-500 font-sans">
          <svg class="w-8 h-8 mx-auto mb-2 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${isAppEn ? 'No currency added yet.<br>Select a currency and click Add Item.' : 'Belum ada valas yang ditambahkan.<br>Silakan pilih mata uang dan klik tombol Tambah.'}
        </td>
      </tr>
    `;
    rcptItemsBody.innerHTML = `<div class="text-center py-2 text-gray-400 italic">${isRcptEn ? 'No items' : 'Belum ada item'}</div>`;
  } else {
    tbody.innerHTML = '';
    rcptItemsBody.innerHTML = '';

    state.cart.forEach((item, idx) => {
      // Screen Cart Row
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-navy-700/30 transition-colors';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-bold text-white">
          <span class="text-brand">${item.currency_code}</span>
          ${item.is_custom ? `<span class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-brand/10 text-brand font-sans font-normal border border-brand/20">${isAppEn ? 'Custom' : 'Kustom'}</span>` : ''}
        </td>
        <td class="py-2.5 px-3 text-right text-slate-200">${item.amount.toLocaleString(isAppEn ? 'en-US' : 'id-ID')}</td>
        <td class="py-2.5 px-3 text-right text-slate-300">Rp ${item.rate.toLocaleString('id-ID')}</td>
        <td class="py-2.5 px-3 text-right text-brand font-bold">Rp ${item.subtotal_idr.toLocaleString('id-ID')}</td>
        <td class="py-2.5 px-2 text-center">
          <button type="button" class="btn-remove-item text-rose-400 hover:text-rose-300 p-1" data-idx="${idx}" title="${isAppEn ? 'Remove' : 'Hapus'}">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);

      // 58mm Thermal Receipt Row (4 Columns)
      const rcptRow = document.createElement('div');
      rcptRow.className = 'grid grid-cols-12 py-0.5 text-black';
      rcptRow.innerHTML = `
        <div class="col-span-3 text-left font-bold">${item.currency_code}</div>
        <div class="col-span-2 text-right">${item.amount.toLocaleString(isRcptEn ? 'en-US' : 'id-ID')}</div>
        <div class="col-span-3 text-right">${item.rate.toLocaleString('id-ID')}</div>
        <div class="col-span-4 text-right font-medium">${item.subtotal_idr.toLocaleString('id-ID')}</div>
      `;
      rcptItemsBody.appendChild(rcptRow);
    });

    document.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        removeCartItem(idx);
      });
    });
  }

  // Update Calculations
  document.getElementById('calc-total-idr').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('calc-change-idr').textContent = 'Rp ' + change.toLocaleString('id-ID');

  document.getElementById('rcpt-total').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('rcpt-payment').textContent = 'Rp ' + payment.toLocaleString('id-ID');
  document.getElementById('rcpt-change').textContent = 'Rp ' + change.toLocaleString('id-ID');

  updateLiveReceiptMetadata();
}

function updateLiveReceiptMetadata() {
  const custName = document.getElementById('cust-name').value.trim();
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custId = document.getElementById('cust-id').value.trim();
  const signatureInput = document.getElementById('input-signature-customer');
  const isRcptEn = state.receiptLang === 'en';

  const rcptCust = document.getElementById('rcpt-cust-name');
  const rcptPhone = document.getElementById('rcpt-cust-phone');
  const rcptId = document.getElementById('rcpt-cust-id');
  const rcptSignCustomer = document.getElementById('rcpt-sign-customer');

  const phoneRow = document.getElementById('rcpt-phone-row');
  const idRow = document.getElementById('rcpt-id-row');
  const deliveryRow = document.getElementById('rcpt-delivery-row');

  const finalCustName = custName ? custName.toUpperCase() : '-';
  rcptCust.textContent = finalCustName;

  if (!signatureInput.getAttribute('data-customized')) {
    signatureInput.value = custName ? custName.toUpperCase() : '';
    rcptSignCustomer.textContent = custName ? `( ${custName.toUpperCase()} )` : (isRcptEn ? '( CUSTOMER )' : '( CUSTOMER )');
  } else {
    rcptSignCustomer.textContent = signatureInput.value ? `( ${signatureInput.value.toUpperCase()} )` : `( ${finalCustName} )`;
  }

  if (custPhone) {
    rcptPhone.textContent = custPhone;
    phoneRow.classList.remove('hidden');
  } else {
    phoneRow.classList.add('hidden');
  }

  if (custId) {
    rcptId.textContent = custId;
    idRow.classList.remove('hidden');
  } else {
    idRow.classList.add('hidden');
  }

  if (state.isDelivery) {
    deliveryRow.classList.remove('hidden');
    document.getElementById('rcpt-delivery-val').textContent = isRcptEn ? 'DELIVERY SERVICE' : 'DELIVERY (ANTAR)';
  } else {
    deliveryRow.classList.add('hidden');
  }

  // Live Date Time on Receipt
  const now = new Date();
  const locale = isRcptEn ? 'en-US' : 'id-ID';
  const dateFormatted = now.toLocaleDateString(locale) + ' ' + now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  document.getElementById('rcpt-datetime').textContent = dateFormatted;

  // Transaction type on receipt
  const rcptType = document.getElementById('rcpt-type');
  if (state.txType === 'BELI') {
    rcptType.textContent = isRcptEn ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)';
  } else {
    rcptType.textContent = isRcptEn ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)';
  }
}

// ==================== PROCESS TRANSACTION ====================
async function processTransaction() {
  const custName = document.getElementById('cust-name').value.trim();
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custId = document.getElementById('cust-id').value.trim();
  const signatureName = document.getElementById('input-signature-customer').value.trim();
  const isEn = state.appLang === 'en';

  if (state.cart.length === 0) {
    showToast(isEn ? 'Add at least 1 currency item to process' : 'Tambahkan setidaknya 1 item valas untuk diproses', 'error');
    return;
  }
  if (!custName) {
    showToast(isEn ? 'Customer name is required for currency transaction record' : 'Nama customer wajib diisi untuk bukti transaksi valas', 'error');
    document.getElementById('cust-name').focus();
    return;
  }

  const { total, payment, change } = calculateTotals();

  if (state.txType === 'JUAL' && payment < total && payment > 0) {
    showToast(isEn ? 'Payment amount is less than total due' : 'Jumlah pembayaran kurang dari total tagihan', 'error');
    document.getElementById('input-payment').focus();
    return;
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randSeq = String(Math.floor(Math.random() * 9000) + 1000);
  const tempReceiptNo = `SE-${yyyy}${mm}${dd}-${randSeq}`;

  const payload = {
    receipt_no: tempReceiptNo,
    type: state.txType,
    customer_name: custName.toUpperCase(),
    customer_phone: custPhone,
    customer_id_no: custId,
    customer_signature_name: signatureName.toUpperCase() || custName.toUpperCase(),
    teller_name: state.settings.default_teller || 'TELLER 01',
    total_idr: total,
    paid_amount: payment || total,
    change_amount: change,
    is_delivery: state.isDelivery ? 1 : 0,
    delivery_address: state.isDelivery ? document.getElementById('delivery-address').value.trim() : '',
    delivery_time: state.isDelivery ? document.getElementById('delivery-time').value.trim() : '',
    delivery_status: state.isDelivery ? 'PENDING' : 'COMPLETED',
    courier_name: state.isDelivery ? document.getElementById('delivery-courier').value.trim() : '',
    items: [...state.cart],
    created_at: now.toISOString(),
    created_at_formatted: now.toLocaleDateString(state.receiptLang === 'en' ? 'en-US' : 'id-ID') + ' ' + now.toLocaleTimeString(state.receiptLang === 'en' ? 'en-US' : 'id-ID')
  };

  state.currentReceipt = payload;
  document.getElementById('rcpt-no').textContent = payload.receipt_no;

  let savedOnline = false;
  if (state.isOnline) {
    try {
      const res = await authFetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        payload.receipt_no = data.data.receipt_no;
        document.getElementById('rcpt-no').textContent = payload.receipt_no;
        savedOnline = true;
        showToast(isEn ? `Transaction saved successfully! No: ${payload.receipt_no}` : `Transaksi berhasil disimpan! No: ${payload.receipt_no}`, 'success');
      }
    } catch {
      savedOnline = false;
    }
  }

  if (!savedOnline) {
    await saveToOfflineQueue(payload);
    showToast(isEn ? `Transaction saved in local offline memory. No: ${payload.receipt_no}` : `Transaksi disimpan di memori lokal (Offline). No: ${payload.receipt_no}`, 'warning');
  }

  // Attempt Bluetooth Print with chosen receipt language
  if (printer.isConnected) {
    try {
      const escPosBytes = printer.buildEscPos(payload, state.settings, state.receiptLang);
      await printer.print(escPosBytes);
      showToast(isEn ? 'Receipt printed to Bluetooth printer!' : 'Struk berhasil dicetak ke printer Bluetooth!', 'success');
    } catch (err) {
      showToast(`${isEn ? 'Bluetooth print failed' : 'Gagal mencetak Bluetooth'}: ${err.message}`, 'error');
    }
  } else {
    showToast(isEn ? 'Transaction completed. You can print the receipt now.' : 'Transaksi selesai. Anda dapat mencetak struk sekarang.', 'info');
  }

  loadHistory();
  loadDeliveryOrders();
  loadReportsSummary();
}

function resetForm() {
  state.cart = [];
  document.getElementById('cust-name').value = '';
  document.getElementById('cust-phone').value = '';
  document.getElementById('cust-id').value = '';
  document.getElementById('input-payment').value = '';
  document.getElementById('check-delivery').checked = false;
  document.getElementById('delivery-fields').classList.add('hidden');
  document.getElementById('delivery-address').value = '';
  document.getElementById('delivery-time').value = '';
  document.getElementById('delivery-courier').value = '';
  document.getElementById('input-signature-customer').value = '';
  document.getElementById('input-signature-customer').removeAttribute('data-customized');
  state.isDelivery = false;
  renderCart();
  showToast(state.appLang === 'en' ? 'Cashier form reset' : 'Formulir kasir telah di-reset', 'info');
}

// ==================== PRINT ACTIONS ====================

async function handleDirectBtPrint() {
  const currentData = state.currentReceipt || buildCurrentFormReceiptData();
  const isEn = state.appLang === 'en';

  if (!currentData || !currentData.items || currentData.items.length === 0) {
    showToast(isEn ? 'No transaction to print' : 'Belum ada transaksi untuk dicetak', 'warning');
    return;
  }

  if (!printer.isConnected) {
    try {
      showToast(isEn ? 'Connecting to Bluetooth printer...' : 'Menghubungkan ke printer Bluetooth...', 'info');
      await printer.connect();
    } catch (err) {
      showToast(`${isEn ? 'Bluetooth connection failed' : 'Koneksi Bluetooth gagal'}: ${err.message}`, 'error');
      return;
    }
  }

  try {
    const escPosBytes = printer.buildEscPos(currentData, state.settings, state.receiptLang);
    await printer.print(escPosBytes);
    showToast(isEn ? 'Receipt printed successfully!' : 'Struk berhasil dicetak!', 'success');
  } catch (err) {
    showToast(`Bluetooth print error: ${err.message}`, 'error');
  }
}

function buildCurrentFormReceiptData() {
  const custName = document.getElementById('cust-name').value.trim() || 'CUSTOMER';
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custId = document.getElementById('cust-id').value.trim();
  const signatureName = document.getElementById('input-signature-customer').value.trim();
  const { total, payment, change } = calculateTotals();

  const now = new Date();
  const locale = state.receiptLang === 'en' ? 'en-US' : 'id-ID';
  return {
    receipt_no: document.getElementById('rcpt-no').textContent || 'SE-DRAFT',
    type: state.txType,
    customer_name: custName.toUpperCase(),
    customer_phone: custPhone,
    customer_id_no: custId,
    customer_signature_name: signatureName.toUpperCase() || custName.toUpperCase(),
    teller_name: state.settings.default_teller || 'TELLER 01',
    total_idr: total,
    paid_amount: payment || total,
    change_amount: change,
    is_delivery: state.isDelivery ? 1 : 0,
    delivery_address: state.isDelivery ? document.getElementById('delivery-address').value.trim() : '',
    items: [...state.cart],
    created_at_formatted: now.toLocaleDateString(locale) + ' ' + now.toLocaleTimeString(locale)
  };
}

function handleBrowserPrint() {
  window.print();
}

function handleShareWhatsApp() {
  const currentData = state.currentReceipt || buildCurrentFormReceiptData();
  const isEn = state.receiptLang === 'en';

  if (!currentData || !currentData.items || currentData.items.length === 0) {
    showToast(isEn ? 'Add transaction items first' : 'Tambahkan item transaksi terlebih dahulu', 'warning');
    return;
  }

  const phone = currentData.customer_phone ? currentData.customer_phone.replace(/\D/g, '') : '';
  const s = state.settings;

  let text = `*${s.store_name || 'SKYLINE EXCHANGE'}*\n`;
  text += `${s.store_address || 'Kuta, Bali'}\n`;
  text += `WA: ${s.store_phone || '+6285-122-777-970'}\n`;
  text += `--------------------------------\n`;
  text += `${isEn ? 'Receipt No' : 'No. Struk'} : ${currentData.receipt_no}\n`;
  text += `${isEn ? 'Date' : 'Tanggal'}   : ${currentData.created_at_formatted}\n`;
  text += `${isEn ? 'Type' : 'Tipe'}      : ${currentData.type === 'BELI' ? (isEn ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)') : (isEn ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)')}\n`;
  text += `${isEn ? 'Customer' : 'Customer'}  : ${currentData.customer_name}\n`;
  if (currentData.customer_id_no) text += `${isEn ? 'Passport/ID' : 'No. ID'}    : ${currentData.customer_id_no}\n`;
  text += `--------------------------------\n`;
  text += `*${isEn ? 'EXCHANGE DETAILS:' : 'RINCIAN TRANSAKSI VALAS:'}*\n`;

  currentData.items.forEach(item => {
    text += `• ${item.currency_code} ${item.amount.toLocaleString(isEn ? 'en-US' : 'id-ID')} @ Rp ${item.rate.toLocaleString('id-ID')} = Rp ${item.subtotal_idr.toLocaleString('id-ID')}\n`;
  });

  text += `--------------------------------\n`;
  text += `*TOTAL IDR   : Rp ${currentData.total_idr.toLocaleString('id-ID')}*\n`;
  text += `${isEn ? 'PAYMENT' : 'PEMBAYARAN'}  : Rp ${currentData.paid_amount.toLocaleString('id-ID')}\n`;
  text += `${isEn ? 'CHANGE' : 'KEMBALIAN'}   : Rp ${currentData.change_amount.toLocaleString('id-ID')}\n`;
  text += `--------------------------------\n`;
  text += isEn 
    ? `_Thank you for visiting Skyline Exchange._` 
    : `_Terima kasih telah bertransaksi di Skyline Exchange._`;

  const encoded = encodeURIComponent(text);
  const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(waUrl, '_blank');
}

// ==================== DELIVERY MANAGEMENT ====================
async function loadDeliveryOrders() {
  const container = document.getElementById('delivery-orders-list');
  if (!container) return;

  try {
    const res = await authFetch('/api/transactions?delivery=1&limit=50');
    const data = await res.json();
    if (data.success) {
      renderDeliveryOrders(data.data);
    }
  } catch {
    container.innerHTML = `<div class="col-span-2 text-center py-8 text-slate-500">${state.appLang === 'en' ? 'Unable to load delivery orders while offline.' : 'Tidak dapat memuat pesanan delivery saat offline.'}</div>`;
  }
}

function renderDeliveryOrders(orders) {
  const container = document.getElementById('delivery-orders-list');
  const countBadge = document.getElementById('badge-delivery-count');
  const filter = document.getElementById('filter-delivery-status').value;
  const isEn = state.appLang === 'en';

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.delivery_status === filter);

  const pendingCount = orders.filter(o => o.delivery_status === 'PENDING' || o.delivery_status === 'ON_THE_WAY').length;
  if (pendingCount > 0) {
    countBadge.textContent = pendingCount;
    countBadge.classList.remove('hidden');
  } else {
    countBadge.classList.add('hidden');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 md:col-span-2 text-center py-12 bg-navy-800 rounded-xl border border-navy-700 text-slate-500">
        <svg class="w-10 h-10 mx-auto mb-2 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        ${isEn ? 'No delivery orders matching this status.' : 'Tidak ada pesanan delivery dengan status ini.'}
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(o => {
    const statusBadges = {
      PENDING: `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">${isEn ? 'Awaiting Courier' : 'Menunggu Kurir'}</span>`,
      ON_THE_WAY: `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${isEn ? 'On The Way' : 'Dalam Pengantaran'}</span>`,
      COMPLETED: `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">${isEn ? 'Completed' : 'Selesai'}</span>`,
      CANCELLED: `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">${isEn ? 'Cancelled' : 'Batal'}</span>`
    };

    const card = document.createElement('div');
    card.className = 'bg-navy-800 border border-navy-700 rounded-xl p-4 space-y-3 shadow-sm';

    let itemsSummary = '';
    if (o.items && o.items.length) {
      itemsSummary = o.items.map(it => `${it.amount.toLocaleString(isEn ? 'en-US' : 'id-ID')} ${it.currency_code}`).join(', ');
    }

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="text-xs font-mono font-bold text-brand">${o.receipt_no}</span>
          <h4 class="text-sm font-bold text-white uppercase">${o.customer_name}</h4>
        </div>
        ${statusBadges[o.delivery_status] || ''}
      </div>

      <div class="space-y-1 text-xs text-slate-300 font-sans">
        <div class="flex items-start gap-1.5">
          <svg class="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="text-slate-200">${o.delivery_address || (isEn ? 'Address not specified' : 'Alamat tidak dicantumkan')}</span>
        </div>
        ${o.customer_phone ? `
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="https://wa.me/${o.customer_phone.replace(/\D/g, '')}" target="_blank" class="text-emerald-400 hover:underline font-mono">${o.customer_phone}</a>
          </div>
        ` : ''}
        ${o.delivery_time ? `
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="text-slate-400">${o.delivery_time}</span>
          </div>
        ` : ''}
      </div>

      <div class="pt-2 border-t border-navy-700 flex items-center justify-between text-xs font-mono">
        <div>
          <span class="text-slate-400">Forex:</span> <span class="font-bold text-white">${itemsSummary}</span>
        </div>
        <div class="text-right">
          <span class="text-slate-400">Total:</span> <span class="font-bold text-brand">Rp ${o.total_idr.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div class="pt-2 flex items-center gap-2">
        <select class="select-change-delivery-status flex-1 bg-navy-900 border border-navy-600 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand" data-id="${o.id}">
          <option value="PENDING" ${o.delivery_status === 'PENDING' ? 'selected' : ''}>${isEn ? 'Awaiting Courier' : 'Menunggu Kurir'}</option>
          <option value="ON_THE_WAY" ${o.delivery_status === 'ON_THE_WAY' ? 'selected' : ''}>${isEn ? 'On The Way' : 'Dalam Pengantaran'}</option>
          <option value="COMPLETED" ${o.delivery_status === 'COMPLETED' ? 'selected' : ''}>${isEn ? 'Completed (Handover Done)' : 'Selesai (Sudah Serah Terima)'}</option>
          <option value="CANCELLED" ${o.delivery_status === 'CANCELLED' ? 'selected' : ''}>${isEn ? 'Cancel' : 'Batalkan'}</option>
        </select>
        <button type="button" class="btn-delivery-reprint py-1.5 px-3 rounded bg-navy-700 hover:bg-navy-600 text-slate-200 text-xs font-medium" data-id="${o.id}">
          ${isEn ? 'Receipt' : 'Struk'}
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll('.select-change-delivery-status').forEach(sel => {
    sel.addEventListener('change', async () => {
      const id = sel.getAttribute('data-id');
      const newStatus = sel.value;
      try {
        await authFetch(`/api/transactions/${id}/delivery`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_status: newStatus })
        });
        showToast(isEn ? 'Delivery status updated' : 'Status delivery diperbarui', 'success');
        loadDeliveryOrders();
      } catch (err) {
        showToast(isEn ? 'Failed to update status' : 'Gagal memperbarui status', 'error');
      }
    });
  });

  document.querySelectorAll('.btn-delivery-reprint').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await reprintTransaction(id);
    });
  });
}

// ==================== HISTORY & REPORTS ====================
async function loadHistory() {
  const tbody = document.getElementById('history-table-body');
  const dateInput = document.getElementById('history-date-filter');
  if (!tbody) return;

  const dateVal = dateInput.value;
  let url = '/api/transactions?limit=100';
  if (dateVal) url += `&date=${dateVal}`;

  try {
    const res = await authFetch(url);
    const data = await res.json();
    if (data.success) {
      renderHistoryTable(data.data);
    }
  } catch {
    tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500">${state.appLang === 'en' ? 'Failed to load transaction history while offline.' : 'Gagal memuat riwayat transaksi saat offline.'}</td></tr>`;
  }
}

function renderHistoryTable(transactions) {
  const tbody = document.getElementById('history-table-body');
  const search = document.getElementById('history-search-input').value.toLowerCase();
  const isEn = state.appLang === 'en';

  const filtered = transactions.filter(t => {
    if (!search) return true;
    return (t.receipt_no && t.receipt_no.toLowerCase().includes(search)) ||
           (t.customer_name && t.customer_name.toLowerCase().includes(search)) ||
           (t.customer_phone && t.customer_phone.includes(search));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-500 font-sans">${isEn ? 'No transactions found.' : 'Tidak ada transaksi ditemukan.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-navy-700/40 transition-colors';

    const dateStr = new Date(t.created_at).toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
    const isBeli = t.type === 'BELI';
    const typeBadge = isBeli 
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">${isEn ? 'BUY' : 'BELI'}</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">${isEn ? 'SELL' : 'JUAL'}</span>`;

    const itemsSummary = (t.items || []).map(it => `${it.amount.toLocaleString(isEn ? 'en-US' : 'id-ID')} ${it.currency_code}`).join(', ');

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-brand">${t.receipt_no}</td>
      <td class="py-2.5 px-3 text-slate-400">${dateStr}</td>
      <td class="py-2.5 px-3">${typeBadge}</td>
      <td class="py-2.5 px-3 font-sans font-semibold text-white uppercase">${t.customer_name}</td>
      <td class="py-2.5 px-3 text-slate-300 font-mono">${itemsSummary}</td>
      <td class="py-2.5 px-3 text-right font-bold text-white font-mono">Rp ${t.total_idr.toLocaleString('id-ID')}</td>
      <td class="py-2.5 px-3 text-center">
        <button type="button" class="btn-history-reprint px-2.5 py-1 rounded bg-navy-700 hover:bg-navy-600 text-brand text-xs font-sans transition-colors" data-id="${t.id}">
          ${isEn ? 'Print' : 'Cetak'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-history-reprint').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      reprintTransaction(id);
    });
  });
}

async function reprintTransaction(id) {
  try {
    const res = await authFetch(`/api/transactions/${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      const tx = data.data;
      const locale = state.receiptLang === 'en' ? 'en-US' : 'id-ID';
      tx.created_at_formatted = new Date(tx.created_at).toLocaleDateString(locale) + ' ' + new Date(tx.created_at).toLocaleTimeString(locale);
      state.currentReceipt = tx;

      document.getElementById('rcpt-no').textContent = tx.receipt_no;
      document.getElementById('rcpt-datetime').textContent = tx.created_at_formatted;
      document.getElementById('rcpt-type').textContent = tx.type === 'BELI' 
        ? (state.receiptLang === 'en' ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)') 
        : (state.receiptLang === 'en' ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)');
      document.getElementById('rcpt-cust-name').textContent = tx.customer_name.toUpperCase();
      document.getElementById('rcpt-teller').textContent = tx.teller_name;
      document.getElementById('rcpt-sign-teller').textContent = `( ${tx.teller_name.toUpperCase()} )`;
      document.getElementById('rcpt-sign-customer').textContent = `( ${(tx.customer_signature_name || tx.customer_name).toUpperCase()} )`;
      document.getElementById('input-signature-customer').value = (tx.customer_signature_name || tx.customer_name).toUpperCase();

      const phoneRow = document.getElementById('rcpt-phone-row');
      const idRow = document.getElementById('rcpt-id-row');
      if (tx.customer_phone) {
        document.getElementById('rcpt-cust-phone').textContent = tx.customer_phone;
        phoneRow.classList.remove('hidden');
      } else phoneRow.classList.add('hidden');

      if (tx.customer_id_no) {
        document.getElementById('rcpt-cust-id').textContent = tx.customer_id_no;
        idRow.classList.remove('hidden');
      } else idRow.classList.add('hidden');

      const rcptItemsBody = document.getElementById('rcpt-items-body');
      rcptItemsBody.innerHTML = '';
      (tx.items || []).forEach(item => {
        const rcptRow = document.createElement('div');
        rcptRow.className = 'grid grid-cols-12 py-0.5 text-black';
        rcptRow.innerHTML = `
          <div class="col-span-3 text-left font-bold">${item.currency_code}</div>
          <div class="col-span-2 text-right">${item.amount.toLocaleString(state.receiptLang === 'en' ? 'en-US' : 'id-ID')}</div>
          <div class="col-span-3 text-right">${item.rate.toLocaleString('id-ID')}</div>
          <div class="col-span-4 text-right font-medium">${item.subtotal_idr.toLocaleString('id-ID')}</div>
        `;
        rcptItemsBody.appendChild(rcptRow);
      });

      document.getElementById('rcpt-total').textContent = 'Rp ' + tx.total_idr.toLocaleString('id-ID');
      document.getElementById('rcpt-payment').textContent = 'Rp ' + tx.paid_amount.toLocaleString('id-ID');
      document.getElementById('rcpt-change').textContent = 'Rp ' + tx.change_amount.toLocaleString('id-ID');

      switchTab('tab-pos');
      showToast(`${state.appLang === 'en' ? 'Receipt loaded' : 'Struk dimuat'}: ${tx.receipt_no}`, 'info');
    }
  } catch (err) {
    showToast(state.appLang === 'en' ? 'Failed to load receipt details' : 'Gagal memuat detail struk', 'error');
  }
}

async function loadReportsSummary() {
  try {
    const res = await authFetch('/api/reports/summary');
    const data = await res.json();
    if (data.success && data.data) {
      const { totals } = data.data;
      const isEn = state.appLang === 'en';
      let buyTotal = 0, buyCount = 0;
      let sellTotal = 0, sellCount = 0;

      totals.forEach(t => {
        if (t.type === 'BELI') {
          buyTotal = t.sum_idr || 0;
          buyCount = t.count || 0;
        } else if (t.type === 'JUAL') {
          sellTotal = t.sum_idr || 0;
          sellCount = t.count || 0;
        }
      });

      document.getElementById('sum-buy-idr').textContent = 'Rp ' + buyTotal.toLocaleString('id-ID');
      document.getElementById('sum-buy-count').textContent = isEn ? `${buyCount} buy transactions` : `${buyCount} transaksi beli`;

      document.getElementById('sum-sell-idr').textContent = 'Rp ' + sellTotal.toLocaleString('id-ID');
      document.getElementById('sum-sell-count').textContent = isEn ? `${sellCount} sell transactions` : `${sellCount} transaksi jual`;

      const totalTurnover = buyTotal + sellTotal;
      const totalCount = buyCount + sellCount;
      document.getElementById('sum-turnover-idr').textContent = 'Rp ' + totalTurnover.toLocaleString('id-ID');
      document.getElementById('sum-total-count').textContent = isEn ? `${totalCount} total transactions` : `${totalCount} transaksi total`;
    }
  } catch {
    // Ignore in offline
  }
}

// ==================== SUBTAB & TAB SWITCHER ====================
function switchSubtab(subtabName) {
  const panelSheets = document.getElementById('subtab-panel-sheets');
  const panelStore = document.getElementById('subtab-panel-store');
  const panelUsers = document.getElementById('subtab-panel-users');
  const btnSheets = document.getElementById('subtab-btn-sheets');
  const btnStore = document.getElementById('subtab-btn-store');
  const btnUsers = document.getElementById('subtab-btn-users');

  if (panelSheets) panelSheets.classList.add('hidden');
  if (panelStore) panelStore.classList.add('hidden');
  if (panelUsers) panelUsers.classList.add('hidden');

  const inactiveBtnClass = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-400 hover:text-white';
  if (btnSheets) btnSheets.className = inactiveBtnClass;
  if (btnStore) btnStore.className = inactiveBtnClass;
  if (btnUsers) btnUsers.className = inactiveBtnClass;

  if (subtabName === 'sheets') {
    if (panelSheets) panelSheets.classList.remove('hidden');
    if (btnSheets) btnSheets.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow';
  } else if (subtabName === 'users') {
    if (panelUsers) panelUsers.classList.remove('hidden');
    if (btnUsers) btnUsers.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-brand text-navy-950 font-bold shadow';
    if (state.user && state.user.role === 'ADMIN') {
      loadUsersList();
    }
  } else {
    if (panelStore) panelStore.classList.remove('hidden');
    if (btnStore) btnStore.className = 'flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-brand text-navy-950 font-bold shadow';
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(el => {
    el.className = 'nav-tab px-3 sm:px-4 py-2.5 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap';
  });

  if (tabId === 'tab-sheets') {
    const settingsEl = document.getElementById('tab-settings');
    if (settingsEl) settingsEl.classList.remove('hidden');
    switchSubtab('sheets');
    const tabBtn = document.querySelector('.nav-tab[data-target="tab-sheets"]');
    if (tabBtn) {
      tabBtn.className = 'nav-tab active-tab px-3 sm:px-4 py-2.5 font-semibold text-emerald-400 border-b-2 border-emerald-400 flex items-center gap-1.5 whitespace-nowrap';
    }
    setTimeout(() => {
      const urlInput = document.getElementById('setting-sheets-url');
      if (urlInput) {
        urlInput.focus();
        urlInput.select();
        urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
    return;
  }

  const targetEl = document.getElementById(tabId);
  if (targetEl) targetEl.classList.remove('hidden');

  const tabBtn = document.querySelector(`.nav-tab[data-target="${tabId}"]`);
  if (tabBtn) {
    tabBtn.className = 'nav-tab active-tab px-3 sm:px-4 py-2.5 font-semibold text-brand border-b-2 border-brand flex items-center gap-1.5 whitespace-nowrap';
  }

  if (tabId === 'tab-rates') loadRates();
  if (tabId === 'tab-delivery') loadDeliveryOrders();
  if (tabId === 'tab-history') { loadHistory(); loadReportsSummary(); }
  if (tabId === 'tab-settings') {
    const panelStore = document.getElementById('subtab-panel-store');
    if (panelStore && !panelStore.classList.contains('hidden')) {
      switchSubtab('store');
    } else {
      switchSubtab('sheets');
    }
  }
}

// ==================== BLUETOOTH PRINTER UI ====================
function initBluetoothUI() {
  const btnConnect = document.getElementById('btn-bt-connect');
  const btnDirectPrint = document.getElementById('btn-direct-bt-print');
  const nameLabel = document.getElementById('bt-printer-name');
  const statusDot = document.getElementById('bt-status-dot');

  printer.onStatusChange = ({ connected, status, text }) => {
    if (connected) {
      statusDot.className = 'w-2 h-2 rounded-full bg-brand animate-pulse';
      nameLabel.textContent = text || 'Printer Terhubung';
      btnConnect.classList.add('border-brand/60', 'text-brand');
    } else {
      statusDot.className = 'w-2 h-2 rounded-full bg-slate-500';
      nameLabel.textContent = i18n[state.appLang].connectBt;
      btnConnect.classList.remove('border-brand/60', 'text-brand');
    }
  };

  btnConnect.addEventListener('click', async () => {
    const isEn = state.appLang === 'en';
    if (printer.isConnected) {
      if (confirm(isEn ? 'Disconnect current Bluetooth thermal printer?' : 'Putuskan koneksi dengan printer thermal Bluetooth saat ini?')) {
        await printer.disconnect();
        showToast(isEn ? 'Bluetooth printer disconnected' : 'Printer Bluetooth diputuskan', 'info');
      }
      return;
    }
    try {
      const deviceName = await printer.connect();
      showToast(`${isEn ? 'Connected to' : 'Terhubung ke'} ${deviceName}`, 'success');
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        showToast(`Bluetooth: ${err.message}`, 'error');
      }
    }
  });

  btnDirectPrint.addEventListener('click', handleDirectBtPrint);
}

// ==================== EVENT LISTENERS SETUP ====================
function initEventListeners() {
  // Live Clock
  setInterval(() => {
    const now = new Date();
    const clock = document.getElementById('live-clock');
    if (clock) clock.textContent = now.toLocaleTimeString(state.appLang === 'en' ? 'en-US' : 'id-ID');
  }, 1000);

  // Online / Offline Listeners
  window.addEventListener('online', () => {
    setOnlineStatus(true);
    syncOfflineTransactions();
  });
  window.addEventListener('offline', () => {
    setOnlineStatus(false);
  });
  setInterval(checkOnlineStatus, 20000);

  // Sync Queue Button
  document.getElementById('btn-sync-queue').addEventListener('click', syncOfflineTransactions);

  // Language Switchers
  document.getElementById('btn-lang-id').addEventListener('click', () => setAppLanguage('id'));
  document.getElementById('btn-lang-en').addEventListener('click', () => setAppLanguage('en'));
  document.getElementById('btn-rcpt-lang-id').addEventListener('click', () => setReceiptLanguage('id'));
  document.getElementById('btn-rcpt-lang-en').addEventListener('click', () => setReceiptLanguage('en'));

  // Navigation Tabs
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchTab(target);
    });
  });

  // Type Switchers
  document.getElementById('btn-type-beli').addEventListener('click', () => setTransactionType('BELI'));
  document.getElementById('btn-type-jual').addEventListener('click', () => setTransactionType('JUAL'));

  // Delivery Checkbox
  const deliveryCheck = document.getElementById('check-delivery');
  const deliveryFields = document.getElementById('delivery-fields');
  deliveryCheck.addEventListener('change', () => {
    state.isDelivery = deliveryCheck.checked;
    if (state.isDelivery) {
      deliveryFields.classList.remove('hidden');
    } else {
      deliveryFields.classList.add('hidden');
    }
    updateLiveReceiptMetadata();
  });

  // Currency select change
  document.getElementById('item-currency').addEventListener('change', handleCurrencyChange);

  // Quick Currency Chips
  document.querySelectorAll('.chip-curr').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const select = document.getElementById('item-currency');
      if (select && state.rates.some(r => r.code === code)) {
        select.value = code;
        handleCurrencyChange();
        document.getElementById('item-amount').focus();
      }
    });
  });

  // Custom Currency Quick Chip
  const chipCustom = document.getElementById('chip-custom-curr');
  if (chipCustom) {
    chipCustom.addEventListener('click', () => {
      const select = document.getElementById('item-currency');
      if (select) {
        select.value = '__CUSTOM__';
        handleCurrencyChange();
      }
    });
  }

  // Add Item to Cart
  document.getElementById('btn-add-item').addEventListener('click', addItemToCart);
  document.getElementById('item-amount').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItemToCart();
    }
  });

  // Customer Name & Inputs Live Update
  ['cust-name', 'cust-phone', 'cust-id'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateLiveReceiptMetadata);
  });

  // Signature Name Edit Trigger
  const sigInput = document.getElementById('input-signature-customer');
  sigInput.addEventListener('input', () => {
    sigInput.setAttribute('data-customized', 'true');
    const rcptSign = document.getElementById('rcpt-sign-customer');
    rcptSign.textContent = sigInput.value ? `( ${sigInput.value.toUpperCase()} )` : '( CUSTOMER )';
  });

  // Payment Input Live Update
  document.getElementById('input-payment').addEventListener('input', renderCart);

  // Exact Cash Button
  document.getElementById('btn-exact-cash').addEventListener('click', () => {
    const { total } = calculateTotals();
    document.getElementById('input-payment').value = total;
    renderCart();
  });

  // Quick Add Cash Buttons
  document.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseFloat(btn.getAttribute('data-val'));
      const paymentInput = document.getElementById('input-payment');
      const current = parseFloat(paymentInput.value) || 0;
      paymentInput.value = current + val;
      renderCart();
    });
  });

  // Main Transaction Process & Reset
  document.getElementById('btn-submit-tx').addEventListener('click', processTransaction);
  document.getElementById('btn-reset-form').addEventListener('click', resetForm);

  // Print Buttons
  document.getElementById('btn-browser-print').addEventListener('click', handleBrowserPrint);
  document.getElementById('btn-share-wa').addEventListener('click', handleShareWhatsApp);

  // Edit Rate Modal Events
  document.getElementById('btn-modal-add-rate').addEventListener('click', () => openEditRateModal(null));
  document.getElementById('btn-close-modal-rate').addEventListener('click', closeEditRateModal);
  document.getElementById('btn-cancel-modal-rate').addEventListener('click', closeEditRateModal);

  document.getElementById('form-rate-edit').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-rate-id').value;
    const code = document.getElementById('edit-rate-code').value.trim().toUpperCase();
    const name = document.getElementById('edit-rate-name').value.trim();
    const denom = document.getElementById('edit-rate-denom').value.trim() || 'All';
    const buy = parseFloat(document.getElementById('edit-rate-buy').value);
    const sell = parseFloat(document.getElementById('edit-rate-sell').value);
    const isEn = state.appLang === 'en';

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/rates/${id}` : '/api/rates';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, denomination: denom, buy_rate: buy, sell_rate: sell })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEn ? 'Exchange rate saved successfully!' : 'Kurs berhasil disimpan!', 'success');
        closeEditRateModal();
        loadRates();
      } else {
        showToast(data.message || (isEn ? 'Failed to save exchange rate' : 'Gagal menyimpan kurs'), 'error');
      }
    } catch (err) {
      showToast(isEn ? 'Failed to connect to server' : 'Gagal menghubungi server', 'error');
    }
  });

  // History Filter Listeners
  document.getElementById('history-date-filter').value = new Date().toISOString().split('T')[0];
  document.getElementById('history-date-filter').addEventListener('change', loadHistory);
  document.getElementById('history-search-input').addEventListener('input', loadHistory);

  // Delivery Filter
  document.getElementById('filter-delivery-status').addEventListener('change', loadDeliveryOrders);

  // Settings Form Submit
  document.getElementById('form-settings').addEventListener('submit', async (e) => {
    e.preventDefault();
    const isEn = state.appLang === 'en';
    const payload = {
      store_name: document.getElementById('setting-store-name').value.trim(),
      store_address: document.getElementById('setting-store-address').value.trim(),
      store_phone: document.getElementById('setting-store-phone').value.trim(),
      paper_size: document.querySelector('input[name="setting-paper-size"]:checked')?.value || '80',
      store_permit: document.getElementById('setting-store-permit').value.trim(),
      show_permit: document.getElementById('setting-show-permit').checked ? '1' : '0',
      default_teller: document.getElementById('setting-default-teller').value.trim() || 'TELLER 01',
      disclaimer_1: document.getElementById('setting-disclaimer-1').value.trim(),
      disclaimer_2: document.getElementById('setting-disclaimer-2').value.trim(),
      google_sheets_url: (document.getElementById('setting-sheets-url')?.value || '').trim(),
      google_sheets_auto_sync: document.getElementById('setting-sheets-auto-sync')?.checked ? '1' : '0'
    };

    try {
      const res = await authFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        state.settings = { ...state.settings, ...payload };
        applySettingsToUI();
        showToast(isEn ? 'Settings saved successfully!' : 'Pengaturan berhasil disimpan!', 'success');
      }
    } catch {
      showToast(isEn ? 'Failed to save settings' : 'Gagal menyimpan ke server', 'error');
    }
  });

  // Paper Size Real-Time Toggle Listeners
  document.getElementById('setting-paper-80')?.addEventListener('change', () => applyPaperSize('80'));
  document.getElementById('setting-paper-58')?.addEventListener('change', () => applyPaperSize('58'));

  // Settings Sub-Tabs Switcher Listeners
  document.getElementById('subtab-btn-sheets')?.addEventListener('click', () => switchSubtab('sheets'));
  document.getElementById('subtab-btn-store')?.addEventListener('click', () => switchSubtab('store'));
  document.getElementById('subtab-btn-users')?.addEventListener('click', () => switchSubtab('users'));

  // Auth & User Management Listeners
  document.getElementById('form-login')?.addEventListener('submit', handleLogin);
  document.getElementById('btn-header-logout')?.addEventListener('click', () => handleLogout(false));
  document.getElementById('btn-toggle-pwd')?.addEventListener('click', togglePasswordVisibility);
  document.getElementById('form-change-pwd')?.addEventListener('submit', handleChangeMyPassword);
  document.getElementById('btn-open-add-user')?.addEventListener('click', openAddUserModal);
  document.getElementById('btn-close-modal-add-user')?.addEventListener('click', closeAddUserModal);
  document.getElementById('btn-cancel-modal-add-user')?.addEventListener('click', closeAddUserModal);
  document.getElementById('form-add-user')?.addEventListener('submit', handleAddUserSubmit);
  document.getElementById('btn-close-modal-reset-pwd')?.addEventListener('click', closeResetPasswordModal);
  document.getElementById('btn-cancel-modal-reset-pwd')?.addEventListener('click', closeResetPasswordModal);
  document.getElementById('form-reset-user-pwd')?.addEventListener('submit', handleResetPasswordSubmit);

  // Google Sheets Integration Listeners
  document.getElementById('btn-sheets-test')?.addEventListener('click', testGoogleSheetsConnection);
  document.getElementById('btn-sheets-sync-today')?.addEventListener('click', () => syncTransactionsToGoogleSheets());
  document.getElementById('btn-open-sheets-guide')?.addEventListener('click', openGoogleSheetsGuideModal);
  document.getElementById('btn-open-sheets-guide-link')?.addEventListener('click', openGoogleSheetsGuideModal);
  document.getElementById('btn-close-modal-sheets-guide')?.addEventListener('click', closeGoogleSheetsGuideModal);
  document.getElementById('btn-close-guide-footer')?.addEventListener('click', closeGoogleSheetsGuideModal);
  document.getElementById('btn-copy-sheets-script')?.addEventListener('click', copyGoogleSheetsScript);
  document.getElementById('btn-history-sync-sheets')?.addEventListener('click', () => {
    const d = document.getElementById('history-date-filter')?.value;
    syncTransactionsToGoogleSheets(d);
  });
  document.getElementById('btn-history-export-csv')?.addEventListener('click', () => {
    const d = document.getElementById('history-date-filter')?.value;
    exportGoogleSheetsCsv(d);
  });
  document.getElementById('setting-sheets-url')?.addEventListener('change', (e) => {
    saveGoogleSheetsSettings(e.target.value.trim());
  });
  document.getElementById('setting-sheets-auto-sync')?.addEventListener('change', () => {
    saveGoogleSheetsSettings(document.getElementById('setting-sheets-url')?.value.trim());
  });

  // Keyboard Navigation: Escape closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEditRateModal();
      closeGoogleSheetsGuideModal();
      closeAddUserModal();
      closeResetPasswordModal();
    }
  });
}

// ==================== GOOGLE SHEETS INTEGRATION ====================

async function testGoogleSheetsConnection() {
  const isEn = state.appLang === 'en';
  const urlInput = document.getElementById('setting-sheets-url');
  const btn = document.getElementById('btn-sheets-test');
  const alertBox = document.getElementById('sheets-status-alert');
  const url = (urlInput?.value || '').trim();

  if (!url) {
    showToast(isEn ? 'Please enter the Google Apps Script Web App URL first.' : 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.', 'warning');
    urlInput?.focus();
    return;
  }

  const origHtml = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block animate-spin mr-1">↻</span> ${isEn ? 'Connecting...' : 'Menghubungkan...'}`;
  btn.disabled = true;

  try {
    const res = await authFetch('/api/sheets/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (data.success) {
      showToast(isEn ? 'Connected to Google Sheets successfully!' : 'Berhasil terhubung ke Google Sheets!', 'success');
      alertBox.className = 'p-3 rounded-lg text-xs border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 block';
      alertBox.innerHTML = `
        <div class="font-bold flex items-center gap-1.5 text-emerald-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          ${isEn ? 'Connected to' : 'Terhubung ke'}: ${data.spreadsheet_title || 'Oktober MC Skyline'}
        </div>
        <div class="mt-1 text-slate-300">
          ${isEn ? 'Available tabs' : 'Tab tersedia'}: ${(data.tabs || []).join(', ')} ... (${data.total_tabs || 0} ${isEn ? 'tabs total' : 'tab total'})
        </div>
      `;
      // Auto save URL to settings
      await saveGoogleSheetsSettings(url);
    } else {
      showToast(data.message || (isEn ? 'Failed to connect to Google Sheets' : 'Gagal terhubung ke Google Sheets'), 'error');
      alertBox.className = 'p-3 rounded-lg text-xs border bg-rose-950/60 border-rose-500/40 text-rose-200 block';
      alertBox.innerHTML = `
        <div class="font-bold text-rose-300">⚠️ ${isEn ? 'Connection Failed' : 'Koneksi Gagal'}:</div>
        <div class="mt-0.5 text-slate-300">${data.message || (isEn ? 'Unknown error' : 'Terjadi kesalahan')}</div>
      `;
    }
  } catch (err) {
    showToast(isEn ? 'Network error while testing connection.' : 'Gagal menghubungi server untuk tes koneksi.', 'error');
    alertBox.className = 'p-3 rounded-lg text-xs border bg-rose-950/60 border-rose-500/40 text-rose-200 block';
    alertBox.textContent = `Error: ${err.message}`;
  } finally {
    btn.innerHTML = origHtml;
    btn.disabled = false;
  }
}

async function saveGoogleSheetsSettings(url) {
  const autoSync = document.getElementById('setting-sheets-auto-sync')?.checked ? '1' : '0';
  const payload = {
    google_sheets_url: url || (document.getElementById('setting-sheets-url')?.value || '').trim(),
    google_sheets_auto_sync: autoSync
  };
  try {
    await authFetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    state.settings.google_sheets_url = payload.google_sheets_url;
    state.settings.google_sheets_auto_sync = payload.google_sheets_auto_sync;
  } catch (e) {
    console.warn('Failed to auto-save sheets settings:', e);
  }
}

async function syncTransactionsToGoogleSheets(targetDate) {
  const isEn = state.appLang === 'en';
  const url = (document.getElementById('setting-sheets-url')?.value || state.settings.google_sheets_url || '').trim();

  if (!url) {
    showToast(isEn ? 'Please set Google Apps Script URL in Settings first.' : 'Silakan atur URL Google Apps Script di tab Pengaturan terlebih dahulu.', 'warning');
    switchTab('tab-settings');
    document.getElementById('setting-sheets-url')?.focus();
    return;
  }

  const date = targetDate || new Date().toISOString().split('T')[0];
  showToast(isEn ? `Syncing transactions (${date}) to Google Sheets...` : `Menyinkronkan transaksi (${date}) ke Google Sheets...`, 'info');

  try {
    const res = await authFetch('/api/sheets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, url })
    });
    const data = await res.json();

    if (data.success) {
      const msg = data.message || (isEn ? `Successfully synced ${data.processed || 0} rows to Google Sheets!` : `Berhasil menyinkronkan ${data.processed || 0} baris ke Google Sheets!`);
      showToast(msg, 'success');
      const alertBox = document.getElementById('sheets-status-alert');
      if (alertBox) {
        alertBox.className = 'p-3 rounded-lg text-xs border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 block';
        alertBox.innerHTML = `
          <div class="font-bold text-emerald-300">✓ ${isEn ? 'Last Sync Succeeded' : 'Sinkronisasi Terakhir Berhasil'} (${new Date().toLocaleTimeString()}):</div>
          <div class="mt-0.5 text-slate-300">${msg}</div>
        `;
      }
    } else {
      showToast(data.message || (isEn ? 'Failed to sync to Google Sheets' : 'Gagal sinkronisasi ke Google Sheets'), 'error');
    }
  } catch (err) {
    showToast(isEn ? 'Network error during Google Sheets sync.' : 'Terjadi kesalahan jaringan saat sinkronisasi.', 'error');
  }
}

async function openGoogleSheetsGuideModal() {
  const modal = document.getElementById('modal-sheets-guide');
  const preview = document.getElementById('sheets-script-preview');
  if (modal) modal.classList.remove('hidden');

  try {
    preview.textContent = state.appLang === 'en' ? 'Loading script...' : 'Memuat kode script...';
    const res = await authFetch('/api/sheets/script');
    if (res.ok) {
      const code = await res.text();
      preview.textContent = code;
    } else {
      preview.textContent = '// Error loading script from server';
    }
  } catch (e) {
    preview.textContent = '// Failed to fetch script: ' + e.message;
  }
}

function closeGoogleSheetsGuideModal() {
  const modal = document.getElementById('modal-sheets-guide');
  if (modal) modal.classList.add('hidden');
}

async function copyGoogleSheetsScript() {
  const isEn = state.appLang === 'en';
  const preview = document.getElementById('sheets-script-preview');
  const btn = document.getElementById('btn-copy-sheets-script');
  const text = preview?.textContent || '';

  if (!text || text.startsWith('Memuat') || text.startsWith('Loading')) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast(isEn ? 'Google Apps Script code copied to clipboard!' : 'Kode Google Apps Script berhasil disalin ke clipboard!', 'success');
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML = `✓ ${isEn ? 'Copied!' : 'Tersalin!'}`;
      setTimeout(() => { btn.innerHTML = origHtml; }, 2000);
    }
  } catch (err) {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    showToast(isEn ? 'Code selected. Press Ctrl+C to copy.' : 'Kode terseleksi. Tekan Ctrl+C untuk menyalin.', 'info');
  }
}

function exportGoogleSheetsCsv(targetDate) {
  const date = targetDate || document.getElementById('history-date-filter')?.value || new Date().toISOString().split('T')[0];
  const url = `/api/sheets/export-csv?date=${encodeURIComponent(date)}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `Skyline_POS_${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(state.appLang === 'en' ? `Exporting CSV for date ${date}...` : `Mengunduh CSV tanggal ${date}...`, 'info');
}

// ==================== AUTH & USER MANAGEMENT ====================

function togglePasswordVisibility() {
  const pwdInput = document.getElementById('login-password');
  const icon = document.getElementById('pwd-eye-icon');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    if (icon) {
      icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
  } else {
    pwdInput.type = 'password';
    if (icon) {
      icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  }
}

function showLoginOverlay() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.remove('hidden');
  const badge = document.getElementById('user-header-badge');
  if (badge) {
    badge.classList.add('hidden');
    badge.classList.remove('flex');
  }
  const usernameInput = document.getElementById('login-username');
  if (usernameInput) {
    usernameInput.focus();
  }
}

function hideLoginOverlay() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.add('hidden');
  updateUserHeaderBadge();
}

function updateUserHeaderBadge() {
  const badge = document.getElementById('user-header-badge');
  const nameEl = document.getElementById('header-user-name');
  const roleEl = document.getElementById('header-user-role');
  const adminSection = document.getElementById('admin-user-management-section');

  if (state.user && state.token) {
    if (badge) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    }
    if (nameEl) nameEl.textContent = state.user.username;
    if (roleEl) {
      roleEl.textContent = state.user.role;
      roleEl.className = state.user.role === 'ADMIN'
        ? 'px-1.5 py-0.5 rounded text-[9px] bg-brand/20 text-brand font-bold border border-brand/30'
        : 'px-1.5 py-0.5 rounded text-[9px] bg-slate-700 text-slate-300 font-bold border border-slate-600';
    }

    if (adminSection) {
      if (state.user.role === 'ADMIN') {
        adminSection.classList.remove('hidden');
      } else {
        adminSection.classList.add('hidden');
      }
    }

    if (state.user.displayName) {
      state.settings.default_teller = state.user.displayName;
      const tellerInput = document.getElementById('setting-default-teller');
      if (tellerInput) tellerInput.value = state.user.displayName;
      const rcptTeller = document.getElementById('rcpt-teller');
      if (rcptTeller) rcptTeller.textContent = state.user.displayName;
      const rcptSign = document.getElementById('rcpt-sign-teller');
      if (rcptSign) rcptSign.textContent = `( ${state.user.displayName.toUpperCase()} )`;
    }
  } else {
    if (badge) {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }
}

async function handleLogin(e) {
  if (e) e.preventDefault();
  const isEn = state.appLang === 'en';
  const username = (document.getElementById('login-username')?.value || '').trim();
  const password = document.getElementById('login-password')?.value || '';
  const remember = document.getElementById('login-remember')?.checked;
  const alertBox = document.getElementById('login-error-alert');
  const btn = document.getElementById('btn-login-submit');

  if (!username || !password) {
    if (alertBox) {
      alertBox.textContent = isEn ? 'Username and password are required.' : 'Username dan password wajib diisi.';
      alertBox.classList.remove('hidden');
    }
    return;
  }

  const origHtml = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block animate-spin mr-1">↻</span> ${isEn ? 'Signing in...' : 'Memproses masuk...'}`;
  btn.disabled = true;
  if (alertBox) alertBox.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, remember })
    });
    const data = await res.json();

    if (data.success && data.token) {
      state.token = data.token;
      state.user = data.user;

      if (remember) {
        localStorage.setItem('skyline_pos_token', data.token);
        localStorage.setItem('skyline_pos_user', JSON.stringify(data.user));
        sessionStorage.removeItem('skyline_pos_token');
        sessionStorage.removeItem('skyline_pos_user');
      } else {
        sessionStorage.setItem('skyline_pos_token', data.token);
        sessionStorage.setItem('skyline_pos_user', JSON.stringify(data.user));
        localStorage.removeItem('skyline_pos_token');
        localStorage.removeItem('skyline_pos_user');
      }

      hideLoginOverlay();
      showToast(isEn ? `Welcome back, ${data.user.displayName}!` : `Selamat datang, ${data.user.displayName}!`, 'success');

      await loadSettings();
      await loadRates();
      await loadReportsSummary();
      await loadHistory();
    } else {
      if (alertBox) {
        alertBox.textContent = data.message || (isEn ? 'Login failed.' : 'Gagal login.');
        alertBox.classList.remove('hidden');
      }
    }
  } catch (err) {
    if (alertBox) {
      alertBox.textContent = isEn ? 'Network error during login.' : 'Gagal terhubung ke server saat login.';
      alertBox.classList.remove('hidden');
    }
  } finally {
    btn.innerHTML = origHtml;
    btn.disabled = false;
  }
}

function handleLogout(isExpired = false) {
  const isEn = state.appLang === 'en';
  state.token = null;
  state.user = null;
  localStorage.removeItem('skyline_pos_token');
  localStorage.removeItem('skyline_pos_user');
  sessionStorage.removeItem('skyline_pos_token');
  sessionStorage.removeItem('skyline_pos_user');

  const alertBox = document.getElementById('login-error-alert');
  if (alertBox) {
    if (isExpired) {
      alertBox.textContent = isEn ? 'Your session has expired. Please log in again.' : 'Sesi login telah berakhir. Silakan login kembali.';
      alertBox.classList.remove('hidden');
    } else {
      alertBox.classList.add('hidden');
    }
  }

  const pwdInput = document.getElementById('login-password');
  if (pwdInput) pwdInput.value = '';

  showLoginOverlay();
  if (!isExpired) {
    showToast(isEn ? 'Logged out successfully.' : 'Berhasil keluar dari akun kasir.', 'info');
  }
}

async function checkAuthSession() {
  if (!state.token) {
    showLoginOverlay();
    return false;
  }
  try {
    const res = await authFetch('/api/auth/me');
    const data = await res.json();
    if (data.success && data.user) {
      state.user = data.user;
      hideLoginOverlay();
      return true;
    } else {
      handleLogout(true);
      return false;
    }
  } catch {
    if (!navigator.onLine && state.token && state.user) {
      hideLoginOverlay();
      return true;
    }
    showLoginOverlay();
    return false;
  }
}

async function loadUsersList() {
  const tbody = document.getElementById('user-table-body');
  if (!tbody) return;
  const isEn = state.appLang === 'en';

  tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400 font-sans">${isEn ? 'Loading cashier accounts...' : 'Memuat data kasir...'}</td></tr>`;

  try {
    const res = await authFetch('/api/auth/users');
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-500 font-sans">${isEn ? 'No cashier accounts registered.' : 'Belum ada akun kasir terdaftar.'}</td></tr>`;
        return;
      }
      tbody.innerHTML = data.data.map(u => {
        const isSelf = state.user && (state.user.id === u.id || state.user.userId === u.id);
        const roleBadge = u.role === 'ADMIN'
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] bg-brand/20 text-brand font-bold border border-brand/30">ADMIN</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300 font-bold border border-slate-600">TELLER</span>';

        return `
          <tr class="hover:bg-navy-800 transition-colors">
            <td class="py-2.5 px-3 font-bold text-white font-mono">${escapeHtml(u.username)}</td>
            <td class="py-2.5 px-3 font-medium text-slate-200">${escapeHtml(u.display_name)}</td>
            <td class="py-2.5 px-3">${roleBadge}</td>
            <td class="py-2.5 px-3 text-right space-x-1">
              <button type="button" onclick="openResetPasswordModal(${u.id}, '${escapeHtml(u.username)}')" class="py-1 px-2.5 rounded bg-navy-700 hover:bg-navy-600 text-slate-200 text-[11px] font-semibold transition-colors">
                ${isEn ? 'Reset Pass' : 'Reset Sandi'}
              </button>
              ${!isSelf ? `
                <button type="button" onclick="handleDeleteUser(${u.id}, '${escapeHtml(u.username)}')" class="py-1 px-2.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-semibold transition-colors">
                  ${isEn ? 'Delete' : 'Hapus'}
                </button>
              ` : `
                <span class="text-[10px] text-slate-500 italic px-2">${isEn ? '(Active)' : '(Akun ini)'}</span>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-rose-400 font-sans">Error: ${err.message}</td></tr>`;
  }
}

async function handleChangeMyPassword(e) {
  e.preventDefault();
  const isEn = state.appLang === 'en';
  const oldPassword = document.getElementById('input-old-pwd')?.value || '';
  const newPassword = document.getElementById('input-new-pwd')?.value || '';

  if (newPassword.length < 6) {
    showToast(isEn ? 'New password must be at least 6 characters.' : 'Password baru minimal 6 karakter.', 'warning');
    return;
  }

  try {
    const res = await authFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast(isEn ? 'Password updated successfully!' : 'Password berhasil diperbarui!', 'success');
      document.getElementById('input-old-pwd').value = '';
      document.getElementById('input-new-pwd').value = '';
    } else {
      showToast(data.message || (isEn ? 'Failed to update password.' : 'Gagal memperbarui password.'), 'error');
    }
  } catch (err) {
    showToast(isEn ? 'Network error.' : 'Gagal menghubungi server.', 'error');
  }
}

function openAddUserModal() {
  const modal = document.getElementById('modal-add-user');
  if (modal) modal.classList.remove('hidden');
  document.getElementById('add-user-username')?.focus();
}

function closeAddUserModal() {
  const modal = document.getElementById('modal-add-user');
  if (modal) modal.classList.add('hidden');
  document.getElementById('form-add-user')?.reset();
}

async function handleAddUserSubmit(e) {
  e.preventDefault();
  const isEn = state.appLang === 'en';
  const username = (document.getElementById('add-user-username')?.value || '').trim();
  const displayName = (document.getElementById('add-user-display')?.value || '').trim();
  const role = document.getElementById('add-user-role')?.value || 'TELLER';
  const password = document.getElementById('add-user-password')?.value || '';

  if (!username || !displayName || !password) {
    showToast(isEn ? 'All fields are required.' : 'Semua kolom wajib diisi.', 'warning');
    return;
  }
  if (password.length < 6) {
    showToast(isEn ? 'Password must be at least 6 characters.' : 'Password minimal 6 karakter.', 'warning');
    return;
  }

  try {
    const res = await authFetch('/api/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, role, password })
    });
    const data = await res.json();
    if (data.success) {
      showToast(isEn ? 'New cashier account created successfully!' : 'Akun kasir baru berhasil didaftarkan!', 'success');
      closeAddUserModal();
      loadUsersList();
    } else {
      showToast(data.message || (isEn ? 'Failed to add user.' : 'Gagal mendaftarkan akun kasir.'), 'error');
    }
  } catch (err) {
    showToast(isEn ? 'Network error.' : 'Gagal menghubungi server.', 'error');
  }
}

function openResetPasswordModal(id, username) {
  const modal = document.getElementById('modal-reset-user-pwd');
  if (modal) modal.classList.remove('hidden');
  document.getElementById('reset-target-user-id').value = id;
  document.getElementById('reset-target-username').textContent = `@${username}`;
  document.getElementById('reset-new-password')?.focus();
}

function closeResetPasswordModal() {
  const modal = document.getElementById('modal-reset-user-pwd');
  if (modal) modal.classList.add('hidden');
  document.getElementById('form-reset-user-pwd')?.reset();
}

async function handleResetPasswordSubmit(e) {
  e.preventDefault();
  const isEn = state.appLang === 'en';
  const id = document.getElementById('reset-target-user-id')?.value;
  const newPassword = document.getElementById('reset-new-password')?.value || '';

  if (newPassword.length < 6) {
    showToast(isEn ? 'Password must be at least 6 characters.' : 'Password minimal 6 karakter.', 'warning');
    return;
  }

  try {
    const res = await authFetch(`/api/auth/users/${id}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast(isEn ? 'Password reset successfully!' : 'Password berhasil direset!', 'success');
      closeResetPasswordModal();
    } else {
      showToast(data.message || (isEn ? 'Failed to reset password.' : 'Gagal mereset password.'), 'error');
    }
  } catch (err) {
    showToast(isEn ? 'Network error.' : 'Gagal menghubungi server.', 'error');
  }
}

async function handleDeleteUser(id, username) {
  const isEn = state.appLang === 'en';
  const confirmMsg = isEn
    ? `Are you sure you want to delete cashier account "${username}"?`
    : `Apakah Anda yakin ingin menghapus akun kasir "${username}"?`;
  if (!confirm(confirmMsg)) return;

  try {
    const res = await authFetch(`/api/auth/users/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(isEn ? 'Account deleted successfully!' : 'Akun kasir berhasil dihapus!', 'info');
      loadUsersList();
    } else {
      showToast(data.message || (isEn ? 'Failed to delete account.' : 'Gagal menghapus akun.'), 'error');
    }
  } catch (err) {
    showToast(isEn ? 'Network error.' : 'Gagal menghubungi server.', 'error');
  }
}

window.openResetPasswordModal = openResetPasswordModal;
window.handleDeleteUser = handleDeleteUser;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  initEventListeners();
  initBluetoothUI();

  // Load Saved Language Preferences
  if (state.appLang) setAppLanguage(state.appLang);
  if (state.receiptLang) setReceiptLanguage(state.receiptLang);

  // Purge Stale Service Worker Cache
  if ('caches' in window) {
    try {
      await caches.delete('skyline-pos-v1');
    } catch (e) {
      console.warn('Cache purge skipped:', e);
    }
  }

  if ('serviceWorker' in navigator) {
    try {
      const isPos = window.location.pathname.startsWith('/pos');
      const swUrl = isPos ? '/pos/sw.js' : '/sw.js';
      const swScope = isPos ? '/pos/' : '/';
      const reg = await navigator.serviceWorker.register(swUrl, { scope: swScope });
      if (reg && reg.update) {
        reg.update();
      }
    } catch (e) {
      console.warn('SW registration skipped:', e);
    }
  }

  // Load base settings (store name, brand color)
  await loadSettings();
  renderCart();

  // Check auth session
  const isAuthenticated = await checkAuthSession();
  if (isAuthenticated) {
    await loadRates();
    await updateOfflineQueueBadge();
    await checkOnlineStatus();
  }
});
