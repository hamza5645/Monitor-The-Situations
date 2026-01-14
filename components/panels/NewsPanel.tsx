"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSituation } from "@/context/SituationContext";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const published = new Date(dateString);
  const diffMs = now.getTime() - published.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NewsPanel() {
  const { activeSituation } = useSituation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const situationIdRef = useRef(activeSituation.id);

  const fetchNews = useCallback(async () => {
    try {
      // Pass situation-specific feeds and keywords to API
      const params = new URLSearchParams({
        feeds: JSON.stringify(activeSituation.news.feeds),
      });
      if (activeSituation.news.keywords && activeSituation.news.keywords.length > 0) {
        params.set("keywords", JSON.stringify(activeSituation.news.keywords));
      }
      const response = await fetch(`/api/news?${params}`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const newArticles: NewsItem[] = data.articles || [];
        // Merge with existing articles, preserving original publishedAt timestamps
        // This prevents the "X seconds ago" from resetting for the same articles
        setNews((prevNews) => {
          // Create a map of existing articles by URL for quick lookup
          const existingByUrl = new Map<string, NewsItem>();
          for (const article of prevNews) {
            existingByUrl.set(article.url, article);
          }

          // Merge: use existing publishedAt if article already exists
          const mergedArticles = newArticles.map((newArticle) => {
            const existing = existingByUrl.get(newArticle.url);
            if (existing) {
              // Preserve the original timestamp for known articles
              return { ...newArticle, publishedAt: existing.publishedAt };
            }
            return newArticle;
          });

          // Only reset counter if the first headline actually changed
          const firstNewTitle = mergedArticles[0]?.title;
          const firstOldTitle = prevNews[0]?.title;
          if (firstNewTitle !== firstOldTitle) {
            setSecondsAgo(0);
          }
          return mergedArticles;
        });
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  }, [activeSituation.news]);

  // Re-fetch when situation changes
  useEffect(() => {
    if (situationIdRef.current !== activeSituation.id) {
      situationIdRef.current = activeSituation.id;
      setLoading(true);
      // Clear news to avoid preserving timestamps from a different situation
      setNews([]);
    }
    fetchNews();
    // Refresh every 20 seconds for real-time breaking news updates
    const dataInterval = setInterval(fetchNews, 20 * 1000);
    // Update seconds counter every second
    const tickInterval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchNews, activeSituation.id]);

  // Duplicate news for seamless ticker loop
  const tickerContent = [...news, ...news];

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          BREAKING NEWS
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          {secondsAgo}s ago
        </span>
      </div>

      {/* Ticker */}
      <div className="ticker-wrapper bg-red-900/20 border-b border-red-900/30 py-2">
        {loading ? (
          <div className="text-center text-gray-500 text-xs">Loading headlines...</div>
        ) : news.length > 0 ? (
          <div className="ticker-content">
            {tickerContent.map((item, index) => (
              <span key={index} className="inline-flex items-center mx-8">
                <span className="text-red-500 mr-2">●</span>
                <span className="text-white text-sm font-medium">{item.title}</span>
                <span className="text-gray-500 text-xs ml-2">— {item.source}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs">No headlines available</div>
        )}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto">
        {news.slice(0, 40).map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 border-b border-gray-800 hover:bg-white/5 transition-colors"
          >
            <div className="text-sm text-white leading-tight mb-1">
              {item.title}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>{item.source}</span>
              <span>{formatTimeAgo(item.publishedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
