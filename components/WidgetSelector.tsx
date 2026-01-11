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
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border bg-black/50 border-red-900/50 text-red-400 hover:bg-red-900/30 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Widgets
        <span className="ml-1 px-1.5 py-0.5 bg-red-900/30 rounded text-[10px]">
          {visiblePanels.length}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-black/95 border border-red-900/50 rounded shadow-lg shadow-red-900/20 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-red-900/30 bg-red-900/10">
            <p className="text-xs text-red-100 font-medium">Select Widgets</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {visiblePanels.length}/{maxPanels} active
            </p>
          </div>

          {/* Panel List by Category */}
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(panelsByCategory).map(([category, panels]) => (
              <div key={category} className="p-2 border-b border-red-900/20 last:border-b-0">
                <p className="text-[10px] uppercase tracking-wider text-red-400/50 px-2 mb-1">
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
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded text-xs transition-colors text-left ${
                        isVisible
                          ? "bg-red-900/30 text-white"
                          : "text-red-100/70 hover:bg-red-900/20"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} ${
                        isLastPanel ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isVisible ? "bg-red-600 border-red-500" : "border-red-900/50"
                        }`}
                      >
                        {isVisible && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
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
