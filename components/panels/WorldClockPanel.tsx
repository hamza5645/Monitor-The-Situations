"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSituation } from "@/context/SituationContext";
import type { ClockZoneConfig } from "@/types/situation";

// Default zones used when no situation-specific config exists
const DEFAULT_ZONES: ClockZoneConfig[] = [
  { city: "Washington DC", timezone: "America/New_York" },
  { city: "Moscow", timezone: "Europe/Moscow" },
  { city: "Beijing", timezone: "Asia/Shanghai" },
  { city: "Gaza", timezone: "Asia/Gaza" },
  { city: "Kyiv", timezone: "Europe/Kyiv" },
];

const STORAGE_KEY = "mts-custom-clocks";

// Get all available IANA timezones
function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older browsers
    return [
      "America/New_York", "America/Los_Angeles", "America/Chicago",
      "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
      "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Asia/Gaza",
      "Australia/Sydney", "Pacific/Auckland"
    ];
  }
}

// Convert timezone ID to a readable name
function timezoneToDisplayName(timezone: string): string {
  return timezone.replace(/_/g, " ").replace(/\//g, " / ");
}

// Extract city name from timezone
function timezoneToCityName(timezone: string): string {
  const parts = timezone.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

function getCustomZones(situationId: string): ClockZoneConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data[situationId] || [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveCustomZones(situationId: string, zones: ClockZoneConfig[]) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[situationId] = zones;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getTimeForZone(timezone: string): { time: string; date: string; hour: number } {
  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });

  return {
    time: timeFormatter.format(now),
    date: dateFormatter.format(now),
    hour: parseInt(hourFormatter.format(now)),
  };
}

function isDayTime(hour: number): boolean {
  return hour >= 6 && hour < 18;
}

function ClockCard({
  zone,
  onRemove,
  isCustom
}: {
  zone: ClockZoneConfig;
  onRemove?: () => void;
  isCustom?: boolean;
}) {
  const { time, date, hour } = getTimeForZone(zone.timezone);
  const isDay = isDayTime(hour);

  return (
    <div className="bg-black/30 border border-gray-800 rounded p-3 flex flex-col relative group">
      {isCustom && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          title="Remove timezone"
        >
          ×
        </button>
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-500">
          {zone.city}
        </span>
        <span className="text-[10px] text-gray-600" title={isDay ? "Daytime" : "Nighttime"}>
          {isDay ? "☀" : "☾"}
        </span>
      </div>
      <div className="text-2xl font-mono font-bold text-red-500 tracking-wide">
        {time}
      </div>
      <div className="text-[10px] text-gray-500 mt-1">{date}</div>
    </div>
  );
}

function AddTimezoneCard({
  onAdd,
  existingTimezones
}: {
  onAdd: (zone: ClockZoneConfig) => void;
  existingTimezones: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allTimezones = useMemo(() => getAllTimezones(), []);

  // Filter out already-added timezones and match search
  const filteredTimezones = useMemo(() => {
    return allTimezones.filter(
      (tz) =>
        !existingTimezones.includes(tz) &&
        (tz.toLowerCase().includes(search.toLowerCase()) ||
         timezoneToDisplayName(tz).toLowerCase().includes(search.toLowerCase()))
    );
  }, [allTimezones, existingTimezones, search]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
        setSelectedTimezone(null);
        setCustomName("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectTimezone = (tz: string) => {
    setSelectedTimezone(tz);
    setCustomName(timezoneToCityName(tz));
  };

  const handleAdd = () => {
    if (selectedTimezone && customName.trim()) {
      onAdd({
        city: customName.trim(),
        timezone: selectedTimezone,
      });
      setIsOpen(false);
      setSearch("");
      setSelectedTimezone(null);
      setCustomName("");
    }
  };

  const handleCancel = () => {
    setSelectedTimezone(null);
    setCustomName("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black/20 border border-dashed border-gray-700 hover:border-gray-500 rounded p-3 flex flex-col items-center justify-center min-h-[88px] transition-colors"
      >
        <span className="text-2xl text-gray-600 mb-1">+</span>
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">Add Zone</span>
      </button>
    );
  }

  // Step 2: Customize name after selecting timezone
  if (selectedTimezone) {
    return (
      <div ref={dropdownRef} className="bg-black/40 border border-gray-700 rounded p-2">
        <div className="text-[10px] text-gray-500 mb-1">TIMEZONE</div>
        <div className="text-xs text-gray-300 mb-2 truncate" title={selectedTimezone}>
          {timezoneToDisplayName(selectedTimezone)}
        </div>
        <div className="text-[10px] text-gray-500 mb-1">DISPLAY NAME</div>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="City name..."
          className="w-full bg-black/50 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-2"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex gap-1">
          <button
            onClick={handleCancel}
            className="flex-1 px-2 py-1 text-[10px] text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleAdd}
            disabled={!customName.trim()}
            className="flex-1 px-2 py-1 text-[10px] text-white bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Search and select timezone
  return (
    <div ref={dropdownRef} className="bg-black/40 border border-gray-700 rounded p-2">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search timezone..."
        className="w-full bg-black/50 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
      />
      <div className="mt-2 max-h-40 overflow-y-auto">
        {filteredTimezones.length === 0 ? (
          <div className="text-[10px] text-gray-500 text-center py-2">No results</div>
        ) : (
          filteredTimezones.slice(0, 20).map((tz) => (
            <button
              key={tz}
              onClick={() => handleSelectTimezone(tz)}
              className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-800 rounded transition-colors"
            >
              <div className="truncate">{timezoneToDisplayName(tz)}</div>
            </button>
          ))
        )}
        {filteredTimezones.length > 20 && (
          <div className="text-[10px] text-gray-600 text-center py-1">
            +{filteredTimezones.length - 20} more...
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorldClockPanel() {
  const { activeSituation } = useSituation();
  const [, setTick] = useState(0);
  const [customZones, setCustomZones] = useState<ClockZoneConfig[]>([]);
  const [mounted, setMounted] = useState(false);

  const situationId = activeSituation?.id ?? "default";

  // Get base zones from situation or use defaults
  const baseZones = activeSituation?.clock?.zones ?? DEFAULT_ZONES;

  // Load custom zones from localStorage on mount and when situation changes
  useEffect(() => {
    setMounted(true);
    setCustomZones(getCustomZones(situationId));
  }, [situationId]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const allZones = [...baseZones, ...customZones];
  const existingTimezones = allZones.map((z) => z.timezone);

  const handleAddZone = (zone: ClockZoneConfig) => {
    const newCustomZones = [...customZones, zone];
    setCustomZones(newCustomZones);
    saveCustomZones(situationId, newCustomZones);
  };

  const handleRemoveZone = (city: string) => {
    const newCustomZones = customZones.filter((z) => z.city !== city);
    setCustomZones(newCustomZones);
    saveCustomZones(situationId, newCustomZones);
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          WORLD CLOCK
          <span className="live-indicator" />
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {baseZones.map((zone) => (
            <ClockCard key={zone.city} zone={zone} />
          ))}
          {mounted && customZones.map((zone) => (
            <ClockCard
              key={zone.city}
              zone={zone}
              isCustom
              onRemove={() => handleRemoveZone(zone.city)}
            />
          ))}
          {mounted && (
            <AddTimezoneCard onAdd={handleAddZone} existingTimezones={existingTimezones} />
          )}
        </div>
      </div>
    </div>
  );
}
