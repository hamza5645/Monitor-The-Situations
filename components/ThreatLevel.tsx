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
  const [threat, setThreat] = useState<ThreatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchThreat = async () => {
      try {
        const response = await fetch("/api/defcon");
        if (response.ok) {
          const data = await response.json();
          const threatData = THREAT_LEVELS.find(t => t.level === data.level);
          if (threatData) {
            setThreat(threatData);
            setError(false);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch threat level:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchThreat();
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
          className={`w-2 h-2 rounded-full ${loading || error || !threat ? 'bg-gray-500' : ''} ${!loading && !error && threat?.color === 'threat-stable' ? 'bg-green-500' : ''} ${!loading && !error && threat?.color === 'threat-elevated' ? 'bg-yellow-500' : ''} ${!loading && !error && threat?.color === 'threat-high' ? 'bg-orange-500' : ''} ${!loading && !error && threat?.color === 'threat-critical' ? 'bg-red-500' : ''}`}
          style={{
            animation: loading || error || !threat ? 'none' : 'pulse-dot 2s infinite',
            boxShadow: loading || error || !threat ? 'none' : `0 0 10px currentColor`
          }}
        />
        <span className={`text-xs font-bold tracking-wider ${loading ? 'text-gray-500' : error || !threat ? 'text-gray-600' : threat.color}`}>
          {loading ? "LOADING" : error || !threat ? "UNAVAILABLE" : threat.label}
        </span>
      </div>
    </div>
  );
}
