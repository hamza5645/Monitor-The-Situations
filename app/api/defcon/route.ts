import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_KEY = "defcon";
const CACHE_TTL = 900; // 15 minutes

async function fetchDefconLevel(): Promise<number | null> {
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

  return null;
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

  if (level === null) {
    return NextResponse.json(
      { error: "Failed to fetch DEFCON level" },
      { status: 502 }
    );
  }

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
