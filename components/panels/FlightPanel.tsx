"use client";

import { useState } from "react";
import { useSituation } from "@/context/SituationContext";

export default function FlightPanel() {
  const { activeSituation } = useSituation();
  const { lat, lon, zoom } = activeSituation.flight;
  const [militaryOnly, setMilitaryOnly] = useState(false);

  // Build ADS-B Exchange URL with situation-specific coordinates
  // Add mil=1 parameter when military filter is enabled
  const adsbUrl = `https://globe.adsbexchange.com/?lat=${lat}&lon=${lon}&zoom=${zoom}&hideSidebar&hideButtons&mapDim=0.3${militaryOnly ? "&mil=1" : ""}`;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          FLIGHT RADAR
          <span className="live-indicator" />
        </span>
      </div>
      <div className="flex-1 iframe-container">
        <iframe
          key={militaryOnly ? "mil" : "all"}
          src={adsbUrl}
          title="ADS-B Exchange Flight Radar"
          allow="fullscreen; storage-access"
          loading="lazy"
          referrerPolicy="origin"
        />
      </div>
      <div className="bg-black/50 text-[10px] text-gray-500 px-2 py-1 flex items-center justify-between">
        <span>Powered by ADS-B Exchange</span>
        <div className="relative flex items-center bg-gray-800 rounded overflow-hidden">
          {/* Sliding indicator */}
          <div
            className="absolute h-full w-1/2 bg-red-600 rounded transition-transform duration-200 ease-out"
            style={{ transform: militaryOnly ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            onClick={() => setMilitaryOnly(false)}
            className={`relative z-10 px-3 py-0.5 font-mono text-[10px] transition-colors ${
              !militaryOnly ? "text-white" : "text-gray-400"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setMilitaryOnly(true)}
            className={`relative z-10 px-3 py-0.5 font-mono text-[10px] transition-colors ${
              militaryOnly ? "text-white" : "text-gray-400"
            }`}
          >
            MIL
          </button>
        </div>
      </div>
    </div>
  );
}
