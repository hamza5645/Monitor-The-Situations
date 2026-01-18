import { NextResponse } from "next/server";

export type SentimentLevel = "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";

type CnnRating = "extreme fear" | "fear" | "neutral" | "greed" | "extreme greed";

const CNN_FEAR_GREED_URL = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";

export interface FearGreedData {
  value: number;
  level: SentimentLevel;
  color: string;
  previousClose: number;
  change: number;
  timestamp: number;
  error?: string;
}

function getSentimentLevel(value: number): { level: SentimentLevel; color: string } {
  if (value <= 25) {
    return { level: "Extreme Fear", color: "#ef4444" }; // red
  } else if (value <= 45) {
    return { level: "Fear", color: "#f97316" }; // orange
  } else if (value <= 55) {
    return { level: "Neutral", color: "#eab308" }; // yellow
  } else if (value <= 75) {
    return { level: "Greed", color: "#84cc16" }; // lime
  } else {
    return { level: "Extreme Greed", color: "#22c55e" }; // green
  }
}

function getSentimentFromRating(rating?: string): { level: SentimentLevel; color: string } | null {
  const normalized = rating?.toLowerCase() as CnnRating | undefined;

  switch (normalized) {
    case "extreme fear":
      return { level: "Extreme Fear", color: "#ef4444" };
    case "fear":
      return { level: "Fear", color: "#f97316" };
    case "neutral":
      return { level: "Neutral", color: "#eab308" };
    case "greed":
      return { level: "Greed", color: "#84cc16" };
    case "extreme greed":
      return { level: "Extreme Greed", color: "#22c55e" };
    default:
      return null;
  }
}

async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    // CNN Fear & Greed Index (stock market)
    const response = await fetch(CNN_FEAR_GREED_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
        "Accept": "application/json",
        "Referer": "https://money.cnn.com/data/fear-and-greed/",
        "Origin": "https://money.cnn.com",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    const fg = data?.fear_and_greed;
    if (!fg || typeof fg.score !== "number") return null;

    const value = Math.round(fg.score);
    const prevClose = typeof fg.previous_close === "number" ? Math.round(fg.previous_close) : value;
    const change = value - prevClose;
    const sentimentFromRating = getSentimentFromRating(fg.rating);
    const { level, color } = sentimentFromRating ?? getSentimentLevel(value);
    const timestamp = fg.timestamp ? Date.parse(fg.timestamp) : Date.now();

    return {
      value,
      level,
      color,
      previousClose: prevClose,
      change,
      timestamp: Number.isNaN(timestamp) ? Date.now() : timestamp,
    };
  } catch (error) {
    console.error("Error fetching Fear & Greed Index:", error);
    return null;
  }
}

export async function GET() {
  const data = await fetchFearGreedIndex();

  if (!data) {
    // Return a fallback value if fetch fails
    const { level, color } = getSentimentLevel(50);
    return NextResponse.json(
      {
        value: 50,
        level,
        color,
        previousClose: 50,
        change: 0,
        timestamp: Date.now(),
        error: "Failed to fetch live data",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
