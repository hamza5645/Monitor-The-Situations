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
}

// Stored state in localStorage
export interface SituationsState {
  activeSituationId: string | null;
  customSituations: SituationConfig[];
}
