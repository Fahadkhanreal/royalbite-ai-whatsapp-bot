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
        {/* Gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent, #C9A227, transparent)",
          }}
        />

        {/* Decorative corners */}
        <div style={{ position: "absolute", top: 40, left: 40, width: 60, height: 60, borderTop: "3px solid #C9A227", borderLeft: "3px solid #C9A227" }} />
        <div style={{ position: "absolute", top: 40, right: 40, width: 60, height: 60, borderTop: "3px solid #C9A227", borderRight: "3px solid #C9A227" }} />
        <div style={{ position: "absolute", bottom: 40, left: 40, width: 60, height: 60, borderBottom: "3px solid #C9A227", borderLeft: "3px solid #C9A227" }} />
        <div style={{ position: "absolute", bottom: 40, right: 40, width: 60, height: 60, borderBottom: "3px solid #C9A227", borderRight: "3px solid #C9A227" }} />

        {/* Crown */}
        <div style={{ fontSize: 64, marginBottom: 16 }}>👑</div>

        {/* Restaurant name */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#F8F5F0",
            marginBottom: 8,
            letterSpacing: "0.05em",
          }}
        >
          RoyalBite
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 32,
            color: "#C9A227",
            marginBottom: 24,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Premium Pakistani Restaurant
        </p>

        {/* Gold divider */}
        <div
          style={{
            width: 200,
            height: 2,
            background: "linear-gradient(90deg, transparent, #C9A227, transparent)",
            marginBottom: 24,
          }}
        />

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 48,
            color: "#A8B0B9",
            fontSize: 20,
          }}
        >
          <span>🍽️ Authentic Cuisine</span>
          <span>📱 WhatsApp Ordering</span>
          <span>📍 Karachi</span>
        </div>

        {/* Bottom gold glow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "25%",
            right: "25%",
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.4), transparent)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
