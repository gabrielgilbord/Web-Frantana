import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const wordmarkSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/media/brand/frantana-wordmark.png")
).toString("base64")}`;

/** Apple touch icon: wordmark Frantana en negro sobre blanco. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 36,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wordmarkSrc}
          alt=""
          width={150}
          height={44}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
