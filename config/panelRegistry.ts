import TwitterPanel from "@/components/panels/TwitterPanel";
import FlightPanel from "@/components/panels/FlightPanel";
import StocksPanel from "@/components/panels/StocksPanel";
import NewsPanel from "@/components/panels/NewsPanel";
import EarthquakePanel from "@/components/panels/EarthquakePanel";

export interface PanelConfig {
  id: string;
  title: string;
  description: string;
  category: "data" | "intel" | "monitor";
  component: React.ComponentType;
}

// Centralized panel registry - all panels defined here
export const PANEL_REGISTRY: PanelConfig[] = [
  {
    id: "twitter",
    title: "Intel Feed",
    description: "Real-time intelligence sources from X/Twitter",
    category: "intel",
    component: TwitterPanel,
  },
  {
    id: "flight",
    title: "Flight Radar",
    description: "Live aircraft tracking via ADS-B Exchange",
    category: "monitor",
    component: FlightPanel,
  },
  {
    id: "stocks",
    title: "Market Data",
    description: "Live stock prices and market indicators",
    category: "data",
    component: StocksPanel,
  },
  {
    id: "news",
    title: "Breaking News",
    description: "Aggregated RSS feeds from major news sources",
    category: "data",
    component: NewsPanel,
  },
  {
    id: "earthquake",
    title: "Seismic Monitor",
    description: "Real-time earthquake data from USGS",
    category: "monitor",
    component: EarthquakePanel,
  },
];

// Helper functions
export function getPanelById(id: string): PanelConfig | undefined {
  return PANEL_REGISTRY.find((p) => p.id === id);
}

export function getPanelsByCategory(category: string): PanelConfig[] {
  return PANEL_REGISTRY.filter((p) => p.category === category);
}

export function getAllPanelIds(): string[] {
  return PANEL_REGISTRY.map((p) => p.id);
}

// Category labels for UI
export const CATEGORY_LABELS: Record<string, string> = {
  intel: "Intelligence",
  data: "Data Feeds",
  monitor: "Monitoring",
};
