# Design Direction: Skyline Exchange POS

## 1. Identitas Usaha & Karakter Brand
- **Nama Usaha**: Skyline Exchange
- **Jenis Usaha**: Pedagang Valuta Asing (Money Changer)
- **Lokasi**: Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali
- **Kontak/WA**: +6285-122-777-970
- **Suasana/Mood**: Terpercaya, Cepat, Modern, Transparan, Profesional (Fintech grade).

## 2. Palet Warna (Color System)
- **Brand Primary**: Turquoise `#00E2DE`
- **Surface & Backgrounds**:
  - Dark Slate Marine: `#06121e` (App background kasir)
  - Card/Panel Slate: `#0c2134` (Surface card)
  - Elevated Surface: `#13324c` (Elevated modals & inputs)
  - Border Contrast: `#1b4566`
- **High Contrast Text & Badges**:
  - Text on Turquoise: `#031720` (Bold dark text for strict WCAG AA 4.5:1+ compliance)
  - Light Text on Slate: `#f1f5f9` (Primary), `#94a3b8` (Muted), `#cbd5e1` (Secondary)
- **Status & Semantics**:
  - Beli Valas (Kasir beli valas dari customer): Emerald `#10b981`
  - Jual Valas (Kasir jual valas ke customer): Amber/Gold `#f59e0b`
  - Delivery Status: Indigo `#6366f1` / Turquoise `#00E2DE`
  - Danger/Batal: Coral Red `#ef4444`

## 3. Tipografi
- **Interface**: Inter / Plus Jakarta Sans / System UI (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Angka & Kalkulator**: Tabular numbers (`font-mono` / monospace numbers) agar angka mata uang sejajar rapi dan mudah dicek kasir.
- **Struk Thermal**: Monospace 32-kolom ESC/POS thermal receipt formatting (58mm).

## 4. Dials (antislop)
- **ENERGY**: 2 (Fokus tinggi, responsif, warna brand turquoise dipakai tegas pada elemen penting dan interaksi kasir).
- **RHYTHM**: 2 (Struktur teratur antara papan kurs, form kalkulator transaksi, keranjang valas, dan panel struk).
- **MOTION**: 1 (Animasi minimalis, transisi cepat dan fungsional agar proses kasir tidak terhambat).

## 5. Standar Format Struk 58mm Thermal
- Lebar: 32 karakter per baris
- Baris 1: Header Nama Toko (Center, Bold, Double Size)
- Baris 2: Alamat & Kontak Toko
- Baris 3: Pemisah garis putus-putus
- Baris 4: Nomor Struk, Tanggal & Jam, Tipe Transaksi
- Baris 5: Data Pelanggan (Nama, Telepon, KTP/Paspor)
- Baris 6: Rincian Tabel 4 Kolom: Valas | Jml | Kurs | Subtotal
- Baris 7: Ringkasan Total IDR, Pembayaran, Kembalian
- Baris 8: Kolom Tanda Tangan (Teller & Pelanggan, default huruf kapital)
- Baris 9: Catatan/Disclaimer hukum money changer
