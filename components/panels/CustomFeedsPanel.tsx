"use client";

import { useState, useEffect, useCallback } from "react";
import { useCustomFeeds } from "@/hooks/useCustomFeeds";

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

export default function CustomFeedsPanel() {
  const { feeds, feedsForApi, addFeed, removeFeed, hasFeeds } = useCustomFeeds();
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Form state
  const [feedUrl, setFeedUrl] = useState("");
  const [feedName, setFeedName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles when feeds change
  const fetchArticles = useCallback(async () => {
    if (feedsForApi.length === 0) {
      setArticles([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        feeds: JSON.stringify(feedsForApi),
      });
      const response = await fetch(`/api/news?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setSecondsAgo(0);
      }
    } catch (error) {
      console.error("Failed to fetch custom feeds:", error);
    } finally {
      setLoading(false);
    }
  }, [feedsForApi]);

  // Refresh on mount and periodically
  useEffect(() => {
    fetchArticles();
    const dataInterval = setInterval(fetchArticles, 30 * 1000);
    const tickInterval = setInterval(() => setSecondsAgo((p) => p + 1), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchArticles]);

  // Handle form submission
  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const url = feedUrl.trim();
    let name = feedName.trim();

    // Basic URL validation
    try {
      const parsed = new URL(url);
      if (!name) {
        name = parsed.hostname.replace(/^www\./, "");
      }
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    addFeed(url, name);
    setFeedUrl("");
    setFeedName("");
    setIsAdding(false);
  };

  // Empty state
  if (!hasFeeds && !isAdding) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header">CUSTOM FEEDS</div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-red-500/40 mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4 text-center">
            No custom feeds yet.
            <br />
            Add your own RSS sources.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-800/40
                       border border-red-900/50 text-red-400 text-sm rounded transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Your First Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <span className="flex items-center gap-2">
          CUSTOM FEEDS
          {hasFeeds && <span className="live-indicator" />}
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          {hasFeeds ? `${secondsAgo}s ago` : ""}
        </span>
      </div>

      {/* Add Feed Form */}
      <div className="px-3 py-2 border-b border-red-900/30">
        {isAdding ? (
          <form onSubmit={handleAddFeed} className="space-y-2">
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="RSS Feed URL..."
              required
              autoFocus
              className="w-full bg-black/30 border border-red-900/30 text-red-100 text-xs
                         px-2 py-1.5 rounded placeholder:text-red-900/50
                         focus:outline-none focus:border-red-600/50"
            />
            <input
              type="text"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              placeholder="Feed name (optional)..."
              className="w-full bg-black/30 border border-red-900/30 text-red-100 text-xs
                         px-2 py-1.5 rounded placeholder:text-red-900/50
                         focus:outline-none focus:border-red-600/50"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-red-900/30 hover:bg-red-800/40 border border-red-900/50
                           text-red-400 text-xs px-3 py-1.5 rounded transition-colors"
              >
                Add Feed
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setError(null);
                }}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add feed...
          </button>
        )}
      </div>

      {/* Active Feeds Bar */}
      {hasFeeds && (
        <div className="px-3 py-2 border-b border-red-900/30 overflow-x-auto">
          <div className="flex gap-2">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center gap-1.5 px-2 py-1 bg-red-950/30
                           border border-red-900/30 rounded text-xs shrink-0 group"
              >
                <span className="text-red-300 truncate max-w-[120px]">
                  {feed.source}
                </span>
                <button
                  onClick={() => removeFeed(feed.id)}
                  className="text-red-500/40 hover:text-red-400 transition-colors"
                  title="Remove feed"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto">
        {loading && articles.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            Loading articles...
          </div>
        ) : articles.length === 0 && hasFeeds ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs text-center p-4">
            No articles found.
            <br />
            Check that your feed URLs are valid RSS feeds.
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
