// Weather alert types for NOAA API integration

export type WeatherSeverity =
  | "Extreme"
  | "Severe"
  | "Moderate"
  | "Minor"
  | "Unknown";

export type WeatherUrgency =
  | "Immediate"
  | "Expected"
  | "Future"
  | "Past"
  | "Unknown";

export type WeatherCertainty =
  | "Observed"
  | "Likely"
  | "Possible"
  | "Unlikely"
  | "Unknown";

export interface WeatherAlert {
  id: string;
  event: string; // "Tornado Warning", "Winter Storm Watch", etc.
  headline: string;
  severity: WeatherSeverity;
  urgency: WeatherUrgency;
  certainty: WeatherCertainty;
  areaDesc: string; // "Travis County, TX"
  onset: string; // ISO timestamp
  expires: string; // ISO timestamp
  instruction: string | null;
  senderName: string;
  url: string;
}

export interface WeatherAlertAPIResponse {
  alerts: WeatherAlert[];
  count: number;
  timestamp: number;
  source: string;
  error?: string;
}

// NOAA API response types
export interface NOAAAlertFeature {
  id: string;
  properties: {
    event: string;
    headline: string | null;
    severity: string;
    urgency: string;
    certainty: string;
    areaDesc: string;
    onset: string | null;
    expires: string | null;
    instruction: string | null;
    senderName: string;
    "@id": string;
  };
}

export interface NOAAResponse {
  features: NOAAAlertFeature[];
}
