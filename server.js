/* Skyline Exchange — coming soon server
   Minimal Express static server, ready for Hostinger hPanel Node.js
   (listens on process.env.PORT) and any generic Node host. */
"use strict";

const path = require("path");
const express = require("express");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");

// Security headers
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  });
  next();
});

app.use(compression());

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

// ponytail: pretty URLs (/contact -> /contact.html) without a static-site generator
const fs = require("fs");
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  let file = req.path;
  if (file.endsWith("/")) file += "index.html";
  else if (!path.extname(file)) file += ".html";
  const full = path.join(PUBLIC_DIR, file);
  if (full.startsWith(PUBLIC_DIR) && fs.existsSync(full) && fs.statSync(full).isFile()) {
    return res.sendFile(full);
  }
  next();
});

app.use(
  express.static(PUBLIC_DIR, {
    setHeaders(res, filePath) {
      // config.js is meant to be edited — never cache it hard
      if (filePath.endsWith("config.js") || filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else if (/[\\/]vendor[\\/]|[\\/]assets[\\/]/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=604800");
      } else if (/\.(css|js)$/.test(filePath)) {
        // no content hashes in filenames — keep these fresh-ish
        res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
      }
    }
  })
);

// ponytail: specific short redirects w/ pixel
app.get("/cek", (req, res) => {
  const target = "https://script.google.com/macros/s/AKfycbyPAP7FKm1qKsKgUUU15p0WSCgk9KXWem74dpbSdHJy0HGpobIV3SZJ8UR_YZn9GY4dKQ/exec?page=cek";
  res.send(`<!DOCTYPE html>
<html><head><meta http-equiv="refresh" content="0;url=${target}">
<noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript></head>
<body><script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1701643450891632');
fbq('track','Lead');
</script></body></html>`);
});

// Redirect with pixel: /go?url=https://...
app.get("/go", (req, res) => {
  const target = req.query.url || "/";
  const html = `<!DOCTYPE html>
<html><head>
  <meta http-equiv="refresh" content="0;url=${target.replace(/"/g, "&quot;")}">
  <noscript><meta http-equiv="refresh" content="0;url=${target.replace(/"/g, "&quot;")}"></noscript>
</head><body>
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1701643450891632');
fbq('track','Lead',{content_name:'Redirect',content_category:'go'});
</script>
</body></html>`;
  res.send(html);
});

// Single-page fallback (unknown paths render the page, marked 404 for SEO)
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Skyline coming-soon running on http://localhost:${PORT}`);
});
