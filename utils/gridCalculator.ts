export interface GridDimensions {
  cols: number;
  rows: number;
  templateColumns: string;
  templateRows: string;
}

export interface CrosshairPosition {
  x: number; // percentage
  y: number; // percentage
  xIndex: number; // which X split this controls
  yIndex: number; // which Y split this controls
}

/**
 * Calculate optimal grid dimensions for n panels
 * Strategy: Prefer wider grids (more columns) for landscape displays
 *
 * Panel count -> Grid layout:
 * 1 -> 1x1
 * 2 -> 2x1
 * 3-4 -> 2x2
 * 5-6 -> 3x2
 * 7-9 -> 3x3
 * 10-12 -> 4x3
 */
export function calculateGridDimensions(
  panelCount: number,
  splitXs: number[] = [50],
  splitYs: number[] = [50]
): GridDimensions {
  if (panelCount <= 0) {
    return { cols: 1, rows: 1, templateColumns: "1fr", templateRows: "1fr" };
  }

  let cols: number;
  let rows: number;

  if (panelCount === 1) {
    cols = 1;
    rows = 1;
  } else if (panelCount === 2) {
    cols = 2;
    rows = 1;
  } else if (panelCount <= 4) {
    cols = 2;
    rows = 2;
  } else if (panelCount <= 6) {
    cols = 3;
    rows = 2;
  } else if (panelCount <= 9) {
    cols = 3;
    rows = 3;
  } else if (panelCount <= 12) {
    cols = 4;
    rows = 3;
  } else {
    // For larger counts, calculate dynamically
    cols = Math.ceil(Math.sqrt(panelCount * 1.5)); // Favor wider grids
    rows = Math.ceil(panelCount / cols);
  }

  // Generate template strings with proper splits
  const templateColumns = generateTemplate(cols, splitXs);
  const templateRows = generateTemplate(rows, splitYs);

  return { cols, rows, templateColumns, templateRows };
}

/**
 * Generate CSS grid template string from split positions
 * splits array contains cumulative percentages where each column/row ends
 * e.g., [33, 66] means: first is 33%, second is 33% (66-33), third is 34% (100-66)
 */
function generateTemplate(count: number, splits: number[]): string {
  if (count === 1) return "1fr";

  // For grids with splits, calculate each track size from split positions
  const trackSizes: string[] = [];
  let prevSplit = 0;

  for (let i = 0; i < count; i++) {
    if (i < splits.length) {
      // Use the split value (percentage where this track ends)
      const trackEnd = splits[i];
      const trackSize = trackEnd - prevSplit;
      trackSizes.push(`${trackSize}%`);
      prevSplit = trackEnd;
    } else {
      // Last track takes remaining space
      const remaining = 100 - prevSplit;
      trackSizes.push(`${remaining}%`);
    }
  }

  return trackSizes.join(" ");
}

/**
 * Generate default split positions for a given number of columns/rows
 * Returns evenly distributed positions
 */
export function generateDefaultSplits(count: number): number[] {
  if (count <= 1) return [];

  const splits: number[] = [];
  const step = 100 / count;

  for (let i = 1; i < count; i++) {
    splits.push(Math.round(step * i));
  }

  return splits;
}

/**
 * Get crosshair positions for the grid
 * Returns array of positions where crosshairs should appear (at grid intersections)
 */
export function getCrosshairPositions(
  cols: number,
  rows: number,
  splitXs: number[],
  splitYs: number[]
): CrosshairPosition[] {
  const positions: CrosshairPosition[] = [];

  // We need at least 2 columns and 2 rows for any crosshair
  if (cols < 2 || rows < 2) return positions;

  // Create a crosshair at each intersection
  for (let xIndex = 0; xIndex < splitXs.length && xIndex < cols - 1; xIndex++) {
    for (let yIndex = 0; yIndex < splitYs.length && yIndex < rows - 1; yIndex++) {
      positions.push({
        x: splitXs[xIndex],
        y: splitYs[yIndex],
        xIndex,
        yIndex,
      });
    }
  }

  return positions;
}

/**
 * Check if crosshair resize should be enabled for this grid
 */
export function shouldShowCrosshairResize(cols: number, rows: number): boolean {
  return cols >= 2 && rows >= 2;
}

/**
 * Migrate old layout format (single splitX/splitY) to new format (arrays)
 */
export function migrateLayoutSplits(
  splitX: number | undefined,
  splitY: number | undefined,
  splitXs: number[] | undefined,
  splitYs: number[] | undefined
): { splitXs: number[]; splitYs: number[] } {
  // If new format exists, use it
  if (splitXs && splitXs.length > 0 && splitYs && splitYs.length > 0) {
    return { splitXs, splitYs };
  }

  // Migrate from old format
  return {
    splitXs: [splitX ?? 50],
    splitYs: [splitY ?? 50],
  };
}

/**
 * Ensure splits array has correct length for grid dimensions
 * Adds/removes entries as needed while preserving existing values
 */
export function normalizeSplits(
  currentSplits: number[],
  requiredCount: number
): number[] {
  const required = requiredCount - 1; // number of dividers = columns/rows - 1

  if (required <= 0) return [];

  if (currentSplits.length === required) {
    return currentSplits;
  }

  // Generate new splits based on even distribution
  const newSplits: number[] = [];
  const step = 100 / requiredCount;

  for (let i = 1; i <= required; i++) {
    // Try to preserve existing value if available
    if (i <= currentSplits.length && currentSplits[i - 1] !== undefined) {
      newSplits.push(currentSplits[i - 1]);
    } else {
      newSplits.push(Math.round(step * i));
    }
  }

  return newSplits;
}
