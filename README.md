# Skyline Exchange — Coming Soon

Halaman "coming soon" untuk **skylinemoneychanger.com** (Skyline Exchange, money changer di Bali).
Node.js + Express, zero-build, bilingual EN/ID, siap deploy ke Hostinger hPanel (Node.js app) —
dan tetap bisa di-hosting statis (isi folder `public/` saja).

## Menjalankan lokal

```bash
npm install
npm start          # http://localhost:3000
```

Server membaca `process.env.PORT` (kebutuhan hPanel), fallback ke 3000.

## Mengubah konten — edit `public/config.js`

| Yang diubah | Field |
|---|---|
| Tanggal launching (countdown) | `launchDate` — ISO 8601, `+08:00` = WITA |
| Nomor WhatsApp | `whatsapp` (digit saja) + `whatsappDisplay` |
| Instagram / Email / Google Maps | `instagram`, `instagramUrl`, `email`, `mapsUrl` |
| Lokasi singkat di kartu Maps | `location` |
| Jam operasional (opsional) | `hours` — kosongkan untuk menyembunyikan |
| Semua teks EN/ID | objek `i18n` |

Tanpa build step — simpan, refresh, selesai. `config.js` di-serve `no-cache`.

> Jika mengubah `css/styles.css` atau `js/main.js` di produksi, naikkan parameter versi
> di `index.html` (`styles.css?v=2`, `main.js?v=2`) agar cache pengunjung ter-refresh.

## Meta Pixel

Pixel ID aktif: **1701643450891632**. ID ini muncul di **6 tempat / 4 file** —
kalau ganti pixel lagi, ganti **semuanya**, jangan sebagian:

| File | Baris | Event |
|---|---|---|
| `public/index.html` | `fbq('init')` + `<noscript>` | PageView |
| `public/contact.html` | `fbq('init')` + `<noscript>` | PageView + Lead |
| `public/contactskyline.html` | `fbq('init')` + `<noscript>` | PageView + ViewContent |
| `server.js` (route `/cek`) | `fbq('init')` | Lead |
| `server.js` (route `/go`) | `fbq('init')` | Lead |

Cara cepat mengganti seluruhnya sekaligus:

```bash
grep -rn "ID_LAMA" public server.js          # cek dulu di mana saja
sed -i 's/ID_LAMA/ID_BARU/g' public/index.html public/contact.html public/contactskyline.html server.js
grep -rn "ID_LAMA" public server.js          # harus kosong
```

Meninggalkan satu ID lama = dua pixel aktif berbarengan dan data iklan jadi terpecah.

## Mengganti logo

Timpa `public/assets/logo.svg` dengan logo resmi (SVG dianjurkan, PNG juga bisa —
sesuaikan `src` di `index.html`). Wordmark teks di sebelah logo bisa dihapus dari
`index.html` (`.brand-word`) bila logo sudah memuat nama brand.

## Struktur

```
server.js              Express: static + compression + security headers + /health
public/
  index.html           Markup + SEO/OG/JSON-LD
  config.js            SEMUA konten yang bisa diedit (kontak, tanggal, copy EN/ID)
  css/styles.css       Design tokens + layout + animasi CSS
  js/main.js           Countdown, toggle bahasa, preloader, motion GSAP
  vendor/              GSAP 3.12.5 (core + ScrollTrigger), di-pin lokal
  assets/              logo, favicon, og-image
tools/og.html          Sumber og-image (render ulang: headless Chrome 1200×630)
```

## Deploy — Hostinger hPanel (Business/Cloud)

1. Push repo ini ke GitHub.
2. hPanel → **Websites → Add Website → Node.js (Web Apps)** → hubungkan repo GitHub, branch `main`.
3. Entry point / start command: `npm start` (atau `server.js`). hPanel menjalankan `npm install` otomatis dan menyuplai `PORT` via environment — server sudah membacanya.
4. Arahkan domain **skylinemoneychanger.com** ke website tersebut (ikuti wizard DNS hPanel), aktifkan **SSL Let's Encrypt** (gratis, otomatis).
5. Cek: `https://skylinemoneychanger.com` dan `https://skylinemoneychanger.com/health`.

Setelah terhubung, setiap `git push` ke `main` memicu redeploy otomatis.

### Fallback statis (tanpa Node.js)

Situs 100% statis by design: upload **isi folder `public/`** ke `public_html` lewat
File Manager/FTP hPanel — tampilan dan fungsi identik (hanya endpoint `/health` yang hilang).

## Verifikasi cepat

- `curl http://localhost:3000/health` → `{"ok":true}`
- `PORT=8123 npm start` → server pindah port (simulasi hPanel)
- Toggle EN/ID tersimpan setelah reload (localStorage)
- `prefers-reduced-motion` menonaktifkan semua animasi
