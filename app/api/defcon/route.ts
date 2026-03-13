import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_KEY = "defcon";
const CACHE_TTL = 900; // 15 minutes

async function fetchDefconLevel(): Promise<number> {
  try {
    // Try to scrape defconlevel.com
    const response = await fetch("https://www.defconlevel.com/current-level.php", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
      },
      next: { revalidate: 900 },
    });

    if (response.ok) {
      const html = await response.text();
      const match = html.match(/DEFCON\s*(\d)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  } catch (error) {
    console.error("Error fetching DEFCON level:", error);
  }

  // Fallback: Use VIX-based estimation
  try {
    const vixResponse = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d",
      { next: { revalidate: 900 } }
    );
    if (vixResponse.ok) {
      const data = await vixResponse.json();
      const vix = data.chart?.result?.[0]?.meta?.regularMarketPrice || 20;

      if (vix < 15) return 5;
      if (vix < 20) return 4;
      if (vix < 25) return 3;
      if (vix < 30) return 2;
      return 1;
    }
  } catch (error) {
    console.error("Error fetching VIX:", error);
  }

  return 3; // Default to elevated
}

const DEFCON_LABELS: { [key: number]: string } = {
  5: "STABLE",
  4: "GUARDED",
  3: "ELEVATED",
  2: "HIGH",
  1: "CRITICAL",
};

export async function GET() {
  const cached = getCached<{ level: number; label: string; timestamp: number }>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  }

  const level = await fetchDefconLevel();
  const body = {
    level,
    label: DEFCON_LABELS[level] || "UNKNOWN",
    timestamp: Date.now(),
  };

  setCache(CACHE_KEY, body, CACHE_TTL);

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
