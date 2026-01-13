"use client";

import { useState, useRef, useEffect } from "react";
import { PANEL_REGISTRY, CATEGORY_LABELS, createCustomFeedPanelId, type PanelConfig } from "@/config/panelRegistry";
import { useCustomFeeds } from "@/hooks/useCustomFeeds";

interface WidgetSelectorProps {
  visiblePanels: string[];
  onTogglePanel: (panelId: string, enabled: boolean) => void;
  maxPanels?: number;
}

export default function WidgetSelector({
  visiblePanels,
  onTogglePanel,
  maxPanels = 12,
}: WidgetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [feedName, setFeedName] = useState("");
  const [feedError, setFeedError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { feeds, addFeed, removeFeed } = useCustomFeeds();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingFeed(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group panels by category
  const panelsByCategory = PANEL_REGISTRY.reduce((acc, panel) => {
    if (!acc[panel.category]) acc[panel.category] = [];
    acc[panel.category].push(panel);
    return acc;
  }, {} as Record<string, PanelConfig[]>);

  const handleToggle = (panelId: string) => {
    const isCurrentlyVisible = visiblePanels.includes(panelId);

    // Prevent removing last panel
    if (isCurrentlyVisible && visiblePanels.length <= 1) {
      return;
    }

    // Check max limit when adding
    if (!isCurrentlyVisible && visiblePanels.length >= maxPanels) {
      return;
    }

    onTogglePanel(panelId, !isCurrentlyVisible);
  };

  // Handle adding a new custom feed
  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedError(null);

    const url = feedUrl.trim();
    let name = feedName.trim();

    // Basic URL validation
    try {
      const parsed = new URL(url);
      if (!name) {
        name = parsed.hostname.replace(/^www\./, "");
      }
    } catch {
      setFeedError("Please enter a valid URL");
      return;
    }

    // Check max panel limit
    if (visiblePanels.length >= maxPanels) {
      setFeedError(`Maximum ${maxPanels} panels allowed`);
      return;
    }

    // Add the feed and get its ID
    const feedId = addFeed(url, name);
    const panelId = createCustomFeedPanelId(feedId);

    // Enable the panel
    onTogglePanel(panelId, true);

    // Reset form
    setFeedUrl("");
    setFeedName("");
    setIsAddingFeed(false);
  };

  // Handle removing a custom feed
  const handleRemoveFeed = (feedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const panelId = createCustomFeedPanelId(feedId);

    // First disable the panel
    if (visiblePanels.includes(panelId)) {
      onTogglePanel(panelId, false);
    }

    // Then remove the feed
    removeFeed(feedId);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200 ${
          isOpen
            ? "bg-red-950/50 text-red-300"
            : "text-red-400/80 hover:text-red-300 hover:bg-red-950/30"
        }`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-45" : "group-hover:rotate-90"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Widgets
        <span className="ml-0.5 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-medium tabular-nums border border-red-900/30">
          {visiblePanels.length}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-black/95 backdrop-blur-md border border-red-900/40 rounded-lg shadow-xl shadow-black/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-red-900/20 bg-gradient-to-b from-red-950/30 to-transparent">
            <p className="text-xs text-red-100 font-medium tracking-wide">Select Widgets</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              <span className="text-red-400 font-medium">{visiblePanels.length}</span>/{maxPanels} active
            </p>
          </div>

          {/* Panel List by Category */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/30 scrollbar-track-transparent">
            {Object.entries(panelsByCategory).map(([category, panels]) => (
              <div key={category} className="p-2 border-b border-red-950/30 last:border-b-0">
                <p className="text-[10px] uppercase tracking-widest text-red-500/40 font-medium px-2 mb-1.5">
                  {CATEGORY_LABELS[category] || category}
                </p>

                {panels.map((panel) => {
                  const isVisible = visiblePanels.includes(panel.id);
                  const isDisabled = !isVisible && visiblePanels.length >= maxPanels;
                  const isLastPanel = isVisible && visiblePanels.length <= 1;

                  return (
                    <button
                      key={panel.id}
                      onClick={() => handleToggle(panel.id)}
                      disabled={isDisabled || isLastPanel}
                      className={`group w-full flex items-center gap-3 px-2 py-2 rounded-md text-xs transition-all duration-150 text-left ${
                        isVisible
                          ? "bg-red-950/40 text-white"
                          : "text-red-100/60 hover:text-red-100/90 hover:bg-red-950/20"
                      } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${
                        isLastPanel ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                          isVisible
                            ? "bg-gradient-to-b from-red-500 to-red-600 shadow-sm shadow-red-950/50"
                            : "border border-red-900/40 group-hover:border-red-800/60"
                        }`}
                      >
                        {isVisible && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Panel info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{panel.title}</p>
                        <p className="text-[10px] text-gray-500 truncate">{panel.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Custom Feeds Section */}
            <div className="p-2 border-t border-red-950/30">
              <p className="text-[10px] uppercase tracking-widest text-red-500/40 font-medium px-2 mb-1.5">
                Custom RSS Feeds
              </p>

              {/* Existing custom feeds */}
              {feeds.map((feed) => {
                const panelId = createCustomFeedPanelId(feed.id);
                const isVisible = visiblePanels.includes(panelId);
                const isDisabled = !isVisible && visiblePanels.length >= maxPanels;
                const isLastPanel = isVisible && visiblePanels.length <= 1;

                return (
                  <div
                    key={feed.id}
                    className={`group w-full flex items-center gap-3 px-2 py-2 rounded-md text-xs transition-all duration-150 ${
                      isVisible
                        ? "bg-red-950/40 text-white"
                        : "text-red-100/60 hover:text-red-100/90 hover:bg-red-950/20"
                    } ${isDisabled ? "opacity-40" : ""}`}
                  >
                    {/* Checkbox - clickable */}
                    <button
                      onClick={() => handleToggle(panelId)}
                      disabled={isDisabled || isLastPanel}
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                        isVisible
                          ? "bg-gradient-to-b from-red-500 to-red-600 shadow-sm shadow-red-950/50"
                          : "border border-red-900/40 hover:border-red-800/60"
                      } ${isDisabled || isLastPanel ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {isVisible && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Feed info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{feed.source}</p>
                      <p className="text-[10px] text-gray-500 truncate">{feed.url}</p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleRemoveFeed(feed.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-400 transition-all"
                      title="Remove feed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Add Feed Form */}
              {isAddingFeed ? (
                <form onSubmit={handleAddFeed} className="mt-2 space-y-2 px-2">
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
                  {feedError && <p className="text-red-500 text-[10px]">{feedError}</p>}
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
                        setIsAddingFeed(false);
                        setFeedError(null);
                        setFeedUrl("");
                        setFeedName("");
                      }}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Add Feed Button */
                <button
                  onClick={() => setIsAddingFeed(true)}
                  disabled={visiblePanels.length >= maxPanels}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs transition-all duration-150 ${
                    visiblePanels.length >= maxPanels
                      ? "text-red-900/50 cursor-not-allowed"
                      : "text-red-400/60 hover:text-red-400 hover:bg-red-950/20"
                  }`}
                >
                  <div className="w-4 h-4 rounded border border-dashed border-red-900/40 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span>Add RSS Feed...</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
