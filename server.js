/* Skyline Exchange - Website & POS Server
   Express server ready for Hostinger hPanel Node.js
   (listens on process.env.PORT) and local development. */
"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const compression = require("compression");
const posRoutes = require("./pos-routes");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");
app.set("trust proxy", true);

// One canonical host: www.* is a duplicate of the bare domain for crawlers.
const CANONICAL_HOST = "skylinemoneychanger.com";
app.use((req, res, next) => {
  if (req.hostname && req.hostname.toLowerCase() === "www." + CANONICAL_HOST) {
    return res.redirect(301, "https://" + CANONICAL_HOST + req.originalUrl);
  }
  next();
});

// Canonical URL redirect for static HTML files (exclude /pos and /pos/)
app.use((req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.path.endsWith(".html") && !req.path.startsWith("/pos")) {
    const clean = req.path === "/index.html" ? "/" : req.path.slice(0, -".html".length);
    const query = req.originalUrl.slice(req.path.length);
    return res.redirect(301, clean + query);
  }
  next();
});

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
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

// POS Application and API routes
app.use(posRoutes);

// Pretty URLs (/contact -> /contact.html) without a static-site generator
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
      // config.js and POS files are meant to be updated without stale caches
      if (filePath.endsWith("config.js") || filePath.endsWith(".html") || filePath.includes("pos")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (/[\\/]vendor[\\/]|[\\/]assets[\\/]/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=604800");
      } else if (/\.(css|js)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
      }
    }
  })
);

// Specific short redirects w/ pixel
app.get("/cek", (req, res) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
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

// Single-page fallback (unknown paths render the page, marked 404 for SEO)
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Skyline Exchange Website & POS running on http://localhost:${PORT}`);
});
