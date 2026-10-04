/**
 * Write artist shots with NEW filenames (cache-bust vs immutable /media headers).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcDir = path.join(process.env.USERPROFILE || "", "Downloads", "Web Frantana");
const outGallery = path.join(root, "public/media/gallery/frantana");
const outBrand = path.join(root, "public/media/brand");

const SHOTS = [
  { file: "IMG_2590.JPG", out: "shot-01.jpg" },
  { file: "IMG_3048.JPG", out: "shot-02.jpg" },
  { file: "IMG_3064.JPG", out: "shot-03.jpg" },
  { file: "IMG_3065.JPG", out: "shot-04.jpg" },
  { file: "IMG_3066.JPG", out: "shot-05.jpg" },
];

async function writeJpeg(input, output, width = 1800, quality = 84) {
  await sharp(input)
    .rotate()
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(output);
  const m = await sharp(output).metadata();
  console.log(`✓ ${path.basename(output)} ${m.width}x${m.height}`);
  return m;
}

async function main() {
  fs.mkdirSync(outGallery, { recursive: true });
  const dims = {};
  for (const s of SHOTS) {
    const m = await writeJpeg(path.join(srcDir, s.file), path.join(outGallery, s.out));
    dims[s.out] = { width: m.width, height: m.height };
  }
  await writeJpeg(path.join(srcDir, "IMG_2590.JPG"), path.join(outBrand, "profile.jpg"), 1200, 85);

  // Remove old numbered cache-bust blockers (optional keep for safety — delete)
  for (let i = 1; i <= 8; i++) {
    const old = path.join(outGallery, `${String(i).padStart(2, "0")}.jpg`);
    if (fs.existsSync(old)) {
      fs.unlinkSync(old);
      console.log(`removed ${path.basename(old)}`);
    }
  }

  fs.writeFileSync(
    path.join(outGallery, "shots-meta.json"),
    JSON.stringify(dims, null, 2)
  );
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
