import fs from "fs";

const p = new URL("../src/app/globals.css", import.meta.url);
let css = fs.readFileSync(p, "utf8");
const before = css.length;
const nl = css.includes("\r\n") ? "\r\n" : "\n";

function block(...lines) {
  return lines.join(nl);
}

const marker = block(
  ".chapter--directo .chapter__blast-side > * {",
  "  position: relative;",
  "  min-height: 28svh;",
  "  overflow: hidden;",
  "}",
  "",
  ".chapter--directo .chapter__word {"
);

const insert = block(
  ".chapter--directo .chapter__blast-side > * {",
  "  position: relative;",
  "  min-height: 28svh;",
  "  overflow: hidden;",
  "}",
  "",
  "/* Retratos cuerpo entero: anclar arriba para no cortar la cara */",
  ".chapter--directo .chapter__blast img,",
  ".chapter--oficio .chapter__tile img,",
  ".chapter--firma .chapter__portrait img,",
  ".chapter--piel .piel-frame img {",
  "  object-fit: cover;",
  "  object-position: 50% 12%;",
  "}",
  "",
  ".chapter--directo .chapter__blast-side img {",
  "  object-position: 50% 8%;",
  "}",
  "",
  "/* Catch-all fotos artista (Next/Image encodea la URL) */",
  'img[src*="gallery/frantana"],',
  'img[src*="gallery%2Ffrantana"],',
  'img[src*="shot-0"],',
  'img[src*="artist-plate"],',
  'img[src*="music-atmosphere"],',
  'img[src*="brand/profile"],',
  'img[src*="brand%2Fprofile"] {',
  "  object-position: 50% 12%;",
  "}",
  "",
  ".chapter--directo .chapter__word {"
);

if (!css.includes(marker)) {
  console.error("MARKER NOT FOUND");
  process.exit(1);
}
css = css.replace(marker, insert);

const replacements = [
  [
    block(".hero-experience__plate img {", "  object-position: 50% 40%;"),
    block(".hero-experience__plate img {", "  object-position: 50% 12%;"),
  ],
  [
    block(
      ".musica-scene__atmosphere-img {",
      "  object-fit: cover;",
      "  object-position: 50% 42%;"
    ),
    block(
      ".musica-scene__atmosphere-img {",
      "  object-fit: cover;",
      "  object-position: 50% 12%;"
    ),
  ],
  [
    block(
      ".tour-agenda__atmosphere-img {",
      "  object-fit: cover;",
      "  object-position: 50% 28%;"
    ),
    block(
      ".tour-agenda__atmosphere-img {",
      "  object-fit: cover;",
      "  object-position: 50% 12%;"
    ),
  ],
  [
    block(
      ".concert-detail__atmosphere-img {",
      "  object-fit: cover;",
      "  object-position: 50% 30%;"
    ),
    block(
      ".concert-detail__atmosphere-img {",
      "  object-fit: cover;",
      "  object-position: 50% 12%;"
    ),
  ],
  [
    block(
      ".store-piece__img {",
      "  object-fit: cover;",
      "  object-position: center 18%;"
    ),
    block(
      ".store-piece__img {",
      "  object-fit: cover;",
      "  object-position: 50% 12%;"
    ),
  ],
  [
    block(
      ".concert-night__hero-img {",
      "  object-fit: cover;",
      "  object-position: 50% 35%;"
    ),
    block(
      ".concert-night__hero-img {",
      "  object-fit: cover;",
      "  object-position: 50% 12%;"
    ),
  ],
  [
    block(
      ".booking-hero__img {",
      "  object-fit: cover;",
      "  object-position: 50% 42%;"
    ),
    block(
      ".booking-hero__img {",
      "  object-fit: cover;",
      "  object-position: 50% 12%;"
    ),
  ],
  [
    block(
      ".booking-hero__img--portrait {",
      "  object-position: 50% 22%;"
    ),
    block(
      ".booking-hero__img--portrait {",
      "  object-position: 50% 8%;"
    ),
  ],
  [
    block(
      ".admin-gallery-card__preview img {",
      "  width: 100%;",
      "  height: 100%;",
      "  object-fit: cover;",
      "}"
    ),
    block(
      ".admin-gallery-card__preview img {",
      "  width: 100%;",
      "  height: 100%;",
      "  object-fit: cover;",
      "  object-position: 50% 12%;",
      "}"
    ),
  ],
];

for (const [from, to] of replacements) {
  if (!css.includes(from)) {
    console.error("MISS:\n", JSON.stringify(from.slice(0, 100)));
    process.exit(1);
  }
  css = css.replace(from, to);
  console.log("ok", from.split("{")[0].trim());
}

fs.writeFileSync(p, css);
console.log(`size ${before} -> ${css.length}`);
