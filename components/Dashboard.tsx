"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useSyncExternalStore } from "react";
import { useSituation } from "@/context/SituationContext";
import { DEFAULT_LAYOUT } from "@/types/situation";
import { getPanelById, type PanelConfig } from "@/config/panelRegistry";
import {
  calculateGridDimensions,
  shouldShowCrosshairResize,
  getCrosshairPositions,
  normalizeSplits,
  migrateLayoutSplits,
  type CrosshairPosition,
} from "@/utils/gridCalculator";
import WidgetSelector from "./WidgetSelector";

// Hydration-safe mounted state using useSyncExternalStore
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Dashboard() {
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const { activeLayout, updateActiveLayout, activeSituationId } = useSituation();

  // Local state for editing - initialized from context
  const [panelOrder, setPanelOrder] = useState<string[]>(DEFAULT_LAYOUT.order);
  const [visiblePanels, setVisiblePanels] = useState<string[]>(
    DEFAULT_LAYOUT.visiblePanels || DEFAULT_LAYOUT.order
  );
  const [splitXs, setSplitXs] = useState<number[]>(DEFAULT_LAYOUT.splitXs);
  const [splitYs, setSplitYs] = useState<number[]>(DEFAULT_LAYOUT.splitYs);

  const [isEditing, setIsEditing] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<string | null>(null);
  const [activeCrosshair, setActiveCrosshair] = useState<{ xIndex: number; yIndex: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local state with context layout when situation changes or on mount
  useEffect(() => {
    if (activeLayout) {
      setPanelOrder(activeLayout.order);
      setVisiblePanels(activeLayout.visiblePanels || activeLayout.order);

      // Migrate from old format if needed
      const { splitXs: migratedXs, splitYs: migratedYs } = migrateLayoutSplits(
        activeLayout.splitX,
        activeLayout.splitY,
        activeLayout.splitXs,
        activeLayout.splitYs
      );
      setSplitXs(migratedXs);
      setSplitYs(migratedYs);
    }
  }, [activeLayout, activeSituationId]);

  // Calculate grid dimensions based on visible panel count
  const gridDimensions = useMemo(() => {
    return calculateGridDimensions(visiblePanels.length, splitXs, splitYs);
  }, [visiblePanels.length, splitXs, splitYs]);

  // Normalize splits when grid size changes
  useEffect(() => {
    const normalizedXs = normalizeSplits(splitXs, gridDimensions.cols);
    const normalizedYs = normalizeSplits(splitYs, gridDimensions.rows);

    if (JSON.stringify(normalizedXs) !== JSON.stringify(splitXs)) {
      setSplitXs(normalizedXs);
    }
    if (JSON.stringify(normalizedYs) !== JSON.stringify(splitYs)) {
      setSplitYs(normalizedYs);
    }
  }, [gridDimensions.cols, gridDimensions.rows, splitXs, splitYs]);

  // Check if crosshair resize should be shown
  const showCrosshairResize = shouldShowCrosshairResize(gridDimensions.cols, gridDimensions.rows);

  // Get all crosshair positions
  const crosshairPositions = useMemo(() => {
    return getCrosshairPositions(gridDimensions.cols, gridDimensions.rows, splitXs, splitYs);
  }, [gridDimensions.cols, gridDimensions.rows, splitXs, splitYs]);

  // Handle panel toggle from widget selector
  const handleTogglePanel = useCallback((panelId: string, enabled: boolean) => {
    setVisiblePanels((prev) => {
      if (enabled) {
        return [...prev, panelId];
      } else {
        return prev.filter((id) => id !== panelId);
      }
    });

    setPanelOrder((prev) => {
      if (enabled && !prev.includes(panelId)) {
        return [...prev, panelId];
      } else if (!enabled) {
        return prev.filter((id) => id !== panelId);
      }
      return prev;
    });
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
  const splitXsRef = useRef(splitXs);
  const splitYsRef = useRef(splitYs);

  // Keep refs in sync
  useEffect(() => {
    splitXsRef.current = splitXs;
    splitYsRef.current = splitYs;
  }, [splitXs, splitYs]);

  // Crosshair resize handler
  const handleResizeStart = useCallback((e: React.MouseEvent, crosshair: CrosshairPosition) => {
    e.preventDefault();
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    setActiveCrosshair({ xIndex: crosshair.xIndex, yIndex: crosshair.yIndex });
    const rect = container.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Calculate constraints based on neighboring splits
      const cols = gridDimensions.cols;
      const rows = gridDimensions.rows;

      // X constraints: must be between previous split (or 0) and next split (or 100)
      // With minimum 15% between each
      const minGap = 15;
      const prevXSplit = crosshair.xIndex > 0 ? splitXsRef.current[crosshair.xIndex - 1] : 0;
      const nextXSplit = crosshair.xIndex < cols - 2 ? splitXsRef.current[crosshair.xIndex + 1] : 100;
      const minX = prevXSplit + minGap;
      const maxX = nextXSplit - minGap;
      const clampedX = Math.min(maxX, Math.max(minX, x));

      // Y constraints: same logic
      const prevYSplit = crosshair.yIndex > 0 ? splitYsRef.current[crosshair.yIndex - 1] : 0;
      const nextYSplit = crosshair.yIndex < rows - 2 ? splitYsRef.current[crosshair.yIndex + 1] : 100;
      const minY = prevYSplit + minGap;
      const maxY = nextYSplit - minGap;
      const clampedY = Math.min(maxY, Math.max(minY, y));

      // Update the specific split index
      setSplitXs(prev => {
        const newSplits = [...prev];
        newSplits[crosshair.xIndex] = clampedX;
        splitXsRef.current = newSplits;
        return newSplits;
      });

      setSplitYs(prev => {
        const newSplits = [...prev];
        newSplits[crosshair.yIndex] = clampedY;
        splitYsRef.current = newSplits;
        return newSplits;
      });
    };

    const handleMouseUp = () => {
      setActiveCrosshair(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [gridDimensions.cols, gridDimensions.rows]);

  const handleReset = useCallback(() => {
    setPanelOrder(DEFAULT_LAYOUT.order);
    setVisiblePanels(DEFAULT_LAYOUT.visiblePanels || DEFAULT_LAYOUT.order);
    setSplitXs(DEFAULT_LAYOUT.splitXs);
    setSplitYs(DEFAULT_LAYOUT.splitYs);
  }, []);

  // Save layout to context when clicking Done
  const handleDone = useCallback(() => {
    updateActiveLayout({
      order: panelOrder.filter((id) => visiblePanels.includes(id)),
      visiblePanels,
      splitXs,
      splitYs,
    });
    setIsEditing(false);
  }, [panelOrder, visiblePanels, splitXs, splitYs, updateActiveLayout]);

  // Cancel editing and revert to saved layout
  const handleCancel = useCallback(() => {
    if (activeLayout) {
      setPanelOrder(activeLayout.order);
      setVisiblePanels(activeLayout.visiblePanels || activeLayout.order);

      const { splitXs: migratedXs, splitYs: migratedYs } = migrateLayoutSplits(
        activeLayout.splitX,
        activeLayout.splitY,
        activeLayout.splitXs,
        activeLayout.splitYs
      );
      setSplitXs(migratedXs);
      setSplitYs(migratedYs);
    }
    setIsEditing(false);
  }, [activeLayout]);

  // Filter ordered panels to only visible ones
  const orderedVisiblePanels = panelOrder
    .filter((id) => visiblePanels.includes(id))
    .map((id) => getPanelById(id))
    .filter((p): p is PanelConfig => p !== undefined);

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
            {/* Widget Selector - only visible in edit mode */}
            <WidgetSelector
              visiblePanels={visiblePanels}
              onTogglePanel={handleTogglePanel}
            />
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

      {/* Multiple crosshair resize handles - only visible in edit mode */}
      {isEditing && showCrosshairResize && crosshairPositions.map((crosshair) => {
        const isActive = activeCrosshair?.xIndex === crosshair.xIndex && activeCrosshair?.yIndex === crosshair.yIndex;
        return (
          <div
            key={`crosshair-${crosshair.xIndex}-${crosshair.yIndex}`}
            className={`crosshair-handle ${isActive ? "resizing" : ""}`}
            style={{
              left: `calc(${crosshair.x}% - 12px)`,
              top: `calc(${crosshair.y}% - 12px)`,
            }}
            onMouseDown={(e) => handleResizeStart(e, crosshair)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        );
      })}

      {/* Panel Grid with dynamic sizing */}
      <div
        className="w-full h-full p-2 grid gap-2"
        style={{
          gridTemplateColumns: gridDimensions.templateColumns,
          gridTemplateRows: gridDimensions.templateRows,
        }}
      >
        {orderedVisiblePanels.map((panel) => {
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
