"use client";

import { useSituation } from "@/context/SituationContext";

export default function FlightPanel() {
  const { activeSituation } = useSituation();
  const { lat, lon, zoom } = activeSituation.flight;

  // Build ADS-B Exchange URL with situation-specific coordinates
  const adsbUrl = `https://globe.adsbexchange.com/?lat=${lat}&lon=${lon}&zoom=${zoom}&hideSidebar&hideButtons&mapDim=0.3`;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          FLIGHT RADAR
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          LIVE
        </span>
      </div>
      <div className="flex-1 iframe-container">
        <iframe
          src={adsbUrl}
          title="ADS-B Exchange Flight Radar"
          allow="fullscreen; storage-access"
          loading="lazy"
          referrerPolicy="origin"
        />
      </div>
      <div className="bg-black/50 text-[10px] text-gray-500 px-2 py-1 text-center">
        Powered by ADS-B Exchange • Military & Government Aircraft Visible
      </div>
    </div>
  );
}
