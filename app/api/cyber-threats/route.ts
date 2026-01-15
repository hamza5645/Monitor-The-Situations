import { NextResponse } from "next/server";

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

// Major city/country coordinates for threat visualization
const COUNTRY_COORDS: { [key: string]: { lat: number; lng: number; name: string } } = {
  US: { lat: 37.0902, lng: -95.7129, name: "United States" },
  CN: { lat: 35.8617, lng: 104.1954, name: "China" },
  RU: { lat: 61.524, lng: 105.3188, name: "Russia" },
  DE: { lat: 51.1657, lng: 10.4515, name: "Germany" },
  GB: { lat: 55.3781, lng: -3.436, name: "United Kingdom" },
  FR: { lat: 46.2276, lng: 2.2137, name: "France" },
  JP: { lat: 36.2048, lng: 138.2529, name: "Japan" },
  KR: { lat: 35.9078, lng: 127.7669, name: "South Korea" },
  BR: { lat: -14.235, lng: -51.9253, name: "Brazil" },
  IN: { lat: 20.5937, lng: 78.9629, name: "India" },
  AU: { lat: -25.2744, lng: 133.7751, name: "Australia" },
  NL: { lat: 52.1326, lng: 5.2913, name: "Netherlands" },
  UA: { lat: 48.3794, lng: 31.1656, name: "Ukraine" },
  IR: { lat: 32.4279, lng: 53.688, name: "Iran" },
  KP: { lat: 40.3399, lng: 127.5101, name: "North Korea" },
  SG: { lat: 1.3521, lng: 103.8198, name: "Singapore" },
  IL: { lat: 31.0461, lng: 34.8516, name: "Israel" },
  CA: { lat: 56.1304, lng: -106.3468, name: "Canada" },
  PL: { lat: 51.9194, lng: 19.1451, name: "Poland" },
  VN: { lat: 14.0583, lng: 108.2772, name: "Vietnam" },
  ID: { lat: -0.7893, lng: 113.9213, name: "Indonesia" },
  TH: { lat: 15.87, lng: 100.9925, name: "Thailand" },
  MX: { lat: 23.6345, lng: -102.5528, name: "Mexico" },
  ZA: { lat: -30.5595, lng: 22.9375, name: "South Africa" },
  NG: { lat: 9.082, lng: 8.6753, name: "Nigeria" },
  EG: { lat: 26.8206, lng: 30.8025, name: "Egypt" },
  PK: { lat: 30.3753, lng: 69.3451, name: "Pakistan" },
  BD: { lat: 23.685, lng: 90.3563, name: "Bangladesh" },
  TR: { lat: 38.9637, lng: 35.2433, name: "Turkey" },
  IT: { lat: 41.8719, lng: 12.5674, name: "Italy" },
};

const MAX_OTX_THREATS = 15;
const NOC_COUNTRY_LIMIT = 12;

// OTX API response types
interface OTXPulse {
  id: string;
  name: string;
  description: string;
  author_name: string;
  created: string;
  modified: string;
  tags: string[];
  targeted_countries: string[];
  malware_families: string[];
  attack_ids: { id: string; name: string }[];
  industries: string[];
  indicators: OTXIndicator[];
}

interface OTXIndicator {
  id: number;
  indicator: string;
  type: string;
  created: string;
  title: string;
  description: string;
}

interface OTXResponse {
  results: OTXPulse[];
  count: number;
  next: string | null;
}

interface OTXNocCountry {
  country: string;
  count: number;
  lat: number;
  long: number;
  iso_code: string;
}

interface OTXNocResponse {
  countries: OTXNocCountry[];
}

// Map country codes to our coordinate system
function getCountryCode(countryName: string): string | null {
  const mapping: { [key: string]: string } = {
    "united states": "US",
    "united states of america": "US",
    "usa": "US",
    "china": "CN",
    "russia": "RU",
    "russian federation": "RU",
    "germany": "DE",
    "united kingdom": "GB",
    "uk": "GB",
    "france": "FR",
    "japan": "JP",
    "south korea": "KR",
    "korea": "KR",
    "brazil": "BR",
    "india": "IN",
    "australia": "AU",
    "netherlands": "NL",
    "ukraine": "UA",
    "iran": "IR",
    "north korea": "KP",
    "dprk": "KP",
    "singapore": "SG",
    "israel": "IL",
    "canada": "CA",
    "poland": "PL",
    "vietnam": "VN",
    "indonesia": "ID",
    "thailand": "TH",
    "mexico": "MX",
    "south africa": "ZA",
    "nigeria": "NG",
    "egypt": "EG",
    "pakistan": "PK",
    "bangladesh": "BD",
    "turkey": "TR",
    "italy": "IT",
  };
  return mapping[countryName.toLowerCase()] || null;
}

function getTargetCountryCode(targetedCountries: string[] | undefined): string | null {
  if (!targetedCountries || targetedCountries.length === 0) return null;

  for (const country of targetedCountries) {
    const code = getCountryCode(country);
    if (code && COUNTRY_COORDS[code]) return code;
  }

  return null;
}

