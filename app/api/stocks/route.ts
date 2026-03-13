import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockGroup {
  title: string;
  stocks: StockQuote[];
}

interface StockSymbolInput {
  symbol: string;
  name: string;
}

interface StockGroupInput {
  title: string;
  symbols: StockSymbolInput[];
}

const DEFAULT_STOCK_GROUPS: StockGroupInput[] = [
  {
    title: "Major Indices",
    symbols: [
      { symbol: "^GSPC", name: "S&P 500" },
      { symbol: "^DJI", name: "Dow Jones" },
      { symbol: "^IXIC", name: "NASDAQ" },
      { symbol: "^VIX", name: "VIX (Fear)" },
    ],
  },
  {
    title: "Defense",
    symbols: [
      { symbol: "LMT", name: "Lockheed Martin" },
      { symbol: "RTX", name: "RTX Corp" },
      { symbol: "NOC", name: "Northrop" },
      { symbol: "GD", name: "General Dynamics" },
    ],
  },
  {
    title: "Crypto",
    symbols: [
      { symbol: "BTC-USD", name: "Bitcoin" },
      { symbol: "ETH-USD", name: "Ethereum" },
    ],
  },
  {
    title: "Global",
    symbols: [
      { symbol: "^FTSE", name: "FTSE 100" },
      { symbol: "^N225", name: "Nikkei 225" },
    ],
  },
];

async function fetchQuote(symbol: string, name: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || meta.chartPreviousClose || price;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      symbol: symbol.replace("^", "").replace("-USD", ""),
      name,
      price,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

const STOCKS_CACHE_TTL = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupsParam = searchParams.get("groups");
  const cacheKey = `stocks:${groupsParam || "default"}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  // Parse custom groups from query param, or use defaults
  let stockGroups: StockGroupInput[] = DEFAULT_STOCK_GROUPS;
  if (groupsParam) {
    try {
      stockGroups = JSON.parse(groupsParam) as StockGroupInput[];
    } catch {
      // If parsing fails, use defaults
      stockGroups = DEFAULT_STOCK_GROUPS;
    }
  }

  const groups: StockGroup[] = [];

  for (const group of stockGroups) {
    const stockPromises = group.symbols.map((s) => fetchQuote(s.symbol, s.name));
    const stocks = await Promise.all(stockPromises);
    const validStocks = stocks.filter((s): s is StockQuote => s !== null);

    if (validStocks.length > 0) {
      groups.push({
        title: group.title,
        stocks: validStocks,
      });
    }
  }

  const body = { groups, timestamp: Date.now() };
  setCache(cacheKey, body, STOCKS_CACHE_TTL);

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
