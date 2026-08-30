import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "110px",
          border: "4px solid #775a19",
        }}
      >
        <div
          style={{
            fontSize: 240,
            fontWeight: "bold",
            color: "#d4af37",
            fontFamily: "serif",
            lineHeight: 1,
            marginBottom: "10px",
          }}
        >
          A
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#fbf2ef",
            letterSpacing: "10px",
            textTransform: "uppercase",
          }}
        >
          AURA
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#d4af37",
            letterSpacing: "6px",
            textTransform: "uppercase",
            marginTop: "6px",
          }}
        >
          POS &amp; ATELIER
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
