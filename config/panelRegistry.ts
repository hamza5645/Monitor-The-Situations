import TwitterPanel from "@/components/panels/TwitterPanel";
import FlightPanel from "@/components/panels/FlightPanel";
import StocksPanel from "@/components/panels/StocksPanel";
import NewsPanel from "@/components/panels/NewsPanel";
import EarthquakePanel from "@/components/panels/EarthquakePanel";
import CyberThreatPanel from "@/components/panels/CyberThreatPanel";
import WeatherAlertsPanel from "@/components/panels/WeatherAlertsPanel";
import FearGreedPanel from "@/components/panels/FearGreedPanel";
import WorldClockPanel from "@/components/panels/WorldClockPanel";

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
    id: "fear-greed",
    title: "Fear & Greed",
    description: "Crypto Fear & Greed Index showing market sentiment",
    category: "data",
    component: FearGreedPanel,
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
  {
    id: "cyber",
    title: "Cyber Threats",
    description: "Real-time global cyber attack visualization",
    category: "monitor",
    component: CyberThreatPanel,
  },
  {
    id: "weather",
    title: "Weather Alerts",
    description: "Real-time NOAA weather alerts and warnings",
    category: "monitor",
    component: WeatherAlertsPanel,
  },
  {
    id: "world-clock",
    title: "World Clock",
    description: "Key geopolitical time zones",
    category: "monitor",
    component: WorldClockPanel,
  },
];

// Custom feed panel helpers
export const CUSTOM_FEED_PREFIX = "custom-feed-";

export function isCustomFeedPanelId(panelId: string): boolean {
  return panelId.startsWith(CUSTOM_FEED_PREFIX);
}

export function getCustomFeedId(panelId: string): string {
  return panelId.replace(CUSTOM_FEED_PREFIX, "");
}

export function createCustomFeedPanelId(feedId: string): string {
  return `${CUSTOM_FEED_PREFIX}${feedId}`;
}

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