function inferSourceCountryCode(attackIds: { id: string; name: string }[] | undefined): string | null {
  if (!attackIds || attackIds.length === 0) return null;

  const attackName = attackIds
    .map((attack) => attack?.name)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!attackName) return null;

  if (attackName.includes("china") || attackName.includes("apt1") || attackName.includes("apt10")) {
    return "CN";
  }
  if (attackName.includes("russia") || attackName.includes("apt28") || attackName.includes("apt29")) {
    return "RU";
  }
  if (attackName.includes("north korea") || attackName.includes("lazarus")) {
    return "KP";
  }
  if (attackName.includes("iran")) {
    return "IR";
  }

  return null;
}

function getThreatType(pulse: OTXPulse): string {
  let threatType = "Malware";

  if (pulse.malware_families && pulse.malware_families.length > 0 && pulse.malware_families[0]) {
    threatType = pulse.malware_families[0];
    if (threatType.length > 12) {
      threatType = threatType.substring(0, 10) + "..";
    }
  } else if (pulse.tags && pulse.tags.length > 0 && pulse.tags[0]) {
    const tag = String(pulse.tags[0]).toLowerCase();
    if (tag.includes("ransomware")) threatType = "Ransomware";
    else if (tag.includes("phishing")) threatType = "Phishing";
    else if (tag.includes("botnet")) threatType = "Botnet";
    else if (tag.includes("trojan")) threatType = "Trojan";
    else if (tag.includes("apt")) threatType = "APT";
    else if (tag.includes("rat")) threatType = "RAT";
    else if (tag.includes("malware")) threatType = "Malware";
    else if (tag.includes("c2")) threatType = "C2 Server";
    else threatType = pulse.tags[0].length > 12 ? pulse.tags[0].substring(0, 10) + ".." : pulse.tags[0];
  }

  return threatType;
}

async function fetchOTXSubscribedThreats(apiKey: string): Promise<ThreatData[]> {
  // Fetch recent subscribed pulses (threat intelligence feeds)
  const response = await fetch(
    "https://otx.alienvault.com/api/v1/pulses/subscribed?limit=10&page=1",
    {
      headers: {
        "X-OTX-API-KEY": apiKey,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OTX API error ${response.status}:`, errorText);
    throw new Error(`OTX API returned ${response.status}`);
  }

  const data: OTXResponse = await response.json();

  if (!data.results || data.results.length === 0) {
    return [];
  }

  const now = Date.now();
  const threats: ThreatData[] = [];

  // Process each pulse and create threat visualizations
  for (const pulse of data.results.slice(0, MAX_OTX_THREATS)) {
    const srcCode = inferSourceCountryCode(pulse.attack_ids);
    const dstCode = getTargetCountryCode(pulse.targeted_countries);

    if (!srcCode || !dstCode) continue;

    const src = COUNTRY_COORDS[srcCode];
    const dst = COUNTRY_COORDS[dstCode];

    if (!src || !dst) continue;

    threats.push({
      id: `otx-${pulse.id}-${threats.length}`,
      srcLat: src.lat,
      srcLng: src.lng,
      dstLat: dst.lat,
      dstLng: dst.lng,
      srcCountry: src.name,
      dstCountry: dst.name,
      threatType: getThreatType(pulse),
      timestamp: now - threats.length * 1000,
    });
  }

  return threats;
}

async function fetchOTXNocThreats(): Promise<ThreatData[]> {
  const response = await fetch("https://otx.alienvault.com/otxapi/noc/active_by_roles", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MonitorTheSituations/1.0)",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OTX NOC error ${response.status}:`, errorText);
    throw new Error(`OTX NOC returned ${response.status}`);
  }

  const data: OTXNocResponse = await response.json();
  const now = Date.now();

  return (data.countries || []).slice(0, NOC_COUNTRY_LIMIT).map((country, index) => ({
    id: `otx-noc-${country.iso_code || index}-${now}`,
    srcLat: country.lat,
    srcLng: country.long,
    dstLat: country.lat,
    dstLng: country.long,
    srcCountry: country.country,
    dstCountry: country.country,
    threatType: "OTX Activity",
    timestamp: now - index * 1000,
  }));
}

// Fetch real threat data from AlienVault OTX
async function fetchOTXData(): Promise<{ threats: ThreatData[]; source: string }> {
  const apiKey = process.env.OTX_API_KEY;

  if (apiKey) {
    try {
      const threats = await fetchOTXSubscribedThreats(apiKey);
      if (threats.length > 0) {
        return { threats, source: "otx" };
      }
      console.log("OTX API returned no usable threats, falling back to public feed");
    } catch (error) {
      console.error("OTX fetch failed:", error);
    }
  } else {
    console.log("OTX_API_KEY not configured, using public OTX NOC feed");
  }

  try {
    const threats = await fetchOTXNocThreats();
    return { threats, source: threats.length > 0 ? "otx-noc" : "none" };
  } catch (error) {
    console.error("OTX NOC fetch failed:", error);
    return { threats: [], source: "none" };
  }
}

export async function GET() {
  try {
    const { threats, source } = await fetchOTXData();

    return NextResponse.json(
      {
        success: true,
        threats,
        timestamp: Date.now(),
        source,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error in cyber-threats API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch threat data" },
      { status: 500 }
    );
  }
}
