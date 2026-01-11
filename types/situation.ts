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

// Layout configuration - panel order and split positions
export interface LayoutConfig {
  order: string[];
  splitX: number;
  splitY: number;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  order: ["twitter", "flight", "stocks", "news"],
  splitX: 50,
  splitY: 50,
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
  layout?: LayoutConfig;
}

// Stored state in localStorage
export interface SituationsState {
  activeSituationId: string | null;
  customSituations: SituationConfig[];
  presetLayoutOverrides?: Record<string, LayoutConfig>; // Layout overrides for preset situations
}
