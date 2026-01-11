import { NextResponse } from "next/server";

interface Tweet {
  text: string;
  url: string;
  timestamp: string;
  handle: string;
}

// RSS bridges that might work
const RSS_SOURCES = [
  { type: "rsshub", url: (handle: string) => `https://rsshub.app/twitter/user/${handle}` },
  { type: "nitter", url: (handle: string) => `https://xcancel.com/${handle}/rss` },
  { type: "nitter2", url: (handle: string) => `https://nitter.poast.org/${handle}/rss` },
];

async function fetchTweets(handle: string): Promise<Tweet[]> {
  for (const source of RSS_SOURCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(source.url(handle), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const xml = await response.text();

      // Check if it's actually RSS/XML
      if (!xml.includes("<item") && !xml.includes("<entry")) continue;

      // Parse RSS items
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || xml.match(/<entry>[\s\S]*?<\/entry>/g);

      if (!items || items.length === 0) continue;

      const tweets: Tweet[] = items.slice(0, 15).map((item) => {
        // RSS format
        let titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
        let linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
        let pubDateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/);

        // Atom format fallback
        if (!titleMatch) titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        if (!linkMatch) {
          const atomLink = item.match(/<link[^>]*href="([^"]*)"[^>]*\/>/);
          if (atomLink) linkMatch = [atomLink[0], atomLink[1]];
        }
        if (!pubDateMatch) pubDateMatch = item.match(/<published[^>]*>([\s\S]*?)<\/published>/) ||
                                          item.match(/<updated[^>]*>([\s\S]*?)<\/updated>/);

        let text = titleMatch ? titleMatch[1].trim() : "";
        text = text.replace(/<!\[CDATA\[|\]\]>/g, "");
        text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
        text = text.replace(/<[^>]*>/g, ""); // Strip HTML tags
        text = text.replace(/\n+/g, " ").trim();
        text = text.replace(/^RT @\w+:\s*/i, ""); // Remove RT prefix
        text = text.replace(/^R to @\w+:\s*/i, ""); // Remove reply prefix

        let url = linkMatch ? linkMatch[1].trim() : "#";
        url = url.replace(/xcancel\.com|nitter\.[^/]+/g, "x.com");

        const timestamp = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

        return { text, url, timestamp, handle };
      }).filter(t => t.text.length > 0);

      if (tweets.length > 0) {
        console.log(`Successfully fetched ${tweets.length} tweets from ${source.type}`);
        return tweets;
      }
    } catch (error) {
      console.error(`Error fetching from ${source.type}:`, error);
      continue;
    }
  }

  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle") || "Reuters";

  // Sanitize handle
  const cleanHandle = handle.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");

  if (!cleanHandle) {
    return NextResponse.json({ tweets: [], error: "Invalid handle" }, { status: 400 });
  }

  const tweets = await fetchTweets(cleanHandle);

  return NextResponse.json({
    tweets,
    handle: cleanHandle,
    timestamp: Date.now(),
    source: tweets.length > 0 ? "rss" : "none",
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
