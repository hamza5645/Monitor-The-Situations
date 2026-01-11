// Shared Earthquake types used by API and Panel

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number; // Unix timestamp in ms
  depth: number; // km
  url: string; // USGS detail page
  coordinates: {
    lat: number;
    lon: number;
  };
  tsunami: boolean;
  felt: number | null; // Number of "felt it" reports
}

export interface EarthquakeAPIResponse {
  earthquakes: Earthquake[];
  feed: string;
  count: number;
  error?: string;
  timestamp: number;
}
