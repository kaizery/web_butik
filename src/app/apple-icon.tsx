import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e1b19",
          borderRadius: "40px",
          border: "2px solid #775a19",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: "bold",
            color: "#d4af37",
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          A
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#fbf2ef",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          AURA POS
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
