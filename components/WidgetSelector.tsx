"use client";

import { useState, useRef, useEffect } from "react";
import { PANEL_REGISTRY, CATEGORY_LABELS, type PanelConfig } from "@/config/panelRegistry";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
          </div>
        </div>
      )}
    </div>
  );
}
