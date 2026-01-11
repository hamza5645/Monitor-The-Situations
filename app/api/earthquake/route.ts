import { NextResponse } from "next/server";
import type { Earthquake } from "@/types/earthquake";

interface USGSFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    tsunami: number;
    felt: number | null;
  };
  geometry: {
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
}

interface USGSResponse {
  type: string;
  features: USGSFeature[];
}

const FEED_URLS: Record<string, string> = {
  all_hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  all_day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  significant_day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson",
  "4.5_day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
};

function transformFeature(feature: USGSFeature): Earthquake | null {
  const { properties, geometry, id } = feature;

  // Validate required data exists
  if (properties.mag === null || properties.mag === undefined) return null;
  if (!geometry?.coordinates || geometry.coordinates.length < 3) return null;

  const depth = geometry.coordinates[2];
  const lat = geometry.coordinates[1];
  const lon = geometry.coordinates[0];

  // Validate numeric values
  if (typeof depth !== "number" || isNaN(depth)) return null;
  if (typeof lat !== "number" || isNaN(lat)) return null;
  if (typeof lon !== "number" || isNaN(lon)) return null;

  return {
    id,
    magnitude: properties.mag,
    place: properties.place || "Unknown location",
    time: properties.time,
    depth,
    url: properties.url,
    coordinates: { lat, lon },
    tsunami: properties.tsunami === 1,
    felt: properties.felt,
  };
}

// Haversine formula to calculate distance between two points
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface FetchResult {
  earthquakes: Earthquake[];
  error?: string;
}

async function fetchUSGSFeed(feedUrl: string): Promise<FetchResult> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error(`USGS API error: ${response.status}`);
      return { earthquakes: [], error: `USGS unavailable (${response.status})` };
    }

    const data: USGSResponse = await response.json();

    const earthquakes = data.features
      .map(transformFeature)
      .filter((eq): eq is Earthquake => eq !== null);

    return { earthquakes };
  } catch (error) {
    console.error("Error fetching USGS data:", error);
    return { earthquakes: [], error: "Failed to connect to USGS" };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feed = searchParams.get("feed") || "all_hour";
  const minMag = Math.max(0, parseFloat(searchParams.get("minMag") || "0"));

  // Optional region filtering
  const focusLat = searchParams.get("focusLat");
  const focusLon = searchParams.get("focusLon");
  const radiusKm = searchParams.get("radiusKm");

  // Get feed URL
  const feedUrl = FEED_URLS[feed] || FEED_URLS.all_hour;

  const result = await fetchUSGSFeed(feedUrl);
  let { earthquakes } = result;

  // If there was an error, return it with 502 status
  if (result.error) {
    return NextResponse.json({
      earthquakes: [],
      feed,
      count: 0,
      error: result.error,
      timestamp: Date.now(),
    }, {
      status: 502,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  }

  // Filter by minimum magnitude
  if (minMag > 0) {
    earthquakes = earthquakes.filter(eq => eq.magnitude >= minMag);
  }

  // Filter by region if specified
  if (focusLat && focusLon && radiusKm) {
    const lat = parseFloat(focusLat);
    const lon = parseFloat(focusLon);
    const radius = parseFloat(radiusKm);

    if (!isNaN(lat) && !isNaN(lon) && !isNaN(radius) && radius > 0) {
      earthquakes = earthquakes.filter(eq => {
        const distance = getDistanceKm(lat, lon, eq.coordinates.lat, eq.coordinates.lon);
        return distance <= radius;
      });
    }
  }

  // Sort by time (most recent first)
  earthquakes.sort((a, b) => b.time - a.time);

  return NextResponse.json({
    earthquakes,
    feed,
    count: earthquakes.length,
    timestamp: Date.now(),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
