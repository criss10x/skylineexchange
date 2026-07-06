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

// Single-page fallback (unknown paths render the page, marked 404 for SEO)
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Skyline coming-soon running on http://localhost:${PORT}`);
});
