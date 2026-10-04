/**
 * Import artist photos + hero video from Downloads/Web Frantana
 * into public/media (keeps island/footer editorial assets untouched).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcDir = path.join(
  process.env.USERPROFILE || "",
  "Downloads",
  "Web Frantana"
);
const outGallery = path.join(root, "public/media/gallery/frantana");
const outBrand = path.join(root, "public/media/brand");
const outHero = path.join(root, "public/media/hero");

const PHOTOS = [
  "IMG_2590.JPG",
  "IMG_3048.JPG",
  "IMG_3064.JPG",
  "IMG_3065.JPG",
  "IMG_3066.JPG",
];

// Map 5 source photos → 8 gallery slots (+ profile uses 01)
const SLOT_MAP = [0, 1, 2, 3, 4, 1, 2, 0];

function findFfmpeg() {
  const candidates = [
    "ffmpeg",
    path.join(process.env.LOCALAPPDATA || "", "Microsoft/WinGet/Links/ffmpeg.exe"),
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
  ];
  for (const c of candidates) {
    const r = spawnSync(c, ["-version"], { encoding: "utf8" });
    if (r.status === 0) return c;
  }
  // search winget packages
  const wingetBase = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft",
    "WinGet",
    "Packages"
  );
  if (fs.existsSync(wingetBase)) {
    const walk = (dir, depth = 0) => {
      if (depth > 4) return null;
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (name.toLowerCase() === "ffmpeg.exe") return full;
        try {
          if (fs.statSync(full).isDirectory()) {
            const found = walk(full, depth + 1);
            if (found) return found;
          }
        } catch {
          /* skip */
        }
      }
      return null;
    };
    const found = walk(wingetBase);
    if (found) return found;
  }
  return null;
}

async function writeWebJpeg(inputPath, outputPath, { width, height, quality = 82 } = {}) {
  let pipeline = sharp(inputPath).rotate();
  if (width || height) {
    pipeline = pipeline.resize({
      width,
      height,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  await pipeline.jpeg({ quality, mozjpeg: true }).toFile(outputPath);
  const st = fs.statSync(outputPath);
  console.log(`✓ ${path.relative(root, outputPath)} (${Math.round(st.size / 1024)} KB)`);
}

async function main() {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`No encuentro carpeta: ${srcDir}`);
  }
  fs.mkdirSync(outGallery, { recursive: true });
  fs.mkdirSync(outBrand, { recursive: true });
  fs.mkdirSync(outHero, { recursive: true });

  const absPhotos = PHOTOS.map((f) => path.join(srcDir, f));
  for (const p of absPhotos) {
    if (!fs.existsSync(p)) throw new Error(`Falta foto: ${p}`);
  }

  // Gallery 01–08
  for (let i = 0; i < 8; i++) {
    const src = absPhotos[SLOT_MAP[i]];
    const dest = path.join(outGallery, `${String(i + 1).padStart(2, "0")}.jpg`);
    await writeWebJpeg(src, dest, { width: 1800, quality: 84 });
  }

  // Brand profile (portrait crop-friendly)
  await writeWebJpeg(absPhotos[0], path.join(outBrand, "profile.jpg"), {
    width: 1200,
    quality: 85,
  });

  // Hero posters from strongest full-body / stage-ish shots
  await writeWebJpeg(absPhotos[1], path.join(outHero, "hero-poster.jpg"), {
    width: 1920,
    quality: 82,
  });
  await writeWebJpeg(absPhotos[1], path.join(outHero, "hero-poster-mobile.jpg"), {
    width: 1080,
    height: 1600,
    quality: 80,
  });
  // For mobile poster prefer a tighter portrait — regenerate with cover
  await sharp(absPhotos[0])
    .rotate()
    .resize(1080, 1600, { fit: "cover", position: "attention" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(outHero, "hero-poster-mobile.jpg"));
  console.log("✓ hero-poster-mobile.jpg (cover)");

  const videoSrc = path.join(
    srcDir,
    "video-output-11198BF1-DF21-4E2E-B09B-142040454487-2.MOV"
  );
  if (!fs.existsSync(videoSrc)) throw new Error(`Falta vídeo: ${videoSrc}`);

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.warn("⚠ ffmpeg no disponible — copio MOV y dejo nota");
    fs.copyFileSync(videoSrc, path.join(outHero, "hero-source.mov"));
    return;
  }

  const outFull = path.join(outHero, "hero-cinematic.mp4");
  const out720 = path.join(outHero, "hero-cinematic-720.mp4");

  console.log("Codificando hero-cinematic.mp4…");
  let r = spawnSync(
    ffmpeg,
    [
      "-y",
      "-i",
      videoSrc,
      "-vf",
      "scale='min(1920,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      outFull,
    ],
    { stdio: "inherit" }
  );
  if (r.status !== 0) throw new Error("ffmpeg full failed");

  console.log("Codificando hero-cinematic-720.mp4…");
  r = spawnSync(
    ffmpeg,
    [
      "-y",
      "-i",
      videoSrc,
      "-vf",
      "scale='min(1280,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "26",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      out720,
    ],
    { stdio: "inherit" }
  );
  if (r.status !== 0) throw new Error("ffmpeg 720 failed");

  // Poster frame from video mid-point (overwrite desktop poster if useful)
  const posterFromVideo = path.join(outHero, "hero-poster-from-video.jpg");
  spawnSync(
    ffmpeg,
    [
      "-y",
      "-ss",
      "00:00:02",
      "-i",
      outFull,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      posterFromVideo,
    ],
    { stdio: "inherit" }
  );
  if (fs.existsSync(posterFromVideo)) {
    await writeWebJpeg(posterFromVideo, path.join(outHero, "hero-poster.jpg"), {
      width: 1920,
      quality: 82,
    });
    fs.unlinkSync(posterFromVideo);
  }

  console.log("Listo. Isla/footer (gran-canaria.jpg) sin tocar.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
