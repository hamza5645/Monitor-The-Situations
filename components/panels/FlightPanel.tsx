"use client";

export default function FlightPanel() {
  // ADS-B Exchange URL for global view with military aircraft
  // You can customize lat, lon, zoom parameters
  const adsbUrl = "https://globe.adsbexchange.com/?hideSidebar&hideButtons&mapDim=0.3";

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">FLIGHT RADAR</div>
      <div className="flex-1 iframe-container">
        <iframe
          src={adsbUrl}
          title="ADS-B Exchange Flight Radar"
          allow="fullscreen"
          loading="lazy"
        />
      </div>
      <div className="bg-black/50 text-[10px] text-gray-500 px-2 py-1 text-center">
        Powered by ADS-B Exchange • Military & Government Aircraft Visible
      </div>
    </div>
  );
}
