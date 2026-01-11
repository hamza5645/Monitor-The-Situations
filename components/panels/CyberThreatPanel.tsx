"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ThreatData {
  id: string;
  srcLat: number;
  srcLng: number;
  dstLat: number;
  dstLng: number;
  srcCountry: string;
  dstCountry: string;
  threatType: string;
  timestamp: number;
}

interface ThreatResponse {
  success: boolean;
  threats: ThreatData[];
  timestamp: number;
  source: string;
}

// Map lat/lng to canvas coordinates (simple equirectangular projection)
function latLngToCanvas(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export default function CyberThreatPanel() {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [stats, setStats] = useState({ total: 0, perSecond: 0 });
  const [dataSource, setDataSource] = useState<string>("loading");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const threatsRef = useRef<ThreatData[]>([]);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const processedMapRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef<(() => void) | null>(null);

  const fetchThreats = useCallback(async () => {
    try {
      const res = await fetch("/api/cyber-threats");
      const data: ThreatResponse = await res.json();
      if (data.success) {
        // Add new threats to existing ones, keep last 50
        setThreats((prev) => {
          const combined = [...data.threats, ...prev].slice(0, 50);
          threatsRef.current = combined;
          return combined;
        });
        setStats({
          total: data.threats.length,
          perSecond: Math.round(data.threats.length / 10),
        });
        setDataSource(data.source || "unknown");
      }
    } catch (error) {
      console.error("Failed to fetch threats:", error);
    }
  }, []);

  // Load map image on mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      mapImageRef.current = img;
    };
    img.onerror = () => {
      console.error("Failed to load map image");
    };
    img.src = "/world-map-dark.png";
  }, []);

  // Draw the threat map on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const now = Date.now();

    // Clear canvas with dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Draw the world map image if loaded
    if (mapImageRef.current) {
      // Check if we need to process the map (first time or size changed)
      if (
        !processedMapRef.current ||
        processedMapRef.current.width !== width ||
        processedMapRef.current.height !== height
      ) {
        // Create and cache the processed map
        const offscreen = document.createElement("canvas");
        offscreen.width = width;
        offscreen.height = height;
        const offCtx = offscreen.getContext("2d");

        if (offCtx) {
          // Draw the map
          offCtx.drawImage(mapImageRef.current, 0, 0, width, height);

          // Get image data and invert colors for dark theme
          const imageData = offCtx.getImageData(0, 0, width, height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            // Invert and tint with dark green/cyan for ops-center look
            const gray = data[i]; // Use red channel (grayscale image)
            const inverted = 255 - gray;

            // Make continents a subtle dark gray-green
            data[i] = Math.floor(inverted * 0.12); // R
            data[i + 1] = Math.floor(inverted * 0.18); // G - slightly more green
            data[i + 2] = Math.floor(inverted * 0.15); // B
            data[i + 3] = data[i + 3] > 0 ? Math.floor(inverted * 0.9) : 0; // A
          }

          offCtx.putImageData(imageData, 0, 0);
          processedMapRef.current = offscreen;
        }
      }

      // Draw cached processed map
      if (processedMapRef.current) {
        ctx.drawImage(processedMapRef.current, 0, 0);
      }
    }

    // Draw subtle grid lines
    ctx.strokeStyle = "rgba(40, 60, 50, 0.3)";
    ctx.lineWidth = 0.5;

    // Longitude lines
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw attack arcs
    const currentThreats = threatsRef.current;
    currentThreats.forEach((threat, index) => {
      const age = now - threat.timestamp;
      const maxAge = 60000; // 60 seconds

      if (age > maxAge) return;

      const src = latLngToCanvas(threat.srcLat, threat.srcLng, width, height);
      const dst = latLngToCanvas(threat.dstLat, threat.dstLng, width, height);

      // Animation progress (0 to 1)
      const progress = Math.min(age / 3000, 1); // 3 second animation
      const opacity = 1 - age / maxAge;

      // Draw arc path
      const midX = (src.x + dst.x) / 2;
      const midY = (src.y + dst.y) / 2 - 30; // Arc height

      // Calculate current position along the arc
      const t = progress;
      const currentX =
        (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * midX + t * t * dst.x;
      const currentY =
        (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * midY + t * t * dst.y;

      // Draw the arc trail
      ctx.strokeStyle = `rgba(255, 0, 0, ${opacity * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(midX, midY, currentX, currentY);
      ctx.stroke();

      // Draw moving dot
      if (progress < 1) {
        ctx.fillStyle = `rgba(255, 50, 50, ${opacity})`;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          8
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, ${opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw impact at destination
      if (progress >= 1) {
        const impactAge = age - 3000;
        const impactOpacity = Math.max(0, 1 - impactAge / 5000);
        const impactRadius = 3 + (impactAge / 1000) * 2;

        ctx.strokeStyle = `rgba(255, 100, 100, ${impactOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(dst.x, dst.y, impactRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Source pulse
      const pulseRadius = 3 + Math.sin(now / 200 + index) * 2;
      ctx.fillStyle = `rgba(255, 100, 0, ${opacity * 0.6})`;
      ctx.beginPath();
      ctx.arc(src.x, src.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    animationRef.current = requestAnimationFrame(() => drawRef.current?.());
  }, []);

  // Keep ref in sync
  drawRef.current = draw;

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 5000); // Fetch every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [fetchThreats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Start animation using ref to avoid dependency issues
    drawRef.current?.();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          CYBER THREATS
          <span className="live-indicator" />
        </span>
        <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
          {stats.total} ATTACKS
        </span>
      </div>
      <div className="flex-1 relative bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: "crisp-edges" }}
        />
        {/* Attack stats overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-500 bg-black/70 px-2 py-1 rounded">
          <div className="text-red-500">{stats.perSecond}/s</div>
        </div>
        {/* Recent attacks log */}
        <div className="absolute top-2 right-2 text-[9px] font-mono text-gray-600 bg-black/70 px-2 py-1 rounded max-h-20 overflow-hidden">
          {threats.slice(0, 3).map((t) => (
            <div key={t.id} className="truncate">
              <span className="text-red-500">{t.threatType}</span>
              <span className="text-gray-600">
                {" "}
                {t.srcCountry} → {t.dstCountry}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-black/50 text-[10px] text-gray-500 px-2 py-1 text-center flex justify-between">
        <span>
          {dataSource === "otx"
            ? "Data: AlienVault OTX"
            : "Data: Simulated"}
        </span>
        <span>Cyber Attack Visualization</span>
      </div>
    </div>
  );
}
