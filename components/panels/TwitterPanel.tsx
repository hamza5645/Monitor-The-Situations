"use client";

import { useState, useEffect } from "react";
import { useSituation } from "@/context/SituationContext";

export default function TwitterPanel() {
  const { activeSituation } = useSituation();
  const [customHandle, setCustomHandle] = useState("");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customHandle.trim()) {
      // Sanitize: remove @ prefix and only allow alphanumeric + underscore
      const clean = customHandle.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
      if (clean) {
        window.open(`https://x.com/${clean}`, "_blank", "noopener,noreferrer");
        setCustomHandle("");
      }
    }
  };

  // Get categories and accounts from situation config
  const { accounts, categories } = activeSituation.intel;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          INTEL SOURCES
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">{currentTime}</span>
      </div>

      {/* Custom handle input */}
      <form onSubmit={handleCustomSubmit} className="px-3 py-2 border-b border-red-900/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={customHandle}
            onChange={(e) => setCustomHandle(e.target.value)}
            placeholder="Enter @handle to open..."
            className="flex-1 bg-black/30 border border-red-900/30 text-red-100 text-xs px-2 py-1.5 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
          />
          <button
            type="submit"
            className="bg-red-900/30 hover:bg-red-800/40 border border-red-900/50 text-red-400 text-xs px-3 py-1.5 rounded transition-colors"
          >
            Open
          </button>
        </div>
      </form>

      {/* Account links by category */}
      <div className="flex-1 overflow-y-auto p-3">
        {categories.map((category) => {
          const categoryAccounts = accounts.filter(a => a.category === category);
          if (categoryAccounts.length === 0) return null;

          return (
            <div key={category} className="mb-4">
              <p className="text-red-400/50 text-xs uppercase tracking-wider mb-2">{category}</p>
              <div className="grid grid-cols-2 gap-2">
                {categoryAccounts.map((account) => (
                  <a
                    key={account.handle}
                    href={`https://x.com/${account.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 hover:border-red-600/50 rounded text-xs transition-all group"
                  >
                    <span className="text-red-100 truncate group-hover:text-white">@{account.handle}</span>
                    <svg className="w-3 h-3 text-red-500/40 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-red-900/30">
        <p className="text-red-400/30 text-xs text-center">
          Click any account to open on X
        </p>
      </div>
    </div>
  );
}
