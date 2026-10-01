import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon F — noche + ember, tipografía editorial. */
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
          background: "#14110e",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#c4a574",
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1,
            marginTop: -1,
            letterSpacing: -1,
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size }
  );
}
