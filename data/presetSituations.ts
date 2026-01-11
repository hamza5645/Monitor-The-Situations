import type { SituationConfig } from "@/types/situation";

// Default "All Situations" - matches current hardcoded behavior
export const DEFAULT_SITUATION: SituationConfig = {
  id: "default",
  name: "All Situations",
  description: "Global monitoring view",
  isPreset: true,
  flight: {
    lat: 0,
    lon: 0,
    zoom: 2,
  },
  stocks: [
    {
      title: "Major Indices",
      symbols: [
        { symbol: "^GSPC", name: "S&P 500" },
        { symbol: "^DJI", name: "Dow Jones" },
        { symbol: "^IXIC", name: "NASDAQ" },
        { symbol: "^VIX", name: "VIX (Fear)" },
      ],
    },
    {
      title: "Defense",
      symbols: [
        { symbol: "LMT", name: "Lockheed Martin" },
        { symbol: "RTX", name: "RTX Corp" },
        { symbol: "NOC", name: "Northrop" },
        { symbol: "GD", name: "General Dynamics" },
      ],
    },
    {
      title: "Crypto",
      symbols: [
        { symbol: "BTC-USD", name: "Bitcoin" },
        { symbol: "ETH-USD", name: "Ethereum" },
      ],
    },
    {
      title: "Global",
      symbols: [
        { symbol: "^FTSE", name: "FTSE 100" },
        { symbol: "^N225", name: "Nikkei 225" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
    ],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "Polymarket", name: "Polymarket", category: "Markets" },
      { handle: "WhiteHouse", name: "White House", category: "Gov" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "DeptofDefense", name: "DoD", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "spectatorindex", name: "Spectator Index", category: "News" },
      { handle: "disclosetv", name: "Disclose.tv", category: "News" },
      { handle: "BNONews", name: "BNO News", category: "News" },
      { handle: "ABORTEDALPHA", name: "Aborted Alpha", category: "OSINT" },
      { handle: "IntelCrab", name: "Intel Crab", category: "OSINT" },
    ],
    categories: ["News", "Gov", "OSINT", "Markets"],
  },
};

export const VENEZUELA_SITUATION: SituationConfig = {
  id: "venezuela",
  name: "Venezuela",
  description: "Monitor Venezuelan political crisis and regional developments",
  isPreset: true,
  flight: {
    lat: 10.5,
    lon: -66.9,
    zoom: 6,
  },
  stocks: [
    {
      title: "Oil & Energy",
      symbols: [
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "BZ=F", name: "Brent Crude" },
        { symbol: "XOM", name: "Exxon" },
        { symbol: "CVX", name: "Chevron" },
      ],
    },
    {
      title: "Latin America",
      symbols: [
        { symbol: "EWZ", name: "Brazil ETF" },
        { symbol: "ARGT", name: "Argentina ETF" },
        { symbol: "ILF", name: "LatAm 40 ETF" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
        { symbol: "DXY", name: "US Dollar Index" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml", source: "BBC Latin America" },
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
    ],
    keywords: ["Venezuela", "Maduro", "Caracas", "Guaido", "PDVSA"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "AFP", name: "AFP", category: "News" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "WHLac", name: "WH Americas", category: "Gov" },
      { handle: "OaborrowP", name: "OAS Americas", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "Gov", "OSINT"],
  },
};

export const GAZA_SITUATION: SituationConfig = {
  id: "gaza",
  name: "Gaza",
  description: "Monitor Gaza conflict and Middle East developments",
  isPreset: true,
  flight: {
    lat: 31.5,
    lon: 34.5,
    zoom: 8,
  },
  stocks: [
    {
      title: "Defense",
      symbols: [
        { symbol: "LMT", name: "Lockheed Martin" },
        { symbol: "RTX", name: "RTX Corp" },
        { symbol: "NOC", name: "Northrop" },
        { symbol: "GD", name: "General Dynamics" },
      ],
    },
    {
      title: "Energy",
      symbols: [
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "NG=F", name: "Natural Gas" },
        { symbol: "XLE", name: "Energy ETF" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
        { symbol: "GC=F", name: "Gold" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC Middle East" },
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
    ],
    keywords: ["Gaza", "Israel", "Hamas", "IDF", "Palestine", "Netanyahu", "Rafah", "Hezbollah"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "IDF", name: "Israel Defense Forces", category: "Gov" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "IsraeliPM", name: "Israeli PM", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "IntelCrab", name: "Intel Crab", category: "OSINT" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "Gov", "OSINT"],
  },
};

export const GREENLAND_SITUATION: SituationConfig = {
  id: "greenland",
  name: "Greenland",
  description: "Monitor Arctic developments and Greenland situation",
  isPreset: true,
  flight: {
    lat: 72.0,
    lon: -40.0,
    zoom: 4,
  },
  stocks: [
    {
      title: "Defense",
      symbols: [
        { symbol: "LMT", name: "Lockheed Martin" },
        { symbol: "NOC", name: "Northrop" },
        { symbol: "BA", name: "Boeing" },
      ],
    },
    {
      title: "Rare Earth & Mining",
      symbols: [
        { symbol: "MP", name: "MP Materials" },
        { symbol: "VALE", name: "Vale SA" },
        { symbol: "RIO", name: "Rio Tinto" },
      ],
    },
    {
      title: "Nordic Markets",
      symbols: [
        { symbol: "EWD", name: "Sweden ETF" },
        { symbol: "NORW", name: "Norway ETF" },
        { symbol: "EDEN", name: "Denmark ETF" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
    ],
    keywords: ["Greenland", "Denmark", "Arctic", "NATO", "Thule", "Nuuk", "rare earth"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "NATO", name: "NATO", category: "Gov" },
      { handle: "USArmy", name: "US Army", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "ArcticCouncil", name: "Arctic Council", category: "Gov" },
    ],
    categories: ["News", "Gov", "OSINT"],
  },
};

export const PRESET_SITUATIONS: SituationConfig[] = [
  DEFAULT_SITUATION,
  VENEZUELA_SITUATION,
  GAZA_SITUATION,
  GREENLAND_SITUATION,
];

export function getPresetById(id: string): SituationConfig | undefined {
  return PRESET_SITUATIONS.find((s) => s.id === id);
}
