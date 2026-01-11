"use client";

import ThreatLevel from "./ThreatLevel";
import MonitoringCounter from "./MonitoringCounter";

export default function Header() {
  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="text-red-500 font-bold text-sm tracking-widest">
          MONITOR THE SITUATIONS
        </div>
      </div>

      {/* Center: Threat Level */}
      <div className="hidden md:flex">
        <ThreatLevel />
      </div>

      {/* Right: Counter */}
      <div className="hidden sm:flex">
        <MonitoringCounter />
      </div>
    </header>
  );
}
