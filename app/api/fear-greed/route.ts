import { NextResponse } from "next/server";

export type SentimentLevel = "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";

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

async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    // Alternative.me Crypto Fear & Greed Index API (free, reliable)
    const response = await fetch(
      "https://api.alternative.me/fng/?limit=2",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data?.data?.[0]) return null;

    const current = data.data[0];
    const previous = data.data[1];

    const value = parseInt(current.value, 10);
    const prevClose = previous ? parseInt(previous.value, 10) : value;
    const change = value - prevClose;
    const { level, color } = getSentimentLevel(value);

    return {
      value,
      level,
      color,
      previousClose: prevClose,
      change,
      timestamp: Date.now(),
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
