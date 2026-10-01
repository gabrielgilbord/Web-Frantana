import fs from "fs";
import { execSync } from "child_process";

const out = execSync(
  'playwright-cli eval "() => JSON.stringify((window.__frantanaImgs||[]).map((x,idx)=>({idx,w:x.w,h:x.h,alt:x.alt,data:x.full})))"',
  { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
);

const start = out.indexOf("[{");
const end = out.lastIndexOf("}]");
if (start < 0 || end < 0) {
  console.error("No JSON array found in playwright output");
  console.error(out.slice(0, 500));
  process.exit(1);
}

const json = JSON.parse(out.slice(start, end + 2));
fs.mkdirSync("public/media/gallery/frantana", { recursive: true });
fs.mkdirSync("public/media/brand", { recursive: true });

const meta = [];
json.forEach((item, i) => {
  const b64 = item.data.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(b64, "base64");
  const file = `public/media/gallery/frantana/${String(i + 1).padStart(2, "0")}.jpg`;
  fs.writeFileSync(file, buf);
  meta.push({ file, w: item.w, h: item.h, alt: item.alt, bytes: buf.length });
  console.log("wrote", file, buf.length);
});

if (json[0]) {
  const b64 = json[0].data.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(
    "public/media/brand/profile.jpg",
    Buffer.from(b64, "base64")
  );
}

fs.writeFileSync(
  "public/media/gallery/frantana/meta.json",
  JSON.stringify(meta, null, 2)
);
console.log("done", meta.length);
