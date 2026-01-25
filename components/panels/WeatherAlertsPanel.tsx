"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSituation } from "@/context/SituationContext";
import type { WeatherConfig } from "@/types/situation";
import type { WeatherAlert, WeatherAlertAPIResponse } from "@/types/weather";

// Default config if situation doesn't have weather config
const DEFAULT_WEATHER_CONFIG: WeatherConfig = {
  regions: {
    states: [], // Empty = nationwide
  },
  severityFilter: ["Extreme", "Severe", "Moderate"],
  includeMarine: false,
};

export default function WeatherAlertsPanel() {
  const { activeSituation } = useSituation();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const situationIdRef = useRef(activeSituation.id);

  // Use situation weather config or defaults
  const weatherConfig = activeSituation.weather || DEFAULT_WEATHER_CONFIG;

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (weatherConfig.regions?.states?.length) {
        params.set("states", weatherConfig.regions.states.join(","));
      }

      if (weatherConfig.severityFilter?.length) {
        params.set("severities", weatherConfig.severityFilter.join(","));
      }

      const response = await fetch(`/api/weather-alerts?${params}`);
      const data: WeatherAlertAPIResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setError(null);
        setAlerts(data.alerts || []);
      }
      setSecondsAgo(0);
    } catch (err) {
      console.error("Failed to fetch weather alerts:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [weatherConfig]);

  useEffect(() => {
    if (situationIdRef.current !== activeSituation.id) {
      situationIdRef.current = activeSituation.id;
      setLoading(true);
    }
    fetchAlerts();
    // Refresh every 60 seconds (weather alerts are less volatile)
    const dataInterval = setInterval(fetchAlerts, 60 * 1000);
    const tickInterval = setInterval(
      () => setSecondsAgo((prev) => prev + 1),
      1000
    );
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchAlerts, activeSituation.id]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Extreme":
        return "text-red-500";
      case "Severe":
        return "text-orange-500";
      case "Moderate":
        return "text-yellow-500";
      case "Minor":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "Extreme":
        return "bg-red-500/20 border-red-500/30";
      case "Severe":
        return "bg-orange-500/20 border-orange-500/30";
      case "Moderate":
        return "bg-yellow-500/20 border-yellow-500/30";
      case "Minor":
        return "bg-green-500/20 border-green-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

  const formatExpiry = (expires: string) => {
    const expDate = new Date(expires);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();

    if (diffMs < 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      return expDate.toLocaleDateString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    }
    if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
    return `${diffMins}m`;
  };

  // Region description for summary bar
  const regionDesc = weatherConfig.regions?.states?.length
    ? weatherConfig.regions.states.slice(0, 4).join(", ") +
      (weatherConfig.regions.states.length > 4
        ? ` +${weatherConfig.regions.states.length - 4}`
        : "")
    : "Nationwide";

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          WEATHER ALERTS
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          {secondsAgo}s ago
        </span>
      </div>

      {/* Summary bar */}
      <div className="bg-red-900/20 border-b border-red-900/30 px-3 py-2 flex justify-between text-xs">
        <span className="text-gray-400">{alerts.length} active alerts</span>
        <span className="text-gray-500">NWS • {regionDesc}</span>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Scanning weather alerts...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-red-400 text-sm mb-2">
              NWS Connection Error
            </div>
            <div className="text-gray-500 text-xs">{error}</div>
            <button
              onClick={() => {
                setLoading(true);
                fetchAlerts();
              }}
              className="mt-3 px-3 py-1 text-xs bg-red-900/30 border border-red-900/50 rounded text-red-400 hover:bg-red-900/50 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No active weather alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <a
              key={alert.id}
              href={alert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border-b border-gray-800 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Severity indicator */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center border ${getSeverityBgColor(
                    alert.severity
                  )}`}
                >
                  <span
                    className={`text-lg font-bold ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    !
                  </span>
                </div>

                {/* Alert details */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium leading-tight mb-1 ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {alert.event}
                  </div>
                  <div className="text-xs text-white mb-1 truncate">
                    {alert.areaDesc}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
                    <span>Expires: {formatExpiry(alert.expires)}</span>
                    {alert.urgency !== "Unknown" && (
                      <span>{alert.urgency}</span>
                    )}
                    {alert.certainty !== "Unknown" && (
                      <span>{alert.certainty}</span>
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
        Powered by National Weather Service
      </div>
    </div>
  );
}
