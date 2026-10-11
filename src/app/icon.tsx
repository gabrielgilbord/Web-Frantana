import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const wordmarkSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/media/brand/frantana-wordmark.png")
).toString("base64")}`;

/** Favicon: wordmark Frantana en negro sobre blanco. */
export default function Icon() {
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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wordmarkSrc}
          alt=""
          width={28}
          height={8}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
