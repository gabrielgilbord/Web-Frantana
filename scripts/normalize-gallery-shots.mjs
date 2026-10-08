/**
 * Normalize gallery shots to lowercase .jpg, max edge 1800, web-ready.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../public/media/gallery/frantana");

async function main() {
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  const dims = {};

  for (const file of files.sort()) {
    const abs = path.join(dir, file);
    const base = file.replace(/\.(jpe?g|png|webp)$/i, "").toLowerCase();
    const outName = `${base}.jpg`;
    const outAbs = path.join(dir, outName);
    const tmp = path.join(dir, `${base}.__tmp.jpg`);

    const meta = await sharp(abs).rotate().metadata();
    const isLandscape = (meta.width ?? 0) >= (meta.height ?? 0);
    const pipeline = sharp(abs)
      .rotate()
      .resize({
        width: isLandscape ? 2200 : 1800,
        height: isLandscape ? 1600 : undefined,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 84, mozjpeg: true });

    await pipeline.toFile(tmp);

    // Remove original if different path (case / extension)
    if (path.resolve(abs) !== path.resolve(outAbs) && fs.existsSync(abs)) {
      try {
        fs.unlinkSync(abs);
      } catch {
        /* Windows case-only rename: overwrite via tmp */
      }
    }
    // On Windows, shot-02.JPG and shot-02.jpg are the same inode — replace carefully
    if (fs.existsSync(outAbs) && path.resolve(abs) === path.resolve(outAbs)) {
      fs.renameSync(tmp, outAbs + ".new");
      fs.unlinkSync(outAbs);
      fs.renameSync(outAbs + ".new", outAbs);
    } else {
      if (fs.existsSync(outAbs)) fs.unlinkSync(outAbs);
      fs.renameSync(tmp, outAbs);
    }

    const m = await sharp(outAbs).metadata();
    dims[outName] = { width: m.width, height: m.height };
    const kb = Math.round(fs.statSync(outAbs).size / 1024);
    console.log(`✓ ${outName} ${m.width}x${m.height} ${kb}KB`);
  }

  fs.writeFileSync(path.join(dir, "shots-meta.json"), JSON.stringify(dims, null, 2));
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
