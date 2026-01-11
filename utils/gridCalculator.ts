export interface GridDimensions {
  cols: number;
  rows: number;
  templateColumns: string;
  templateRows: string;
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
  splitX: number = 50,
  splitY: number = 50
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

  // Generate template strings
  const templateColumns = generateTemplate(cols, splitX, cols === 2);
  const templateRows = generateTemplate(rows, splitY, rows === 2);

  return { cols, rows, templateColumns, templateRows };
}

function generateTemplate(
  count: number,
  splitPercent: number,
  useSplit: boolean
): string {
  if (count === 1) return "1fr";

  if (count === 2 && useSplit) {
    // Use custom split for 2-item layouts
    return `${splitPercent}% 1fr`;
  }

  // Equal distribution for 3+ items
  return Array(count).fill("1fr").join(" ");
}

/**
 * Check if the crosshair resize should be enabled
 * Only works for 2x2 grids
 */
export function shouldShowCrosshairResize(cols: number, rows: number): boolean {
  return cols === 2 && rows === 2;
}
