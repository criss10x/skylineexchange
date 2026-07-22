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

## SEO — aturan yang harus dijaga

- **Satu URL per halaman.** `server.js` me-301 `www.*` → domain telanjang dan
  `/apa.html` → `/apa`. Jangan menautkan versi `.html` di mana pun.

  ⚠️ **Batasan hosting:** CDN Hostinger (`Server: hcdn`) menyajikan file yang
  benar-benar ada di `public/` secara langsung, tanpa melewati Node. Jadi
  `/contact.html`, `/contactskyline.html`, dan `/index.html` tetap balas 200 di
  produksi — redirect `.html` di `server.js` hanya berlaku saat jalan lokal.
  Cara memastikan: `curl -I` URL tersebut; kalau tidak ada header
  `X-Content-Type-Options`, berarti Express memang dilewati.
  Yang menahan duplikat itu sekarang adalah tag `canonical` di tiap halaman
  (sudah benar) plus tidak adanya link internal ke versi `.html`.
  Kalau kelak ingin benar-benar hilang: pindahkan file halaman keluar dari
  `public/` (mis. ke `views/`) supaya CDN tak punya file untuk disajikan dan
  semua permintaan jatuh ke Express.
- **`/contactskyline` sengaja `noindex`** — isinya kembar dengan `/contact`, jadi
  hanya `/contact` yang boleh diindeks. Kalau membuat varian landing iklan lagi,
  beri `<meta name="robots" content="noindex, follow">` juga.
- **`/cek` dikirim dengan header `X-Robots-Tag: noindex`** — jangan di-`Disallow`
  di robots.txt, karena crawler jadi tak bisa membaca noindex-nya.
- **Route `/go?url=` sudah dihapus** (open redirect). Redirect baru harus
  menuliskan tujuannya di kode, seperti `/cek` — jangan pernah mengambil URL
  tujuan dari query string.
- **`sitemap.xml` hanya memuat URL kanonik & indexable.** Setiap menambah halaman
  baru yang layak diindeks, tambahkan di situ dan perbarui `lastmod`.
- Target keyword: **"Skyline Money Changer"** (brand + domain), didukung
  "money changer Bali" / "currency exchange Bali".

## Meta Pixel

Pixel ID aktif: **1701643450891632**. Semua logika ada di
**`public/js/pixel.js`** — itu satu-satunya tempat ID perlu diubah untuk semua
halaman. (Satu pengecualian: route `/cek` di `server.js` punya snippet sendiri,
karena halaman itu langsung berpindah sehingga pixel-nya tidak boleh ditunda.)

```bash
grep -rn "ID_LAMA" public server.js   # pastikan hanya 2 lokasi ini
```

**Event yang terkirim:**

| Kapan | Event |
|---|---|
| Setiap halaman dibuka | `PageView` |
| **Klik tombol/link WhatsApp mana pun** | `Contact` |
| `/contact` dibuka | `Lead` |
| `/contactskyline` dibuka | `ViewContent` |
| `/cek` dibuka | `Lead` |

Menambah event khusus halaman: set `window.SKYLINE_PIXEL_EVENTS` **sebelum**
memuat `pixel.js`, contohnya di `contact.html`:

```html
<script>window.SKYLINE_PIXEL_EVENTS = [["Lead", { content_name: "Contact Page" }]];</script>
<script src="/js/pixel.js?v=1" defer></script>
```

**Kenapa pixel dimuat belakangan:** pustaka Meta ±250 KB — 80% berat halaman.
`pixel.js` menjalankan stub `fbq()` seketika (semua event masuk antrean) tapi
baru mengunduh pustakanya setelah halaman selesai tampil. Antrean di-flush saat
pustaka tiba, jadi tidak ada event yang hilang — termasuk klik WhatsApp yang
terjadi sebelum pustaka termuat.

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
