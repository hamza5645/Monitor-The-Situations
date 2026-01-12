// Flight panel configuration - ADS-B Exchange iframe parameters
export interface FlightConfig {
  lat: number;
  lon: number;
  zoom: number;
}

// Stock configuration
export interface StockSymbolConfig {
  symbol: string;
  name: string;
}

export interface StockGroupConfig {
  title: string;
  symbols: StockSymbolConfig[];
}

// News configuration - RSS feeds and keyword filtering
export interface NewsFeedConfig {
  url: string;
  source: string;
}

export interface NewsConfig {
  feeds: NewsFeedConfig[];
  keywords?: string[];
}

// Intel/Twitter accounts configuration
export interface IntelAccountConfig {
  handle: string;
  name: string;
  category: string;
}

export interface IntelConfig {
  accounts: IntelAccountConfig[];
  categories: string[];
}

// Earthquake panel configuration
export interface EarthquakeConfig {
  feed: "all_hour" | "all_day" | "significant_day" | "4.5_day";
  minMagnitude: number;
  focusRegion?: {
    lat: number;
    lon: number;
    radiusKm: number;
  };
}

// Weather alerts panel configuration
export interface WeatherConfig {
  regions?: {
    states?: string[]; // US state codes: ["TX", "FL", "LA"]
  };
  severityFilter?: (
    | "Extreme"
    | "Severe"
    | "Moderate"
    | "Minor"
    | "Unknown"
  )[];
  includeMarine?: boolean;
}

// Layout configuration - panel order and split positions
export interface LayoutConfig {
  order: string[];
  visiblePanels?: string[]; // Which panels are enabled (subset of all available)
  // Array of split percentages for grid dividers
  // For 2 columns: splitXs = [50] means first column is 50%
  // For 3 columns: splitXs = [33, 66] means first ends at 33%, second at 66%
  splitXs: number[];
  splitYs: number[];
  // Legacy single-split support (for backward compatibility)
  splitX?: number;
  splitY?: number;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  order: ["twitter", "flight", "stocks", "news"],
  visiblePanels: ["twitter", "flight", "stocks", "news"],
  splitXs: [50],
  splitYs: [50],
};

// Complete Situation configuration
export interface SituationConfig {
  id: string;
  name: string;
  description?: string;
  isPreset: boolean;
  createdAt?: string;
  updatedAt?: string;
  flight: FlightConfig;
  stocks: StockGroupConfig[];
  news: NewsConfig;
  intel: IntelConfig;
  earthquake?: EarthquakeConfig;
  weather?: WeatherConfig;
  layout?: LayoutConfig;
}

// Stored state in localStorage
export interface SituationsState {
  activeSituationId: string | null;
  customSituations: SituationConfig[];
  presetLayoutOverrides?: Record<string, LayoutConfig>; // Layout overrides for preset situations
}
