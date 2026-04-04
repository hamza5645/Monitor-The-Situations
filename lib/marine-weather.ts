/**
 * Heuristic: NWS marine / coastal water event names (substring match, case-insensitive).
 * When includeMarine is false, alerts matching these are excluded from the panel.
 */
const MARINE_HINTS = [
  "marine",
  "small craft",
  "gale",
  "hazardous seas",
  "heavy freezing spray",
  "freezing spray",
  "rough surf",
  "rip current",
  "special marine",
  "brisk wind",
  "hurricane force wind",
  "typhoon",
];

export function isLikelyMarineWeatherEvent(eventName: string): boolean {
  const e = eventName.toLowerCase();
  return MARINE_HINTS.some((h) => e.includes(h));
}
