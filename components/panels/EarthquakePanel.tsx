"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSituation } from "@/context/SituationContext";
import type { EarthquakeConfig } from "@/types/situation";
import type { Earthquake, EarthquakeAPIResponse } from "@/types/earthquake";

// Default config if situation doesn't have earthquake config
const DEFAULT_EARTHQUAKE_CONFIG: EarthquakeConfig = {
  feed: "all_hour",
  minMagnitude: 2.5,
};

export default function EarthquakePanel() {
  const { activeSituation } = useSituation();
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const situationIdRef = useRef(activeSituation.id);

  // Use situation earthquake config or defaults
  const earthquakeConfig = activeSituation.earthquake || DEFAULT_EARTHQUAKE_CONFIG;

  const fetchEarthquakes = useCallback(async () => {
    try {
      // Only send params if non-default to maximize cache hits
      const isDefault = activeSituation.id === "default" && !earthquakeConfig.focusRegion;
      const params = new URLSearchParams();

      if (!isDefault) {
        params.set("feed", earthquakeConfig.feed);
        params.set("minMag", earthquakeConfig.minMagnitude.toString());

        // Add region filtering if configured
        if (earthquakeConfig.focusRegion) {
          params.set("focusLat", earthquakeConfig.focusRegion.lat.toString());
          params.set("focusLon", earthquakeConfig.focusRegion.lon.toString());
          params.set("radiusKm", earthquakeConfig.focusRegion.radiusKm.toString());
        }
      }

      const queryString = params.toString();
      const response = await fetch(`/api/earthquake${queryString ? `?${queryString}` : ""}`);
      const data: EarthquakeAPIResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setError(null);
        setEarthquakes(data.earthquakes || []);
      }
      setSecondsAgo(0);
    } catch (err) {
      console.error("Failed to fetch earthquakes:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [earthquakeConfig, activeSituation.id]);

  useEffect(() => {
    if (situationIdRef.current !== activeSituation.id) {
      situationIdRef.current = activeSituation.id;
      setLoading(true);
    }
    fetchEarthquakes();
    // Refresh every 30 seconds
    const dataInterval = setInterval(fetchEarthquakes, 30 * 1000);
    const tickInterval = setInterval(() => setSecondsAgo((prev) => prev + 1), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchEarthquakes, activeSituation.id]);

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 6.0) return "text-red-500";
    if (mag >= 4.0) return "text-orange-500";
    return "text-yellow-500";
  };

  const getMagnitudeBgColor = (mag: number) => {
    if (mag >= 6.0) return "bg-red-500/20 border-red-500/30";
    if (mag >= 4.0) return "bg-orange-500/20 border-orange-500/30";
    return "bg-yellow-500/20 border-yellow-500/30";
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          SEISMIC MONITOR
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          {secondsAgo}s ago
        </span>
      </div>

      {/* Summary bar */}
      <div className="bg-red-900/20 border-b border-red-900/30 px-3 py-2 flex justify-between text-xs">
        <span className="text-gray-400">
          {earthquakes.length} events
        </span>
        <span className="text-gray-500">
          USGS • {earthquakeConfig.feed.replace("_", " ")}
        </span>
      </div>

      {/* Earthquake list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Scanning seismic activity...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-red-400 text-sm mb-2">USGS Connection Error</div>
            <div className="text-gray-500 text-xs">{error}</div>
            <button
              onClick={() => { setLoading(true); fetchEarthquakes(); }}
              className="mt-3 px-3 py-1 text-xs bg-red-900/30 border border-red-900/50 rounded text-red-400 hover:bg-red-900/50 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : earthquakes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No seismic events detected
          </div>
        ) : (
          earthquakes.map((quake) => (
            <a
              key={quake.id}
              href={quake.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border-b border-gray-800 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Magnitude indicator */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded flex items-center justify-center border ${getMagnitudeBgColor(
                    quake.magnitude
                  )}`}
                >
                  <span
                    className={`text-lg font-bold font-mono ${getMagnitudeColor(
                      quake.magnitude
                    )}`}
                  >
                    {quake.magnitude.toFixed(1)}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white leading-tight mb-1 truncate">
                    {quake.place}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
                    <span>{formatTime(quake.time)}</span>
                    <span>Depth: {quake.depth.toFixed(1)}km</span>
                    {quake.tsunami && (
                      <span className="text-red-400 font-bold animate-pulse">
                        TSUNAMI ALERT
                      </span>
                    )}
                    {quake.felt && quake.felt > 0 && (
                      <span>{quake.felt} felt reports</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-black/50 text-[10px] text-gray-500 px-2 py-1 text-center border-t border-gray-800">
        Powered by USGS Earthquake Hazards Program
      </div>
    </div>
  );
}
