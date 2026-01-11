"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import TwitterPanel from "./panels/TwitterPanel";
import FlightPanel from "./panels/FlightPanel";
import StocksPanel from "./panels/StocksPanel";
import NewsPanel from "./panels/NewsPanel";
import { useSituation } from "@/context/SituationContext";
import { DEFAULT_LAYOUT } from "@/types/situation";

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

// Hydration-safe mounted state using useSyncExternalStore
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Dashboard() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const { activeLayout, updateActiveLayout, activeSituationId } = useSituation();

  // Local state for editing - initialized from context
  const [panelOrder, setPanelOrder] = useState<string[]>(DEFAULT_LAYOUT.order);
  const [splitX, setSplitX] = useState(DEFAULT_LAYOUT.splitX);
  const [splitY, setSplitY] = useState(DEFAULT_LAYOUT.splitY);

  const [isEditing, setIsEditing] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local state with context layout when situation changes or on mount
  useEffect(() => {
    if (activeLayout) {
      setPanelOrder(activeLayout.order);
      setSplitX(activeLayout.splitX);
      setSplitY(activeLayout.splitY);
    }
  }, [activeLayout, activeSituationId]);

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
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleReset = useCallback(() => {
    setPanelOrder(DEFAULT_LAYOUT.order);
    setSplitX(DEFAULT_LAYOUT.splitX);
    setSplitY(DEFAULT_LAYOUT.splitY);
  }, []);

  // Save layout to context when clicking Done
  const handleDone = useCallback(() => {
    updateActiveLayout({
      order: panelOrder,
      splitX,
      splitY,
    });
    setIsEditing(false);
  }, [panelOrder, splitX, splitY, updateActiveLayout]);

  // Cancel editing and revert to saved layout
  const handleCancel = useCallback(() => {
    if (activeLayout) {
      setPanelOrder(activeLayout.order);
      setSplitX(activeLayout.splitX);
      setSplitY(activeLayout.splitY);
    }
    setIsEditing(false);
  }, [activeLayout]);

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
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border bg-black/50 border-gray-600 text-gray-400 hover:bg-gray-900/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border bg-black/50 border-red-900/50 text-red-400 hover:bg-red-900/30 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            <button
              onClick={handleDone}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border bg-red-600 border-red-500 text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border bg-black/50 border-red-900/50 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Edit Layout
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
