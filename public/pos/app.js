/**
 * Skyline Exchange POS Application Logic
 * Supports: Dual Language (ID / EN), Offline-first IndexedDB, Web Bluetooth 58mm Thermal Printer, Rates & KYC
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
    connectUsb: 'Hubungkan Printer USB',
    themeLight: 'Terang',
    themeDark: 'Gelap',
    badgeRequired: '[Wajib Diisi]',
    badgeRequiredSelect: '[Pilih]',
    badgeOptional: '[Opsional]',
    badgeBoardRate: '[Kurs Papan]',
    badgeAutoCalc: '[Kalkulasi Otomatis]',
    tabPos: 'Kasir Transaksi',
    tabRates: 'Papan Kurs',
    tabHistory: 'Riwayat & Laporan',
    tabSettings: 'Pengaturan',
    subtabSheets: 'Google Sheets',
    subtabStore: 'Profil Toko',
    subtabCompliance: 'Kepatuhan BI',
    lblCustPep: 'Customer adalah PEP (pejabat publik)',
    badgePepNotice: 'High Risk Customer',
    txtEddMandate: 'PBI APU PPT: Nasabah PEP wajib menjalani Enhanced Due Diligence (EDD) dan Persetujuan Direksi.',
    lblPepInstitution: 'Institusi / Jabatan PEP',
    lblPepSource: 'Sumber Dana (Source of Funds)',
    lblPepPurpose: 'Tujuan Transaksi (Purpose)',
    lblPepApproval: 'Saya mengonfirmasi bahwa transaksi nasabah PEP ini telah mendapatkan Persetujuan Direksi / Senior Management sesuai standar kepatuhan Bank Indonesia.',
    lblUnderlyingTitle: 'Wajib dokumen underlying',
    txtUnderlyingDesc: 'Total transaksi mencapai batas USD 10.000 (PBI Transaksi Valas). Isi dokumen underlying sebelum menyimpan transaksi.',
    lblUnderlyingType: 'Jenis Dokumen Underlying',
    lblUnderlyingNo: 'Nomor Dokumen / Keterangan',
    dttotAlertTitle: 'PERINGATAN DTTOT / DPPSPM: TRANSAKSI DIBEKUKAN',
    dttotAlertDesc: 'Nama nasabah terindikasi dalam Daftar Terduga Teroris & Organisasi Teroris (DTTOT). Sesuai regulasi Bank Indonesia (PBI APU PPT), transaksi WAJIB DIBEKUKAN serta-merta tanpa penundaan (Freeze Without Delay).',

    // POS Cashier Form
    legendTitle: 'Petunjuk Kolom:',
    legendMandatory: 'Border Tebal = Wajib Diisi',
    legendOptional: 'Border Tipis = Opsional',
    legendAuto: 'Otomatis / Kurs Papan',
    btnBeli: 'Beli valas',
    btnJual: 'Jual valas',
    expBeli: 'Kasir membeli valas dari customer. Customer menyerahkan Valas dan menerima Rupiah (IDR).',
    expJual: 'Kasir menjual valas ke customer. Customer membeli Valas dan menyerahkan Rupiah (IDR).',
    custTitle: 'Customer',
    custNameLabel: 'Nama *',
    custNamePlaceholder: 'Nama lengkap',
    custPhoneLabel: 'Telepon / WhatsApp',
    custIdLabel: 'No. KTP / paspor',
    custIdPlaceholder: 'Nomor identitas',
    custNpwpLabel: 'NPWP',
    custNpwpPlaceholder: 'Nomor NPWP',
    custNationalityLabel: 'Kewarganegaraan',
    custNationalityPlaceholder: 'Indonesia, Australia',
    custJobLabel: 'Pekerjaan',
    custExtraLabel: 'Data tambahan (NPWP, kewarganegaraan, pekerjaan, alamat)',
    custJobPlaceholder: 'Pekerjaan',
    custGenderLabel: 'Jenis kelamin',
    optGenderNone: '- Pilih Gender -',
    optGenderMale: 'Laki-Laki',
    optGenderFemale: 'Perempuan',
    custAddressLabel: 'Alamat tinggal',
    custAddressPlaceholder: 'Alamat domisili atau hotel',
    rcptNationalityLabel: 'Kewarganegaraan',
    rcptNpwpLabel: 'NPWP',
    rcptJobLabel: 'Pekerjaan',
    rcptGenderLabel: 'Jenis Kelamin',
    rcptAddressLabel: 'Alamat',
    addValasTitle: 'Valas',
    addValasSub: 'Pilih mata uang & isi nominal',
    currLabel: 'Mata uang',
    amountLabel: 'Jumlah *',
    amountPlaceholder: '100',
    rateLabel: 'Kurs',
    btnAdd: 'Tambah',
    quickPick: 'Pilihan cepat:',
    customCurrencyTitle: 'Mata uang lain',
    saveCustomRateLabel: 'Simpan ke Papan Kurs',
    customCodeLabel: 'Kode (VND, AED, CHF) *',
    customNameLabel: 'Nama mata uang *',
    customOptionLabel: '+ Kustom / Valas Lain (+ Custom)',

    // Cart 4 Columns Table
    cartTitle: 'Rincian',
    cartItemsCount: 'Item',
    cartItemsEmpty: 'Belum ada valas yang ditambahkan.<br>Silakan pilih mata uang dan klik tombol Tambah.',
    colValas: 'Valas',
    colAmount: 'Jumlah',
    colRate: 'Kurs',
    colSubtotal: 'Subtotal',
    colAction: 'Hapus',

    // Financial Totals
    totalIdr: 'Total',
    paymentIdr: 'Uang diterima',
    changeIdr: 'Kembalian',
    exactCash: 'Uang pas',
    btnSubmitTx: 'Proses & cetak struk',
    btnSubmitShort: 'Proses',
    btnReset: 'Kosongkan',
    explainBeli: 'Customer menyerahkan valas, kasir membayar Rupiah.',
    explainJual: 'Customer membayar Rupiah, kasir menyerahkan valas.',

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
    rcptColValas: 'VALAS',
    rcptColQty: 'JML',
    rcptColRate: 'KURS',
    rcptColSub: 'SUBTOTAL',
    rcptItemsEmpty: 'Belum ada item',
    rcptTotal: 'TOTAL IDR',
    rcptPayment: 'PEMBAYARAN',
    rcptChange: 'KEMBALIAN',
    payoutLabel: 'Dibayarkan ke customer',
    payoutHint: 'Serahkan Rupiah sejumlah total ke customer.',
    rcptSignTeller: 'Teller',
    rcptSignCustomer: 'Customer',
    rcptSignNamePrompt: 'Nama TTD customer',
    rcptSignPlaceholder: 'Sama dengan nama',
    rcptDisclaimer1: '* Periksa fisik uang sebelum meninggalkan kasir.',
    rcptDisclaimer2: '* Uang yang sudah ditukar tidak dapat dikembalikan.',
    rcptThanks: 'TERIMA KASIH ATAS KUNJUNGAN ANDA',
    btnPrintBt: 'Cetak BT',
    btnPrintBrowser: 'Cetak USB',
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


    // Tab History & Summary
    histBuyToday: 'Total Beli Hari Ini (Kasir Beli)',
    histSellToday: 'Total Jual Hari Ini (Kasir Jual)',
    histTurnoverToday: 'Perputaran Total Hari Ini',
    histTitle: 'Riwayat Transaksi',
    histFilterDate: 'Filter Tanggal:',
    histFrom: 'Dari:',
    histTo: 'Sampai:',
    histBtnToday: 'Hari Ini',
    histBtnMonth: 'Bulan Ini',
    histBtnAll: 'Semua',
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
    settingStoreCompany: 'Nama PT (badan usaha)',
    settingStoreCompanyHint: 'Dicetak di bawah nama money changer. Kosongkan jika tidak ingin ditampilkan.',
    settingStoreAddr: 'Alamat Outlet / Counter',
    settingStorePhone: 'No. WhatsApp & Telepon',
    settingPaperSize: 'Ukuran Kertas & Tipe Printer',
    paper80Title: '80 mm (Thermal Kasir)',
    paper80Desc: 'Lebar 48 kolom, thermal & auto-cutter',
    paper76Title: '76 mm (Dot Matrix / Pita)',
    paper76Desc: 'Lebar 33 kolom, iWare DM-76H / Epson TM-U220, pita hitam/merah',
    paper58Title: '58 mm (Printer Mini / Mobile)',
    paper58Desc: 'Lebar 32 kolom, compact Bluetooth kecil',
    settingPermit: 'Nomor Izin KUPVA / Bank Indonesia',
    settingShowPermit: 'Tampilkan di Struk (Saat ini disembunyikan)',
    settingTeller: 'Nama Teller Aktif di Kasir',
    settingDisc1: 'Catatan Disclaimer 1 Struk',
    settingDisc2: 'Catatan Disclaimer 2 Struk',
    btnSaveSettings: 'Simpan Pengaturan',

    // Logo & Favicon
    logoTitle: 'Logo Aplikasi & Favicon Browser',
    logoSub: 'Ubah logo sistem kasir, ikon tab browser (favicon), dan logo struk',
    logoTagDefault: 'Logo Default Skyline',
    logoTagCustom: 'Logo Kustom Aktif',
    logoPreviewDark: 'Tampilan Dark Theme',
    logoPreviewLight: 'Tampilan Light Theme',
    logoFaviconTab: 'Ikon Tab Browser (Favicon)',
    btnUploadLogo: 'Upload Logo / Gambar Baru',
    btnResetLogo: 'Gunakan Logo Default Skyline',
    logoFileHelp: 'Mendukung file: PNG, SVG, JPG, WebP, ICO (Otomatis dijadikan logo header, login, dan favicon browser).',
    showRcptLogo: 'Tampilkan logo di struk thermal',

    // Integrasi Google Sheets
    sheetsCardTitle: 'Google Sheets',
    sheetsCardSubtitle: 'Mencatat data transaksi langsung ke tab tanggal pada spreadsheet Anda',
    sheetsTargetDoc: 'Spreadsheet',
    sheetsRuleMapping: 'Tab',
    setSheetsUrl: 'URL Web App Google Apps Script',
    setSheetsAutoSync: 'Otomatis kirim transaksi ke Google Sheets setiap kali transaksi disimpan atau dicetak',
    btnSheetsSave: 'Simpan URL & Pengaturan',
    sheetsPersistedNote: 'Cukup disimpan sekali; tidak perlu diisi ulang saat login.',
    btnSheetsTest: 'Tes koneksi',
    btnSheetsSyncToday: 'Kirim transaksi hari ini',
    btnSheetsGuide: 'Panduan 1 Menit & Salin Script',
    btnHistSync: 'Sync Sheets',
    btnHistCsv: 'Export CSV',
    modalGuideTitle: 'Panduan Integrasi Google Sheets (1 Menit Siap)',
    btnCopyScript: 'Salin Kode Script (1-Click)',

    // Pengujian & Status Printer
    printerDiagTitle: 'Printer struk',
    printerDiagSub: 'Struk dikirim sebagai perintah ESC/POS. Pakai satu jalur: Print Bridge (USB + driver Windows), Serial / COM, USB langsung, atau Bluetooth.',
    btnSettingsConnect: 'Hubungkan BT',
    btnSettingsDisconnect: 'Putuskan BT',
    btnSettingsConnectUsb: 'Hubungkan USB',
    btnSettingsDisconnectUsb: 'Putuskan USB',
    btnSettingsConnectSerial: 'Hubungkan Serial / COM',
    btnSettingsDisconnectSerial: 'Putuskan Serial / COM',
    btnSettingsTestBt: 'Tes Cetak BT',
    btnSettingsTestSys: 'Tes Cetak Struk',
    printerDiagNote: 'Tes Cetak Struk memakai jalur yang sedang terhubung. Jika belum ada, yang terbuka dialog cetak Windows (bukan ESC/POS).',
    btDisconnectedText: 'BT: Belum Terhubung',
    btConnectedPrefix: 'BT: Terhubung',
    usbDisconnectedText: 'USB: Belum Terhubung',
    usbConnectedPrefix: 'USB: Terhubung',
    serialDisconnectedText: 'Serial COM: Belum Terhubung',
    serialConnectedPrefix: 'Serial COM: Terhubung',
    connectUsb: 'Hubungkan Printer USB',
    lblBtnPrinterGuide: 'Panduan Printer Paired / Driver'
  },
  en: {
    // Header & Navigation
    appBadge: 'Forex POS',
    online: 'Online',
    offline: 'Offline (Local)',
    syncQueueText: 'offline queued',
    connectBt: 'Connect BT Printer',
    connectUsb: 'Connect USB Printer',
    themeLight: 'Light',
    themeDark: 'Dark',
    badgeRequired: '[Required]',
    badgeRequiredSelect: '[Select]',
    badgeOptional: '[Optional]',
    badgeBoardRate: '[Board Rate]',
    badgeAutoCalc: '[Auto-calculated]',
    tabPos: 'Cashier POS',
    tabRates: 'Exchange Rates',
    tabHistory: 'History & Reports',
    tabSettings: 'Settings',
    subtabSheets: 'Google Sheets',
    subtabStore: 'Store Profile',
    subtabCompliance: 'BI Compliance',
    lblCustPep: 'Customer is a PEP (politically exposed person)',
    badgePepNotice: 'High Risk Customer',
    txtEddMandate: 'BI APU PPT: PEP customers require Enhanced Due Diligence (EDD) and Senior Management / Director approval.',
    lblPepInstitution: 'PEP Institution / Position',
    lblPepSource: 'Source of Funds',
    lblPepPurpose: 'Purpose of Transaction',
    lblPepApproval: 'I confirm that this PEP transaction has been formally approved by Senior Management / Board of Directors in compliance with Bank Indonesia regulations.',
    lblUnderlyingTitle: 'Underlying document required',
    txtUnderlyingDesc: 'The total reached the USD 10,000 limit (PBI Transaksi Valas). Fill in the underlying document before saving.',
    lblUnderlyingType: 'Underlying Document Type',
    lblUnderlyingNo: 'Document Number / Reference',
    dttotAlertTitle: 'DTTOT / DPPSPM ALERT: TRANSACTION FROZEN',
    dttotAlertDesc: 'Customer name matched official Terrorist / Extremist Watchlist (DTTOT). Under Bank Indonesia regulations (PBI APU PPT), this transaction MUST BE FROZEN WITHOUT DELAY.',

    // POS Cashier Form
    legendTitle: 'Field Legend:',
    legendMandatory: 'Thick Border = Required',
    legendOptional: 'Thin Border = Optional',
    legendAuto: 'System Automated',
    btnBeli: 'We buy',
    btnJual: 'We sell',
    expBeli: 'We buy foreign currency from customer. Customer receives Rupiah (IDR).',
    expJual: 'We sell foreign currency to customer. Customer pays Rupiah (IDR).',
    custTitle: 'Customer',
    custNameLabel: 'Name *',
    custNamePlaceholder: 'Full name',
    custPhoneLabel: 'Phone / WhatsApp',
    custIdLabel: 'ID / passport no.',
    custIdPlaceholder: 'ID number',
    custNpwpLabel: 'Tax ID (NPWP)',
    custNpwpPlaceholder: 'Tax ID (NPWP)',
    custNationalityLabel: 'Nationality',
    custNationalityPlaceholder: 'Indonesia, Australia',
    custJobLabel: 'Occupation',
    custExtraLabel: 'Additional details (tax ID, nationality, occupation, address)',
    custJobPlaceholder: 'Occupation',
    custGenderLabel: 'Gender',
    optGenderNone: '- Select Gender -',
    optGenderMale: 'Male',
    optGenderFemale: 'Female',
    custAddressLabel: 'Home address',
    custAddressPlaceholder: 'Home or hotel address',
    rcptNationalityLabel: 'Nationality',
    rcptNpwpLabel: 'Tax ID (NPWP)',
    rcptJobLabel: 'Occupation',
    rcptGenderLabel: 'Gender',
    rcptAddressLabel: 'Address',
    addValasTitle: 'Currency',
    addValasSub: 'Select currency & enter amount',
    currLabel: 'Currency',
    amountLabel: 'Amount *',
    amountPlaceholder: '100',
    rateLabel: 'Rate',
    btnAdd: 'Add',
    quickPick: 'Quick select:',
    customCurrencyTitle: 'Other currency',
    saveCustomRateLabel: 'Save to Rates Board',
    customCodeLabel: 'Code (VND, AED, CHF) *',
    customNameLabel: 'Currency name *',
    customOptionLabel: '+ Custom Currency (+ Valas Kustom)',

    // Cart 4 Columns Table
    cartTitle: 'Items',
    cartItemsCount: 'Items',
    cartItemsEmpty: 'No currency added yet.<br>Select a currency and click Add Item.',
    colValas: 'Currency',
    colAmount: 'Amount',
    colRate: 'Rate',
    colSubtotal: 'Subtotal',
    colAction: 'Remove',

    // Financial Totals
    totalIdr: 'Total',
    paymentIdr: 'Cash received',
    changeIdr: 'Change',
    exactCash: 'Exact cash',
    btnSubmitTx: 'Process & print receipt',
    btnSubmitShort: 'Process',
    btnReset: 'Clear',
    explainBeli: 'Customer hands over foreign currency, you pay Rupiah.',
    explainJual: 'Customer pays Rupiah, you hand over foreign currency.',

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
    rcptColValas: 'CURR',
    rcptColQty: 'QTY',
    rcptColRate: 'RATE',
    rcptColSub: 'SUB TOTAL',
    rcptItemsEmpty: 'No items',
    rcptTotal: 'TOTAL IDR',
    rcptPayment: 'PAYMENT',
    rcptChange: 'CHANGE',
    payoutLabel: 'Pay out to customer',
    payoutHint: 'Hand the customer Rupiah equal to the total.',
    rcptSignTeller: 'Teller',
    rcptSignCustomer: 'Customer',
    rcptSignNamePrompt: 'Name under signature',
    rcptSignPlaceholder: 'Same as name',
    rcptDisclaimer1: '* Please check your banknotes before leaving the counter.',
    rcptDisclaimer2: '* Exchanged currency cannot be returned or refunded.',
    rcptThanks: 'THANK YOU FOR YOUR VISIT',
    btnPrintBt: 'Print BT',
    btnPrintBrowser: 'Print USB',
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


    // Tab History & Summary
    histBuyToday: 'Today Buy Volume (Cashier Buy)',
    histSellToday: 'Today Sell Volume (Cashier Sell)',
    histTurnoverToday: 'Total Daily Turnover',
    histTitle: 'Transaction History',
    histFilterDate: 'Filter Date:',
    histFrom: 'From:',
    histTo: 'To:',
    histBtnToday: 'Today',
    histBtnMonth: 'This Month',
    histBtnAll: 'All',
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
    settingStoreCompany: 'Company (PT) name',
    settingStoreCompanyHint: 'Printed under the money changer name. Leave empty to hide it.',
    settingStoreAddr: 'Outlet / Counter Address',
    settingStorePhone: 'WhatsApp & Phone Number',
    settingPaperSize: 'Paper Size & Printer Type',
    paper80Title: '80 mm (Thermal POS)',
    paper80Desc: '48 columns wide, thermal & auto-cutter',
    paper76Title: '76 mm (Dot Matrix / Impact)',
    paper76Desc: '33 columns wide, iWare DM-76H / Epson TM-U220, black/red ribbon',
    paper58Title: '58 mm (Mini / Mobile Printer)',
    paper58Desc: '32 columns wide, compact Bluetooth',
    settingPermit: 'License Number (KUPVA / Bank Indonesia)',
    settingShowPermit: 'Show on Receipt (Currently hidden)',
    settingTeller: 'Active Teller Name',
    settingDisc1: 'Receipt Disclaimer 1',
    settingDisc2: 'Receipt Disclaimer 2',
    btnSaveSettings: 'Save Settings',

    // Logo & Favicon
    logoTitle: 'App Logo & Browser Favicon',
    logoSub: 'Change cashier POS logo, browser tab icon (favicon), and receipt logo',
    logoTagDefault: 'Skyline Default Logo',
    logoTagCustom: 'Custom Logo Active',
    logoPreviewDark: 'Dark Theme Preview',
    logoPreviewLight: 'Light Theme Preview',
    logoFaviconTab: 'Browser Tab Icon (Favicon)',
    btnUploadLogo: 'Upload New Logo / Image',
    btnResetLogo: 'Reset to Skyline Default Logo',
    logoFileHelp: 'Supports: PNG, SVG, JPG, WebP, ICO (Auto-applied to header, login, and browser favicon).',
    showRcptLogo: 'Show logo on thermal receipt',

    // Google Sheets Integration
    sheetsCardTitle: 'Google Sheets',
    sheetsCardSubtitle: 'Automatically logs transactions into date-based tabs in your spreadsheet',
    sheetsTargetDoc: 'Spreadsheet',
    sheetsRuleMapping: 'Tabs',
    setSheetsUrl: 'Google Apps Script Web App URL',
    setSheetsAutoSync: 'Auto-sync transaction to Google Sheets whenever transaction is saved or printed',
    btnSheetsSave: 'Save URL & Settings',
    sheetsPersistedNote: 'Save once; no need to re-enter it at login.',
    btnSheetsTest: 'Test connection',
    btnSheetsSyncToday: "Send today's transactions",
    btnSheetsGuide: '1-Minute Guide & Copy Script',
    btnHistSync: 'Sync Sheets',
    btnHistCsv: 'Export CSV',
    modalGuideTitle: 'Google Sheets Integration Guide (Ready in 1 Min)',
    btnCopyScript: 'Copy Script Code (1-Click)',

    // Printer Diagnostic & Testing
    printerDiagTitle: 'Receipt printer',
    printerDiagSub: 'Receipts are sent as ESC/POS commands. Use one route: Print Bridge (USB + Windows driver), Serial / COM, direct USB or Bluetooth.',
    btnSettingsConnect: 'Connect BT',
    btnSettingsDisconnect: 'Disconnect BT',
    btnSettingsConnectUsb: 'Connect USB',
    btnSettingsDisconnectUsb: 'Disconnect USB',
    btnSettingsConnectSerial: 'Connect Serial / COM',
    btnSettingsDisconnectSerial: 'Disconnect Serial / COM',
    btnSettingsTestBt: 'Test Print BT',
    btnSettingsTestSys: 'Test Receipt Print',
    printerDiagNote: 'Test Receipt Print uses the route that is connected. With none connected it opens the Windows print dialog (not ESC/POS).',
    btDisconnectedText: 'BT: Not Connected',
    btConnectedPrefix: 'BT: Connected',
    usbDisconnectedText: 'USB: Not Connected',
    usbConnectedPrefix: 'USB: Connected',
    serialDisconnectedText: 'Serial COM: Not Connected',
    serialConnectedPrefix: 'Serial COM: Connected',
    connectUsb: 'Connect USB Printer',
    lblBtnPrinterGuide: 'Paired Printer & Driver Guide'
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
  settings: {
    store_name: 'Skyline Exchange',
    store_company: 'PT. Skyline Indonesia',
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

function formatCustomerGender(gender, lang = 'id') {
  if (!gender) return '';
  const g = String(gender).trim().toUpperCase();
  const isEn = lang === 'en';
  if (g.includes('LAKI') || g === 'MALE' || g === 'L' || g === 'PRIA') {
    return isEn ? 'MALE' : 'LAKI-LAKI';
  }
  if (g.includes('PEREMPUAN') || g === 'FEMALE' || g === 'P' || g === 'WANITA') {
    return isEn ? 'FEMALE' : 'PEREMPUAN';
  }
  return g;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Active Teller Helper: Resolves the logged-in user's display name or username with fallback
function getActiveTellerName() {
  if (state.user) {
    if (state.user.displayName && typeof state.user.displayName === 'string' && state.user.displayName.trim()) {
      return state.user.displayName.trim();
    }
    if (state.user.display_name && typeof state.user.display_name === 'string' && state.user.display_name.trim()) {
      return state.user.display_name.trim();
    }
    if (state.user.username) {
      return state.user.username;
    }
  }
  return state.settings.default_teller || 'TELLER 01';
}

function updateActiveCashierBanner() {
  const bannerName = document.getElementById('pos-active-cashier-name');
  const bannerRole = document.getElementById('pos-active-cashier-role');
  if (!bannerName) return;

  const activeTeller = getActiveTellerName();
  if (state.user) {
    const usernameTag = state.user.username ? ` (@${state.user.username})` : '';
    bannerName.textContent = `${activeTeller}${usernameTag}`;
    if (bannerRole) {
      bannerRole.textContent = state.user.role || 'TELLER';
      bannerRole.className = state.user.role === 'ADMIN'
        ? 'px-2 py-0.5 rounded text-[10px] bg-brand/20 text-brand font-bold border border-brand/30'
        : 'px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30';
    }
  } else {
    bannerName.textContent = activeTeller;
    if (bannerRole) {
      bannerRole.textContent = 'GUEST';
      bannerRole.className = 'px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-bold border border-slate-600';
    }
  }
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

// Initialize Printer Instances
const printer = new window.BluetoothPrinter();
const usbPrinter = typeof window.UsbPrinter !== 'undefined' ? new window.UsbPrinter() : null;
const serialPrinter = typeof window.SerialPrinter !== 'undefined' ? new window.SerialPrinter() : null;
const bridgePrinter = typeof window.BridgePrinter !== 'undefined' ? new window.BridgePrinter() : null;

// ==================== NUMERIC INPUT FORMATTING (id-ID) ====================
// Money inputs are type="text" so they can show thousand separators while typing:
// "." groups thousands, "," is the decimal mark. A typed "." in a decimal field is
// taken as the decimal mark, since grouping dots are inserted automatically.
function parseNumInput(raw) {
  let str = String(raw == null ? '' : raw).replace(/[^\d.,-]/g, '');
  if (!str) return NaN;
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes('.')) {
    const groups = str.split('.');
    const looksGrouped = groups[0] !== '' && groups[0] !== '0' && groups.slice(1).every(g => g.length === 3);
    str = looksGrouped ? groups.join('') : groups[0] + '.' + groups.slice(1).join('');
  }
  return parseFloat(str);
}

function getNumInput(el) {
  return parseNumInput(el ? el.value : '');
}

function formatNumForInput(num, allowDecimal) {
  if (num === '' || num == null || isNaN(num)) return '';
  return Number(num).toLocaleString('id-ID', { maximumFractionDigits: allowDecimal ? 6 : 0 });
}

function setNumInput(el, num) {
  if (!el) return;
  el.value = formatNumForInput(num, el.dataset.decimal === 'true');
}

function attachNumFormatter(el) {
  if (!el) return;
  const allowDecimal = el.dataset.decimal === 'true';

  // A typed "." or "," becomes the decimal mark (or is ignored in whole-number fields),
  // so any "." left in the value is always a grouping dot we inserted ourselves.
  el.addEventListener('beforeinput', (e) => {
    if (e.inputType !== 'insertText' || !e.data) return;
    // Multi-character insertions (IME commit, virtual keyboard suggestions) are parsed as a whole
    if (e.data.length > 1 && /[.,]/.test(e.data)) {
      const num = parseNumInput(e.data);
      e.preventDefault();
      if (isNaN(num)) return;
      el.setRangeText(formatNumForInput(num, allowDecimal), el.selectionStart, el.selectionEnd, 'end');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (e.data !== '.' && e.data !== ',') return;
    e.preventDefault();
    if (!allowDecimal || el.value.includes(',')) return;
    el.setRangeText(',', el.selectionStart, el.selectionEnd, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Pasted values may use either convention ("16,250.50" / "16.250,50" / "107.5")
  el.addEventListener('paste', (e) => {
    const text = (e.clipboardData || window.clipboardData)?.getData('text');
    if (!text) return;
    e.preventDefault();
    const num = parseNumInput(text.includes(',') && text.includes('.') && text.lastIndexOf('.') > text.lastIndexOf(',')
      ? text.replace(/,/g, '') : text);
    setNumInput(el, num);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  el.addEventListener('input', (e) => {
    let before = el.value;
    let caret = el.selectionStart ?? before.length;
    // Fallback when beforeinput didn't fire (some IMEs / virtual keyboards):
    // a "." the user just typed is a decimal mark, never a grouping dot.
    if (e.data === '.' && before[caret - 1] === '.') {
      const replacement = allowDecimal && !before.includes(',') ? ',' : '';
      before = before.slice(0, caret - 1) + replacement + before.slice(caret);
      if (!replacement) caret -= 1;
    }
    const significantLeft = before.slice(0, caret).replace(/[^\d,]/g, '').length;

    let cleaned = before.replace(allowDecimal ? /[^\d,]/g : /\D/g, '');
    const firstComma = cleaned.indexOf(',');
    if (firstComma !== -1) {
      cleaned = cleaned.slice(0, firstComma + 1) + cleaned.slice(firstComma + 1).replace(/,/g, '');
    }
    const [intPart, decPart] = cleaned.split(',');
    const grouped = intPart.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const next = decPart !== undefined ? `${grouped || '0'},${decPart}` : grouped;
    if (next === el.value) return;
    el.value = next;

    // Restore the caret after the same number of digits / decimal marks
    let seen = 0, pos = 0;
    while (pos < next.length && seen < significantLeft) {
      if (/[\d,]/.test(next[pos])) seen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
  });
}

// Random [0-9A-Z] token. Uses getRandomValues (not randomUUID), which also works
// on plain-http LAN addresses that are not a secure context.
function randomToken(length) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'info', duration = 3500) {
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
  }, duration);
}

// ==================== INDEXEDDB LOCAL STORAGE ====================
const DB_NAME = 'SkylineExchangeDB';
const DB_VERSION = 2;

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
      if (!db.objectStoreNames.contains('cached_users')) {
        db.createObjectStore('cached_users', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveUsersToIndexedDB(users) {
  if (!Array.isArray(users) || users.length === 0) return;
  try {
    const db = await openLocalDB();
    if (!db.objectStoreNames.contains('cached_users')) return;
    const t = db.transaction('cached_users', 'readwrite');
    const store = t.objectStore('cached_users');
    for (const u of users) {
      store.put(u);
    }
  } catch (e) {
    // Silently continue if private browsing limits IndexedDB
  }
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
    if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-400';
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
      if (Array.isArray(result.renamed) && result.renamed.length) {
        const list = result.renamed.map(r => `${r.from} → ${r.to}`).join(', ');
        showToast(state.appLang === 'en'
          ? `Receipt number already used, renumbered on server: ${list}`
          : `Nomor struk sudah dipakai, diganti di server: ${list}`, 'warning', 15000);
      }
      if (Array.isArray(result.flagged) && result.flagged.length) {
        showToast(state.appLang === 'en'
          ? `DTTOT MATCH on synced offline transaction(s): ${result.flagged.join(', ')}. Report to compliance.`
          : `TERINDIKASI DTTOT pada transaksi offline: ${result.flagged.join(', ')}. Segera laporkan ke kepatuhan.`, 'error', 15000);
      }
      loadHistory();
      loadReportsSummary();
    }
  } catch (err) {
    console.error('Sync failed', err);
    showToast(state.appLang === 'en' ? 'Failed to sync offline data. Will retry.' : 'Gagal menyinkronkan data offline. Mencoba lagi nanti.', 'warning');
  }
}

// ==================== THEME SYSTEM (LIGHT / DARK) ====================
function initTheme() {
  const saved = localStorage.getItem('skyline_pos_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  localStorage.setItem('skyline_pos_theme', theme);
  updateThemeToggleUI();
}

function toggleTheme() {
  const isCurrentlyLight = document.documentElement.classList.contains('light');
  const newTheme = isCurrentlyLight ? 'dark' : 'light';
  applyTheme(newTheme);
  const isEn = state.appLang === 'en';
  showToast(
    newTheme === 'light'
      ? (isEn ? 'Light Theme activated' : 'Mode Terang (Light Theme) diaktifkan')
      : (isEn ? 'Dark Theme activated' : 'Mode Gelap (Dark Theme) diaktifkan'),
    'info'
  );
}

function updateThemeToggleUI() {
  const isLight = document.documentElement.classList.contains('light');
  const icon = document.getElementById('theme-toggle-icon');
  const text = document.getElementById('theme-toggle-text');
  const t = i18n[state.appLang] || i18n.id;
  if (icon) {
    icon.innerHTML = isLight
      ? '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  if (text) text.textContent = isLight ? (t.themeLight || 'Terang') : (t.themeDark || 'Gelap');
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
  safeSet('i18n-tab-history', t.tabHistory);
  safeSet('i18n-tab-settings', t.tabSettings);
  safeSet('lbl-subtab-sheets', t.subtabSheets);
  safeSet('lbl-subtab-compliance', t.subtabCompliance);
  safeSet('lbl-cust-pep', t.lblCustPep);
  safeSet('badge-pep-notice', t.badgePepNotice);
  safeSet('txt-edd-mandate', t.txtEddMandate);
  safeSet('lbl-pep-institution', t.lblPepInstitution);
  safeSet('lbl-pep-source', t.lblPepSource);
  safeSet('lbl-pep-purpose', t.lblPepPurpose);
  safeSet('lbl-pep-approval', t.lblPepApproval);
  safeSet('lbl-underlying-title', t.lblUnderlyingTitle);
  safeSet('txt-underlying-desc', t.txtUnderlyingDesc);
  updateUnderlyingStatus();
  safeSet('lbl-underlying-type', t.lblUnderlyingType);
  safeSet('lbl-underlying-no', t.lblUnderlyingNo);
  safeSet('dttot-alert-title', t.dttotAlertTitle);
  safeSet('dttot-alert-desc', t.dttotAlertDesc);
  safeSet('lbl-subtab-store', t.subtabStore);

  // POS Cashier Form
  safeSet('lbl-pos-active-cashier', lang === 'en' ? 'Active Cashier:' : 'Kasir Bertugas:');
  safeSet('lbl-legend-title', t.legendTitle);
  safeSet('lbl-legend-mandatory', t.legendMandatory);
  safeSet('lbl-legend-optional', t.legendOptional);
  safeSet('lbl-legend-auto', t.legendAuto);
  safeSet('lbl-type-beli', t.btnBeli);
  safeSet('lbl-type-jual', t.btnJual);

  safeSet('lbl-cust-title', t.custTitle);
  safeSet('lbl-cust-name', t.custNameLabel);
  safeSet('badge-req-cust-name', t.badgeRequired);
  safePlaceholder('cust-name', t.custNamePlaceholder);
  safeSet('lbl-cust-phone', t.custPhoneLabel);
  safeSet('badge-opt-cust-phone', t.badgeOptional);
  safeSet('lbl-cust-id', t.custIdLabel);
  safeSet('badge-opt-cust-id', t.badgeOptional);
  safePlaceholder('cust-id', t.custIdPlaceholder);

  safeSet('lbl-cust-npwp', t.custNpwpLabel);
  safeSet('badge-opt-cust-npwp', t.badgeOptional);
  safePlaceholder('cust-npwp', t.custNpwpPlaceholder);

  safeSet('lbl-cust-nationality', t.custNationalityLabel);
  safeSet('badge-opt-cust-nationality', t.badgeOptional);
  safePlaceholder('cust-nationality', t.custNationalityPlaceholder);

  safeSet('lbl-cust-extra', t.custExtraLabel);
  safeSet('lbl-cust-job', t.custJobLabel);
  safeSet('badge-opt-cust-job', t.badgeOptional);
  safePlaceholder('cust-job', t.custJobPlaceholder);

  safeSet('lbl-cust-gender', t.custGenderLabel);
  safeSet('badge-opt-cust-gender', t.badgeOptional);
  safeSet('opt-gender-none', t.optGenderNone);
  safeSet('opt-gender-male', t.optGenderMale);
  safeSet('opt-gender-female', t.optGenderFemale);
  const cgSelect = document.getElementById('cust-gender');
  if (cgSelect) {
    const curVal = cgSelect.value;
    cgSelect.value = curVal;
  }

  safeSet('lbl-cust-address', t.custAddressLabel);
  safeSet('badge-opt-cust-address', t.badgeOptional);
  safePlaceholder('cust-address', t.custAddressPlaceholder);

  safeSet('lbl-add-valas-title', t.addValasTitle);
  safeSet('lbl-add-valas-sub', t.addValasSub);
  safeSet('lbl-curr-select', t.currLabel);
  safeSet('badge-req-curr', t.badgeRequiredSelect);
  safeSet('lbl-amount', t.amountLabel);
  safeSet('badge-req-amount', t.badgeRequired);
  safePlaceholder('item-amount', t.amountPlaceholder);
  safeSet('lbl-rate', t.rateLabel);
  safeSet('badge-rate-board', t.badgeBoardRate);
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
  safeSet('badge-req-payment', t.badgeOptional);
  safeSet('lbl-exact-cash', t.exactCash);
  safeSet('lbl-change-idr', t.changeIdr);
  safeSet('badge-auto-change', t.badgeAutoCalc);
  safeSet('lbl-btn-submit-tx', t.btnSubmitTx);
  safeSet('lbl-btn-reset', t.btnReset);
  safeSet('lbl-btn-submit-mobile', t.btnSubmitShort);

  updateThemeToggleUI();

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


  // Tab History
  safeSet('lbl-hist-buy-card', t.histBuyToday);
  safeSet('lbl-hist-sell-card', t.histSellToday);
  safeSet('lbl-hist-turnover-card', t.histTurnoverToday);
  safeSet('lbl-hist-title', t.histFilterDate || t.histTitle);
  safeSet('lbl-hist-from', t.histFrom);
  safeSet('lbl-hist-to', t.histTo);
  safeSet('lbl-btn-today', t.histBtnToday);
  safeSet('lbl-btn-month', t.histBtnMonth);
  safeSet('lbl-btn-all-dates', t.histBtnAll);
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

  // Logo & Favicon
  safeSet('lbl-logo-title', t.logoTitle);
  safeSet('lbl-logo-sub', t.logoSub);
  safeSet('lbl-logo-preview-dark', t.logoPreviewDark);
  safeSet('lbl-logo-preview-light', t.logoPreviewLight);
  safeSet('lbl-logo-favicon-tab', t.logoFaviconTab);
  safeSet('lbl-btn-upload-logo', t.btnUploadLogo);
  safeSet('lbl-btn-reset-logo', t.btnResetLogo);
  safeSet('lbl-logo-file-help', t.logoFileHelp);
  safeSet('lbl-show-rcpt-logo', t.showRcptLogo);
  safeSet('lbl-set-store-name', t.settingStoreName);
  safeSet('lbl-set-store-company', t.settingStoreCompany);
  safeSet('hint-set-store-company', t.settingStoreCompanyHint);
  safeSet('lbl-set-store-addr', t.settingStoreAddr);
  safeSet('lbl-set-store-phone', t.settingStorePhone);
  safeSet('lbl-set-paper-size', t.settingPaperSize);
  safeSet('lbl-paper-80-title', t.paper80Title);
  safeSet('lbl-paper-80-desc', t.paper80Desc);
  safeSet('lbl-paper-76-title', t.paper76Title);
  safeSet('lbl-paper-76-desc', t.paper76Desc);
  safeSet('lbl-paper-58-title', t.paper58Title);
  safeSet('lbl-paper-58-desc', t.paper58Desc);
  safeSet('lbl-set-permit', t.settingPermit);
  safeSet('lbl-set-show-permit', t.settingShowPermit);
  safeSet('lbl-set-teller', t.settingTeller);
  safeSet('lbl-set-disc1', t.settingDisc1);
  safeSet('lbl-set-disc2', t.settingDisc2);
  safeSet('lbl-btn-save-settings', t.btnSaveSettings);

  // Printer Diagnostic & Testing
  safeSet('lbl-printer-diag-title', t.printerDiagTitle);
  safeSet('lbl-printer-diag-sub', t.printerDiagSub);
  safeSet('lbl-btn-settings-connect', printer.isConnected ? t.btnSettingsDisconnect : t.btnSettingsConnect);
  safeSet('lbl-btn-settings-usb-connect', (usbPrinter && usbPrinter.isConnected) ? t.btnSettingsDisconnectUsb : t.btnSettingsConnectUsb);
  safeSet('lbl-btn-settings-serial-connect', (serialPrinter && serialPrinter.isConnected) ? t.btnSettingsDisconnectSerial : t.btnSettingsConnectSerial);
  safeSet('lbl-btn-printer-guide', t.lblBtnPrinterGuide);
  safeSet('lbl-btn-settings-test-bt', t.btnSettingsTestBt);
  safeSet('lbl-btn-settings-test-sys', t.btnSettingsTestSys);
  safeSet('lbl-printer-diag-note', t.printerDiagNote);
  safeSet('lbl-btn-print-browser', t.btnPrintBrowser);
  const settingsStatusText = document.getElementById('settings-bt-status-text');
  if (settingsStatusText && !printer.isConnected) {
    settingsStatusText.textContent = t.btDisconnectedText;
  }
  const settingsUsbStatusText = document.getElementById('settings-usb-status-text');
  if (settingsUsbStatusText && (!usbPrinter || !usbPrinter.isConnected)) {
    settingsUsbStatusText.textContent = t.usbDisconnectedText;
  }
  const settingsSerialStatusText = document.getElementById('settings-serial-status-text');
  if (settingsSerialStatusText && (!serialPrinter || !serialPrinter.isConnected)) {
    settingsSerialStatusText.textContent = t.serialDisconnectedText;
  }
  refreshUsbNavbar();
  renderBridgeStatus();
  const btPrinterName = document.getElementById('bt-printer-name');
  if (btPrinterName && !printer.isConnected) {
    btPrinterName.textContent = t.connectBt;
  }

  // Google Sheets Card & Guide Modal
  safeSet('lbl-sheets-card-title', t.sheetsCardTitle);
  safeSet('lbl-sheets-card-subtitle', t.sheetsCardSubtitle);
  safeSet('lbl-sheets-target-doc', t.sheetsTargetDoc);
  safeSet('lbl-sheets-rule-mapping', t.sheetsRuleMapping);
  safeSet('lbl-set-sheets-url', t.setSheetsUrl);
  safeSet('lbl-set-sheets-auto-sync', t.setSheetsAutoSync);
  safeSet('lbl-btn-sheets-save', t.btnSheetsSave);
  safeSet('lbl-sheets-persisted-note', t.sheetsPersistedNote);
  safeSet('lbl-btn-sheets-test', t.btnSheetsTest);
  safeSet('lbl-btn-sheets-sync-today', t.btnSheetsSyncToday);
  safeSet('lbl-btn-sheets-guide', t.btnSheetsGuide);
  renderSheetsStatus();
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
  applyPaperSize(state.settings.paper_size || '76');

  // Transaction Types Explanation
  setTransactionType(state.txType);

  // Synchronize receipt language to match app language
  setReceiptLanguage(lang, false);

  // Re-render components with language text
  renderRatesSelect();
  renderCart();
  renderRatesTable();
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
  safeSet('lbl-rcpt-nationality', t.rcptNationalityLabel);
  safeSet('lbl-rcpt-npwp', t.rcptNpwpLabel);
  safeSet('lbl-rcpt-job', t.rcptJobLabel);
  safeSet('lbl-rcpt-gender', t.rcptGenderLabel);
  safeSet('lbl-rcpt-address', t.rcptAddressLabel);
  safeSet('lbl-rcpt-pep', lang === 'en' ? 'PEP Status' : 'Status PEP');
  safeSet('lbl-rcpt-underlying', lang === 'en' ? 'Underlying Doc' : 'Dokumen Underlying');

  // 4 Columns Header
  safeSet('lbl-col-curr', t.rcptColValas);
  safeSet('lbl-col-qty', t.rcptColQty);
  safeSet('lbl-col-rate', t.rcptColRate);
  safeSet('lbl-col-sub', t.rcptColSub);

  // Financial Summary
  safeSet('lbl-rcpt-total', t.rcptTotal);
  safeSet('lbl-rcpt-payment', t.rcptPayment);
  safeSet('lbl-rcpt-change', t.rcptChange);
  safeSet('lbl-payout-idr', t.payoutLabel);
  safeSet('lbl-payout-hint', t.payoutHint);

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

  if (state.currentReceipt) {
    renderReceiptData(state.currentReceipt);
  } else {
    updateLiveReceiptMetadata();
  }
  renderCart();

  if (showToastNotification) {
    showToast(lang === 'en' ? 'Receipt language set to English' : 'Bahasa struk disetel ke Bahasa Indonesia', 'info');
  }
}

// ==================== SETTINGS & RATES LOADING ====================
async function loadSettings() {
  const cachedUrl = localStorage.getItem('skyline_pos_sheets_url') || '';
  const cachedAutoSync = localStorage.getItem('skyline_pos_sheets_auto_sync');
  const cachedLogo = localStorage.getItem('skyline_pos_custom_logo') || '';
  const cachedShowRcptLogo = localStorage.getItem('skyline_pos_show_rcpt_logo');
  const cachedRcptLogoSize = localStorage.getItem('skyline_pos_rcpt_logo_size');

  try {
    const res = await authFetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data) {
      state.settings = { ...state.settings, ...data.data };

      // Restore custom logo from cache if server does not have it, or sync cache with server
      if (!state.settings.store_logo && cachedLogo) {
        state.settings.store_logo = cachedLogo;
      } else if (state.settings.store_logo) {
        localStorage.setItem('skyline_pos_custom_logo', state.settings.store_logo);
      }
      if (state.settings.store_show_rcpt_logo === undefined && cachedShowRcptLogo !== null) {
        state.settings.store_show_rcpt_logo = cachedShowRcptLogo;
      } else if (state.settings.store_show_rcpt_logo !== undefined) {
        localStorage.setItem('skyline_pos_show_rcpt_logo', state.settings.store_show_rcpt_logo);
      }
      if (state.settings.store_rcpt_logo_size === undefined && cachedRcptLogoSize !== null) {
        state.settings.store_rcpt_logo_size = cachedRcptLogoSize;
      } else if (state.settings.store_rcpt_logo_size !== undefined) {
        localStorage.setItem('skyline_pos_rcpt_logo_size', state.settings.store_rcpt_logo_size);
      }

      // Fallback: If server has no sheets URL, but localStorage has cached it, restore it
      if ((!state.settings.google_sheets_url || state.settings.google_sheets_url.trim() === '') && cachedUrl) {
        state.settings.google_sheets_url = cachedUrl;
        if (cachedAutoSync !== null) {
          state.settings.google_sheets_auto_sync = cachedAutoSync;
        }
        // Silently push to server so server DB and backup file have it
        authFetch('/api/sheets/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: cachedUrl,
            auto_sync: state.settings.google_sheets_auto_sync
          })
        }).catch(() => {});
      } else if (state.settings.google_sheets_url && state.settings.google_sheets_url.trim() !== '') {
        // Cache server value to localStorage
        localStorage.setItem('skyline_pos_sheets_url', state.settings.google_sheets_url.trim());
        localStorage.setItem('skyline_pos_sheets_auto_sync', state.settings.google_sheets_auto_sync || '1');
      }

      applySettingsToUI();
    }
  } catch {
    if (cachedUrl && (!state.settings.google_sheets_url || state.settings.google_sheets_url.trim() === '')) {
      state.settings.google_sheets_url = cachedUrl;
    }
    if (cachedLogo && !state.settings.store_logo) {
      state.settings.store_logo = cachedLogo;
    }
    if (cachedShowRcptLogo !== null && state.settings.store_show_rcpt_logo === undefined) {
      state.settings.store_show_rcpt_logo = cachedShowRcptLogo;
    }
    if (cachedRcptLogoSize !== null && state.settings.store_rcpt_logo_size === undefined) {
      state.settings.store_rcpt_logo_size = cachedRcptLogoSize;
    }
    applySettingsToUI();
  }
}

function applySettingsToUI() {
  const s = state.settings;
  const storeNameEl = document.getElementById('rcpt-store-name');
  if (storeNameEl) storeNameEl.textContent = s.store_name || 'SKYLINE EXCHANGE';
  const storeCompanyEl = document.getElementById('rcpt-store-company');
  if (storeCompanyEl) {
    storeCompanyEl.textContent = s.store_company || '';
    storeCompanyEl.classList.toggle('hidden', !s.store_company);
  }
  const storeAddressEl = document.getElementById('rcpt-store-address');
  if (storeAddressEl) storeAddressEl.textContent = s.store_address || 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali';
  const storePhoneEl = document.getElementById('rcpt-store-phone');
  if (storePhoneEl) storePhoneEl.textContent = `WA: ${s.store_phone || '+6285-122-777-970'}`;

  // Logo & Favicon
  applyStoreLogo(s.store_logo, s.store_show_rcpt_logo, s.store_rcpt_logo_size);
  const showRcptLogoEl = document.getElementById('setting-show-rcpt-logo');
  if (showRcptLogoEl) showRcptLogoEl.checked = s.store_show_rcpt_logo !== '0';
  const activeLogoSize = s.store_rcpt_logo_size || 'medium';
  const sizeRadio = document.querySelector(`input[name="setting-rcpt-logo-size"][value="${activeLogoSize}"]`);
  if (sizeRadio) sizeRadio.checked = true;

  const activeTeller = getActiveTellerName();
  const rcptTellerEl = document.getElementById('rcpt-teller');
  if (rcptTellerEl) rcptTellerEl.textContent = activeTeller;
  const rcptSignEl = document.getElementById('rcpt-sign-teller');
  if (rcptSignEl) rcptSignEl.textContent = `( ${activeTeller.toUpperCase()} )`;
  updateActiveCashierBanner();

  const permitEl = document.getElementById('rcpt-store-permit');
  if (s.show_permit === '1' && s.store_permit) {
    permitEl.textContent = `${state.receiptLang === 'en' ? 'License' : 'Izin KUPVA'}: ${s.store_permit}`;
    permitEl.classList.remove('hidden');
  } else {
    permitEl.classList.add('hidden');
  }

  const sName = document.getElementById('setting-store-name');
  if (sName) sName.value = s.store_name || '';
  const sCompany = document.getElementById('setting-store-company');
  if (sCompany) sCompany.value = s.store_company || '';
  const sAddr = document.getElementById('setting-store-address');
  if (sAddr) sAddr.value = s.store_address || '';
  const sPhone = document.getElementById('setting-store-phone');
  if (sPhone) sPhone.value = s.store_phone || '';
  const sPermit = document.getElementById('setting-store-permit');
  if (sPermit) sPermit.value = s.store_permit || '';
  const sShowPermit = document.getElementById('setting-show-permit');
  if (sShowPermit) sShowPermit.checked = s.show_permit === '1';
  const sTeller = document.getElementById('setting-default-teller');
  if (sTeller) sTeller.value = activeTeller;
  const sDisc1 = document.getElementById('setting-disclaimer-1');
  if (sDisc1) sDisc1.value = s.disclaimer_1 || '';
  const sDisc2 = document.getElementById('setting-disclaimer-2');
  if (sDisc2) sDisc2.value = s.disclaimer_2 || '';

  const sheetsUrlInput = document.getElementById('setting-sheets-url');
  if (sheetsUrlInput) sheetsUrlInput.value = s.google_sheets_url || '';
  const sheetsAutoSyncCheck = document.getElementById('setting-sheets-auto-sync');
  if (sheetsAutoSyncCheck) sheetsAutoSyncCheck.checked = s.google_sheets_auto_sync !== '0';
  renderSheetsStatus();

  const paperSize = s.paper_size || '76';
  const r80 = document.getElementById('setting-paper-80');
  const r76 = document.getElementById('setting-paper-76');
  const r58 = document.getElementById('setting-paper-58');
  if (r80 || r76 || r58) {
    if (paperSize === '58') {
      if (r58) r58.checked = true;
    } else if (paperSize === '76') {
      if (r76) r76.checked = true;
    } else {
      if (r80) r80.checked = true;
    }
  }
  applyPaperSize(paperSize);
}

function applyStoreLogo(logoUrl, showOnReceipt, logoSize) {
  const isEn = state.appLang === 'en';
  const defaultLogo = '/assets/logo.svg';
  const defaultFavicon = '/assets/favicon.svg';
  const activeLogo = (logoUrl && String(logoUrl).trim() !== '') ? String(logoUrl).trim() : defaultLogo;
  const isCustom = activeLogo !== defaultLogo;
  const activeSize = logoSize || state.settings.store_rcpt_logo_size || 'medium';

  // Body modifier for @media print CSS
  document.body.classList.remove('rcpt-logo-size-small', 'rcpt-logo-size-medium', 'rcpt-logo-size-large');
  document.body.classList.add(`rcpt-logo-size-${activeSize}`);

  // Header Logo
  const headerLogo = document.getElementById('app-header-logo');
  if (headerLogo) headerLogo.src = activeLogo;

  // Login Logo
  const loginLogo = document.getElementById('app-login-logo');
  if (loginLogo) loginLogo.src = activeLogo;

  // Settings Previews
  const previewDark = document.getElementById('setting-logo-preview-dark');
  if (previewDark) previewDark.src = activeLogo;
  const previewLight = document.getElementById('setting-logo-preview-light');
  if (previewLight) previewLight.src = activeLogo;
  const previewFavicon = document.getElementById('setting-favicon-preview');
  if (previewFavicon) previewFavicon.src = isCustom ? activeLogo : defaultFavicon;

  // Browser Favicon & Apple Touch Icon
  const favEl = document.getElementById('app-favicon');
  if (favEl) {
    favEl.href = isCustom ? activeLogo : defaultFavicon;
  }
  const appleEl = document.getElementById('app-apple-icon');
  if (appleEl) {
    appleEl.href = isCustom ? activeLogo : '/assets/apple-touch-icon.png';
  }

  // Receipt Logo Preview & Sizing
  const rcptLogoImg = document.getElementById('rcpt-logo-img');
  if (rcptLogoImg) {
    rcptLogoImg.src = activeLogo;
    rcptLogoImg.classList.remove('max-h-8', 'max-h-10', 'max-h-12', 'max-h-16', 'max-w-[100px]', 'max-w-[120px]', 'max-w-[140px]', 'max-w-[180px]');
    if (activeSize === 'small') {
      rcptLogoImg.classList.add('max-h-8', 'max-w-[100px]');
    } else if (activeSize === 'large') {
      rcptLogoImg.classList.add('max-h-16', 'max-w-[180px]');
    } else {
      rcptLogoImg.classList.add('max-h-12', 'max-w-[140px]');
    }
  }

  const isShowRcpt = showOnReceipt === undefined 
    ? (state.settings.store_show_rcpt_logo !== '0')
    : (showOnReceipt === '1' || showOnReceipt === true || showOnReceipt === 1);

  const rcptLogoWrap = document.getElementById('rcpt-logo-wrapper');
  if (rcptLogoWrap) {
    if (isShowRcpt) {
      rcptLogoWrap.classList.remove('hidden');
      rcptLogoWrap.classList.add('flex');
    } else {
      rcptLogoWrap.classList.add('hidden');
      rcptLogoWrap.classList.remove('flex');
    }
  }

  // Mini Receipt Mockup in Settings
  const miniWrap = document.getElementById('setting-mini-rcpt-wrap');
  if (miniWrap) {
    if (isShowRcpt) {
      miniWrap.classList.remove('hidden');
      miniWrap.classList.add('flex');
    } else {
      miniWrap.classList.add('hidden');
      miniWrap.classList.remove('flex');
    }
  }

  const miniLogo = document.getElementById('setting-mini-rcpt-logo');
  if (miniLogo) {
    miniLogo.src = activeLogo;
    miniLogo.classList.remove('max-h-7', 'max-h-10', 'max-h-14', 'max-w-[80px]', 'max-w-[120px]', 'max-w-[150px]');
    if (activeSize === 'small') {
      miniLogo.classList.add('max-h-7', 'max-w-[80px]');
    } else if (activeSize === 'large') {
      miniLogo.classList.add('max-h-14', 'max-w-[150px]');
    } else {
      miniLogo.classList.add('max-h-10', 'max-w-[120px]');
    }
  }

  // Status Badge in Settings
  const rcptStatus = document.getElementById('setting-rcpt-logo-status');
  if (rcptStatus) {
    if (isShowRcpt) {
      rcptStatus.textContent = isEn ? 'Printed on Thermal Receipt (Active)' : 'Tampil di Kertas Struk (Aktif)';
      rcptStatus.className = 'set-status set-status--ok';
    } else {
      rcptStatus.textContent = isEn ? 'Hidden from Receipt' : 'Disembunyikan dari Struk';
      rcptStatus.className = 'set-status';
    }
  }

  // Radio button sync
  const radio = document.querySelector(`input[name="setting-rcpt-logo-size"][value="${activeSize}"]`);
  if (radio) radio.checked = true;

  // Status Tag in Settings
  const statusTag = document.getElementById('logo-status-tag');
  if (statusTag) {
    if (isCustom) {
      statusTag.textContent = isEn ? 'Custom Logo Active' : 'Logo Kustom Aktif';
      statusTag.className = 'set-status set-status--ok';
    } else {
      statusTag.textContent = isEn ? 'Skyline Default' : 'Logo Default Skyline';
      statusTag.className = 'set-status';
    }
  }
}

function applyPaperSize(size) {
  const is80 = size === '80';
  const is76 = size === '76';
  const is58 = size === '58';
  state.settings.paper_size = size;

  document.body.classList.toggle('paper-80mm', is80);
  document.body.classList.toggle('paper-76mm', is76);
  document.body.classList.toggle('paper-58mm', is58);

  const receiptEl = document.getElementById('printable-receipt');
  if (receiptEl) {
    receiptEl.classList.remove('max-w-[380px]', 'max-w-[330px]', 'max-w-[280px]', 'text-[12px]', 'text-[11.5px]', 'text-[11px]');
    if (is80) {
      receiptEl.classList.add('max-w-[380px]', 'text-[12px]');
    } else if (is76) {
      receiptEl.classList.add('max-w-[330px]', 'text-[11.5px]');
    } else {
      receiptEl.classList.add('max-w-[280px]', 'text-[11px]');
    }
  }

  const isEn = state.appLang === 'en';
  const titleEl = document.getElementById('lbl-receipt-preview-title');
  if (titleEl) {
    titleEl.textContent = isEn ? 'Receipt preview' : 'Pratinjau struk';
  }
  const badgeEl = document.getElementById('receipt-col-badge');
  if (badgeEl) {
    badgeEl.textContent = is80 ? '80mm (48 col)' : (is76 ? '76mm Dot Matrix (33 col)' : '58mm (32 col)');
  }
  const settingsTitle = document.getElementById('lbl-settings-title');
  if (settingsTitle) {
    const sizeLabel = is80 ? '80mm' : (is76 ? '76mm Dot Matrix' : '58mm');
    settingsTitle.textContent = isEn ? `Store & ${sizeLabel} Receipt Settings` : `Pengaturan Toko & Struk ${sizeLabel}`;
  }

  const dashLine = is80 ? '-'.repeat(48) : (is76 ? '-'.repeat(40) : '-'.repeat(32));
  const doubleLine = is80 ? '='.repeat(48) : (is76 ? '='.repeat(40) : '='.repeat(32));
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
    const denom = r.denomination && r.denomination !== 'All' && !r.name.includes(r.denomination) ? ` (${r.denomination})` : '';
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

  // Keep the cashier's choice; "Custom" is only kept if they picked it on purpose
  // (before rates load it is the sole option, so it gets auto-selected).
  const keepCurrent = state.rates.some(r => r.code === currentVal)
    || (currentVal === '__CUSTOM__' && state.customPickedByUser);
  if (keepCurrent) {
    select.value = currentVal;
  } else if (state.rates.length > 0) {
    const usd = state.rates.find(r => r.code === 'USD');
    select.value = usd ? usd.code : state.rates[0].code;
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
  renderCurrencyTiles();
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
    setNumInput(rateInput, activeRate);
  }
}

function renderRatesTable() {
  const tbody = document.getElementById('rates-table-body');
  if (!tbody) return;

  const isEn = state.appLang === 'en';
  tbody.innerHTML = '';
  state.rates.forEach((r) => {
    const spread = (r.sell_rate - r.buy_rate);
    const tag = r.code.trim().split(' ')[0].slice(0, 3).toUpperCase();
    const isSmall = !!splitRateCode(r.code)[1] || (r.denomination && r.denomination.toLowerCase().includes('small'));
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-navy-700/40 transition-colors';
    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
        <span class="w-7 h-7 rounded bg-navy-700 border border-navy-600 flex items-center justify-center text-xs font-mono text-brand">${tag}</span>
        <div>
          <div class="flex items-center gap-1.5">
            <span>${r.code}</span>
            ${isSmall ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans font-semibold border border-amber-500/30">${isEn ? 'Small' : 'Pecahan Kecil'}</span>` : ''}
          </div>
          <div class="text-[11px] font-sans text-slate-400 font-normal">${r.name}</div>
        </div>
      </td>
      <td class="py-3 px-3 text-slate-300 font-mono text-xs">${r.denomination || 'All'}</td>
      <td class="py-3 px-4 text-right text-emerald-400 font-bold">${state.bulkBuyEdit
        ? `<input type="text" inputmode="decimal" data-decimal="true" data-id="${r.id}" aria-label="${isEn ? 'Buy rate' : 'Kurs beli'} ${escapeHtml(r.code)}" class="rate-bulk-input w-32 text-right font-mono font-bold text-[15px] bg-navy-900 border border-navy-600 rounded-lg px-2.5 py-2 text-emerald-300 focus:outline-none focus:border-brand">`
        : `Rp ${r.buy_rate.toLocaleString('id-ID')}`}</td>
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

  // Bulk buy-rate mode: header buttons + one input per row
  const bulk = !!state.bulkBuyEdit;
  document.getElementById('rates-bulk-actions')?.classList.toggle('hidden', !bulk);
  document.getElementById('btn-bulk-buy-edit')?.classList.toggle('hidden', bulk);
  document.getElementById('btn-modal-add-rate')?.classList.toggle('hidden', bulk);
  const setText = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
  setText('#btn-bulk-buy-cancel', isEn ? 'Cancel' : 'Batal');
  setText('#btn-bulk-buy-save', isEn ? 'Save all buy rates' : 'Simpan semua kurs beli');
  setText('#btn-bulk-buy-edit span', isEn ? 'Edit all buy rates' : 'Edit kurs beli sekaligus');
  setText('#btn-open-tv-display span', isEn ? 'TV display' : 'Tampilan TV');
  if (!bulk) return;
  const inputs = [...tbody.querySelectorAll('.rate-bulk-input')];
  inputs.forEach((inp, i) => {
    const rate = state.rates.find(r => String(r.id) === inp.dataset.id);
    attachNumFormatter(inp);
    setNumInput(inp, rate.buy_rate);
    inp.addEventListener('input', () => inp.classList.toggle('is-changed', getNumInput(inp) !== rate.buy_rate));
    inp.addEventListener('focus', () => inp.select());
    // Enter jumps to the next currency so the whole board can be typed in one pass
    inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (inputs[i + 1]) inputs[i + 1].focus(); else saveBulkBuyRates();
    });
  });
  inputs[0]?.focus();
}

function setBulkBuyMode(on) {
  state.bulkBuyEdit = on;
  renderRatesTable();
}

async function saveBulkBuyRates() {
  const isEn = state.appLang === 'en';
  const changes = [];
  for (const inp of document.querySelectorAll('#rates-table-body .rate-bulk-input')) {
    const rate = state.rates.find(r => String(r.id) === inp.dataset.id);
    const val = getNumInput(inp);
    if (!(val > 0)) {
      inp.focus();
      return showToast(isEn ? `Buy rate for ${rate.code} must be more than 0` : `Kurs beli ${rate.code} harus lebih dari 0`, 'error');
    }
    if (val !== rate.buy_rate) changes.push({ id: rate.id, buy_rate: val });
  }
  if (changes.length === 0) {
    showToast(isEn ? 'No buy rate changed' : 'Tidak ada kurs beli yang berubah', 'info');
    return setBulkBuyMode(false);
  }
  const btn = document.getElementById('btn-bulk-buy-save');
  btn.disabled = true;
  try {
    const res = await authFetch('/api/rates/bulk-buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rates: changes })
    });
    const data = await res.json();
    if (!data.success) return showToast(data.message || (isEn ? 'Failed to save buy rates' : 'Gagal menyimpan kurs beli'), 'error');
    showToast(isEn ? `${data.updated} buy rates saved` : `${data.updated} kurs beli disimpan`, 'success');
    state.bulkBuyEdit = false;
    await loadRates();
  } catch {
    showToast(isEn ? 'Failed to connect to server' : 'Gagal menghubungi server', 'error');
  } finally {
    btn.disabled = false;
  }
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
  const t = i18n[state.appLang] || i18n.id;
  const isRcptEn = state.receiptLang === 'en';
  const isBeli = type === 'BELI';

  // The whole workspace (edge, summary panel, tiles) picks up the mode colour from this attribute
  document.getElementById('tab-pos').dataset.mode = type;
  btnBeli.setAttribute('aria-pressed', String(isBeli));
  btnJual.setAttribute('aria-pressed', String(!isBeli));
  expText.textContent = isBeli ? t.explainBeli : t.explainJual;
  const modeLabel = isBeli ? t.btnBeli : t.btnJual;
  ['summary-mode-label', 'mobile-mode-label'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = modeLabel;
  });
  rcptType.textContent = isBeli
    ? (isRcptEn ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)')
    : (isRcptEn ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)');
  rcptType.className = 'font-bold text-black';

  updateItemRateInput();
  state.cart.forEach(item => {
    if (!item.is_custom) {
      const rateObj = state.rates.find(r => r.code === item.currency_code);
      if (rateObj) {
        item.rate = state.txType === 'BELI' ? rateObj.buy_rate : rateObj.sell_rate;
        item.subtotal_idr = Math.round(item.amount * item.rate);
      }
    }
  });
  renderCurrencyTiles();
  renderCart();
}

// ==================== CURRENCY TILES ====================
// Popular currencies as large tiles showing the rate for the active mode.
const QUICK_CURRENCIES = ['USD', 'USD 20, 10, 5', 'USD 2, 1', 'AUD', 'EUR', 'GBP', 'JPY', 'SGD', 'MYR', 'HKD', 'CNY', 'THB', 'PHP', 'INR', 'NTD'];

// Split a rate code into currency + note size: USD 20, 10, 5 -> USD 20/10/5, MYRs -> MYR Small.
// Older codes with a space ("USD 20, 10, 5", "MYR s") still work.
function splitRateCode(code) {
  const c = String(code || '').trim();
  let m = /^([A-Z]{3})s$/.exec(c);
  if (m) return [m[1], 'Small'];
  m = /^([A-Z]{3})\s+(.+)$/.exec(c);
  if (m) return [m[1], m[2] === 's' ? 'Small' : m[2].replace(/,\s*/g, '/')];
  return [c, null];
}

