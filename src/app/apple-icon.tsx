import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — misma marca, más detalle. */
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
          background: "linear-gradient(145deg, #1a1612 0%, #14110e 55%, #2a2218 100%)",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 28,
            border: "1.5px solid rgba(196, 165, 116, 0.35)",
            background: "rgba(20, 17, 14, 0.5)",
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              color: "#c4a574",
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 1,
              marginTop: -6,
              letterSpacing: -4,
            }}
          >
            F
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
