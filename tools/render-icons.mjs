// Rasterize public/assets/logo.svg into favicon + apple-touch PNGs.
// Run: node tools/render-icons.mjs
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "public", "assets", "logo.svg");
const out = (f) => path.join(root, "public", "assets", f);

// viewBox is 7800 units → intrinsic raster is already large; downscaling stays crisp
const base = sharp(src);

await base
  .clone()
  .resize(32, 32)
  .png()
  .toFile(out("favicon-32.png"));

await base
  .clone()
  .resize(160, 160)
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: "#FFFFFF" })
  .flatten({ background: "#FFFFFF" })
  .png()
  .toFile(out("apple-touch-icon.png"));

console.log("icons written: favicon-32.png (32px, transparent), apple-touch-icon.png (180px, white bg)");