function renderCurrencyTiles() {
  const wrap = document.getElementById('currency-tiles');
  if (!wrap) return;
  const selected = document.getElementById('item-currency')?.value;
  const isEn = state.appLang === 'en';

  const tiles = QUICK_CURRENCIES
    .map(code => state.rates.find(r => r.code === code))
    .filter(Boolean)
    .map(r => {
      const rate = state.txType === 'BELI' ? r.buy_rate : r.sell_rate;
      const [curr, denom] = splitRateCode(r.code);
      return `<button type="button" class="cur-tile" data-code="${escapeHtml(r.code)}" aria-pressed="${r.code === selected}">
        <span class="cur-tile__code">${escapeHtml(curr)}</span>
        ${denom ? `<span class="cur-tile__denom">${escapeHtml(denom)}</span>` : ''}
        <span class="cur-tile__rate num">${formatNumForInput(rate, true)}</span>
      </button>`;
    });
  tiles.push(`<button type="button" id="chip-custom-curr" class="cur-tile cur-tile--other" aria-pressed="${selected === '__CUSTOM__'}">${isEn ? '+ Custom' : '+ Kustom'}</button>`);
  wrap.innerHTML = tiles.join('');
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

  const amount = getNumInput(amountInput);
  const rate = getNumInput(rateInput);

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


function calculateUsdEquivalent(totalIdr) {
  if (!totalIdr || totalIdr <= 0) return 0;
  let usdRate = 16000;
  if (Array.isArray(state.rates) && state.rates.length > 0) {
    const usdObj = state.rates.find(r => r.code === 'USD');
    if (usdObj) {
      usdRate = (state.txType === 'JUAL' ? usdObj.sell_rate : usdObj.buy_rate) || 16000;
    }
  }
  return totalIdr / usdRate;
}

function calculateTotals() {
  const total = state.cart.reduce((sum, item) => sum + item.subtotal_idr, 0);
  const paymentInput = document.getElementById('input-payment');
  let payment = getNumInput(paymentInput);

  if (isNaN(payment)) {
    payment = 0;
  }
  // BELI: the cashier pays the customer exactly the total; there is no change
  if (state.txType === 'BELI') {
    return { total, payment: total, change: 0 };
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

  badge.textContent = `${state.cart.length} ${isAppEn ? (state.cart.length === 1 ? 'item' : 'items') : 'item'}`;

  // 1. Screen Cart Table
  if (state.cart.length === 0) {
    tbody.innerHTML = `
      <tr id="empty-cart-row">
        <td colspan="5" class="py-8 px-4 text-center text-[13px] text-slate-400">
          ${isAppEn ? 'Pick a currency above, enter the amount, then press Add.' : 'Pilih valas di atas, isi jumlah, lalu tekan Tambah.'}
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
        <td class="py-3 px-4 font-semibold text-slate-100">
          ${escapeHtml(item.currency_code)}
          ${item.is_custom ? `<span class="ml-1 text-[12px] font-normal text-slate-400">${isAppEn ? 'custom' : 'kustom'}</span>` : ''}
        </td>
        <td class="py-3 px-3 text-right text-slate-200">${item.amount.toLocaleString(isAppEn ? 'en-US' : 'id-ID')}</td>
        <td class="py-3 px-3 text-right text-slate-400">${item.rate.toLocaleString('id-ID')}</td>
        <td class="py-3 px-3 text-right font-semibold text-slate-100">${item.subtotal_idr.toLocaleString('id-ID')}</td>
        <td class="py-1 px-2 text-center">
          <button type="button" class="btn-remove-item inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" data-idx="${idx}" title="${isAppEn ? 'Remove' : 'Hapus'}" aria-label="${isAppEn ? 'Remove' : 'Hapus'} ${escapeHtml(item.currency_code)}">
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

  // Bank Indonesia USD 10,000 Threshold Check
  const usdEquiv = calculateUsdEquivalent(total);
  const underCard = document.getElementById('card-underlying-warning');
  const usdBadge = document.getElementById('badge-usd-equiv');
  
  if (usdEquiv >= 10000) {
    const justCrossed = !state.isUnderlyingRequired;
    state.isUnderlyingRequired = true;
    if (underCard) underCard.classList.remove('hidden');
    if (usdBadge) usdBadge.textContent = '≈ USD ' + Math.round(usdEquiv).toLocaleString('en-US');
    updateUnderlyingStatus();
    // The notice sits above the item list; bring it into view the moment the limit is crossed
    // next frame: after layout (and scroll anchoring) settle, or the smooth scroll gets cancelled
    if (justCrossed && underCard) requestAnimationFrame(() => underCard.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  } else {
    state.isUnderlyingRequired = false;
    if (underCard) underCard.classList.add('hidden');
  }

  // Update Calculations
  document.getElementById('calc-total-idr').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('mobile-total-idr').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('calc-change-idr').textContent = 'Rp ' + change.toLocaleString('id-ID');

  const isBeli = state.txType === 'BELI';
  document.getElementById('payment-cash-grid').classList.toggle('hidden', isBeli);
  document.getElementById('box-payout-display').classList.toggle('hidden', !isBeli);
  document.getElementById('calc-payout-idr').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('rcpt-payment-row').classList.toggle('hidden', isBeli);
  document.getElementById('rcpt-change-row').classList.toggle('hidden', isBeli);

  const effectivePayment = payment > 0 ? payment : total;
  document.getElementById('rcpt-total').textContent = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('rcpt-payment').textContent = 'Rp ' + effectivePayment.toLocaleString('id-ID');
  document.getElementById('rcpt-change').textContent = 'Rp ' + change.toLocaleString('id-ID');

  updateLiveReceiptMetadata();
}

function updateLiveReceiptMetadata() {
  const custName = document.getElementById('cust-name').value.trim();
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custId = document.getElementById('cust-id').value.trim();
  const custNpwp = document.getElementById('cust-npwp')?.value.trim() || '';
  const custNationality = document.getElementById('cust-nationality')?.value.trim() || '';
  const custJob = document.getElementById('cust-job')?.value.trim() || '';
  const custGender = document.getElementById('cust-gender')?.value.trim() || '';
  const custAddress = document.getElementById('cust-address')?.value.trim() || '';
  const signatureInput = document.getElementById('input-signature-customer');
  const isRcptEn = state.receiptLang === 'en';

  const rcptCust = document.getElementById('rcpt-cust-name');
  const rcptPhone = document.getElementById('rcpt-cust-phone');
  const rcptId = document.getElementById('rcpt-cust-id');
  const rcptSignCustomer = document.getElementById('rcpt-sign-customer');

  const phoneRow = document.getElementById('rcpt-phone-row');
  const idRow = document.getElementById('rcpt-id-row');

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

  const natRow = document.getElementById('rcpt-nationality-row');
  const natVal = document.getElementById('rcpt-cust-nationality');
  if (natRow && natVal) {
    if (custNationality) {
      natVal.textContent = custNationality.toUpperCase();
      natRow.classList.remove('hidden');
    } else {
      natRow.classList.add('hidden');
    }
  }

  const npwpRow = document.getElementById('rcpt-npwp-row');
  const npwpVal = document.getElementById('rcpt-cust-npwp');
  if (npwpRow && npwpVal) {
    if (custNpwp) {
      npwpVal.textContent = custNpwp.toUpperCase();
      npwpRow.classList.remove('hidden');
    } else {
      npwpRow.classList.add('hidden');
    }
  }

  const jobRow = document.getElementById('rcpt-job-row');
  const jobVal = document.getElementById('rcpt-cust-job');
  if (jobRow && jobVal) {
    if (custJob) {
      jobVal.textContent = custJob.toUpperCase();
      jobRow.classList.remove('hidden');
    } else {
      jobRow.classList.add('hidden');
    }
  }

  const genderRow = document.getElementById('rcpt-gender-row');
  const genderVal = document.getElementById('rcpt-cust-gender');
  if (genderRow && genderVal) {
    if (custGender) {
      genderVal.textContent = formatCustomerGender(custGender, state.receiptLang);
      genderRow.classList.remove('hidden');
    } else {
      genderRow.classList.add('hidden');
    }
  }

  const addrRow = document.getElementById('rcpt-address-row');
  const addrVal = document.getElementById('rcpt-cust-address');
  if (addrRow && addrVal) {
    if (custAddress) {
      addrVal.textContent = custAddress.toUpperCase();
      addrRow.classList.remove('hidden');
    } else {
      addrRow.classList.add('hidden');
    }
  }

  const isPep = document.getElementById('cust-pep-toggle')?.checked || false;
  const pepRow = document.getElementById('rcpt-pep-row');
  const pepVal = document.getElementById('rcpt-cust-pep');
  if (pepRow && pepVal) {
    if (isPep) {
      pepVal.textContent = isRcptEn ? 'YES (HIGH RISK - EDD)' : 'YA (HIGH RISK - EDD)';
      pepRow.classList.remove('hidden');
    } else {
      pepRow.classList.add('hidden');
    }
  }

  const underRow = document.getElementById('rcpt-underlying-row');
  const underVal = document.getElementById('rcpt-cust-underlying');
  const underType = document.getElementById('underlying-doc-type')?.value;
  const underNo = document.getElementById('underlying-doc-no')?.value;
  if (underRow && underVal) {
    if (state.isUnderlyingRequired) {
      underVal.textContent = `${underType || 'UNDERLYING'}: ${underNo || '-'}`;
      underRow.classList.remove('hidden');
    } else {
      underRow.classList.add('hidden');
    }
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


// ==================== DTTOT REAL-TIME SCREENING ====================
let dttotCheckTimeout = null;
let currentDttotMatch = null;

function checkDttotRealtime(name) {
  clearTimeout(dttotCheckTimeout);
  if (!name || name.trim().length < 3) {
    clearDttotAlert();
    return;
  }
  
  dttotCheckTimeout = setTimeout(async () => {
    const result = await screenDttot(name);
    // Ignore stale responses if the cashier kept typing
    if (document.getElementById('cust-name').value.trim() !== name.trim()) return;
    if (result.status === 'MATCH') {
      showDttotAlert(result.match);
    } else if (result.status === 'CLEAR') {
      clearDttotAlert();
    }
  }, 300);
}

// Returns { status: 'CLEAR' | 'MATCH' | 'UNAVAILABLE', match? }.
// UNAVAILABLE (offline / server error) must never be treated as CLEAR.
async function screenDttot(name) {
  if (!state.isOnline) return { status: 'UNAVAILABLE' };
  try {
    const res = await authFetch('/api/dttot/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { status: 'UNAVAILABLE' };
    return data.match ? { status: 'MATCH', match: data.data } : { status: 'CLEAR' };
  } catch (e) {
    console.warn('DTTOT screening check failed:', e);
    return { status: 'UNAVAILABLE' };
  }
}

function showDttotAlert(matchData) {
  currentDttotMatch = matchData;
  const alertBox = document.getElementById('dttot-alert-box');
  const alertDetail = document.getElementById('dttot-alert-detail');
  const btnSubmit = document.getElementById('btn-submit-tx');
  
  if (alertDetail) {
    alertDetail.textContent = `[MATCH]: ${matchData.name} | Alias: ${matchData.aliases || '-'} | Daftar: ${matchData.list_type} | Info: ${matchData.notes || '-'}`;
  }
  if (alertBox) {
    alertBox.classList.remove('hidden');
  }
  [btnSubmit, document.getElementById('btn-submit-mobile')].forEach(btn => {
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
  });
}

function clearDttotAlert() {
  currentDttotMatch = null;
  const alertBox = document.getElementById('dttot-alert-box');
  const btnSubmit = document.getElementById('btn-submit-tx');
  
  if (alertBox) {
    alertBox.classList.add('hidden');
  }
  [btnSubmit, document.getElementById('btn-submit-mobile')].forEach(btn => {
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
  });
}

// ==================== PROCESS TRANSACTION ====================
// Guards against double-submit: the button stays locked until the save + print attempt finishes.
async function processTransaction() {
  if (state.isSubmitting) return;
  const btnSubmit = document.getElementById('btn-submit-tx');
  const lbl = document.getElementById('lbl-btn-submit-tx');
  const originalLabel = lbl.textContent;
  const btnMobile = document.getElementById('btn-submit-mobile');
  state.isSubmitting = true;
  btnSubmit.disabled = true;
  btnMobile.disabled = true;
  btnSubmit.classList.add('opacity-60', 'cursor-wait');
  lbl.textContent = state.appLang === 'en' ? 'Processing...' : 'Memproses...';
  try {
    await processTransactionInner();
  } finally {
    state.isSubmitting = false;
    lbl.textContent = originalLabel;
    btnSubmit.classList.remove('opacity-60', 'cursor-wait');
    // Keep the buttons locked if a DTTOT match is on screen
    btnSubmit.disabled = !!currentDttotMatch;
    btnMobile.disabled = !!currentDttotMatch;
  }
}

async function processTransactionInner() {
  const custName = document.getElementById('cust-name').value.trim();
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custId = document.getElementById('cust-id').value.trim();
  const custNpwp = document.getElementById('cust-npwp')?.value.trim() || '';
  const custNationality = document.getElementById('cust-nationality')?.value.trim() || '';
  const custJob = document.getElementById('cust-job')?.value.trim() || '';
  const custGender = document.getElementById('cust-gender')?.value.trim() || '';
  const custAddress = document.getElementById('cust-address')?.value.trim() || '';
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

  // Compliance Check 1: DTTOT screening, run fresh at submit (never rely on the debounced live check)
  clearTimeout(dttotCheckTimeout);
  const screening = await screenDttot(custName);
  if (screening.status === 'MATCH') showDttotAlert(screening.match);
  if (currentDttotMatch || screening.status === 'MATCH') {
    showToast(isEn ? 'TRANSACTION FROZEN: Customer name matches DTTOT list (PBI APU PPT)' : 'TRANSAKSI DIBEKUKAN: Nama nasabah terindikasi dalam Daftar DTTOT Bank Indonesia', 'error');
    return;
  }
  // Offline / server unreachable: recorded as PENDING and re-screened by the server on sync
  const dttotStatus = screening.status === 'CLEAR' ? 'CLEARED' : 'PENDING';
  if (dttotStatus === 'PENDING') {
    showToast(isEn ? 'DTTOT screening unavailable (offline). Transaction will be re-screened on sync.' : 'Screening DTTOT tidak tersedia (offline). Transaksi akan di-screening ulang saat sinkronisasi.', 'warning');
  }

  // Compliance Check 2: USD 10,000 Threshold Detection (Underlying)
  const isUnderlying = state.isUnderlyingRequired || false;
  const underlyingType = document.getElementById('underlying-doc-type')?.value || '';
  const underlyingDocNo = document.getElementById('underlying-doc-no')?.value.trim() || '';

  if (isUnderlying) {
    if (!underlyingType) {
      showToast(isEn ? 'Underlying document type is required for transactions >= USD 10,000' : 'Jenis dokumen underlying wajib dipilih untuk transaksi >= USD 10.000', 'error');
      document.getElementById('underlying-doc-type')?.focus();
      return;
    }
    if (!underlyingDocNo) {
      showToast(isEn ? 'Underlying document number / details is required' : 'Nomor / keterangan dokumen underlying wajib diisi', 'error');
      document.getElementById('underlying-doc-no')?.focus();
      return;
    }
  }

  // Compliance Check 3: PEP & Enhanced Due Diligence (EDD)
  const isPep = document.getElementById('cust-pep-toggle')?.checked || false;
  const pepInstitution = document.getElementById('pep-institution')?.value.trim() || '';
  const sourceOfFunds = document.getElementById('pep-source-funds')?.value || '';
  const transactionPurpose = document.getElementById('pep-purpose')?.value || '';
  const isPepApproved = document.getElementById('check-pep-approval')?.checked || false;

  if (isPep) {
    if (!pepInstitution) {
      showToast(isEn ? 'PEP Institution / Position is required for PEP customer' : 'Institusi / Jabatan PEP wajib diisi untuk nasabah PEP', 'error');
      document.getElementById('pep-institution')?.focus();
      return;
    }
    if (!sourceOfFunds) {
      showToast(isEn ? 'Source of funds is required for PEP customer (EDD)' : 'Sumber dana wajib dipilih untuk nasabah PEP (EDD)', 'error');
      document.getElementById('pep-source-funds')?.focus();
      return;
    }
    if (!transactionPurpose) {
      showToast(isEn ? 'Transaction purpose is required for PEP customer (EDD)' : 'Tujuan transaksi wajib dipilih untuk nasabah PEP (EDD)', 'error');
      document.getElementById('pep-purpose')?.focus();
      return;
    }
    if (!isPepApproved) {
      showToast(isEn ? 'Senior management / Director approval confirmation is required for PEP' : 'Konfirmasi persetujuan Direksi / Senior Management wajib dicentang untuk nasabah PEP', 'error');
      document.getElementById('check-pep-approval')?.focus();
      return;
    }
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
  // Offline-format number (SE-YYYYMMDD-Oxxxxxx), unique across devices. When online the
  // server replaces it with the next sequential number (SE-YYYYMMDD-NNNN).
  const tempReceiptNo = `SE-${yyyy}${mm}${dd}-O${randomToken(6)}`;

  const payload = {
    receipt_no: tempReceiptNo,
    client_tx_id: randomToken(24),
    type: state.txType,
    customer_name: custName.toUpperCase(),
    customer_phone: custPhone,
    customer_id_no: custId,
    customer_npwp: custNpwp,
    customer_nationality: custNationality.toUpperCase(),
    customer_job: custJob.toUpperCase(),
    customer_gender: custGender,
    customer_address: custAddress.toUpperCase(),
    is_pep: isPep ? 1 : 0,
    pep_institution: pepInstitution,
    source_of_funds: sourceOfFunds,
    transaction_purpose: transactionPurpose,
    is_underlying: isUnderlying ? 1 : 0,
    underlying_type: underlyingType,
    underlying_doc_no: underlyingDocNo,
    dttot_check_status: dttotStatus,
    customer_signature_name: signatureName.toUpperCase() || custName.toUpperCase(),
    teller_name: getActiveTellerName(),
    total_idr: total,
    paid_amount: payment || total,
    change_amount: change,
    is_delivery: 0,
    items: [...state.cart],
    created_at: now.toISOString(),
    created_at_formatted: now.toLocaleDateString(state.receiptLang === 'en' ? 'en-US' : 'id-ID') + ' ' + now.toLocaleTimeString(state.receiptLang === 'en' ? 'en-US' : 'id-ID')
  };

  state.currentReceipt = payload;
  document.getElementById('rcpt-no').textContent = payload.receipt_no;

  let savedOnline = false;
  if (state.isOnline) {
    try {
      const { receipt_no: _offlineNo, ...onlinePayload } = payload;
      const res = await authFetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onlinePayload)
      });
      if (res.status === 403) {
        const errData = await res.json();
        showToast(errData.error || (isEn ? 'Transaction frozen by DTTOT watchlist' : 'Transaksi dibekukan oleh sistem kepatuhan DTTOT'), 'error');
        return;
      }
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

  // Update on-screen printable receipt
  renderReceiptData(payload);

  // Print the receipt over whichever ESC/POS route is connected, in the chosen receipt language
  try {
    const via = await sendEscPos(await printer.buildEscPos(payload, state.settings, state.receiptLang));
    if (via) showToast(isEn ? `Receipt printed (${via})` : `Struk dicetak (${via})`, 'success');
    else showToast(isEn ? 'Transaction completed. You can print the receipt now.' : 'Transaksi selesai. Anda dapat mencetak struk sekarang.', 'info');
  } catch (err) {
    showToast(`${isEn ? 'Print failed' : 'Gagal mencetak'}: ${err.message}`, 'error');
  }

  loadHistory();
  loadReportsSummary();
}

// Underlying notice: amber until both fields are filled, then green
function updateUnderlyingStatus() {
  const card = document.getElementById('card-underlying-warning');
  const chip = document.getElementById('underlying-status');
  if (!card || !chip) return;
  const isEn = state.appLang === 'en';
  const done = !!document.getElementById('underlying-doc-type')?.value && !!document.getElementById('underlying-doc-no')?.value.trim();
  card.classList.toggle('is-complete', done);
  chip.className = 'set-status shrink-0 ' + (done ? 'set-status--ok' : 'set-status--warn');
  chip.textContent = done ? (isEn ? 'Complete' : 'Lengkap') : (isEn ? 'Incomplete' : 'Belum lengkap');
}

// YYYY-MM-DD of the store day in Bali (WITA); toISOString() would give the UTC day
function storeToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
}

function resetForm() {
  state.cart = [];
  document.getElementById('cust-name').value = '';
  document.getElementById('cust-phone').value = '';
  document.getElementById('cust-id').value = '';
  const npwpInp = document.getElementById('cust-npwp'); if (npwpInp) npwpInp.value = '';
  const natInp = document.getElementById('cust-nationality'); if (natInp) natInp.value = '';
  const jobInp = document.getElementById('cust-job'); if (jobInp) jobInp.value = '';
  const genInp = document.getElementById('cust-gender'); if (genInp) genInp.value = '';
  const addrInp = document.getElementById('cust-address'); if (addrInp) addrInp.value = '';
  const extraDetails = document.getElementById('cust-extra-details'); if (extraDetails) extraDetails.open = false;
  const pepToggle = document.getElementById('cust-pep-toggle'); if (pepToggle) pepToggle.checked = false;
  const pepFields = document.getElementById('pep-edd-fields'); if (pepFields) pepFields.classList.add('hidden');
  const pepInst = document.getElementById('pep-institution'); if (pepInst) pepInst.value = '';
  const pepSrc = document.getElementById('pep-source-funds'); if (pepSrc) pepSrc.value = '';
  const pepPur = document.getElementById('pep-purpose'); if (pepPur) pepPur.value = '';
  const pepApp = document.getElementById('check-pep-approval'); if (pepApp) pepApp.checked = false;
  const underType = document.getElementById('underlying-doc-type'); if (underType) underType.value = '';
  const underNo = document.getElementById('underlying-doc-no'); if (underNo) underNo.value = '';
  state.isUnderlyingRequired = false;
  const underCard = document.getElementById('card-underlying-warning'); if (underCard) underCard.classList.add('hidden');
  updateUnderlyingStatus();
  clearDttotAlert();
  document.getElementById('input-payment').value = '';
  document.getElementById('input-signature-customer').value = '';
  document.getElementById('input-signature-customer').removeAttribute('data-customized');
  renderCart();
  showToast(state.appLang === 'en' ? 'Form cleared' : 'Form dikosongkan', 'info');
}

// ==================== PRINT ACTIONS & RECEIPT RENDERING ====================

function renderReceiptData(tx) {
  if (!tx) return;
  const isEn = state.receiptLang === 'en';
  const locale = isEn ? 'en-US' : 'id-ID';

  const rcptNoEl = document.getElementById('rcpt-no');
  if (rcptNoEl) rcptNoEl.textContent = tx.receipt_no || 'SE-DRAFT';

  const rcptDateEl = document.getElementById('rcpt-datetime');
  if (rcptDateEl) rcptDateEl.textContent = tx.created_at_formatted || (new Date().toLocaleDateString(locale) + ' ' + new Date().toLocaleTimeString(locale));

  const rcptTypeEl = document.getElementById('rcpt-type');
  if (rcptTypeEl) {
    rcptTypeEl.textContent = tx.type === 'BELI' 
      ? (isEn ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)') 
      : (isEn ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)');
  }

  const rcptCustEl = document.getElementById('rcpt-cust-name');
  if (rcptCustEl) rcptCustEl.textContent = (tx.customer_name || 'CUSTOMER').toUpperCase();

  const rcptTellerEl = document.getElementById('rcpt-teller');
  if (rcptTellerEl) rcptTellerEl.textContent = tx.teller_name || 'TELLER 01';

  const rcptSignTellerEl = document.getElementById('rcpt-sign-teller');
  if (rcptSignTellerEl) rcptSignTellerEl.textContent = `( ${(tx.teller_name || 'TELLER 01').toUpperCase()} )`;

  const rcptSignCustEl = document.getElementById('rcpt-sign-customer');
  if (rcptSignCustEl) rcptSignCustEl.textContent = `( ${(tx.customer_signature_name || tx.customer_name || 'CUSTOMER').toUpperCase()} )`;

  const signInput = document.getElementById('input-signature-customer');
  if (signInput) {
    signInput.value = (tx.customer_signature_name || tx.customer_name || '').toUpperCase();
  }

  const phoneRow = document.getElementById('rcpt-phone-row');
  const phoneVal = document.getElementById('rcpt-cust-phone');
  if (phoneRow && phoneVal) {
    if (tx.customer_phone) {
      phoneVal.textContent = tx.customer_phone;
      phoneRow.classList.remove('hidden');
    } else {
      phoneRow.classList.add('hidden');
    }
  }

  const idRow = document.getElementById('rcpt-id-row');
  const idVal = document.getElementById('rcpt-cust-id');
  if (idRow && idVal) {
    if (tx.customer_id_no) {
      idVal.textContent = tx.customer_id_no;
      idRow.classList.remove('hidden');
    } else {
      idRow.classList.add('hidden');
    }
  }

  const natRow = document.getElementById('rcpt-nationality-row');
  const natVal = document.getElementById('rcpt-cust-nationality');
  if (natRow && natVal) {
    if (tx.customer_nationality) {
      natVal.textContent = tx.customer_nationality.toUpperCase();
      natRow.classList.remove('hidden');
    } else {
      natRow.classList.add('hidden');
    }
  }

  const npwpRow = document.getElementById('rcpt-npwp-row');
  const npwpVal = document.getElementById('rcpt-cust-npwp');
  if (npwpRow && npwpVal) {
    if (tx.customer_npwp) {
      npwpVal.textContent = tx.customer_npwp.toUpperCase();
      npwpRow.classList.remove('hidden');
    } else {
      npwpRow.classList.add('hidden');
    }
  }

  const jobRow = document.getElementById('rcpt-job-row');
  const jobVal = document.getElementById('rcpt-cust-job');
  if (jobRow && jobVal) {
    if (tx.customer_job) {
      jobVal.textContent = tx.customer_job.toUpperCase();
      jobRow.classList.remove('hidden');
    } else {
      jobRow.classList.add('hidden');
    }
  }

  const genderRow = document.getElementById('rcpt-gender-row');
  const genderVal = document.getElementById('rcpt-cust-gender');
  if (genderRow && genderVal) {
    if (tx.customer_gender) {
      genderVal.textContent = formatCustomerGender(tx.customer_gender, state.receiptLang);
      genderRow.classList.remove('hidden');
    } else {
      genderRow.classList.add('hidden');
    }
  }

  const addrRow = document.getElementById('rcpt-address-row');
  const addrVal = document.getElementById('rcpt-cust-address');
  if (addrRow && addrVal) {
    if (tx.customer_address) {
      addrVal.textContent = tx.customer_address.toUpperCase();
      addrRow.classList.remove('hidden');
    } else {
      addrRow.classList.add('hidden');
    }
  }

  const pepRow = document.getElementById('rcpt-pep-row');
  const pepVal = document.getElementById('rcpt-cust-pep');
  if (pepRow && pepVal) {
    if (tx.is_pep) {
      pepVal.textContent = isEn ? 'YES (HIGH RISK - EDD)' : 'YA (HIGH RISK - EDD)';
      pepRow.classList.remove('hidden');
    } else {
      pepRow.classList.add('hidden');
    }
  }

  const underRow = document.getElementById('rcpt-underlying-row');
  const underVal = document.getElementById('rcpt-cust-underlying');
  if (underRow && underVal) {
    if (tx.is_underlying) {
      underVal.textContent = `${tx.underlying_type || 'UNDERLYING'}: ${tx.underlying_doc_no || '-'}`;
      underRow.classList.remove('hidden');
    } else {
      underRow.classList.add('hidden');
    }
  }

  const rcptItemsBody = document.getElementById('rcpt-items-body');
  if (rcptItemsBody) {
    rcptItemsBody.innerHTML = '';
    (tx.items || []).forEach(item => {
      const rcptRow = document.createElement('div');
      rcptRow.className = 'grid grid-cols-12 py-0.5 text-black';
      rcptRow.innerHTML = `
        <div class="col-span-3 text-left font-bold">${item.currency_code}</div>
        <div class="col-span-2 text-right">${(item.amount || 0).toLocaleString(isEn ? 'en-US' : 'id-ID')}</div>
        <div class="col-span-3 text-right">${(item.rate || 0).toLocaleString('id-ID')}</div>
        <div class="col-span-4 text-right font-medium">${(item.subtotal_idr || 0).toLocaleString('id-ID')}</div>
      `;
      rcptItemsBody.appendChild(rcptRow);
    });
  }

  const rcptTotalEl = document.getElementById('rcpt-total');
  if (rcptTotalEl) rcptTotalEl.textContent = 'Rp ' + (tx.total_idr || 0).toLocaleString('id-ID');

  const rcptPayEl = document.getElementById('rcpt-payment');
  if (rcptPayEl) rcptPayEl.textContent = 'Rp ' + (tx.paid_amount || tx.total_idr || 0).toLocaleString('id-ID');

  const rcptChgEl = document.getElementById('rcpt-change');
  if (rcptChgEl) rcptChgEl.textContent = 'Rp ' + (tx.change_amount || 0).toLocaleString('id-ID');

  const isBeliTx = tx.type === 'BELI';
  document.getElementById('rcpt-payment-row')?.classList.toggle('hidden', isBeliTx);
  document.getElementById('rcpt-change-row')?.classList.toggle('hidden', isBeliTx);
}

async function handleDirectBtPrint() {
  const currentData = state.currentReceipt || buildCurrentFormReceiptData();
  const isEn = state.appLang === 'en';

  if (!currentData || !currentData.items || currentData.items.length === 0) {
    const askTest = confirm(isEn 
      ? 'No active transaction to print. Would you like to print a test receipt to verify your Bluetooth printer?' 
      : 'Belum ada transaksi aktif. Apakah Anda ingin mencetak struk tes untuk memeriksa printer Bluetooth?');
    if (askTest) {
      await handleTestBtPrint();
    }
    return;
  }

  if (!printer.isConnected) {
    try {
      showToast(isEn ? 'Connecting to Bluetooth printer...' : 'Menghubungkan ke printer Bluetooth...', 'info');
      await printer.connect();
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        showToast(`${isEn ? 'Bluetooth connection failed' : 'Koneksi Bluetooth gagal'}: ${err.message}`, 'error');
      }
      return;
    }
  }

  try {
    const escPosBytes = await printer.buildEscPos(currentData, state.settings, state.receiptLang);
    await printer.print(escPosBytes);
    showToast(isEn ? 'Receipt printed successfully!' : 'Struk berhasil dicetak!', 'success');
  } catch (err) {
    showToast(`Bluetooth print error: ${err.message}`, 'error');
  }
}

async function handleTestBtPrint() {
  const isEn = state.appLang === 'en';
  if (!printer.isSupported()) {
    showToast(isEn 
      ? 'Web Bluetooth is not supported in this browser. Please use Google Chrome or Microsoft Edge on PC or Android.' 
      : 'Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC atau Android.', 'warning');
    return;
  }

  if (!printer.isConnected) {
    try {
      showToast(isEn ? 'Connecting to Bluetooth printer...' : 'Menghubungkan ke printer Bluetooth...', 'info');
      await printer.connect();
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        showToast(`${isEn ? 'Bluetooth connection failed' : 'Koneksi Bluetooth gagal'}: ${err.message}`, 'error');
      }
      return;
    }
  }

  try {
    showToast(isEn ? 'Printing Bluetooth test receipt...' : 'Mencetak struk tes Bluetooth...', 'info');
    const escPosBytes = await printer.buildTestEscPos(state.settings, state.receiptLang);
    await printer.print(escPosBytes);
    showToast(isEn ? 'Bluetooth test receipt printed successfully!' : 'Struk tes Bluetooth berhasil dicetak!', 'success');
  } catch (err) {
    showToast(`Bluetooth print error: ${err.message}`, 'error');
  }
}

async function handleTestBrowserPrint() {
  const isEn = state.receiptLang === 'en';
  const now = new Date();
  const locale = isEn ? 'en-US' : 'id-ID';
  const testTx = {
    receipt_no: 'TEST-PRINTER',
    type: 'BELI',
    customer_name: 'TEST CUSTOMER',
    customer_phone: '+6281234567890',
    customer_id_no: 'ID-TEST-001',
    teller_name: state.settings.default_teller || 'TELLER 01',
    total_idr: 1635000,
    paid_amount: 1635000,
    change_amount: 0,
    is_delivery: 0,
    delivery_address: '',
    items: [
      { currency_code: 'USD', amount: 100, rate: 16350, subtotal_idr: 1635000 }
    ],
    created_at_formatted: now.toLocaleDateString(locale) + ' ' + now.toLocaleTimeString(locale)
  };

  try {
    const via = await sendEscPos(await printer.buildTestEscPos(state.settings, state.receiptLang));
    if (via) {
      showToast(isEn ? `Test receipt printed (${via})` : `Struk tes dicetak (${via})`, 'success');
      return;
    }
  } catch (err) {
    showToast(`${isEn ? 'Print failed' : 'Gagal mencetak'}: ${err.message}`, 'error');
    return;
  }

  const prev = state.currentReceipt;
  renderReceiptData(testTx);

  const tabPos = document.getElementById('tab-pos');
  const wasHidden = tabPos && tabPos.classList.contains('hidden');
  if (wasHidden) tabPos.classList.remove('hidden');

  window.print();

  if (wasHidden) {
    setTimeout(() => {
      tabPos.classList.add('hidden');
      if (prev) renderReceiptData(prev);
    }, 500);
  } else if (prev) {
    setTimeout(() => renderReceiptData(prev), 1000);
  }
}

function buildCurrentFormReceiptData() {
  const custName = document.getElementById('cust-name').value.trim() || 'CUSTOMER';
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custId = document.getElementById('cust-id').value.trim();
  const custNpwp = document.getElementById('cust-npwp')?.value.trim() || '';
  const custNationality = document.getElementById('cust-nationality')?.value.trim() || '';
  const custJob = document.getElementById('cust-job')?.value.trim() || '';
  const custGender = document.getElementById('cust-gender')?.value.trim() || '';
  const custAddress = document.getElementById('cust-address')?.value.trim() || '';
  const signatureName = document.getElementById('input-signature-customer').value.trim();
  const isUnderlying = state.isUnderlyingRequired || false;
  const underlyingType = document.getElementById('underlying-doc-type')?.value || '';
  const underlyingDocNo = document.getElementById('underlying-doc-no')?.value.trim() || '';
  const isPep = document.getElementById('cust-pep-toggle')?.checked || false;
  const pepInstitution = document.getElementById('pep-institution')?.value.trim() || '';
  const sourceOfFunds = document.getElementById('pep-source-funds')?.value || '';
  const transactionPurpose = document.getElementById('pep-purpose')?.value || '';
  const { total, payment, change } = calculateTotals();

  const now = new Date();
  const locale = state.receiptLang === 'en' ? 'en-US' : 'id-ID';
  return {
    receipt_no: document.getElementById('rcpt-no').textContent || 'SE-DRAFT',
    type: state.txType,
    customer_name: custName.toUpperCase(),
    customer_phone: custPhone,
    customer_id_no: custId,
    customer_npwp: custNpwp,
    customer_nationality: custNationality.toUpperCase(),
    customer_job: custJob.toUpperCase(),
    customer_gender: custGender,
    customer_address: custAddress.toUpperCase(),
    is_pep: isPep ? 1 : 0,
    pep_institution: pepInstitution,
    source_of_funds: sourceOfFunds,
    transaction_purpose: transactionPurpose,
    is_underlying: isUnderlying ? 1 : 0,
    underlying_type: underlyingType,
    underlying_doc_no: underlyingDocNo,
    customer_signature_name: signatureName.toUpperCase() || custName.toUpperCase(),
    teller_name: getActiveTellerName(),
    total_idr: total,
    paid_amount: payment || total,
    change_amount: change,
    is_delivery: 0,
    items: [...state.cart],
    created_at_formatted: now.toLocaleDateString(locale) + ' ' + now.toLocaleTimeString(locale)
  };
}

// Sends ESC/POS bytes over the first connected route. Returns the route used, or null when none is ready
// (the caller then falls back to the browser print dialog).
async function sendEscPos(bytes) {
  if (serialPrinter && serialPrinter.isConnected) { await serialPrinter.print(bytes); return 'Serial / COM'; }
  if (usbPrinter && usbPrinter.isConnected) { await usbPrinter.print(bytes); return 'USB'; }
  // Only re-probe a bridge this browser has seen before, so other devices never get Chrome's local-access prompt
  if (bridgePrinter && (bridgePrinter.isConnected || (bridgePrinter.wasSeen && await bridgePrinter.check(1000)))) {
    return await bridgePrinter.print(bytes);
  }
  if (printer.isConnected) { await printer.print(bytes); return 'Bluetooth'; }
  return null;
}

async function handleBrowserPrint() {
  const currentData = state.currentReceipt || buildCurrentFormReceiptData();
  const isEn = state.appLang === 'en';

  if (!currentData || !currentData.items || currentData.items.length === 0) {
    showToast(isEn ? 'Add transaction items first' : 'Tambahkan item transaksi terlebih dahulu', 'warning');
    return;
  }

  // Always refresh on-screen printable receipt DOM before printing
  renderReceiptData(currentData);

  try {
    const via = await sendEscPos(await printer.buildEscPos(currentData, state.settings, state.receiptLang));
    if (via) {
      showToast(isEn ? `Receipt printed (${via})` : `Struk dicetak (${via})`, 'success');
      return;
    }
  } catch (err) {
    showToast(`${isEn ? 'Print failed' : 'Gagal mencetak'}: ${err.message}`, 'error');
    return;
  }

  const tabPos = document.getElementById('tab-pos');
  const wasHidden = tabPos && tabPos.classList.contains('hidden');
  if (wasHidden) tabPos.classList.remove('hidden');

  window.print();

  if (wasHidden) {
    setTimeout(() => tabPos.classList.add('hidden'), 500);
  }
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
  if (s.store_company) text += `${s.store_company}\n`;
  text += `${s.store_address || 'Kuta, Bali'}\n`;
  text += `WA: ${s.store_phone || '+6285-122-777-970'}\n`;
  text += `--------------------------------\n`;
  text += `${isEn ? 'Receipt No' : 'No. Struk'} : ${currentData.receipt_no}\n`;
  text += `${isEn ? 'Date' : 'Tanggal'}   : ${currentData.created_at_formatted}\n`;
  text += `${isEn ? 'Type' : 'Tipe'}      : ${currentData.type === 'BELI' ? (isEn ? 'BUY CURRENCY (BUY)' : 'BELI VALAS (BUY)') : (isEn ? 'SELL CURRENCY (SELL)' : 'JUAL VALAS (SELL)')}\n`;
  text += `${isEn ? 'Customer' : 'Customer'}  : ${currentData.customer_name}\n`;
  if (currentData.customer_phone) text += `${isEn ? 'Phone' : 'No. HP'}      : ${currentData.customer_phone}\n`;
  if (currentData.customer_id_no) text += `${isEn ? 'Passport/ID' : 'No. ID'}    : ${currentData.customer_id_no}\n`;
  if (currentData.customer_nationality) text += `${isEn ? 'Nationality' : 'Kewarganegaraan'}: ${currentData.customer_nationality}\n`;
  if (currentData.customer_npwp) text += `NPWP        : ${currentData.customer_npwp}\n`;
  if (currentData.customer_job) text += `${isEn ? 'Occupation' : 'Pekerjaan'} : ${currentData.customer_job}\n`;
  if (currentData.customer_gender) text += `${isEn ? 'Gender' : 'Jenis Kelamin'}: ${formatCustomerGender(currentData.customer_gender, isEn ? 'en' : 'id')}\n`;
  if (currentData.customer_address) text += `${isEn ? 'Address' : 'Alamat'}    : ${currentData.customer_address}\n`;
  if (currentData.is_pep) {
    text += `${isEn ? 'PEP / EDD' : 'Status PEP'}   : ${isEn ? 'YES (HIGH RISK - APPROVED)' : 'YA (HIGH RISK - DIREKSI ACC)'}\n`;
    if (currentData.pep_institution) text += `${isEn ? 'Institution' : 'Instansi PEP'} : ${currentData.pep_institution}\n`;
  }
  if (currentData.is_underlying) {
    text += `${isEn ? 'Underlying Doc' : 'Dokumen Underlying'}: ${currentData.underlying_type} (${currentData.underlying_doc_no || '-' })\n`;
  }
  text += `--------------------------------\n`;
  text += `*${isEn ? 'EXCHANGE DETAILS:' : 'RINCIAN TRANSAKSI VALAS:'}*\n`;

  currentData.items.forEach(item => {
    text += `• ${item.currency_code} ${item.amount.toLocaleString(isEn ? 'en-US' : 'id-ID')} @ Rp ${item.rate.toLocaleString('id-ID')} = Rp ${item.subtotal_idr.toLocaleString('id-ID')}\n`;
  });

  text += `--------------------------------\n`;
  text += `*TOTAL IDR   : Rp ${currentData.total_idr.toLocaleString('id-ID')}*\n`;
  if (currentData.type !== 'BELI') {
    text += `${isEn ? 'PAYMENT' : 'PEMBAYARAN'}  : Rp ${currentData.paid_amount.toLocaleString('id-ID')}\n`;
    text += `${isEn ? 'CHANGE' : 'KEMBALIAN'}   : Rp ${currentData.change_amount.toLocaleString('id-ID')}\n`;
  }
  text += `--------------------------------\n`;
  text += isEn 
    ? `_Thank you for visiting Skyline Exchange._` 
    : `_Terima kasih telah bertransaksi di Skyline Exchange._`;

  const encoded = encodeURIComponent(text);
  const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(waUrl, '_blank');
}

// ==================== HISTORY & REPORTS ====================
function getHistoryDateFilterState() {
  const startEl = document.getElementById('history-start-date');
  const endEl = document.getElementById('history-end-date');
  const legacyEl = document.getElementById('history-date-filter');

  let s = startEl ? startEl.value : '';
  let e = endEl ? endEl.value : '';

  if (!s && !e && legacyEl && legacyEl.value) {
    s = legacyEl.value;
    e = legacyEl.value;
  }

  const isAll = !s && !e;
  const isRange = Boolean(s && e && s !== e);
  let label = '';
  if (isAll) {
    label = state.appLang === 'en' ? 'All Transactions' : 'Semua Riwayat';
  } else if (isRange) {
    label = `${s} s/d ${e}`;
  } else {
    label = s || e;
  }

  return {
    startDate: s,
    endDate: e,
    isAll,
    isRange,
    label
  };
}

async function loadHistory() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const filter = getHistoryDateFilterState();
  let url = '/api/transactions?limit=1000';
  if (filter.isAll) {
    url += '&all=1';
  } else if (filter.startDate && filter.endDate) {
    url += `&startDate=${encodeURIComponent(filter.startDate)}&endDate=${encodeURIComponent(filter.endDate)}`;
  } else if (filter.startDate || filter.endDate) {
    url += `&date=${encodeURIComponent(filter.startDate || filter.endDate)}`;
  }

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
           (t.customer_phone && t.customer_phone.includes(search)) ||
           (t.customer_id_no && t.customer_id_no.toLowerCase().includes(search)) ||
           (t.customer_npwp && t.customer_npwp.toLowerCase().includes(search)) ||
           (t.customer_nationality && t.customer_nationality.toLowerCase().includes(search)) ||
           (t.customer_job && t.customer_job.toLowerCase().includes(search)) ||
           (t.customer_address && t.customer_address.toLowerCase().includes(search));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-500 font-sans">${isEn ? 'No transactions found.' : 'Tidak ada transaksi ditemukan.'}</td></tr>`;
    return;
  }

  const filter = getHistoryDateFilterState();
  const showDate = filter.isAll || filter.isRange;

  tbody.innerHTML = '';
  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-navy-700/40 transition-colors';

    const d = new Date(t.created_at);
    const dateStr = !isNaN(d.getTime())
      ? (showDate 
          ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          : d.toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' }))
      : t.created_at;

    const isBeli = t.type === 'BELI';
    const typeBadge = isBeli 
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">${isEn ? 'BUY' : 'BELI'}</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">${isEn ? 'SELL' : 'JUAL'}</span>`;

    const itemsSummary = (t.items || []).map(it => `${it.amount.toLocaleString(isEn ? 'en-US' : 'id-ID')} ${it.currency_code}`).join(', ');

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold text-brand">${t.receipt_no}</td>
      <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${dateStr}</td>
      <td class="py-2.5 px-3">${typeBadge}</td>
      <td class="py-2.5 px-3 font-sans font-semibold text-white uppercase">
        ${t.customer_name}
        ${t.is_pep ? '<span class="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">PEP</span>' : ''}
        ${t.is_underlying ? '<span class="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">≥10K</span>' : ''}
      </td>
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
      renderReceiptData(tx);
      switchTab('tab-pos');
      showToast(`${state.appLang === 'en' ? 'Receipt loaded' : 'Struk dimuat'}: ${tx.receipt_no}`, 'info');
    }
  } catch (err) {
    showToast(state.appLang === 'en' ? 'Failed to load receipt details' : 'Gagal memuat detail struk', 'error');
  }
}

async function loadReportsSummary() {
  try {
    const filter = getHistoryDateFilterState();
    let url = '/api/reports/summary';
    if (filter.isAll) {
      url += '?all=1';
    } else if (filter.startDate && filter.endDate) {
      url += `?startDate=${encodeURIComponent(filter.startDate)}&endDate=${encodeURIComponent(filter.endDate)}`;
    } else if (filter.startDate || filter.endDate) {
      url += `?date=${encodeURIComponent(filter.startDate || filter.endDate)}`;
    }

    const res = await authFetch(url);
    const data = await res.json();
    if (data.success && data.data) {
      const { totals, period } = data.data;
      const isEn = state.appLang === 'en';
      let buyTotal = 0, buyCount = 0;
      let sellTotal = 0, sellCount = 0;

      (totals || []).forEach(t => {
        if (t.type === 'BELI') {
          buyTotal = t.sum_idr || 0;
          buyCount = t.count || 0;
        } else if (t.type === 'JUAL') {
          sellTotal = t.sum_idr || 0;
          sellCount = t.count || 0;
        }
      });

      // Update Card Headings according to period
      const todayStr = storeToday();
      const isToday = !filter.isAll && !filter.isRange && (filter.startDate === todayStr || (!filter.startDate && !filter.endDate));
      
      const buyCardLabel = document.getElementById('lbl-hist-buy-card');
      const sellCardLabel = document.getElementById('lbl-hist-sell-card');
      const turnoverCardLabel = document.getElementById('lbl-hist-turnover-card');

      if (filter.isAll) {
        if (buyCardLabel) buyCardLabel.textContent = isEn ? 'Total Buy (All Time)' : 'Total Beli (Semua Riwayat)';
        if (sellCardLabel) sellCardLabel.textContent = isEn ? 'Total Sell (All Time)' : 'Total Jual (Semua Riwayat)';
        if (turnoverCardLabel) turnoverCardLabel.textContent = isEn ? 'Total Turnover (All Time)' : 'Perputaran Total (Semua)';
      } else if (filter.isRange) {
        const pLabel = period?.label || `${filter.startDate} s/d ${filter.endDate}`;
        if (buyCardLabel) buyCardLabel.textContent = isEn ? `Total Buy (${pLabel})` : `Total Beli (${pLabel})`;
        if (sellCardLabel) sellCardLabel.textContent = isEn ? `Total Sell (${pLabel})` : `Total Jual (${pLabel})`;
        if (turnoverCardLabel) turnoverCardLabel.textContent = isEn ? `Turnover (${pLabel})` : `Perputaran Total (${pLabel})`;
      } else if (isToday) {
        if (buyCardLabel) buyCardLabel.textContent = isEn ? 'Today Buy Volume (Cashier Buy)' : 'Total Beli Hari Ini (Kasir Beli)';
        if (sellCardLabel) sellCardLabel.textContent = isEn ? 'Today Sell Volume (Cashier Sell)' : 'Total Jual Hari Ini (Kasir Jual)';
        if (turnoverCardLabel) turnoverCardLabel.textContent = isEn ? 'Total Daily Turnover' : 'Perputaran Total Hari Ini';
      } else {
        const singleDate = filter.startDate || filter.endDate;
        if (buyCardLabel) buyCardLabel.textContent = isEn ? `Total Buy (${singleDate})` : `Total Beli (${singleDate})`;
        if (sellCardLabel) sellCardLabel.textContent = isEn ? `Total Sell (${singleDate})` : `Total Jual (${singleDate})`;
        if (turnoverCardLabel) turnoverCardLabel.textContent = isEn ? `Turnover (${singleDate})` : `Perputaran Total (${singleDate})`;
      }

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

// ==================== DATABASE & BACKUP SYSTEM ====================
async function loadDatabaseInfo() {
  try {
    const res = await authFetch('/api/system/db-info').then(r => r.json());
    if (res && res.success && res.data) {
      const d = res.data;
      const elPath = document.getElementById('db-info-path');
      const elStorage = document.getElementById('db-info-storage');
      const elProtection = document.getElementById('db-info-protection');
      const elTx = document.getElementById('db-stat-tx');
      const elUsers = document.getElementById('db-stat-users');
      const elRates = document.getElementById('db-stat-rates');
      const elSettings = document.getElementById('db-stat-settings');

      if (elPath) elPath.textContent = d.db_path || '-';
      if (elStorage) elStorage.textContent = d.storage_dir || '-';
      if (elProtection) {
        if (d.is_external_storage) {
          elProtection.innerHTML = '<span class="text-emerald-400 font-bold flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Terproteksi di Luar Git (Aman dari Deploy)</span>';
        } else {
          elProtection.innerHTML = '<span class="text-emerald-400 font-bold flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Terproteksi (.gitignore & JSON Mirroring)</span>';
        }
      }

      if (elTx) elTx.textContent = d.counts ? d.counts.transactions : '0';
      if (elUsers) elUsers.textContent = d.counts ? d.counts.users : '0';
      if (elRates) elRates.textContent = d.counts ? d.counts.rates : '0';
      if (elSettings) elSettings.textContent = d.counts ? d.counts.settings : '0';

      const restoreCard = document.getElementById('card-restore-backup');
      if (restoreCard) {
        if (state.user && state.user.role === 'ADMIN') {
          restoreCard.classList.remove('opacity-50', 'pointer-events-none');
        } else {
          restoreCard.classList.add('opacity-50', 'pointer-events-none');
        }
      }
    }
  } catch (err) {
    console.warn('Gagal memuat status database:', err.message);
  }
}

async function downloadDatabaseBackup() {
  const token = state.token || localStorage.getItem('skyline_pos_token');
  if (!token) {
    showToast('Harap login terlebih dahulu.', 'error');
    return;
  }
  showToast('Menyiapkan file cadangan...', 'info');
  try {
    const res = await fetch('/api/system/backup/download', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal mengunduh backup');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = storeToday();
    a.download = `Skyline_POS_FullBackup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showToast('File backup database berhasil diunduh!', 'success');
  } catch (err) {
    showToast('Gagal download backup: ' + err.message, 'error');
  }
}

async function restoreDatabaseFromFile(file) {
  if (!file) return;
  const token = state.token || localStorage.getItem('skyline_pos_token');
  if (!token) {
    showToast('Harap login sebagai Admin untuk memulihkan data.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!confirm(`Apakah Anda yakin ingin memulihkan database dari file backup "${file.name}"?\nData yang ada akan dilengkapi tanpa menghapus riwayat yang sudah ada.`)) {
        return;
      }

      showToast('Memulihkan database...', 'info');
      const res = await fetch('/api/system/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(json)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Restore gagal');

      const info = data.restored || {};
      const statusBox = document.getElementById('restore-status-box');
      if (statusBox) {
        statusBox.classList.remove('hidden');
        statusBox.innerHTML = `
          <div class="text-emerald-400 font-bold mb-1">Berhasil memulihkan database:</div>
          <ul class="list-disc pl-4 space-y-0.5 text-slate-300">
            <li>${info.users || 0} akun kasir baru dipulihkan</li>
            <li>${info.rates || 0} kurs valas diperbarui/dipulihkan</li>
            <li>${info.transactions || 0} transaksi dipulihkan</li>
            <li>${info.settings || 0} pengaturan toko dipulihkan</li>
          </ul>
        `;
      }
      showToast('Database berhasil dipulihkan dari file backup!', 'success');
      loadDatabaseInfo();
      loadRates();
      if (state.user && state.user.role === 'ADMIN') loadUsersList();
    } catch (err) {
      showToast('Gagal memulihkan backup: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function switchSubtab(subtabName) {
  const panelSheets = document.getElementById('subtab-panel-sheets');
  const panelStore = document.getElementById('subtab-panel-store');
  const panelUsers = document.getElementById('subtab-panel-users');
  const panelDatabase = document.getElementById('subtab-panel-database');
  const panelCompliance = document.getElementById('subtab-panel-compliance');
  const btnSheets = document.getElementById('subtab-btn-sheets');
  const btnStore = document.getElementById('subtab-btn-store');
  const btnUsers = document.getElementById('subtab-btn-users');
  const btnDatabase = document.getElementById('subtab-btn-database');
  const btnCompliance = document.getElementById('subtab-btn-compliance');

  if (panelSheets) panelSheets.classList.add('hidden');
  if (panelStore) panelStore.classList.add('hidden');
  if (panelUsers) panelUsers.classList.add('hidden');
  if (panelDatabase) panelDatabase.classList.add('hidden');
  if (panelCompliance) panelCompliance.classList.add('hidden');

  // Active look comes from .set-tab[aria-selected="true"] in index.html
  [btnSheets, btnStore, btnUsers, btnDatabase, btnCompliance].forEach(b => b?.setAttribute('aria-selected', 'false'));

  if (subtabName === 'sheets') {
    if (panelSheets) panelSheets.classList.remove('hidden');
    btnSheets?.setAttribute('aria-selected', 'true');
    renderSheetsStatus();
  } else if (subtabName === 'users') {
    if (panelUsers) panelUsers.classList.remove('hidden');
    btnUsers?.setAttribute('aria-selected', 'true');
    if (state.user && state.user.role === 'ADMIN') {
      loadUsersList();
    }
  } else if (subtabName === 'database') {
    if (panelDatabase) panelDatabase.classList.remove('hidden');
    btnDatabase?.setAttribute('aria-selected', 'true');
    loadDatabaseInfo();
  } else if (subtabName === 'compliance') {
    if (panelCompliance) panelCompliance.classList.remove('hidden');
    btnCompliance?.setAttribute('aria-selected', 'true');
    loadDttotList();
  } else {
    if (panelStore) panelStore.classList.remove('hidden');
    btnStore?.setAttribute('aria-selected', 'true');
  }
}


// ==================== DTTOT COMPLIANCE MANAGEMENT ====================

async function loadDttotList() {
  const tbody = document.getElementById('dttot-table-body');
  const countBadge = document.getElementById('badge-dttot-count');
  if (!tbody) return;

  const q = document.getElementById('dttot-filter-search')?.value.trim() || '';
  const listType = document.getElementById('dttot-filter-type')?.value || 'ALL';

  try {
    const res = await authFetch(`/api/dttot?q=${encodeURIComponent(q)}&list_type=${encodeURIComponent(listType)}&limit=2000`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const entries = data.data || [];
    const filtered = q || listType !== 'ALL';
    if (countBadge) countBadge.textContent = filtered ? `${entries.length} dari ${data.total} data` : `${data.total} data`;

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-slate-400 font-sans !py-6">Tidak ada data DTTOT yang cocok.</td></tr>';
      return;
    }

    const isAdmin = state.user && state.user.role === 'ADMIN';
    const typeClass = { DTTOT: 'set-status--danger', DPPSPM: 'set-status--warn', INTERNAL: '' };

    // All fields come from the official list or admin input: escape before inserting
    tbody.innerHTML = entries.map(row => {
      const notes = (row.notes || '').split('\n');
      const kind = notes[0].startsWith('Terduga: ') ? notes.shift().slice(9) : '';
      const action = !isAdmin
        ? ''
        : row.ref_code
          ? '<span class="text-[13px] text-slate-400" title="Data resmi, diperbarui lewat file DTTOT terbaru">Resmi</span>'
          : `<button type="button" class="btn-delete-dttot set-btn set-btn--danger set-btn--sm" data-id="${row.id}" data-name="${escapeHtml(row.name)}">Hapus</button>`;
      return `
        <tr>
          <td class="min-w-[12rem]">
            <div class="font-semibold text-slate-100">${escapeHtml(row.name)}</div>
            ${row.ref_code ? `<div class="font-mono text-xs text-slate-400">${escapeHtml(row.ref_code)}</div>` : ''}
          </td>
          <td class="text-slate-300 text-[13px] min-w-[12rem] max-w-xs"><div class="line-clamp-3" title="${escapeHtml(row.aliases)}">${escapeHtml(row.aliases) || '-'}</div></td>
          <td class="text-slate-300 text-[13px]">${escapeHtml(row.nationality) || '-'}</td>
          <td>
            <span class="set-status ${typeClass[row.list_type] ?? ''}">${escapeHtml(row.list_type)}</span>
            ${kind ? `<div class="mt-1 text-xs text-slate-400">${escapeHtml(kind)}</div>` : ''}
          </td>
          <td class="text-[13px] text-slate-300 min-w-[16rem] max-w-md"><div class="line-clamp-2" title="${escapeHtml(notes.join('\n'))}">${escapeHtml(notes.join(' · ')) || '-'}</div></td>
          <td class="text-center">${action}</td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-delete-dttot').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        deleteDttotEntry(id, name);
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-rose-400 !py-6">Gagal memuat daftar DTTOT: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function testDttotScreening() {
  const input = document.getElementById('test-dttot-input');
  const resultBox = document.getElementById('test-dttot-result');
  if (!input || !resultBox) return;

  const query = input.value.trim();
  if (!query) {
    showToast('Ketik nama untuk diuji skrining', 'warning');
    return;
  }

  resultBox.className = 'p-3 rounded-lg text-[13px] font-medium bg-navy-950 text-slate-300 border border-navy-700 block';
  resultBox.textContent = 'Memeriksa database DTTOT / DPPSPM...';

  try {
    const res = await authFetch('/api/dttot/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: query })
    });
    const data = await res.json();

    if (data.success && data.match) {
      const match = data.data;
      resultBox.className = 'p-3 rounded-lg text-xs font-medium bg-rose-950/80 border border-rose-500 text-rose-200 block space-y-1';
      resultBox.innerHTML = `
        <div class="font-bold text-rose-300 text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          HASIL: TERINDIKASI MATCH (${match.list_type})
        </div>
        <div>Nama Cocok: <b>${escapeHtml(match.name)}</b> (Alias: ${escapeHtml(match.aliases) || '-'})</div>
        <div class="text-rose-200/90 whitespace-pre-line">Keterangan: ${escapeHtml(match.notes) || '-'}
Kewarganegaraan: ${escapeHtml(match.nationality) || '-'}</div>
        <div class="text-rose-300 font-semibold mt-1">Status Sistem: Transaksi Kasir Wajib Ditolak / Dibekukan Serta-merta.</div>
      `;
    } else {
      resultBox.className = 'p-3 rounded-lg text-xs font-medium bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 block';
      resultBox.innerHTML = `
        <div class="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          HASIL: BERSIH / CLEAR (Tidak Ditemukan Indikasi Terorisme)
        </div>
        <div class="text-[11px] text-emerald-300/80 mt-0.5">Nama "${query}" lolos skrining daftar DTTOT & DPPSPM Bank Indonesia.</div>
      `;
    }
  } catch (err) {
    resultBox.className = 'p-3 rounded-lg text-[13px] font-medium bg-rose-950/60 text-rose-300 border border-rose-700 block';
    resultBox.textContent = 'Error koneksi server saat skrining: ' + err.message;
  }
}

async function saveDttotEntry(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('add-dttot-name').value.trim();
  const aliases = document.getElementById('add-dttot-aliases').value.trim();
  const nationality = document.getElementById('add-dttot-nationality').value.trim();
  const listType = document.getElementById('add-dttot-type').value;
  const notes = document.getElementById('add-dttot-notes').value.trim();

  if (!name) {
    showToast('Nama terduga teroris / entitas wajib diisi', 'error');
    return;
  }

  try {
    const res = await authFetch('/api/dttot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, aliases, nationality, list_type: listType, notes })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Entitas DTTOT berhasil disimpan!', 'success');
      document.getElementById('modal-add-dttot').classList.add('hidden');
      document.getElementById('form-add-dttot').reset();
      loadDttotList();
    } else {
      showToast(data.message || 'Gagal menyimpan data DTTOT', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

async function deleteDttotEntry(id, name) {
  if (!confirm(`Apakah Anda yakin ingin menghapus data kepatuhan "${name}"?`)) return;

  try {
    const res = await authFetch(`/api/dttot/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Data "${name}" berhasil dihapus.`, 'info');
      loadDttotList();
    } else {
      showToast(data.message || 'Gagal menghapus data', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(el => {
    el.className = 'nav-tab px-3 sm:px-4 py-2.5 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-1.5 whitespace-nowrap';
  });

  const targetEl = document.getElementById(tabId);
  if (targetEl) targetEl.classList.remove('hidden');

  const tabBtn = document.querySelector(`.nav-tab[data-target="${tabId}"]`);
  if (tabBtn) {
    tabBtn.className = 'nav-tab active-tab px-3 sm:px-4 py-2.5 font-semibold text-brand border-b-2 border-brand flex items-center gap-1.5 whitespace-nowrap';
  }

  if (tabId === 'tab-rates') loadRates();
  if (tabId === 'tab-history') { loadHistory(); loadReportsSummary(); }
  // "Google Sheets" has its own nav tab, so Pengaturan opens on the store profile
  if (tabId === 'tab-settings') {
    switchSubtab('store');
    if (bridgePrinter && bridgePrinter.wasSeen) bridgePrinter.check();
  }
}

// ==================== BLUETOOTH PRINTER UI ====================
function initBluetoothUI() {
  const btnConnect = document.getElementById('btn-bt-connect');
  const btnDirectPrint = document.getElementById('btn-direct-bt-print');
  const nameLabel = document.getElementById('bt-printer-name');
  const statusDot = document.getElementById('bt-status-dot');

  const btnSettingsConnect = document.getElementById('btn-settings-bt-connect');
  const btnSettingsBtTest = document.getElementById('btn-settings-bt-test');
  const btnSettingsBrowserTest = document.getElementById('btn-settings-browser-test');
  const settingsStatusBadge = document.getElementById('settings-bt-status-badge');
  const settingsStatusText = document.getElementById('settings-bt-status-text');

  printer.onStatusChange = ({ connected, status, text }) => {
    const isEn = state.appLang === 'en';
    if (connected) {
      if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-brand animate-pulse';
      if (nameLabel) nameLabel.textContent = text || (isEn ? 'Printer Connected' : 'Printer Terhubung');
      if (btnConnect) btnConnect.classList.add('border-brand/60', 'text-brand');

      if (settingsStatusBadge) {
        settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/20 text-brand border border-brand/40 flex items-center gap-1.5';
      }
      if (settingsStatusText) {
        const cleanName = (text || '').replace(/^Terhubung:\s*/i, '');
        settingsStatusText.textContent = cleanName ? `BT: ${cleanName}` : (isEn ? 'BT: Connected' : 'BT: Terhubung');
      }
      if (btnSettingsConnect) {
        btnSettingsConnect.innerHTML = `
          <svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>${isEn ? 'Disconnect BT' : 'Putuskan BT'}</span>
        `;
        btnSettingsConnect.classList.add('border-rose-500/40', 'text-rose-400');
        btnSettingsConnect.classList.remove('border-brand/40', 'text-brand');
      }
    } else {
      if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-slate-500';
      if (nameLabel) nameLabel.textContent = i18n[state.appLang].connectBt;
      if (btnConnect) btnConnect.classList.remove('border-brand/60', 'text-brand');

      if (settingsStatusBadge) {
        settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600 flex items-center gap-1.5';
      }
      if (settingsStatusText) {
        settingsStatusText.textContent = isEn ? 'BT: Not Connected' : 'BT: Belum Terhubung';
      }
      if (btnSettingsConnect) {
        btnSettingsConnect.innerHTML = `
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/></svg>
          <span id="lbl-btn-settings-connect">${isEn ? 'Connect BT' : 'Hubungkan BT'}</span>
        `;
        btnSettingsConnect.classList.remove('border-rose-500/40', 'text-rose-400');
        btnSettingsConnect.classList.add('border-brand/40', 'text-brand');
      }
    }
  };

  const handleToggleBt = async () => {
    const isEn = state.appLang === 'en';
    if (!printer.isSupported()) {
      showToast(isEn 
        ? 'Web Bluetooth is not supported in this browser. Please use Google Chrome or Microsoft Edge on PC or Android.' 
        : 'Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC atau Android.', 'warning');
      return;
    }

    if (printer.isConnected) {
      if (confirm(isEn ? 'Disconnect current Bluetooth thermal printer?' : 'Putuskan koneksi dengan printer thermal Bluetooth saat ini?')) {
        await printer.disconnect();
        showToast(isEn ? 'Bluetooth printer disconnected' : 'Printer Bluetooth diputuskan', 'info');
      }
      return;
    }

    try {
      showToast(isEn ? 'Searching for Bluetooth thermal printer...' : 'Mencari printer thermal Bluetooth...', 'info');
      const deviceName = await printer.connect();
      showToast(`${isEn ? 'Connected to' : 'Terhubung ke'} ${deviceName}!`, 'success');
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        showToast(`Bluetooth: ${err.message}`, 'error');
      }
    }
  };

  if (btnConnect) {
    btnConnect.addEventListener('click', handleToggleBt);
  }
  if (btnSettingsConnect) {
    btnSettingsConnect.addEventListener('click', handleToggleBt);
  }
  if (btnSettingsBtTest) {
    btnSettingsBtTest.addEventListener('click', handleTestBtPrint);
  }
  if (btnSettingsBrowserTest) {
    btnSettingsBrowserTest.addEventListener('click', handleTestBrowserPrint);
  }

  if (btnDirectPrint) {
    btnDirectPrint.addEventListener('click', handleDirectBtPrint);
  }
}

// ==================== USB / SERIAL NAVBAR REFRESH ====================
let toggleSerialPrinterGlobal = null;

function refreshUsbNavbar() {
  const isEn = state.appLang === 'en';
  const statusDot = document.getElementById('usb-status-dot');
  const nameLabel = document.getElementById('usb-printer-name');
  const btnConnect = document.getElementById('btn-usb-connect');
  const settingsStatusBadge = document.getElementById('settings-usb-status-badge');
  const settingsStatusText = document.getElementById('settings-usb-status-text');

  if (serialPrinter && serialPrinter.isConnected) {
    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-brand animate-pulse';
    if (nameLabel) nameLabel.textContent = isEn ? 'Serial: Connected' : 'Serial: Terhubung';
    if (btnConnect) {
      btnConnect.classList.add('border-brand/60', 'text-brand');
      btnConnect.classList.remove('border-emerald-500/50', 'text-emerald-300');
    }
    return;
  }

  if (usbPrinter && usbPrinter.isConnected) {
    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-brand animate-pulse';
    const devName = (usbPrinter.device && usbPrinter.device.productName) || (isEn ? 'USB Connected' : 'USB Terhubung');
    if (nameLabel) nameLabel.textContent = devName;
    if (btnConnect) {
      btnConnect.classList.add('border-brand/60', 'text-brand');
      btnConnect.classList.remove('border-emerald-500/50', 'text-emerald-300');
    }
    return;
  }

  if (bridgePrinter && bridgePrinter.isConnected) {
    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
    if (nameLabel) nameLabel.textContent = bridgePrinter.activePrinter() || (isEn ? 'Choose printer' : 'Pilih printer');
    if (btnConnect) {
      btnConnect.classList.add('border-emerald-500/50', 'text-emerald-300');
      btnConnect.classList.remove('border-brand/60', 'text-brand');
    }
    if (settingsStatusBadge) {
      settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600 flex items-center gap-1.5';
    }
    if (settingsStatusText) settingsStatusText.textContent = isEn ? 'USB: Not Connected' : 'USB: Belum Terhubung';
    return;
  }

  if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-slate-500';
  if (nameLabel) nameLabel.textContent = (i18n[state.appLang] && i18n[state.appLang].connectUsb) || (isEn ? 'Connect USB Printer' : 'Hubungkan Printer USB');
  if (btnConnect) {
    btnConnect.classList.remove('border-brand/60', 'text-brand', 'border-emerald-500/50', 'text-emerald-300');
  }
  if (settingsStatusBadge) {
    settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600 flex items-center gap-1.5';
  }
  if (settingsStatusText) {
    settingsStatusText.textContent = isEn ? 'USB: Not Connected' : 'USB: Belum Terhubung';
  }
}

function openUsbHelperModal(deviceTitle) {
  const modal = document.getElementById('modal-usb-helper');
  if (!modal) return;
  const nameEl = document.getElementById('usb-helper-devicename');
  if (nameEl && deviceTitle) nameEl.textContent = deviceTitle;
  modal.classList.remove('hidden');
}

function initUsbHelperModal() {
  const modal = document.getElementById('modal-usb-helper');
  if (!modal) return;
  const btnClose = document.getElementById('btn-close-usb-helper');
  const btnDone = document.getElementById('btn-helper-done');
  const btnSerial = document.getElementById('btn-helper-connect-serial');
  const btnGuide = document.getElementById('btn-helper-open-guide');

  const closeModal = () => modal.classList.add('hidden');

  if (btnClose) btnClose.addEventListener('click', closeModal);

  if (btnDone) btnDone.addEventListener('click', closeModal);

  if (btnSerial) {
    btnSerial.addEventListener('click', async () => {
      closeModal();
      if (toggleSerialPrinterGlobal) {
        await toggleSerialPrinterGlobal();
      }
    });
  }

  if (btnGuide) {
    btnGuide.addEventListener('click', () => {
      closeModal();
      const guideModal = document.getElementById('modal-printer-guide');
      if (guideModal) guideModal.classList.remove('hidden');
    });
  }
}

// ==================== USB PRINTER UI ====================
function initUsbUI() {
  if (!usbPrinter) return;

  const btnConnect = document.getElementById('btn-usb-connect');
  const btnSettingsConnect = document.getElementById('btn-settings-usb-connect');

  usbPrinter.onStatusChange = ({ connected, status, text }) => {
    const isEn = state.appLang === 'en';
    const settingsStatusBadge = document.getElementById('settings-usb-status-badge');
    const settingsStatusText = document.getElementById('settings-usb-status-text');

    if (connected) {
      if (settingsStatusBadge) {
        settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/20 text-brand border border-brand/40 flex items-center gap-1.5';
      }
      if (settingsStatusText) {
        const cleanName = (text || '').replace(/^Terhubung:\s*/i, '');
        settingsStatusText.textContent = cleanName ? `USB: ${cleanName}` : (isEn ? 'USB: Connected' : 'USB: Terhubung');
      }
      if (btnSettingsConnect) {
        btnSettingsConnect.innerHTML = `
          <svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>${isEn ? 'Disconnect USB' : 'Putuskan USB'}</span>
        `;
        btnSettingsConnect.classList.add('border-rose-500/40', 'text-rose-400');
        btnSettingsConnect.classList.remove('border-brand/40', 'text-brand');
      }
    } else {
      if (btnSettingsConnect) {
        btnSettingsConnect.innerHTML = `
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="7" rx="1"/><rect x="5" y="9" width="14" height="11" rx="2"/><line x1="9" y1="5" x2="9" y2="7"/><line x1="15" y1="5" x2="15" y2="7"/></svg>
          <span id="lbl-btn-settings-usb-connect">${isEn ? 'Connect USB' : 'Hubungkan USB'}</span>
        `;
        btnSettingsConnect.classList.remove('border-rose-500/40', 'text-rose-400');
        btnSettingsConnect.classList.add('border-brand/40', 'text-brand');
      }
    }
    refreshUsbNavbar();
  };

  const handleToggleUsb = async () => {
    const isEn = state.appLang === 'en';
    if (!usbPrinter.isSupported()) {
      showToast(isEn 
        ? 'WebUSB is not supported in this browser. Please use Google Chrome or Microsoft Edge on PC or Android.' 
        : 'WebUSB tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC atau Android.', 'warning');
      return;
    }

    if (usbPrinter.isConnected) {
      if (confirm(isEn ? 'Disconnect current USB printer?' : 'Putuskan koneksi dengan printer USB saat ini?')) {
        await usbPrinter.disconnect();
        showToast(isEn ? 'USB printer disconnected' : 'Printer USB diputuskan', 'info');
      }
      return;
    }

    try {
      showToast(isEn ? 'Selecting USB printer...' : 'Memilih printer USB...', 'info');
      const deviceName = await usbPrinter.connect();
      showToast(`${isEn ? 'Connected to' : 'Terhubung ke'} ${deviceName}!`, 'success');
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        if (err.isDriverLocked || (err.message && /Windows Driver|Access denied|claim/i.test(err.message))) {
          openUsbHelperModal(err.deviceTitle || 'Iware DM-76H / USB Printer');
        } else {
          showToast(`USB: ${err.message}`, 'warning');
        }
      }
    }
  };

  if (btnConnect) {
    // A running Print Bridge is the USB path for printers with a Windows driver: open its settings
    btnConnect.addEventListener('click', async () => {
      if (!usbPrinter.isConnected && bridgePrinter && bridgePrinter.isConnected) {
        openPrinterSettings();
        return;
      }
      await handleToggleUsb();
    });
  }
  if (btnSettingsConnect) {
    btnSettingsConnect.addEventListener('click', handleToggleUsb);
  }

  // Initial navbar state
  refreshUsbNavbar();
}

// ==================== SERIAL / COM PRINTER UI ====================
function initSerialUI() {
  if (!serialPrinter) return;

  const btnSettingsConnect = document.getElementById('btn-settings-serial-connect');
  const settingsStatusBadge = document.getElementById('settings-serial-status-badge');
  const settingsStatusText = document.getElementById('settings-serial-status-text');

  serialPrinter.onStatusChange = ({ connected, status, text }) => {
    const isEn = state.appLang === 'en';
    if (connected) {
      if (settingsStatusBadge) {
        settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/20 text-brand border border-brand/40 flex items-center gap-1.5';
      }
      if (settingsStatusText) {
        const cleanName = (text || '').replace(/^Terhubung:\s*/i, '');
        settingsStatusText.textContent = cleanName ? `Serial: ${cleanName}` : (isEn ? 'Serial COM: Connected' : 'Serial COM: Terhubung');
      }
      if (btnSettingsConnect) {
        btnSettingsConnect.innerHTML = `
          <svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>${isEn ? 'Disconnect Serial' : 'Putuskan Serial'}</span>
        `;
        btnSettingsConnect.classList.add('border-rose-500/40', 'text-rose-400');
        btnSettingsConnect.classList.remove('border-brand/40', 'text-brand');
      }
    } else {
      if (settingsStatusBadge) {
        settingsStatusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600 flex items-center gap-1.5';
      }
      if (settingsStatusText) {
        settingsStatusText.textContent = isEn ? 'Serial COM: Not Connected' : 'Serial COM: Belum Terhubung';
      }
      if (btnSettingsConnect) {
        btnSettingsConnect.innerHTML = `
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3"/></svg>
          <span id="lbl-btn-settings-serial-connect">${isEn ? 'Connect Serial / COM' : 'Hubungkan Serial / COM'}</span>
        `;
        btnSettingsConnect.classList.remove('border-rose-500/40', 'text-rose-400');
        btnSettingsConnect.classList.add('border-brand/40', 'text-brand');
      }
    }
    refreshUsbNavbar();
  };

  const handleToggleSerial = async () => {
    const isEn = state.appLang === 'en';
    if (!serialPrinter.isSupported()) {
      showToast(isEn 
        ? 'Web Serial is not supported in this browser. Please use Google Chrome or Microsoft Edge on PC.' 
        : 'Web Serial tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC.', 'warning');
      return;
    }

    if (serialPrinter.isConnected) {
      if (confirm(isEn ? 'Disconnect current Serial / COM printer?' : 'Putuskan koneksi dengan printer Serial / COM saat ini?')) {
        await serialPrinter.disconnect();
        showToast(isEn ? 'Serial printer disconnected' : 'Printer Serial diputuskan', 'info');
      }
      return;
    }

    try {
      showToast(isEn ? 'Selecting Serial / Bluetooth COM port...' : 'Memilih port Serial / Bluetooth COM...', 'info');
      const portName = await serialPrinter.connect();
      showToast(`${isEn ? 'Connected to' : 'Terhubung ke'} ${portName}!`, 'success');
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        showToast(`Serial: ${err.message}`, 'warning');
      }
    }
  };

  toggleSerialPrinterGlobal = handleToggleSerial;

  if (btnSettingsConnect) {
    btnSettingsConnect.addEventListener('click', handleToggleSerial);
  }
}

// ==================== PRINT BRIDGE (USB printer with a Windows driver) ====================
function openPrinterSettings() {
  switchTab('tab-settings');
  setTimeout(() => document.getElementById('bridge-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

function renderBridgeStatus() {
  if (!bridgePrinter) return;
  const isEn = state.appLang === 'en';
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const connected = bridgePrinter.isConnected;
  const active = bridgePrinter.activePrinter();

  setText('lbl-bridge-title', isEn ? 'USB printer with a Windows driver (Skyline Print Bridge)' : 'Printer USB dengan driver Windows (Skyline Print Bridge)');
  setText('lbl-bridge-desc', isEn
    ? 'For the iWare DM-76H and any USB printer that already prints from Windows. The POS sends ESC/POS commands to a small helper on the cashier PC, which passes them to the printer.'
    : 'Untuk iWare DM-76H dan printer USB lain yang sudah bisa mencetak dari Windows. POS mengirim perintah ESC/POS ke aplikasi kecil di PC kasir, lalu diteruskan ke printer.');
  setText('lbl-bridge-printer', isEn ? 'Receipt printer in Windows' : 'Printer struk di Windows');
  setText('lbl-btn-bridge-check', isEn ? 'Check connection' : 'Cek koneksi');
  setText('lbl-btn-bridge-test', isEn ? 'Test ESC/POS print' : 'Tes cetak ESC/POS');

  const badge = document.getElementById('bridge-status');
  if (badge) {
    badge.className = 'set-status shrink-0 ' + (connected && active ? 'set-status--ok' : 'set-status--warn');
    badge.textContent = !connected ? (isEn ? 'Not running on this PC' : 'Belum aktif di PC ini')
      : active ? (isEn ? 'Ready' : 'Siap')
      : (isEn ? 'Choose a printer' : 'Pilih printer');
  }

  const select = document.getElementById('bridge-printer-select');
  if (select) {
    select.innerHTML = '';
    select.add(new Option(connected ? (isEn ? '-- choose printer --' : '-- pilih printer --') : '-', ''));
    bridgePrinter.printers.forEach(name => select.add(new Option(name, name)));
    select.value = active;
    select.disabled = !connected;
  }
  const btnTest = document.getElementById('btn-bridge-test');
  if (btnTest) btnTest.disabled = !connected || !active;

  const steps = document.getElementById('bridge-install-steps');
  if (steps) {
    steps.classList.toggle('hidden', connected);
    steps.innerHTML = isEn
      ? `<li>On the cashier PC, download <a href="/pos/print-bridge/SkylinePrintBridge.cmd" download class="set-link">SkylinePrintBridge.cmd</a>. If Chrome warns about the file, choose <em>Keep</em>.</li>
         <li>Double-click it. If "Windows protected your PC" appears, click <em>More info</em> then <em>Run anyway</em>.</li>
         <li>Click <strong>Check connection</strong>. If Chrome asks to access apps on this device, choose <strong>Allow</strong>.</li>
         <li>Pick the receipt printer, then click <strong>Test ESC/POS print</strong>. The bridge starts with Windows from now on.</li>`
      : `<li>Di PC kasir, unduh <a href="/pos/print-bridge/SkylinePrintBridge.cmd" download class="set-link">SkylinePrintBridge.cmd</a>. Jika Chrome memperingatkan file ini, pilih <em>Keep</em>.</li>
                <li>Klik dua kali file itu. Jika muncul "Windows protected your PC", klik <em>More info</em> lalu <em>Run anyway</em>.</li>
                <li>Klik <strong>Cek koneksi</strong>. Jika Chrome meminta izin akses ke aplikasi di perangkat ini, pilih <strong>Izinkan</strong>.</li>
                <li>Pilih printer struk, lalu klik <strong>Tes cetak ESC/POS</strong>. Bridge jalan otomatis setiap Windows menyala.</li>`;
  }
  refreshUsbNavbar();
}

function initBridgeUI() {
  if (!bridgePrinter) return;
  const isEn = () => state.appLang === 'en';
  bridgePrinter.onStatusChange = renderBridgeStatus;

  document.getElementById('bridge-printer-select')?.addEventListener('change', (e) => {
    bridgePrinter.printerName = e.target.value;
    renderBridgeStatus();
  });

  document.getElementById('btn-bridge-check')?.addEventListener('click', async () => {
    const ok = await bridgePrinter.check();
    showToast(ok
      ? (isEn() ? 'Print Bridge connected' : 'Print Bridge terhubung')
      : (isEn() ? 'Print Bridge is not running on this PC. Run SkylinePrintBridge.cmd first.' : 'Print Bridge belum aktif di PC ini. Jalankan SkylinePrintBridge.cmd dulu.'),
      ok ? 'success' : 'warning');
  });

  document.getElementById('btn-bridge-test')?.addEventListener('click', async () => {
    try {
      const name = await bridgePrinter.print(await printer.buildTestEscPos(state.settings, state.receiptLang));
      showToast(isEn() ? `Test receipt sent to ${name}` : `Struk tes dikirim ke ${name}`, 'success');
    } catch (err) {
      showToast(`Print Bridge: ${err.message}`, 'error');
    }
  });

  renderBridgeStatus();
  if (bridgePrinter.wasSeen) bridgePrinter.check();
}

// ==================== PRINTER TROUBLESHOOTING GUIDE MODAL ====================
function initPrinterGuideModal() {
  const modal = document.getElementById('modal-printer-guide');
  const btnOpen = document.getElementById('btn-open-printer-guide');
  const btnClose = document.getElementById('btn-close-modal-printer-guide');
  const btnDone = document.getElementById('btn-done-modal-printer-guide');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      if (modal) modal.classList.remove('hidden');
    });
  }
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }
  if (btnDone) {
    btnDone.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }
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

  // Theme Switcher
  document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);

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

  // Currency select change
  document.getElementById('item-currency').addEventListener('change', (e) => {
    state.customPickedByUser = e.target.value === '__CUSTOM__';
    handleCurrencyChange();
  });

  // Currency tiles (rendered by renderCurrencyTiles)
  document.getElementById('currency-tiles').addEventListener('click', (e) => {
    const tile = e.target.closest('.cur-tile');
    const select = document.getElementById('item-currency');
    if (!tile || !select) return;
    if (tile.id === 'chip-custom-curr') {
      state.customPickedByUser = true;
      select.value = '__CUSTOM__';
      handleCurrencyChange();
      return;
    }
    const code = tile.dataset.code;
    if (state.rates.some(r => r.code === code)) {
      state.customPickedByUser = false;
      select.value = code;
      handleCurrencyChange();
      document.getElementById('item-amount').focus();
    }
  });

  // Mobile checkout bar mirrors the main process button
  document.getElementById('btn-submit-mobile').addEventListener('click', processTransaction);

  // Receipt preview: collapsed by default, state remembered per device
  const receiptToggle = document.getElementById('btn-toggle-receipt');
  const receiptBody = document.getElementById('receipt-panel-body');
  const setReceiptOpen = (open) => {
    receiptToggle.setAttribute('aria-expanded', String(open));
    receiptBody.classList.toggle('hidden', !open);
    try { localStorage.setItem('skyline_pos_receipt_open', open ? '1' : '0'); } catch (e) {}
  };
  let receiptOpen = false;
  try { receiptOpen = localStorage.getItem('skyline_pos_receipt_open') === '1'; } catch (e) {}
  setReceiptOpen(receiptOpen);
  receiptToggle.addEventListener('click', () => setReceiptOpen(receiptToggle.getAttribute('aria-expanded') !== 'true'));

  // Add Item to Cart
  document.getElementById('btn-add-item').addEventListener('click', addItemToCart);
  document.getElementById('item-amount').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItemToCart();
    }
  });

  // Customer Name & Inputs Live Update
  ['cust-name', 'cust-phone', 'cust-id', 'cust-npwp', 'cust-nationality', 'cust-job', 'cust-gender', 'cust-address'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLiveReceiptMetadata);
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', updateLiveReceiptMetadata);
      }
    }
  });

  // Signature Name Edit Trigger
  const sigInput = document.getElementById('input-signature-customer');
  sigInput.addEventListener('input', () => {
    sigInput.setAttribute('data-customized', 'true');
    const rcptSign = document.getElementById('rcpt-sign-customer');
    rcptSign.textContent = sigInput.value ? `( ${sigInput.value.toUpperCase()} )` : '( CUSTOMER )';
  });

  // Payment Input Live Update
  ['item-amount', 'item-rate', 'input-payment'].forEach(id => attachNumFormatter(document.getElementById(id)));
  document.getElementById('input-payment').addEventListener('input', renderCart);

  // Exact Cash Button
  document.getElementById('btn-exact-cash').addEventListener('click', () => {
    const { total } = calculateTotals();
    setNumInput(document.getElementById('input-payment'), total);
    renderCart();
  });

  // Quick Add Cash Buttons
  document.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseFloat(btn.getAttribute('data-val'));
      const paymentInput = document.getElementById('input-payment');
      const current = getNumInput(paymentInput) || 0;
      setNumInput(paymentInput, current + val);
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
  document.getElementById('btn-bulk-buy-edit').addEventListener('click', () => setBulkBuyMode(true));
  document.getElementById('btn-bulk-buy-cancel').addEventListener('click', () => setBulkBuyMode(false));
  document.getElementById('btn-bulk-buy-save').addEventListener('click', saveBulkBuyRates);
  document.getElementById('btn-close-modal-rate').addEventListener('click', closeEditRateModal);
  document.getElementById('btn-cancel-modal-rate').addEventListener('click', closeEditRateModal);

  document.getElementById('form-rate-edit').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-rate-id').value;
    const code = document.getElementById('edit-rate-code').value.trim();
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

  // History Date Range Filter Listeners
  const startEl = document.getElementById('history-start-date');
  const endEl = document.getElementById('history-end-date');
  const legacyDateInput = document.getElementById('history-date-filter');
  const todayIso = storeToday();

  if (startEl && !startEl.value) startEl.value = todayIso;
  if (endEl && !endEl.value) endEl.value = todayIso;
  if (legacyDateInput) legacyDateInput.value = todayIso;

  function handleDateFilterChange() {
    if (legacyDateInput) legacyDateInput.value = startEl ? startEl.value : '';
    loadHistory();
    loadReportsSummary();
  }

  startEl?.addEventListener('change', () => {
    if (endEl && (!endEl.value || endEl.value < startEl.value)) {
      endEl.value = startEl.value;
    }
    handleDateFilterChange();
  });

  endEl?.addEventListener('change', () => {
    if (startEl && (!startEl.value || startEl.value > endEl.value)) {
      startEl.value = endEl.value;
    }
    handleDateFilterChange();
  });

  document.getElementById('btn-history-today')?.addEventListener('click', () => {
    const today = storeToday();
    if (startEl) startEl.value = today;
    if (endEl) endEl.value = today;
    showToast(state.appLang === 'en' ? 'Filtered to Today' : 'Menampilkan transaksi Hari Ini', 'info');
    handleDateFilterChange();
  });

  document.getElementById('btn-history-month')?.addEventListener('click', () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const firstDay = `${y}-${m}-01`;
    const today = storeToday();
    if (startEl) startEl.value = firstDay;
    if (endEl) endEl.value = today;
    showToast(state.appLang === 'en' ? `Filtered to This Month (${firstDay} to ${today})` : `Menampilkan transaksi Bulan Ini (${firstDay} s/d ${today})`, 'info');
    handleDateFilterChange();
  });

  document.getElementById('btn-history-all-dates')?.addEventListener('click', () => {
    if (startEl) startEl.value = '';
    if (endEl) endEl.value = '';
    showToast(state.appLang === 'en' ? 'Showing All Transactions' : 'Menampilkan Semua Riwayat Transaksi', 'info');
    handleDateFilterChange();
  });

  document.getElementById('history-search-input')?.addEventListener('input', () => {
    loadHistory();
  });

  // Settings Form Submit
  document.getElementById('form-settings').addEventListener('submit', async (e) => {
    e.preventDefault();
    const isEn = state.appLang === 'en';
    const payload = {
      store_name: document.getElementById('setting-store-name').value.trim(),
      store_company: document.getElementById('setting-store-company').value.trim(),
      store_address: document.getElementById('setting-store-address').value.trim(),
      store_phone: document.getElementById('setting-store-phone').value.trim(),
      paper_size: document.querySelector('input[name="setting-paper-size"]:checked')?.value || '76',
      store_permit: document.getElementById('setting-store-permit').value.trim(),
      show_permit: document.getElementById('setting-show-permit').checked ? '1' : '0',
      default_teller: document.getElementById('setting-default-teller').value.trim() || 'TELLER 01',
      disclaimer_1: document.getElementById('setting-disclaimer-1').value.trim(),
      disclaimer_2: document.getElementById('setting-disclaimer-2').value.trim(),
      google_sheets_url: (document.getElementById('setting-sheets-url')?.value || '').trim(),
      google_sheets_auto_sync: document.getElementById('setting-sheets-auto-sync')?.checked ? '1' : '0',
      store_logo: state.settings.store_logo || '',
      store_show_rcpt_logo: document.getElementById('setting-show-rcpt-logo')?.checked ? '1' : '0',
      store_rcpt_logo_size: document.querySelector('input[name="setting-rcpt-logo-size"]:checked')?.value || 'medium'
    };

    if (payload.google_sheets_url) {
      localStorage.setItem('skyline_pos_sheets_url', payload.google_sheets_url);
      localStorage.setItem('skyline_pos_sheets_auto_sync', payload.google_sheets_auto_sync);
    }
    if (payload.store_logo) {
      localStorage.setItem('skyline_pos_custom_logo', payload.store_logo);
    } else {
      localStorage.removeItem('skyline_pos_custom_logo');
    }
    localStorage.setItem('skyline_pos_show_rcpt_logo', payload.store_show_rcpt_logo);
    localStorage.setItem('skyline_pos_rcpt_logo_size', payload.store_rcpt_logo_size);

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
      } else {
        showToast(data.message || (isEn ? 'Failed to save settings' : 'Gagal menyimpan ke server'), 'error');
      }
    } catch {
      showToast(isEn ? 'Failed to save settings' : 'Gagal menyimpan ke server', 'error');
    }
  });

  // Logo & Favicon Customization Listeners
  const logoInput = document.getElementById('input-store-logo');
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const isEn = state.appLang === 'en';

      if (!file.type.startsWith('image/')) {
        showToast(isEn ? 'Please select a valid image file.' : 'Harap pilih file gambar yang valid.', 'error');
        return;
      }

      const showRcpt = document.getElementById('setting-show-rcpt-logo')?.checked ? '1' : '0';

      // SVG files: Read as Data URL directly
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          state.settings.store_logo = dataUrl;
          applyStoreLogo(dataUrl, showRcpt);
          showToast(isEn ? 'Custom logo selected! Click "Save Settings" to persist.' : 'Logo kustom dipilih! Klik "Simpan Pengaturan" untuk menyimpan permanen.', 'info');
        };
        reader.readAsDataURL(file);
        return;
      }

      // Raster images (PNG, JPG, WebP, ICO): Read and resize to max 512px
      const reader = new FileReader();
      reader.onload = (evt) => {
        const rawData = evt.target.result;
        const img = new Image();
        img.onload = () => {
          const maxDim = 512;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const format = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
          const optimizedDataUrl = canvas.toDataURL(format, 0.92);

          state.settings.store_logo = optimizedDataUrl;
          applyStoreLogo(optimizedDataUrl, showRcpt);
          showToast(isEn ? 'Custom logo selected! Click "Save Settings" to persist.' : 'Logo kustom dipilih! Klik "Simpan Pengaturan" untuk menyimpan permanen.', 'info');
        };
        img.onerror = () => {
          state.settings.store_logo = rawData;
          applyStoreLogo(rawData, showRcpt);
          showToast(isEn ? 'Custom logo selected! Click "Save Settings" to persist.' : 'Logo kustom dipilih! Klik "Simpan Pengaturan" untuk menyimpan permanen.', 'info');
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    });
  }

  document.getElementById('btn-reset-store-logo')?.addEventListener('click', () => {
    const isEn = state.appLang === 'en';
    state.settings.store_logo = '';
    const fileInput = document.getElementById('input-store-logo');
    if (fileInput) fileInput.value = '';
    const showRcpt = document.getElementById('setting-show-rcpt-logo')?.checked ? '1' : '0';
    applyStoreLogo('', showRcpt, state.settings.store_rcpt_logo_size);
    showToast(isEn ? 'Reset to Skyline default logo. Click "Save Settings" to save.' : 'Kembali ke logo default Skyline. Klik "Simpan Pengaturan" untuk menyimpan.', 'info');
  });

  document.getElementById('setting-show-rcpt-logo')?.addEventListener('change', (e) => {
    const isShow = e.target.checked ? '1' : '0';
    state.settings.store_show_rcpt_logo = isShow;
    applyStoreLogo(state.settings.store_logo, isShow, state.settings.store_rcpt_logo_size);
  });

  document.querySelectorAll('input[name="setting-rcpt-logo-size"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const newSize = e.target.value;
      state.settings.store_rcpt_logo_size = newSize;
      applyStoreLogo(state.settings.store_logo, state.settings.store_show_rcpt_logo, newSize);
    });
  });

  // Paper Size Real-Time Toggle Listeners
  document.getElementById('setting-paper-80')?.addEventListener('change', () => applyPaperSize('80'));
  document.getElementById('setting-paper-76')?.addEventListener('change', () => applyPaperSize('76'));
  document.getElementById('setting-paper-58')?.addEventListener('change', () => applyPaperSize('58'));

  // Settings Sub-Tabs Switcher Listeners
  document.getElementById('subtab-btn-sheets')?.addEventListener('click', () => switchSubtab('sheets'));
  document.getElementById('subtab-btn-store')?.addEventListener('click', () => switchSubtab('store'));
  document.getElementById('subtab-btn-users')?.addEventListener('click', () => switchSubtab('users'));
  document.getElementById('subtab-btn-database')?.addEventListener('click', () => switchSubtab('database'));
  document.getElementById('subtab-btn-compliance')?.addEventListener('click', () => switchSubtab('compliance'));

  // DTTOT Screening input in Kasir
  document.getElementById('cust-name')?.addEventListener('input', (e) => {
    checkDttotRealtime(e.target.value);
  });

  // PEP Toggle in Kasir
  document.getElementById('cust-pep-toggle')?.addEventListener('change', (e) => {
    const fields = document.getElementById('pep-edd-fields');
    if (fields) {
      if (e.target.checked) {
        fields.classList.remove('hidden');
      } else {
        fields.classList.add('hidden');
      }
    }
    updateLiveReceiptMetadata();
  });

  // Underlying Inputs in Kasir
  document.getElementById('underlying-doc-type')?.addEventListener('change', updateLiveReceiptMetadata);
  document.getElementById('underlying-doc-no')?.addEventListener('input', updateLiveReceiptMetadata);

  // Compliance subtab DTTOT controls
  document.getElementById('btn-open-add-dttot')?.addEventListener('click', () => {
    document.getElementById('modal-add-dttot')?.classList.remove('hidden');
    document.getElementById('add-dttot-name')?.focus();
  });
  document.getElementById('btn-close-modal-add-dttot')?.addEventListener('click', () => {
    document.getElementById('modal-add-dttot')?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-modal-add-dttot')?.addEventListener('click', () => {
    document.getElementById('modal-add-dttot')?.classList.add('hidden');
  });
  document.getElementById('form-add-dttot')?.addEventListener('submit', saveDttotEntry);

  document.getElementById('btn-test-dttot')?.addEventListener('click', testDttotScreening);
  document.getElementById('test-dttot-input')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') testDttotScreening();
  });

  document.getElementById('dttot-filter-search')?.addEventListener('input', loadDttotList);
  document.getElementById('dttot-filter-type')?.addEventListener('change', loadDttotList);
  document.getElementById('btn-refresh-db-info')?.addEventListener('click', loadDatabaseInfo);
  document.getElementById('btn-download-db-backup')?.addEventListener('click', downloadDatabaseBackup);
  document.getElementById('btn-trigger-restore-db')?.addEventListener('click', () => {
    document.getElementById('input-restore-file')?.click();
  });
  document.getElementById('input-restore-file')?.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      restoreDatabaseFromFile(this.files[0]);
      this.value = '';
    }
  });
  document.getElementById('btn-goto-sheets-tab')?.addEventListener('click', () => switchSubtab('sheets'));

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
  document.getElementById('btn-save-sheets-config')?.addEventListener('click', handleSaveSheetsConfig);
  document.getElementById('btn-sheets-test')?.addEventListener('click', testGoogleSheetsConnection);
  document.getElementById('btn-sheets-sync-today')?.addEventListener('click', () => syncTransactionsToGoogleSheets());
  document.getElementById('btn-open-sheets-guide')?.addEventListener('click', openGoogleSheetsGuideModal);
  document.getElementById('btn-open-sheets-guide-link')?.addEventListener('click', openGoogleSheetsGuideModal);
  document.getElementById('btn-close-modal-sheets-guide')?.addEventListener('click', closeGoogleSheetsGuideModal);
  document.getElementById('btn-close-guide-footer')?.addEventListener('click', closeGoogleSheetsGuideModal);
  document.getElementById('btn-copy-sheets-script')?.addEventListener('click', copyGoogleSheetsScript);
  document.getElementById('btn-history-sync-sheets')?.addEventListener('click', () => {
    syncTransactionsToGoogleSheets();
  });
  document.getElementById('btn-history-export-csv')?.addEventListener('click', () => {
    exportGoogleSheetsCsv();
  });
  document.getElementById('btn-history-export-excel')?.addEventListener('click', () => {
    exportExcel();
  });
  document.getElementById('btn-history-export-pdf')?.addEventListener('click', () => {
    exportPdf();
  });
  document.getElementById('btn-history-bi-report')?.addEventListener('click', exportBiReport);
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
      alertBox.className = 'p-3 rounded-lg text-[13px] border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 block';
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
      alertBox.className = 'p-3 rounded-lg text-[13px] border bg-rose-950/60 border-rose-500/40 text-rose-200 block';
      alertBox.innerHTML = `
        <div class="font-bold text-rose-300">⚠️ ${isEn ? 'Connection Failed' : 'Koneksi Gagal'}:</div>
        <div class="mt-0.5 text-slate-300">${data.message || (isEn ? 'Unknown error' : 'Terjadi kesalahan')}</div>
      `;
    }
  } catch (err) {
    showToast(isEn ? 'Network error while testing connection.' : 'Gagal menghubungi server untuk tes koneksi.', 'error');
    alertBox.className = 'p-3 rounded-lg text-[13px] border bg-rose-950/60 border-rose-500/40 text-rose-200 block';
    alertBox.textContent = `Error: ${err.message}`;
  } finally {
    btn.innerHTML = origHtml;
    btn.disabled = false;
  }
}

async function handleSaveSheetsConfig() {
  const isEn = state.appLang === 'en';
  const urlInput = document.getElementById('setting-sheets-url');
  const btn = document.getElementById('btn-save-sheets-config');
  const alertBox = document.getElementById('sheets-status-alert');
  const rawUrl = (urlInput?.value || '').trim();
  const autoSync = document.getElementById('setting-sheets-auto-sync')?.checked ? '1' : '0';

  if (!rawUrl) {
    showToast(isEn ? 'Please enter the Google Apps Script Web App URL first.' : 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.', 'warning');
    urlInput?.focus();
    return;
  }

  // Pre-validate URL format
  if (rawUrl.includes('docs.google.com/spreadsheets')) {
    showToast(isEn ? 'This is a spreadsheet link, not Apps Script Web App URL.' : 'Tautan ini adalah link Google Sheets biasa, bukan URL Web App Apps Script.', 'error');
    if (alertBox) {
      alertBox.className = 'p-3 rounded-lg text-[13px] border bg-amber-950/60 border-amber-500/40 text-amber-200 block';
      alertBox.innerHTML = `
        <div class="font-bold text-amber-300">⚠️ ${isEn ? 'Incorrect URL Type' : 'Format URL Keliru'}:</div>
        <div class="mt-1 text-slate-300">${isEn ? 'Please copy the Web App URL from Extensions -> Apps Script -> Deploy -> New deployment (ends in /exec).' : 'Buka menu Extensions -> Apps Script -> Deploy -> New deployment -> Web app untuk mendapatkan URL Web App (berakhiran /exec).'}</div>
      `;
    }
    urlInput?.focus();
    return;
  }

  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = `<span class="inline-block animate-spin mr-1">↻</span> ${isEn ? 'Saving...' : 'Menyimpan...'}`;
    btn.disabled = true;
  }

  try {
    const res = await authFetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: rawUrl, auto_sync: autoSync })
    });
    const data = await res.json();

    if (data.success) {
      state.settings.google_sheets_url = rawUrl;
      state.settings.google_sheets_auto_sync = autoSync;
      localStorage.setItem('skyline_pos_sheets_url', rawUrl);
      localStorage.setItem('skyline_pos_sheets_auto_sync', autoSync);

      showToast(isEn ? 'Google Sheets URL saved permanently!' : 'URL Google Sheets berhasil disimpan secara permanen!', 'success');
      if (alertBox) {
        alertBox.className = 'p-3 rounded-lg text-[13px] border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 block';
        alertBox.innerHTML = `
          <div class="font-bold text-emerald-300">✓ ${isEn ? 'Settings Saved Permanently' : 'Pengaturan Tersimpan Permanen'}</div>
          <div class="mt-1 text-slate-300">${isEn ? 'The Google Apps Script URL has been saved. You do not need to re-enter it when logging in.' : 'URL Apps Script telah tersimpan aman di database server & browser. Anda tidak perlu memasukkannya lagi setiap kali login.'}</div>
        `;
      }
    } else {
      showToast(data.message || (isEn ? 'Failed to save configuration.' : 'Gagal menyimpan pengaturan.'), 'error');
    }
  } catch (err) {
    localStorage.setItem('skyline_pos_sheets_url', rawUrl);
    localStorage.setItem('skyline_pos_sheets_auto_sync', autoSync);
    state.settings.google_sheets_url = rawUrl;
    state.settings.google_sheets_auto_sync = autoSync;
    showToast(isEn ? 'Saved to local browser cache.' : 'Tersimpan di cache browser.', 'warning');
  } finally {
    renderSheetsStatus();
    if (btn) {
      btn.innerHTML = origHtml;
      btn.disabled = false;
    }
  }
}

// Badge states the saved config, not a live connection (that is what "Tes koneksi" checks)
function renderSheetsStatus() {
  const el = document.getElementById('sheets-config-status');
  if (!el) return;
  const isEn = state.appLang === 'en';
  const url = (state.settings.google_sheets_url || '').trim();
  const [mod, text] = !url
    ? ['', isEn ? 'Not set up' : 'Belum diatur']
    : state.settings.google_sheets_auto_sync !== '0'
      ? ['set-status--ok', isEn ? 'Auto-sync on' : 'Auto-sync aktif']
      : ['set-status--warn', isEn ? 'Auto-sync off' : 'Auto-sync mati'];
  el.className = `set-status ${mod}`;
  el.textContent = text;
}

async function saveGoogleSheetsSettings(url) {
  const autoSync = document.getElementById('setting-sheets-auto-sync')?.checked ? '1' : '0';
  const cleanUrl = (url || document.getElementById('setting-sheets-url')?.value || '').trim();

  state.settings.google_sheets_url = cleanUrl;
  state.settings.google_sheets_auto_sync = autoSync;
  renderSheetsStatus();
  if (cleanUrl) {
    localStorage.setItem('skyline_pos_sheets_url', cleanUrl);
    localStorage.setItem('skyline_pos_sheets_auto_sync', autoSync);
  }

  try {
    await authFetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl, auto_sync: autoSync })
    });
  } catch (e) {
    console.warn('Failed to auto-save sheets settings:', e);
  }
}

async function syncTransactionsToGoogleSheets() {
  const isEn = state.appLang === 'en';
  const url = (document.getElementById('setting-sheets-url')?.value || state.settings.google_sheets_url || '').trim();

  if (!url) {
    showToast(isEn ? 'Please set Google Apps Script URL in Settings first.' : 'Silakan atur URL Google Apps Script di tab Pengaturan terlebih dahulu.', 'warning');
    switchTab('tab-settings');
    document.getElementById('setting-sheets-url')?.focus();
    return;
  }

  const filter = getHistoryDateFilterState();
  const payload = { url };
  if (filter.isAll) {
    payload.all = true;
  } else if (filter.startDate && filter.endDate) {
    payload.startDate = filter.startDate;
    payload.endDate = filter.endDate;
  } else if (filter.startDate || filter.endDate) {
    payload.date = filter.startDate || filter.endDate;
  }

  showToast(isEn ? `Syncing transactions (${filter.label}) to Google Sheets...` : `Menyinkronkan transaksi (${filter.label}) ke Google Sheets...`, 'info');

  try {
    const res = await authFetch('/api/sheets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      const msg = data.message || (isEn ? `Successfully synced ${data.processed || 0} rows to Google Sheets!` : `Berhasil menyinkronkan ${data.processed || 0} baris ke Google Sheets!`);
      showToast(msg, 'success');
      const alertBox = document.getElementById('sheets-status-alert');
      if (alertBox) {
        alertBox.className = 'p-3 rounded-lg text-[13px] border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 block';
        alertBox.innerHTML = `
          <div class="font-bold text-emerald-300">✓ ${isEn ? 'Last Sync Succeeded' : 'Sinkronisasi Terakhir Berhasil'} (${new Date().toLocaleTimeString()}):</div>
          <div class="mt-0.5 text-slate-300">${msg}</div>
        `;
      }
    } else {
      showToast(data.message || (isEn ? 'Failed to sync to Google Sheets' : 'Gagal sinkronisasi ke Google Sheets'), 'error');
      const alertBox = document.getElementById('sheets-status-alert');
      if (alertBox) {
        alertBox.className = 'p-3 rounded-lg text-[13px] border bg-rose-950/60 border-rose-500/40 text-rose-200 block';
        alertBox.innerHTML = `
          <div class="font-bold text-rose-300">⚠️ ${isEn ? 'Sync Failed' : 'Sinkronisasi Gagal'}:</div>
          <div class="mt-0.5 text-slate-300">${data.message || (isEn ? 'Unknown error' : 'Terjadi kesalahan')}</div>
        `;
      }
    }
  } catch (err) {
    showToast(isEn ? 'Network error during Google Sheets sync.' : 'Terjadi kesalahan jaringan saat sinkronisasi.', 'error');
    const alertBox = document.getElementById('sheets-status-alert');
    if (alertBox) {
      alertBox.className = 'p-3 rounded-lg text-[13px] border bg-rose-950/60 border-rose-500/40 text-rose-200 block';
      alertBox.textContent = `Error: ${err.message}`;
    }
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

function exportGoogleSheetsCsv() {
  const filter = getHistoryDateFilterState();
  let url = '/api/sheets/export-csv';
  let filename = 'Skyline_POS_Transactions_ALL.csv';

  if (filter.isAll) {
    url += '?all=1';
  } else if (filter.startDate && filter.endDate) {
    url += `?startDate=${encodeURIComponent(filter.startDate)}&endDate=${encodeURIComponent(filter.endDate)}`;
    filename = filter.isRange ? `Skyline_POS_${filter.startDate}_sd_${filter.endDate}.csv` : `Skyline_POS_${filter.startDate}.csv`;
  } else if (filter.startDate || filter.endDate) {
    const d = filter.startDate || filter.endDate;
    url += `?date=${encodeURIComponent(d)}`;
    filename = `Skyline_POS_${d}.csv`;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showToast(state.appLang === 'en'
    ? `Exporting CSV (${filter.label})...`
    : `Mengunduh CSV (${filter.label})...`, 'info');
}

function exportExcel() {
  const filter = getHistoryDateFilterState();
  let url = '/api/sheets/export-excel';
  let filename = 'Skyline_POS_Transactions_ALL.xlsx';

  if (filter.isAll) {
    url += '?all=1';
  } else if (filter.startDate && filter.endDate) {
    url += `?startDate=${encodeURIComponent(filter.startDate)}&endDate=${encodeURIComponent(filter.endDate)}`;
    filename = filter.isRange ? `Skyline_POS_${filter.startDate}_sd_${filter.endDate}.xlsx` : `Skyline_POS_${filter.startDate}.xlsx`;
  } else if (filter.startDate || filter.endDate) {
    const d = filter.startDate || filter.endDate;
    url += `?date=${encodeURIComponent(d)}`;
    filename = `Skyline_POS_${d}.xlsx`;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showToast(state.appLang === 'en'
    ? `Exporting Excel (${filter.label})...`
    : `Mengunduh Excel (${filter.label})...`, 'info');
}

// "Laporan Summary Valas [By Currency]" for Bank Indonesia, laid out like the BI money changer program
async function exportBiReport() {
  const isEn = state.appLang === 'en';
  const filter = getHistoryDateFilterState();
  let url = '/api/reports/bi-summary';
  if (filter.isAll) url += '?all=1';
  else url += `?startDate=${encodeURIComponent(filter.startDate || filter.endDate || storeToday())}&endDate=${encodeURIComponent(filter.endDate || filter.startDate || storeToday())}`;

  // open the window inside the click so the popup blocker allows it
  const win = window.open('', '_blank');
  if (!win) {
    showToast(isEn ? 'Popup blocked. Please allow popups to print the report.' : 'Pop-up terblokir. Izinkan pop-up untuk mencetak laporan.', 'error');
    return;
  }
  win.document.write('<p style="font-family:sans-serif">Menyiapkan laporan...</p>');

  try {
    const data = await (await authFetch(url)).json();
    if (!data.success) throw new Error(data.message || 'Gagal memuat laporan');
    const r = data.data;
    const n2 = v => Number(v || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const n4 = v => Number(v || 0).toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    const dmy = iso => { const [y, m, d] = String(iso).split('-'); return `${d}/${m}/${y}`; };
    const now = new Date();
    const printed = `${now.toLocaleDateString('en-GB', { timeZone: 'Asia/Makassar' })} ${now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour12: false })}`;
    const company = r.company || state.settings.store_company || state.settings.store_name || '';

    const body = r.rows.length
      ? r.rows.map(x => `<tr>
          <td class="l">${escapeHtml(x.currency)}</td>
          <td>${n2(x.open_qty)}</td><td>${n2(x.open_idr)}</td>
          <td>${n2(x.buy_qty)}</td><td>${n2(x.buy_idr)}</td>
          <td>${n2(x.sell_qty)}</td><td>${n2(x.sell_idr)}</td>
          <td class="red">${n2(x.close_qty)}</td><td>${n4(x.close_rate)}</td><td>${n2(x.close_idr)}</td>
        </tr>`).join('')
      : '<tr><td class="l" colspan="10">Tidak ada transaksi pada periode ini.</td></tr>';

    win.document.open();
    win.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan_Summary_Valas_${r.startDate}_${r.endDate}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm 10mm; }
    body { font-family: "Times New Roman", Times, serif; color: #000; background: #fff; margin: 0; padding: 16px; font-size: 11px; }
    .company { font-weight: bold; font-size: 13px; text-transform: uppercase; }
    h1 { font-weight: normal; font-size: 22px; margin: 14px 0 2px; }
    .period { font-size: 12px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { font-size: 10px; font-weight: bold; padding: 2px 6px; text-align: right; }
    thead tr:first-child th { border-top: 1px solid #000; padding-top: 6px; }
    thead tr:last-child th { border-bottom: 1px solid #000; padding-bottom: 6px; }
    th.grp { text-align: center; }
    td { padding: 2px 6px; text-align: right; white-space: nowrap; }
    tbody tr:first-child td { padding-top: 12px; }
    tfoot td { font-weight: bold; padding-top: 10px; }
    .l { text-align: left; }
    .red { color: #d00; }
    .foot { display: flex; justify-content: space-between; margin-top: 18px; font-size: 10px; }
    .foot span:nth-child(2) { flex: 1; text-align: center; }
    .actions { margin-bottom: 14px; }
    .actions button { font: 600 13px sans-serif; padding: 8px 16px; border-radius: 6px; border: 0; background: #0f766e; color: #fff; cursor: pointer; }
    @media print { .actions { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="actions"><button onclick="window.print()">Cetak / Simpan PDF</button></div>
  <div class="company">${escapeHtml(company)}</div>
  <h1>Laporan Summary Valas [ By Currency ]</h1>
  <div class="period">Periode : &nbsp;${dmy(r.startDate)} S/D ${dmy(r.endDate)}</div>
  <table>
    <thead>
      <tr>
        <th class="l">CURRENCY</th>
        <th class="grp" colspan="2">SALDO AWAL</th>
        <th class="grp" colspan="2">VOLUME PEMBELIAN</th>
        <th class="grp" colspan="2">VOLUME PENJUALAN</th>
        <th class="grp" colspan="3">SALDO AKHIR</th>
      </tr>
      <tr>
        <th></th>
        <th>VALAS</th><th>RUPIAH</th>
        <th>VALAS</th><th>RUPIAH</th>
        <th>VALAS</th><th>RUPIAH</th>
        <th>VALAS</th><th>KURS TGH</th><th>RUPIAH</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
    <tfoot>
      <tr>
        <td class="l">Grand Total</td>
        <td></td><td>${n2(r.totals.open_idr)}</td>
        <td></td><td>${n2(r.totals.buy_idr)}</td>
        <td></td><td>${n2(r.totals.sell_idr)}</td>
        <td></td><td></td><td>${n2(r.totals.close_idr)}</td>
      </tr>
    </tfoot>
  </table>
  <div class="foot"><span>Tgl Cetak : ${printed}</span><span>Page 1 of 1</span><span></span></div>
</body>
</html>`);
    win.document.close();
  } catch (err) {
    win.close();
    showToast(`${isEn ? 'BI report failed' : 'Gagal membuat laporan BI'}: ${err.message}`, 'error');
  }
}

async function exportPdf() {
  const isEn = state.appLang === 'en';
  const filter = getHistoryDateFilterState();
  let url = '/api/transactions?limit=5000';
  if (filter.isAll) {
    url += '&all=1';
  } else if (filter.startDate && filter.endDate) {
    url += `&startDate=${encodeURIComponent(filter.startDate)}&endDate=${encodeURIComponent(filter.endDate)}`;
  } else if (filter.startDate || filter.endDate) {
    url += `&date=${encodeURIComponent(filter.startDate || filter.endDate)}`;
  }

  showToast(isEn ? `Preparing PDF report (${filter.label})...` : `Menyiapkan dokumen laporan PDF (${filter.label})...`, 'info');

  try {
    const res = await authFetch(url);
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) {
      showToast(isEn ? 'No transaction data available for PDF export.' : 'Tidak ada data transaksi untuk diekspor ke PDF.', 'warning');
      return;
    }

    const txList = data.data;
    const flatRows = [];
    txList.forEach(t => {
      const items = (t.items && t.items.length > 0) ? t.items : [{
        currency_code: t.currency_code || 'USD',
        amount: t.amount || 0,
        rate: t.rate || 0,
        subtotal_idr: t.subtotal_idr || t.total_idr || 0
      }];
      items.forEach(it => {
        flatRows.push({
          ...t,
          currency_code: it.currency_code,
          amount: it.amount,
          rate: it.rate,
          subtotal_idr: it.subtotal_idr
        });
      });
    });

    const periodTitle = filter.isAll
      ? (isEn ? 'All Recorded Transactions' : 'Semua Riwayat Transaksi')
      : (filter.isRange ? `${filter.startDate} s/d ${filter.endDate}` : filter.label);
    const totalIdr = flatRows.reduce((acc, r) => acc + (Number(r.subtotal_idr) || 0), 0);
    const totalRowsCount = flatRows.length;

    const trHtml = flatRows.map((r, i) => {
      const d = new Date(r.created_at);
      const dateStr = !isNaN(d.getTime())
        ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
        : r.created_at;
      return `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td style="text-align:center; white-space:nowrap;">${dateStr}</td>
          <td style="font-weight:bold;">${escapeHtml((r.customer_name || 'CASH').toUpperCase())}</td>
          <td>${escapeHtml(r.customer_phone || '-')}</td>
          <td style="font-family:monospace;">${escapeHtml(r.customer_id_no || '-')}</td>
          <td style="font-family:monospace;">${escapeHtml(r.customer_npwp || '-')}</td>
          <td>${escapeHtml((r.customer_nationality || 'INDONESIA').toUpperCase())}</td>
          <td>${escapeHtml((r.customer_job || '-').toUpperCase())}</td>
          <td style="text-align:center;">${escapeHtml((r.customer_gender || '-').toUpperCase())}</td>
          <td>${escapeHtml((r.customer_address || '-').toUpperCase())}</td>
          <td style="text-align:center; font-family:monospace; font-weight:bold;">${escapeHtml(r.receipt_no || '-')}</td>
          <td style="text-align:center; font-weight:bold;">${escapeHtml(r.currency_code || '-')}</td>
          <td style="text-align:right; font-family:monospace;">${Number(r.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align:right; font-family:monospace;">${Number(r.rate || 0).toLocaleString('id-ID')}</td>
          <td style="text-align:right; font-family:monospace; font-weight:bold;">Rp ${Number(r.subtotal_idr || 0).toLocaleString('id-ID')}</td>
          <td style="text-align:center; font-weight:bold;">${escapeHtml(r.type || 'BELI')}</td>
          <td>${escapeHtml(r.teller_name || '-')}</td>
        </tr>
      `;
    }).join('');

    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast(isEn ? 'Popup blocked. Please allow popups for PDF printing.' : 'Pop-up terblokir di browser. Izinkan pop-up untuk mencetak PDF.', 'error');
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Skyline_POS_Laporan_${periodTitle}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm 8mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 8.5px; color: #000; background: #fff; margin: 0; padding: 12px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
    .brand { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }
    .subbrand { font-size: 9.5px; color: #333; margin-top: 2px; }
    .rep-title { text-align: right; }
    .rep-title h2 { margin: 0; font-size: 13px; font-weight: 800; text-transform: uppercase; }
    .rep-title p { margin: 2px 0 0 0; font-size: 9px; color: #444; }
    .summary-box { display: flex; gap: 12px; margin-bottom: 10px; }
    .kpi { border: 1px solid #94a3b8; border-radius: 4px; padding: 6px 10px; min-width: 140px; background: #f8fafc; }
    .kpi-title { font-size: 8px; text-transform: uppercase; color: #475569; font-weight: bold; }
    .kpi-val { font-size: 12px; font-weight: 800; margin-top: 2px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; font-size: 8px; }
    th { background: #f1f5f9; border: 1px solid #94a3b8; padding: 5px 3px; font-size: 8px; font-weight: 700; text-transform: uppercase; }
    td { border: 1px solid #cbd5e1; padding: 4px 3px; vertical-align: middle; }
    .tot-row { background: #f8fafc; font-weight: bold; }
    .tot-row td { border-top: 2px solid #000; padding: 6px 3px; }
    .footer { margin-top: 24px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-col { text-align: center; width: 180px; }
    .sig-line { margin-top: 45px; border-bottom: 1px solid #000; }
    .print-bar { margin-bottom: 12px; display: flex; gap: 8px; }
    .print-btn { padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; }
    @media print { .print-bar { display: none !important; } }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF (A4 Landscape)</button>
  </div>
  <div class="header">
    <div>
      <div class="brand">SKYLINE EXCHANGE</div>
      <div class="subbrand">PT SKYLINE VALAS MANDIRI &bull; Izin KUPVA BB Bank Indonesia</div>
    </div>
    <div class="rep-title">
      <h2>Laporan Database Rekapitulasi Valas</h2>
      <p>Periode: ${periodTitle} &bull; Dicetak: ${new Date().toLocaleString(isEn ? 'en-US' : 'id-ID')}</p>
    </div>
  </div>
  <div class="summary-box">
    <div class="kpi">
      <div class="kpi-title">Total Baris Transaksi</div>
      <div class="kpi-val">${totalRowsCount} Baris</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Total Volume Rupiah (IDR)</div>
      <div class="kpi-val" style="color: #047857;">Rp ${totalIdr.toLocaleString('id-ID')}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:22px;">No</th>
        <th>Tanggal</th>
        <th>Customer Name</th>
        <th>Phone</th>
        <th>No Identitas</th>
        <th>NPWP</th>
        <th>Country</th>
        <th>Occupation</th>
        <th>Gender</th>
        <th>Address</th>
        <th>Invoice No</th>
        <th>Valas</th>
        <th>Amount</th>
        <th>Rate</th>
        <th>Total (IDR)</th>
        <th>Tipe</th>
        <th>Teller</th>
      </tr>
    </thead>
    <tbody>
      ${trHtml}
      <tr class="tot-row">
        <td colspan="12" style="text-align:right; font-weight:bold;">TOTAL KESELURUHAN:</td>
        <td colspan="3" style="text-align:right; font-weight:bold; font-size:9.5px; font-family:monospace; color:#047857;">
          Rp ${totalIdr.toLocaleString('id-ID')}
        </td>
        <td colspan="2"></td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    <div class="sig-col">
      <div>Dibuat Oleh (Kasir / Teller):</div>
      <div class="sig-line"></div>
      <div style="margin-top:4px;">Nama &amp; Tanda Tangan</div>
    </div>
    <div class="sig-col">
      <div>Mengetahui (Supervisor / Direksi):</div>
      <div class="sig-line"></div>
      <div style="margin-top:4px;">Nama &amp; Tanda Tangan</div>
    </div>
  </div>
</body>
</html>`);
    printWin.document.close();
    setTimeout(() => {
      try { printWin.print(); } catch (e) {}
    }, 400);

  } catch (err) {
    showToast(isEn ? 'Failed to generate PDF report: ' + err.message : 'Gagal membuat laporan PDF: ' + err.message, 'error');
  }
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
    const lastUser = localStorage.getItem('skyline_last_username') || '';
    if (lastUser && !usernameInput.value) {
      usernameInput.value = lastUser;
    }
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
  const tellerSection = document.getElementById('teller-user-profile-section');

  if (state.user && state.token) {
    // Normalize display name
    state.user.displayName = state.user.displayName || state.user.display_name || state.user.username;
    const activeTeller = getActiveTellerName();

    if (badge) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    }
    if (nameEl) {
      nameEl.textContent = state.user.displayName ? `${state.user.displayName} (@${state.user.username})` : state.user.username;
    }
    if (roleEl) {
      roleEl.textContent = state.user.role || 'TELLER';
      roleEl.className = state.user.role === 'ADMIN'
        ? 'px-1.5 py-0.5 rounded text-[9px] bg-brand/20 text-brand font-bold border border-brand/30'
        : 'px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30';
    }

    // Role-based Section Visibility in Tab 5 Settings
    if (state.user.role === 'ADMIN') {
      if (adminSection) adminSection.classList.remove('hidden');
      if (tellerSection) tellerSection.classList.add('hidden');
      loadUsersList();
    } else {
      if (adminSection) adminSection.classList.add('hidden');
      if (tellerSection) {
        tellerSection.classList.remove('hidden');
        renderTellerProfileCard();
      }
      loadPublicCashiers();
    }

    // Synchronize active cashier on POS receipt preview and banner
    updateActiveCashierBanner();
    const tellerInput = document.getElementById('setting-default-teller');
    if (tellerInput) tellerInput.value = activeTeller;
    const rcptTeller = document.getElementById('rcpt-teller');
    if (rcptTeller) rcptTeller.textContent = activeTeller;
    const rcptSign = document.getElementById('rcpt-sign-teller');
    if (rcptSign) rcptSign.textContent = `( ${activeTeller.toUpperCase()} )`;
  } else {
    if (badge) {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
    updateActiveCashierBanner();
  }
}

function renderTellerProfileCard() {
  if (!state.user) return;
  const activeTeller = getActiveTellerName();
  const dNameEl = document.getElementById('teller-profile-display-name');
  if (dNameEl) dNameEl.textContent = activeTeller;
  const uNameEl = document.getElementById('teller-profile-username');
  if (uNameEl) uNameEl.textContent = `@${state.user.username}`;
  const roleEl = document.getElementById('teller-profile-role');
  if (roleEl) roleEl.textContent = state.user.role || 'TELLER';
}


function renderTellerReadonlyUsers(cashiers) {
  const tbody = document.getElementById('teller-readonly-users-body');
  if (!tbody) return;
  if (!cashiers || cashiers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-slate-400 font-sans">Tidak ada kasir terdaftar</td></tr>';
    return;
  }
  tbody.innerHTML = cashiers.map(c => {
    const isSelf = state.user && (state.user.username?.toLowerCase() === c.username?.toLowerCase());
    const roleBadge = c.role === 'ADMIN'
      ? '<span class="set-status set-status--brand">ADMIN</span>'
      : '<span class="set-status">TELLER</span>';
    return `
      <tr class="${isSelf ? 'set-row--self' : ''}">
        <td class="font-mono font-semibold text-slate-100">@${escapeHtml(c.username)}</td>
        <td class="text-slate-200">${escapeHtml(c.displayName || c.display_name)}</td>
        <td>${roleBadge}</td>
        <td class="text-right">
          ${isSelf
            ? '<span class="set-status set-status--ok">Akun Anda</span>'
            : '<span class="text-[13px] text-slate-400">Terdaftar</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

async function loadPublicCashiers() {
  try {
    const res = await fetch('/api/auth/cashiers');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      localStorage.setItem('skyline_pos_cached_cashiers', JSON.stringify(data.data));
      saveUsersToIndexedDB(data.data);
      renderTellerReadonlyUsers(data.data);
    }
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem('skyline_pos_cached_cashiers') || '[]');
    if (cached.length > 0) {
      renderTellerReadonlyUsers(cached);
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
      const normUser = {
        ...data.user,
        displayName: data.user.displayName || data.user.display_name || data.user.username
      };
      state.token = data.token;
      state.user = normUser;

      // Remember last username
      localStorage.setItem('skyline_last_username', username);

      if (remember) {
        localStorage.setItem('skyline_pos_token', data.token);
        localStorage.setItem('skyline_pos_user', JSON.stringify(normUser));
        sessionStorage.removeItem('skyline_pos_token');
        sessionStorage.removeItem('skyline_pos_user');
      } else {
        sessionStorage.setItem('skyline_pos_token', data.token);
        sessionStorage.setItem('skyline_pos_user', JSON.stringify(normUser));
        localStorage.removeItem('skyline_pos_token');
        localStorage.removeItem('skyline_pos_user');
      }

      hideLoginOverlay();
      showToast(isEn ? `Welcome back, ${normUser.displayName}!` : `Selamat datang, ${normUser.displayName}!`, 'success');

      await loadSettings();
      await loadRates();
      await loadReportsSummary();
      await loadHistory();
      if (normUser.role === 'ADMIN') {
        loadUsersList();
      } else {
        loadPublicCashiers();
      }
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
    loadPublicCashiers();
    showLoginOverlay();
    return false;
  }
  try {
    const res = await authFetch('/api/auth/me');
    const data = await res.json();
    if (data.success && data.user) {
      state.user = {
        ...data.user,
        displayName: data.user.displayName || data.user.display_name || data.user.username
      };
      if (localStorage.getItem('skyline_pos_token')) {
        localStorage.setItem('skyline_pos_user', JSON.stringify(state.user));
      } else {
        sessionStorage.setItem('skyline_pos_user', JSON.stringify(state.user));
      }
      hideLoginOverlay();
      return true;
    } else {
      handleLogout(true);
      return false;
    }
  } catch {
    if (!navigator.onLine && state.token && state.user) {
      state.user.displayName = state.user.displayName || state.user.display_name || state.user.username;
      hideLoginOverlay();
      return true;
    }
    loadPublicCashiers();
    showLoginOverlay();
    return false;
  }
}

function renderAdminUsersTable(users, tbody, isEn) {
  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400 font-sans">${isEn ? 'No cashier accounts registered.' : 'Belum ada akun kasir terdaftar.'}</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => {
    const isSelf = state.user && (state.user.id === u.id || state.user.userId === u.id || (state.user.username && state.user.username.toLowerCase() === u.username.toLowerCase()));
    const roleBadge = u.role === 'ADMIN'
      ? '<span class="set-status set-status--brand">ADMIN</span>'
      : '<span class="set-status">TELLER</span>';
    const dName = u.displayName || u.display_name || '-';

    return `
      <tr class="${isSelf ? 'set-row--self' : ''}">
        <td class="font-mono font-semibold text-slate-100">@${escapeHtml(u.username)}</td>
        <td class="text-slate-200">${escapeHtml(dName)}</td>
        <td>${roleBadge}</td>
        <td><div class="flex items-center justify-end gap-2">
          <button type="button" onclick="openResetPasswordModal(${u.id}, '${escapeHtml(u.username)}')" class="set-btn set-btn--secondary set-btn--sm">
            ${isEn ? 'Reset Pass' : 'Reset Sandi'}
          </button>
          ${!isSelf ? `
            <button type="button" onclick="handleDeleteUser(${u.id}, '${escapeHtml(u.username)}')" class="set-btn set-btn--danger set-btn--sm">
              ${isEn ? 'Delete' : 'Hapus'}
            </button>
          ` : `
            <span class="set-status set-status--ok">${isEn ? 'You' : 'Akun ini'}</span>
          `}
        </div></td>
      </tr>
    `;
  }).join('');
}

async function loadUsersList() {
  const tbody = document.getElementById('user-table-body');
  if (!tbody) return;
  const isEn = state.appLang === 'en';

  const cachedUsers = JSON.parse(localStorage.getItem('skyline_pos_cached_cashiers') || '[]');
  if (cachedUsers.length > 0 && tbody.children.length === 0) {
    renderAdminUsersTable(cachedUsers, tbody, isEn);
  } else if (tbody.children.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400 font-sans">${isEn ? 'Loading cashier accounts...' : 'Memuat data kasir...'}</td></tr>`;
  }

  try {
    const res = await authFetch('/api/auth/users');
    const data = await res.json();
    if (data.success && data.data) {
      localStorage.setItem('skyline_pos_cached_cashiers', JSON.stringify(data.data));
      saveUsersToIndexedDB(data.data);
      renderAdminUsersTable(data.data, tbody, isEn);
      renderTellerReadonlyUsers(data.data);
    } else {
      if (cachedUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-rose-400 font-sans">${data.message || 'Gagal memuat kasir.'}</td></tr>`;
      }
    }
  } catch (err) {
    if (cachedUsers.length > 0) {
      renderAdminUsersTable(cachedUsers, tbody, isEn);
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-rose-400 font-sans">Error: ${err.message}</td></tr>`;
    }
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
      await loadUsersList();
      await loadPublicCashiers();
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
      await loadUsersList();
      await loadPublicCashiers();
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
  initUsbUI();
  initSerialUI();
  initBridgeUI();
  ['underlying-doc-type', 'underlying-doc-no'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', updateUnderlyingStatus); el.addEventListener('change', updateUnderlyingStatus); }
  });
  initPrinterGuideModal();
  initUsbHelperModal();
  initTheme();

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
    if (state.user && state.user.role === 'ADMIN') {
      loadUsersList();
    } else {
      loadPublicCashiers();
    }
  } else {
    loadPublicCashiers();
  }
});
