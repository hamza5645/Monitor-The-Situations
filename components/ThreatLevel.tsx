"use client";

import { useState, useEffect } from "react";

interface ThreatData {
  level: number;
  label: string;
  color: string;
}

const THREAT_LEVELS: ThreatData[] = [
  { level: 5, label: "DEFCON 5", color: "threat-stable" },
  { level: 4, label: "DEFCON 4", color: "threat-stable" },
  { level: 3, label: "DEFCON 3", color: "threat-elevated" },
  { level: 2, label: "DEFCON 2", color: "threat-high" },
  { level: 1, label: "DEFCON 1", color: "threat-critical" },
];

export default function ThreatLevel() {
  const [threat, setThreat] = useState<ThreatData>(THREAT_LEVELS[2]); // Default to ELEVATED
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreat = async () => {
      try {
        const response = await fetch("/api/defcon", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const threatData = THREAT_LEVELS.find(t => t.level === data.level) || THREAT_LEVELS[2];
          setThreat(threatData);
        }
      } catch (error) {
        console.error("Failed to fetch threat level:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreat();
    // Refresh every 60 seconds for real-time monitoring
    const interval = setInterval(fetchThreat, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500">
        THREAT LEVEL
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${loading ? 'bg-gray-500' : ''} ${!loading && threat.color === 'threat-stable' ? 'bg-green-500' : ''} ${!loading && threat.color === 'threat-elevated' ? 'bg-yellow-500' : ''} ${!loading && threat.color === 'threat-high' ? 'bg-orange-500' : ''} ${!loading && threat.color === 'threat-critical' ? 'bg-red-500' : ''}`}
          style={{
            animation: loading ? 'none' : 'pulse-dot 2s infinite',
            boxShadow: loading ? 'none' : `0 0 10px currentColor`
          }}
        />
        <span className={`text-xs font-bold tracking-wider ${loading ? 'text-gray-500' : threat.color}`}>
          {loading ? "LOADING" : threat.label}
        </span>
      </div>
    </div>
  );
}
