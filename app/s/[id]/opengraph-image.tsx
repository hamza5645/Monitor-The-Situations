import { ImageResponse } from "next/og";
import { getPresetById, PRESET_SITUATIONS } from "@/data/presetSituations";
import {
  getSituationShareDescription,
  getSituationUrl,
} from "@/lib/situationSeo";

export const alt = "Monitor the Situation";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface OpenGraphImageProps {
  params: Promise<{
    id: string;
  }>;
}

export function generateStaticParams() {
  return PRESET_SITUATIONS.map((situation) => ({
    id: situation.id,
  }));
}

export default async function Image({ params }: OpenGraphImageProps) {
  const { id } = await params;
  const situation = getPresetById(id);

  if (!situation) {
    return new Response("Not found", { status: 404 });
  }

  const url = getSituationUrl(situation.id);
  const description = getSituationShareDescription(situation);

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
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0.16) 4px)",
          }}
        />
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
        <div
          style={{
            position: "absolute",
            inset: "42px",
            border: "1px solid rgba(220,38,38,0.28)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#dc2626",
              marginRight: "12px",
              boxShadow: "0 0 12px #dc2626",
            }}
          />
          <span style={{ color: "#dc2626", fontSize: "24px", letterSpacing: "4px" }}>
            LIVE
          </span>
        </div>
        <div
          style={{
            color: "#777",
            fontSize: "24px",
            letterSpacing: "6px",
            marginBottom: "18px",
          }}
        >
          MONITOR THE SITUATION
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: situation.name.length > 18 ? "68px" : "82px",
            lineHeight: 1,
            margin: 0,
            maxWidth: "960px",
            textAlign: "center",
            textShadow: "0 0 24px rgba(220,38,38,0.45)",
          }}
        >
          {situation.name.toUpperCase()}
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: "24px",
            lineHeight: 1.35,
            margin: "32px 0 0",
            maxWidth: "920px",
            textAlign: "center",
          }}
        >
          {description}
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "38px",
          }}
        >
          {["FLIGHTS", "NEWS", "MARKETS", "INTEL"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid #3f3f46",
                color: "#a1a1aa",
                fontSize: "18px",
                letterSpacing: "2px",
                padding: "10px 18px",
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <p
          style={{
            position: "absolute",
            bottom: "30px",
            color: "#52525b",
            fontSize: "18px",
            letterSpacing: "2px",
          }}
        >
          {url}
        </p>
      </div>
    ),
    size
  );
}
