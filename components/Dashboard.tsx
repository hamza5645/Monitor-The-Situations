"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TwitterPanel from "./panels/TwitterPanel";
import FlightPanel from "./panels/FlightPanel";
import StocksPanel from "./panels/StocksPanel";
import NewsPanel from "./panels/NewsPanel";

interface PanelConfig {
  id: string;
  title: string;
  component: React.ComponentType;
}

const ALL_PANELS: PanelConfig[] = [
  { id: "twitter", title: "Intel Feed", component: TwitterPanel },
  { id: "flight", title: "Flight Radar", component: FlightPanel },
  { id: "stocks", title: "Market Data", component: StocksPanel },
  { id: "news", title: "Breaking News", component: NewsPanel },
];

const ORDER_KEY = "mts-order-v1";
const SPLIT_KEY = "mts-split-v1";

interface SplitPosition {
  splitX: number;
  splitY: number;
}

function getStoredOrder(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ORDER_KEY);
    if (stored) {
      const order = JSON.parse(stored);
      if (Array.isArray(order) && order.length === ALL_PANELS.length) {
        return order;
      }
    }
  } catch (e) {
    console.error("Error loading order:", e);
  }
  return null;
}

function saveOrder(order: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch (e) {
    console.error("Error saving order:", e);
  }
}

function getStoredSplit(): SplitPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SPLIT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading split:", e);
  }
  return null;
}

function saveSplit(split: SplitPosition) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SPLIT_KEY, JSON.stringify(split));
  } catch (e) {
    console.error("Error saving split:", e);
  }
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [panelOrder, setPanelOrder] = useState<string[]>(ALL_PANELS.map(p => p.id));
  const [isEditing, setIsEditing] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<string | null>(null);

  // Split position state (percentage-based)
  const [splitX, setSplitX] = useState(50);
  const [splitY, setSplitY] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedOrder = getStoredOrder();
    if (storedOrder) {
      setPanelOrder(storedOrder);
    }
    const storedSplit = getStoredSplit();
    if (storedSplit) {
      setSplitX(storedSplit.splitX);
      setSplitY(storedSplit.splitY);
    }
  }, []);

  // Drag handlers for reordering
  const handleDragStart = useCallback((e: React.DragEvent, panelId: string) => {
    setDraggedPanel(panelId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", panelId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, panelId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (panelId !== draggedPanel) {
      setDragOverPanel(panelId);
    }
  }, [draggedPanel]);

  const handleDragLeave = useCallback(() => {
    setDragOverPanel(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetPanelId: string) => {
    e.preventDefault();
    const sourcePanelId = e.dataTransfer.getData("text/plain");

    if (sourcePanelId && sourcePanelId !== targetPanelId) {
      setPanelOrder(prev => {
        const newOrder = [...prev];
        const sourceIndex = newOrder.indexOf(sourcePanelId);
        const targetIndex = newOrder.indexOf(targetPanelId);

        // Swap positions
        [newOrder[sourceIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[sourceIndex]];

        saveOrder(newOrder);
        return newOrder;
      });
    }

    setDraggedPanel(null);
    setDragOverPanel(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPanel(null);
    setDragOverPanel(null);
  }, []);

  // Refs to track current split values during resize
  const splitXRef = useRef(splitX);
  const splitYRef = useRef(splitY);

  // Keep refs in sync
  useEffect(() => {
    splitXRef.current = splitX;
    splitYRef.current = splitY;
  }, [splitX, splitY]);

  // Crosshair resize handler
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    setIsResizing(true);
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp between 20% and 80% to prevent panels from disappearing
      const clampedX = Math.min(80, Math.max(20, x));
      const clampedY = Math.min(80, Math.max(20, y));

      setSplitX(clampedX);
      setSplitY(clampedY);
      splitXRef.current = clampedX;
      splitYRef.current = clampedY;
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      // Save using refs to get current values
      saveSplit({ splitX: splitXRef.current, splitY: splitYRef.current });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleReset = useCallback(() => {
    const defaultOrder = ALL_PANELS.map(p => p.id);
    setPanelOrder(defaultOrder);
    setSplitX(50);
    setSplitY(50);
    saveOrder(defaultOrder);
    saveSplit({ splitX: 50, splitY: 50 });
  }, []);

  const orderedPanels = panelOrder
    .map(id => ALL_PANELS.find(p => p.id === id))
    .filter((p): p is PanelConfig => p !== null);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ height: "calc(100vh - 50px)" }}
    >
      {/* Edit controls */}
      <div className="absolute top-2 right-2 z-50 flex gap-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors ${
            isEditing
              ? "bg-red-600 border-red-500 text-white"
              : "bg-black/50 border-red-900/50 text-red-400 hover:bg-red-900/30"
          }`}
        >
          {isEditing ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Edit Layout
            </>
          )}
        </button>
        {isEditing && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border bg-black/50 border-red-900/50 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* Crosshair resize handle - only visible in edit mode */}
      {isEditing && (
        <div
          className={`crosshair-handle ${isResizing ? "resizing" : ""}`}
          style={{
            left: `calc(${splitX}% - 12px)`,
            top: `calc(${splitY}% - 12px)`,
          }}
          onMouseDown={handleResizeStart}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      )}

      {/* Panel Grid with dynamic sizing */}
      <div
        className="w-full h-full p-2 grid gap-2"
        style={{
          gridTemplateColumns: `${splitX}% 1fr`,
          gridTemplateRows: `${splitY}% 1fr`,
        }}
      >
        {orderedPanels.map((panel) => {
          const Component = panel.component;
          const isDragging = draggedPanel === panel.id;
          const isDragOver = dragOverPanel === panel.id;

          return (
            <div
              key={panel.id}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, panel.id)}
              onDragOver={(e) => handleDragOver(e, panel.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, panel.id)}
              onDragEnd={handleDragEnd}
              className={`relative transition-all duration-200 panel-wrapper min-w-0 min-h-0 ${
                isEditing ? "cursor-move editing" : ""
              } ${isDragging ? "opacity-50 scale-95" : ""} ${
                isDragOver ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black" : ""
              }`}
            >
              {isEditing && (
                <div className="absolute top-0 left-0 right-0 bg-red-900/90 text-red-100 text-xs px-3 py-1.5 z-20 flex items-center gap-2 rounded-t">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span className="font-medium">Drag to swap</span>
                </div>
              )}
              <div className={`h-full w-full overflow-hidden ${isEditing ? "pointer-events-none pt-7" : ""}`}>
                <Component />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
