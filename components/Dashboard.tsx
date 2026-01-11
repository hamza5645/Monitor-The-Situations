"use client";

import { useState, useEffect } from "react";
import TwitterPanel from "./panels/TwitterPanel";
import FlightPanel from "./panels/FlightPanel";
import StocksPanel from "./panels/StocksPanel";
import NewsPanel from "./panels/NewsPanel";

interface PanelConfig {
  id: string;
  title: string;
  component: React.ComponentType;
}

const PANELS: PanelConfig[] = [
  { id: "twitter", title: "Intel Feed", component: TwitterPanel },
  { id: "flight", title: "Flight Radar", component: FlightPanel },
  { id: "stocks", title: "Market Data", component: StocksPanel },
  { id: "news", title: "Breaking News", component: NewsPanel },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2 grid grid-cols-1 lg:grid-cols-2 gap-2 auto-rows-fr" style={{ height: 'calc(100vh - 50px)' }}>
      {PANELS.map((panel) => {
        const Component = panel.component;
        return (
          <div key={panel.id} className="min-h-[300px] lg:min-h-0">
            <Component />
          </div>
        );
      })}
    </div>
  );
}
