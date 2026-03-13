import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface RSSFeedConfig {
  url: string;
  source: string;
}

const DEFAULT_RSS_FEEDS: RSSFeedConfig[] = [
  {
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    source: "BBC World",
  },
  {
    url: "https://www.theguardian.com/world/rss",
    source: "The Guardian",
  },
];

// Decode HTML entities in RSS content
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

function parseRSSItem(item: string, source: string): NewsArticle | null {
  try {
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
    const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s);
    const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s);

    if (!titleMatch || !linkMatch) return null;

    const title = decodeHtmlEntities(titleMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, ''));
    const url = linkMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '');

    // Filter out items where title matches the source name (likely RSS channel metadata)
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedSource = source.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedSource.includes(normalizedTitle) || normalizedTitle === normalizedSource) {
      return null;
    }

    // Use a fixed old date for items without pubDate so they sort to the bottom
    // instead of getting fresh "now" timestamps that push them to the top
    const fallbackDate = "2000-01-01T00:00:00.000Z";
    return {
      title,
      source,
      url,
      publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : fallbackDate,
    };
  } catch {
    return null;
  }
}

async function fetchRSSFeed(feedUrl: string, source: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/g);
    if (!itemMatches) return [];

    const articles = itemMatches
      .slice(0, 25) // Get 25 items per feed for more coverage
      .map((item) => parseRSSItem(item, source))
      .filter((a): a is NewsArticle => a !== null);

    return articles;
  } catch (error) {
    console.error(`Error fetching ${source}:`, error);
    return [];
  }
}

const FALLBACK_HEADLINES: NewsArticle[] = [
  {
    title: "World leaders continue to monitor global developments",
    source: "Wire Services",
    url: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Markets react to geopolitical tensions",
    source: "Financial News",
    url: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "International community calls for diplomatic solutions",
    source: "World Affairs",
    url: "#",
    publishedAt: new Date().toISOString(),
  },
];

const NEWS_CACHE_TTL = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedsParam = searchParams.get("feeds");
  const keywordsParam = searchParams.get("keywords");
  const cacheKey = `news:${feedsParam || "default"}:${keywordsParam || ""}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  // Parse custom feeds from query param, or use defaults
  let feeds: RSSFeedConfig[] = DEFAULT_RSS_FEEDS;
  if (feedsParam) {
    try {
      feeds = JSON.parse(feedsParam) as RSSFeedConfig[];
    } catch {
      feeds = DEFAULT_RSS_FEEDS;
    }
  }

  // Parse keywords for filtering
  let keywords: string[] | null = null;
  if (keywordsParam) {
    try {
      keywords = JSON.parse(keywordsParam) as string[];
    } catch {
      keywords = null;
    }
  }

  let allArticles: NewsArticle[] = [];

  const feedPromises = feeds.map((feed) => fetchRSSFeed(feed.url, feed.source));
  const feedResults = await Promise.all(feedPromises);

  for (const articles of feedResults) {
    allArticles = [...allArticles, ...articles];
  }

  // Filter by keywords if provided
  if (keywords && keywords.length > 0) {
    const lowerKeywords = keywords.map((k) => k.toLowerCase());
    allArticles = allArticles.filter((article) =>
      lowerKeywords.some((kw) => article.title.toLowerCase().includes(kw))
    );
  }

  // Sort by publishedAt, with URL as tiebreaker for stable ordering
  allArticles.sort((a, b) => {
    const timeDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    // Use URL as stable tiebreaker when timestamps are equal
    return a.url.localeCompare(b.url);
  });

  if (allArticles.length === 0) {
    allArticles = FALLBACK_HEADLINES;
  }

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
