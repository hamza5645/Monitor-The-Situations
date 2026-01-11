import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Monitor the Situations - Real-Time Global Monitoring Dashboard";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Red accent line at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#dc2626",
          }}
        />

        {/* Status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#dc2626",
              marginRight: "10px",
              boxShadow: "0 0 10px #dc2626",
            }}
          />
          <span style={{ color: "#dc2626", fontSize: "24px", letterSpacing: "4px" }}>
            LIVE
          </span>
        </div>

        {/* Main title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#ffffff",
            textAlign: "center",
            margin: "0",
            letterSpacing: "4px",
            textShadow: "0 0 20px rgba(220,38,38,0.5)",
          }}
        >
          MONITOR THE
        </h1>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#dc2626",
            textAlign: "center",
            margin: "0",
            letterSpacing: "4px",
          }}
        >
          SITUATIONS
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "24px",
            color: "#888888",
            marginTop: "30px",
            letterSpacing: "2px",
          }}
        >
          REAL-TIME GLOBAL MONITORING DASHBOARD
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          {["FLIGHT RADAR", "MARKETS", "NEWS", "INTEL"].map((item) => (
            <div
              key={item}
              style={{
                padding: "10px 20px",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "#666",
                fontSize: "16px",
                letterSpacing: "2px",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* URL at bottom */}
        <p
          style={{
            position: "absolute",
            bottom: "30px",
            color: "#444",
            fontSize: "18px",
            letterSpacing: "2px",
          }}
        >
          monitorthesituations.com
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
