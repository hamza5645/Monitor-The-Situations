"use client";

import { useState, useEffect } from "react";

// Generate initial count outside component to avoid hydration mismatch
function getInitialCount() {
  if (typeof window === 'undefined') return 1337; // SSR fallback
  return Math.floor(Math.random() * 4500) + 500;
}

export default function MonitoringCounter() {
  const [count, setCount] = useState(getInitialCount);

  useEffect(() => {
    // Fluctuate every 3-7 seconds
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 100) - 50; // -50 to +50
        const newCount = prev + change;
        // Keep within reasonable bounds
        return Math.max(200, Math.min(10000, newCount));
      });
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75" />
      </div>
      <span className="text-xs text-gray-400">
        <span className="text-white font-bold tabular-nums">
          {count.toLocaleString()}
        </span>
        {" "}currently monitoring
      </span>
    </div>
  );
}
