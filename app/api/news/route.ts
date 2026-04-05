import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";
import { DEFAULT_SITUATION } from "@/data/presetSituations";
import { articlesFromRssXml, type NewsArticle } from "@/lib/parse-rss-xml";
import { isAllowedFeedUrl } from "@/lib/validate-feed-url";

interface RSSFeedConfig {
  url: string;
  source: string;
}

// Must match DEFAULT_SITUATION.news.feeds — default dashboard requests omit ?feeds= for CDN cache hits
const DEFAULT_RSS_FEEDS: RSSFeedConfig[] = DEFAULT_SITUATION.news.feeds;

const NEWS_CACHE_TTL = 60;
const MAX_FEEDS_PER_REQUEST = 10;
const FETCH_TIMEOUT_MS = 12_000;
const ITEMS_PER_FEED = 25;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeFeedList(raw: unknown): RSSFeedConfig[] {
  if (!Array.isArray(raw)) return [];
  const out: RSSFeedConfig[] = [];
  for (const entry of raw) {
    if (out.length >= MAX_FEEDS_PER_REQUEST) break;
    if (!entry || typeof entry !== "object") continue;
    const url = (entry as RSSFeedConfig).url;
    const source = (entry as RSSFeedConfig).source;
    if (typeof url !== "string" || typeof source !== "string") continue;
    const trimmedUrl = url.trim();
    const trimmedSource = source.trim();
    if (!trimmedUrl || !trimmedSource) continue;
    if (!isAllowedFeedUrl(trimmedUrl)) continue;
    out.push({ url: trimmedUrl, source: trimmedSource });
  }
  return out;
}

function normalizeKeywords(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const kw = raw
    .filter((k): k is string => typeof k === "string")
    .map((k) => k.trim())
    .filter(Boolean);
  return kw.length ? kw : null;
}

async function buildCacheKey(
  feeds: RSSFeedConfig[],
  keywords: string[] | null,
  isDefaultFeeds: boolean
): Promise<string> {
  if (isDefaultFeeds && !keywords?.length) {
    return "news:default:v1";
  }
  const payload = {
    feeds: [...feeds]
      .map((f) => ({ url: f.url, source: f.source }))
      .sort((a, b) => a.url.localeCompare(b.url)),
    keywords: keywords ? [...keywords].sort() : [],
  };
  const hash = await sha256Hex(JSON.stringify(payload));
  return `news:${hash}`;
}

async function fetchRSSFeed(feedUrl: string, source: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return [];

    const xml = await response.text();
    return articlesFromRssXml(xml, source, ITEMS_PER_FEED);
  } catch (error) {
    console.error(`Error fetching ${source}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedsParam = searchParams.get("feeds");
  const keywordsParam = searchParams.get("keywords");

  let feeds: RSSFeedConfig[] = DEFAULT_RSS_FEEDS;
  let isDefaultFeeds = true;

  if (feedsParam) {
    try {
      const parsed = JSON.parse(feedsParam) as unknown;
      const rawList = Array.isArray(parsed) ? parsed : [];
      const normalized = normalizeFeedList(rawList);
      if (normalized.length > 0) {
        feeds = normalized;
        isDefaultFeeds = false;
      } else if (rawList.length > 0) {
        // Client sent feeds but none passed validation (e.g. non-HTTPS URLs)
        feeds = [];
        isDefaultFeeds = false;
      }
    } catch {
      // keep defaults
    }
  }

  let keywords: string[] | null = null;
  if (keywordsParam) {
    try {
      keywords = normalizeKeywords(JSON.parse(keywordsParam) as unknown);
    } catch {
      keywords = null;
    }
  }

  const cacheKey = await buildCacheKey(feeds, keywords, isDefaultFeeds);

  const cached = getCached<{ articles: NewsArticle[]; timestamp: number }>(
    cacheKey
  );
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  let allArticles: NewsArticle[] = [];

  const feedPromises = feeds.map((feed) =>
    fetchRSSFeed(feed.url, feed.source)
  );
  const feedResults = await Promise.all(feedPromises);

  for (const articles of feedResults) {
    allArticles = [...allArticles, ...articles];
  }

  if (keywords && keywords.length > 0) {
    const lowerKeywords = keywords.map((k) => k.toLowerCase());
    allArticles = allArticles.filter((article) =>
      lowerKeywords.some((kw) => article.title.toLowerCase().includes(kw))
    );
  }

  allArticles.sort((a, b) => {
    const timeDiff =
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.url.localeCompare(b.url);
  });

  const body = {
    articles: allArticles.slice(0, 75),
    timestamp: Date.now(),
  };
  setCache(cacheKey, body, NEWS_CACHE_TTL);

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
