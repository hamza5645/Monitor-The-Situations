import { NextResponse } from "next/server";

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

const RSS_FEEDS = [
  {
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    source: "BBC World",
  },
  {
    url: "https://feeds.reuters.com/reuters/topNews",
    source: "Reuters",
  },
];

function parseRSSItem(item: string, source: string): NewsArticle | null {
  try {
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
    const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s);
    const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s);

    if (!titleMatch || !linkMatch) return null;

    const title = titleMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '');
    const url = linkMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '');

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
      .slice(0, 10)
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

export async function GET() {
  let allArticles: NewsArticle[] = [];

  const feedPromises = RSS_FEEDS.map((feed) => fetchRSSFeed(feed.url, feed.source));
  const feedResults = await Promise.all(feedPromises);

  for (const articles of feedResults) {
    allArticles = [...allArticles, ...articles];
  }

  allArticles.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (allArticles.length === 0) {
    allArticles = FALLBACK_HEADLINES;
  }

  return NextResponse.json({
    articles: allArticles.slice(0, 20),
    timestamp: Date.now(),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
