import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "RoyalBite - Premium Pakistani Restaurant"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1512 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>👑</div>
        <h1 style={{ fontSize: 72, fontWeight: 700, color: "#F8F5F0", marginBottom: 8, letterSpacing: "0.05em" }}>
          RoyalBite
        </h1>
        <p style={{ fontSize: 32, color: "#C9A227", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Premium Pakistani Restaurant
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
