"use client";

import { useState, useEffect, useCallback } from "react";

interface FearGreedData {
  value: number;
  level: string;
  color: string;
  previousClose: number;
  change: number;
  timestamp: number;
  error?: string;
}

// SVG gauge constants
const GAUGE_SIZE = 260;
const GAUGE_CENTER_X = GAUGE_SIZE / 2;
const GAUGE_CENTER_Y = 125;
const GAUGE_RADIUS = 90;
const GAUGE_STROKE = 20;
const MAX_VALUE = 100;

// Sentiment segments (Fear on left/red, Greed on right/green)
const SEGMENTS = [
  { min: 0, max: 25, color: "#ef4444", label: "Extreme Fear" },
  { min: 25, max: 45, color: "#f97316", label: "Fear" },
  { min: 45, max: 55, color: "#eab308", label: "Neutral" },
  { min: 55, max: 75, color: "#84cc16", label: "Greed" },
  { min: 75, max: 100, color: "#22c55e", label: "Extreme Greed" },
];

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function GaugeArc() {
  return (
    <>
      {SEGMENTS.map((segment, index) => {
        const startAngle = (segment.min / MAX_VALUE) * 180;
        const endAngle = (segment.max / MAX_VALUE) * 180;
        const d = describeArc(GAUGE_CENTER_X, GAUGE_CENTER_Y, GAUGE_RADIUS, startAngle, endAngle);

        return (
          <path
            key={index}
            d={d}
            fill="none"
            stroke={segment.color}
            strokeWidth={GAUGE_STROKE}
            strokeLinecap="butt"
            opacity={0.4}
          />
        );
      })}
    </>
  );
}

function GaugeNeedle({ value, color }: { value: number; color: string }) {
  const clampedValue = Math.max(0, Math.min(value, MAX_VALUE));
  // 0 = 180° (left), 100 = 0° (right)
  const angle = 180 - (clampedValue / MAX_VALUE) * 180;
  const needleLength = GAUGE_RADIUS - 15;

  const angleRad = (angle * Math.PI) / 180;
  const needleX = GAUGE_CENTER_X + needleLength * Math.cos(angleRad);
  const needleY = GAUGE_CENTER_Y - needleLength * Math.sin(angleRad);

  return (
    <g style={{ transition: "all 0.8s ease-out" }}>
      <line
        x1={GAUGE_CENTER_X}
        y1={GAUGE_CENTER_Y}
        x2={needleX}
        y2={needleY}
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.4}
        style={{ filter: "blur(3px)" }}
      />
      <line
        x1={GAUGE_CENTER_X}
        y1={GAUGE_CENTER_Y}
        x2={needleX}
        y2={needleY}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle
        cx={GAUGE_CENTER_X}
        cy={GAUGE_CENTER_Y}
        r={8}
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </g>
  );
}

function GaugeLabels() {
  const labels = [
    { value: 0, label: "0" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 75, label: "75" },
    { value: 100, label: "100" },
  ];

  return (
    <>
      {labels.map(({ value, label }) => {
        // 0 = 180° (left), 100 = 0° (right)
        const angle = 180 - (value / MAX_VALUE) * 180;
        const angleRad = (angle * Math.PI) / 180;
        const labelRadius = GAUGE_RADIUS + 25;
        const x = GAUGE_CENTER_X + labelRadius * Math.cos(angleRad);
        const y = GAUGE_CENTER_Y - labelRadius * Math.sin(angleRad);

        return (
          <text
            key={value}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6b7280"
            fontSize="12"
            fontFamily="monospace"
          >
            {label}
          </text>
        );
      })}
      {/* Fear/Greed labels at ends */}
      <text
        x={20}
        y={GAUGE_CENTER_Y + 15}
        textAnchor="start"
        fill="#ef4444"
        fontSize="10"
        opacity={0.7}
      >
        FEAR
      </text>
      <text
        x={GAUGE_SIZE - 20}
        y={GAUGE_CENTER_Y + 15}
        textAnchor="end"
        fill="#22c55e"
        fontSize="10"
        opacity={0.7}
      >
        GREED
      </text>
    </>
  );
}

export default function FearGreedPanel() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/fear-greed", { cache: "no-store" });
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setSecondsAgo(0);
      }
    } catch (error) {
      console.error("Failed to fetch Fear & Greed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 60 * 1000);
    const tickInterval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchData]);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          CRYPTO FEAR & GREED
          <span className="live-indicator" />
        </span>
        {data && (
          <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
            {secondsAgo}s ago
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : data ? (
          <>
            <svg
              width={GAUGE_SIZE}
              height={GAUGE_CENTER_Y + 20}
              viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_CENTER_Y + 20}`}
              className="max-w-full"
            >
              <GaugeArc />
              <GaugeNeedle value={data.value} color={data.color} />
              <GaugeLabels />
            </svg>

            <div className="text-center mt-2">
              <div
                className="text-4xl font-bold font-mono"
                style={{ color: data.color }}
              >
                {data.value}
              </div>
              <div
                className="text-lg font-semibold uppercase tracking-wider"
                style={{ color: data.color }}
              >
                {data.level}
              </div>
              {data.change !== 0 && (
                <div
                  className={`text-sm font-mono ${
                    data.change > 0 ? "stock-up" : "stock-down"
                  }`}
                >
                  {data.change > 0 ? "+" : ""}
                  {data.change} from yesterday
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 text-[8px] flex-wrap justify-center">
              {SEGMENTS.map((seg) => (
                <div
                  key={seg.label}
                  className="flex items-center gap-1 opacity-60"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-gray-400">{seg.label}</span>
                </div>
              ))}
            </div>

            {data.error && (
              <div className="text-[10px] text-yellow-500 mt-2">
                {data.error}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500">Failed to load data</div>
        )}
      </div>
    </div>
  );
}
