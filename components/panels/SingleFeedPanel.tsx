"use client";

import { useState, useEffect, useCallback } from "react";
import { useCustomFeeds, type CustomFeed } from "@/hooks/useCustomFeeds";

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

interface SingleFeedPanelProps {
  feedId: string;
}

export default function SingleFeedPanel({ feedId }: SingleFeedPanelProps) {
  const { getFeedById } = useCustomFeeds();
  const [feed, setFeed] = useState<CustomFeed | null>(null);
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Get feed details
  useEffect(() => {
    const feedData = getFeedById(feedId);
    setFeed(feedData || null);
  }, [feedId, getFeedById]);

  // Fetch articles for this feed
  const fetchArticles = useCallback(async () => {
    if (!feed) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        feeds: JSON.stringify([{ url: feed.url, source: feed.source }]),
      });
      const response = await fetch(`/api/news?${params}`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setSecondsAgo(0);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setLoading(false);
    }
  }, [feed]);

  // Refresh on mount and periodically
  useEffect(() => {
    if (feed) {
      fetchArticles();
      const dataInterval = setInterval(fetchArticles, 30 * 1000);
      const tickInterval = setInterval(() => setSecondsAgo((p) => p + 1), 1000);
      return () => {
        clearInterval(dataInterval);
        clearInterval(tickInterval);
      };
    }
  }, [feed, fetchArticles]);

  // Feed not found
  if (!feed) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header">RSS FEED</div>
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Feed not found
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <span className="flex items-center gap-2">
          {feed.source.toUpperCase()}
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          {secondsAgo}s ago
        </span>
      </div>

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto">
        {loading && articles.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs text-center p-4">
            No articles found.
            <br />
            Check that the feed URL is valid.
          </div>
        ) : (
          articles.slice(0, 40).map((item, index) => (
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
          ))
        )}
      </div>
    </div>
  );
}
