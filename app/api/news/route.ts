import { NextResponse } from "next/server";

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

    return {
      title,
      source,
      url,
      publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedsParam = searchParams.get("feeds");
  const keywordsParam = searchParams.get("keywords");

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

  allArticles.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (allArticles.length === 0) {
    allArticles = FALLBACK_HEADLINES;
  }

  return NextResponse.json({
    articles: allArticles.slice(0, 75), // Return up to 75 articles for better coverage
    timestamp: Date.now(),
  }, {
    headers: {
      // Reduced cache to 60s for faster updates
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
