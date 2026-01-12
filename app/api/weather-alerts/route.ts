import { NextResponse } from "next/server";
import type {
  WeatherAlert,
  WeatherAlertAPIResponse,
  NOAAAlertFeature,
  NOAAResponse,
  WeatherSeverity,
  WeatherUrgency,
  WeatherCertainty,
} from "@/types/weather";

// Transform NOAA feature to our format
function transformAlert(feature: NOAAAlertFeature): WeatherAlert {
  const props = feature.properties;
  return {
    id: feature.id,
    event: props.event,
    headline: props.headline || props.event,
    severity: props.severity as WeatherSeverity,
    urgency: props.urgency as WeatherUrgency,
    certainty: props.certainty as WeatherCertainty,
    areaDesc: props.areaDesc,
    onset: props.onset || new Date().toISOString(),
    expires: props.expires || new Date().toISOString(),
    instruction: props.instruction,
    senderName: props.senderName,
    url: props["@id"],
  };
}

// Severity sort order (most severe first)
const SEVERITY_ORDER: Record<string, number> = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
  Unknown: 4,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Get query params from panel
  const statesParam = searchParams.get("states"); // "TX,FL,LA"
  const severitiesParam = searchParams.get("severities"); // "Extreme,Severe"

  // Build NOAA API URL
  const apiUrl = "https://api.weather.gov/alerts/active";
  const params = new URLSearchParams();

  if (statesParam && statesParam.trim()) {
    params.set("area", statesParam);
  }

  // NOAA requires User-Agent header
  try {
    const response = await fetch(`${apiUrl}?${params}`, {
      headers: {
        "User-Agent": "(MonitorTheSituations, github.com/monitor-situations)",
        Accept: "application/geo+json",
      },
      next: { revalidate: 120 }, // Cache for 2 minutes
    });

    if (!response.ok) {
      console.error(`NOAA API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          alerts: [],
          count: 0,
          timestamp: Date.now(),
          source: "NOAA",
          error: `NOAA API error: ${response.status}`,
        } as WeatherAlertAPIResponse,
        {
          status: 502,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    const data: NOAAResponse = await response.json();
    let alerts = data.features.map(transformAlert);

    // Filter by severity if specified
    if (severitiesParam && severitiesParam.trim()) {
      const severities = severitiesParam.split(",").map((s) => s.trim());
      alerts = alerts.filter((a) => severities.includes(a.severity));
    }

    // Filter out expired alerts
    const now = new Date();
    alerts = alerts.filter((a) => new Date(a.expires) > now);

    // Sort by severity (Extreme first) then by onset time (most recent first)
    alerts.sort((a, b) => {
      const sevDiff =
        (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.onset).getTime() - new Date(a.onset).getTime();
    });

    return NextResponse.json(
      {
        alerts,
        count: alerts.length,
        timestamp: Date.now(),
        source: "NOAA",
      } as WeatherAlertAPIResponse,
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
        },
      }
    );
  } catch (error) {
    console.error("NOAA API fetch error:", error);
    return NextResponse.json(
      {
        alerts: [],
        count: 0,
        timestamp: Date.now(),
        source: "NOAA",
        error: "Failed to connect to NOAA",
      } as WeatherAlertAPIResponse,
      {
        status: 502,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }
}
