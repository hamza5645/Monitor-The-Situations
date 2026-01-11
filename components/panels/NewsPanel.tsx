"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export default function NewsPanel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (response.ok) {
          const data = await response.json();
          setNews(data.articles || []);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate news for seamless ticker loop
  const tickerContent = [...news, ...news];

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">BREAKING NEWS</div>

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
        {news.slice(0, 10).map((item, index) => (
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
              <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
