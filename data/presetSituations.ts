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
      title: "Commodities",
      symbols: [
        { symbol: "GC=F", name: "Gold" },
        { symbol: "SI=F", name: "Silver" },
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "NG=F", name: "Natural Gas" },
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
      // Major Wire Services
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
      { url: "https://feeds.reuters.com/reuters/worldNews", source: "Reuters World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://www.theguardian.com/world/rss", source: "The Guardian" },
      // TV Networks
      { url: "https://feeds.nbcnews.com/nbcnews/public/world", source: "NBC News" },
      { url: "https://feeds.cbsnews.com/CBSNewsWorld?format=xml", source: "CBS News" },
      { url: "https://abcnews.go.com/abcnews/internationalheadlines", source: "ABC News" },
      // International
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://rss.dw.com/rdf/rss-en-world", source: "DW News" },
      { url: "https://www.france24.com/en/rss", source: "France 24" },
      // Financial
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
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
  earthquake: {
    feed: "all_hour",
    minMagnitude: 4.0,
  },
  weather: {
    regions: {
      states: [], // Empty = nationwide
    },
    severityFilter: ["Extreme", "Severe"],
    includeMarine: false,
  },
  clock: {
    zones: [
      { city: "Washington DC", timezone: "America/New_York" },
      { city: "Moscow", timezone: "Europe/Moscow" },
      { city: "Beijing", timezone: "Asia/Shanghai" },
      { city: "Gaza", timezone: "Asia/Gaza" },
      { city: "Kyiv", timezone: "Europe/Kyiv" },
    ],
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
      // Regional BBC
      { url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml", source: "BBC Latin America" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      // Wire Services
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
      { url: "https://feeds.reuters.com/reuters/worldNews", source: "Reuters World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Americas.xml", source: "NY Times Americas" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://www.theguardian.com/world/americas/rss", source: "Guardian Americas" },
      // TV Networks
      { url: "https://feeds.nbcnews.com/nbcnews/public/world", source: "NBC News" },
      { url: "https://abcnews.go.com/abcnews/internationalheadlines", source: "ABC News" },
      // International
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://rss.dw.com/rdf/rss-en-world", source: "DW News" },
      { url: "https://www.france24.com/en/americas/rss", source: "France 24 Americas" },
      // Financial (oil focused)
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
    ],
    keywords: ["Venezuela", "Maduro", "Caracas", "Guaido", "PDVSA", "Bolivar", "Latin America", "South America", "Colombia", "Brazil"],
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
  earthquake: {
    feed: "all_day",
    minMagnitude: 3.0,
    focusRegion: {
      lat: 10.5,
      lon: -66.9,
      radiusKm: 2000,
    },
  },
  weather: {
    regions: {
      states: ["TX", "LA", "FL", "AL", "MS", "GA"], // Gulf Coast states
    },
    severityFilter: ["Extreme", "Severe", "Moderate"],
    includeMarine: true, // Include marine/tropical alerts
  },
  clock: {
    zones: [
      { city: "Caracas", timezone: "America/Caracas" },
      { city: "Washington DC", timezone: "America/New_York" },
      { city: "Bogotá", timezone: "America/Bogota" },
      { city: "Brasília", timezone: "America/Sao_Paulo" },
      { city: "Mexico City", timezone: "America/Mexico_City" },
    ],
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
      // Regional BBC
      { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC Middle East" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      // Wire Services
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
      { url: "https://feeds.reuters.com/reuters/worldNews", source: "Reuters World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", source: "NY Times Middle East" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://www.theguardian.com/world/middleeast/rss", source: "Guardian Middle East" },
      // TV Networks
      { url: "https://feeds.nbcnews.com/nbcnews/public/world", source: "NBC News" },
      { url: "https://feeds.cbsnews.com/CBSNewsWorld?format=xml", source: "CBS News" },
      { url: "https://abcnews.go.com/abcnews/internationalheadlines", source: "ABC News" },
      // International - Middle East focused
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://rss.dw.com/rdf/rss-en-world", source: "DW News" },
      { url: "https://www.france24.com/en/middle-east/rss", source: "France 24 Middle East" },
      { url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx", source: "Jerusalem Post" },
      { url: "https://www.timesofisrael.com/feed/", source: "Times of Israel" },
      { url: "https://www.haaretz.com/cmlink/1.628765", source: "Haaretz" },
      // Financial
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
    ],
    keywords: ["Gaza", "Israel", "Hamas", "IDF", "Palestine", "Netanyahu", "Rafah", "Hezbollah", "West Bank", "Tel Aviv", "Jerusalem", "Iran", "Lebanon", "ceasefire", "hostage"],
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
  earthquake: {
    feed: "all_day",
    minMagnitude: 2.0,
    focusRegion: {
      lat: 31.5,
      lon: 34.5,
      radiusKm: 500,
    },
  },
  clock: {
    zones: [
      { city: "Gaza", timezone: "Asia/Gaza" },
      { city: "Tehran", timezone: "Asia/Tehran" },
      { city: "Cairo", timezone: "Africa/Cairo" },
      { city: "Washington DC", timezone: "America/New_York" },
      { city: "Moscow", timezone: "Europe/Moscow" },
    ],
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
      // BBC Regional
      { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml", source: "BBC Europe" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", source: "BBC US/Canada" },
      // Wire Services
      { url: "https://feeds.reuters.com/reuters/topNews", source: "Reuters" },
      { url: "https://feeds.reuters.com/reuters/worldNews", source: "Reuters World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml", source: "NY Times Europe" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", source: "NY Times Politics" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://feeds.washingtonpost.com/rss/politics", source: "WaPo Politics" },
      { url: "https://www.theguardian.com/world/europe-news/rss", source: "Guardian Europe" },
      { url: "https://www.theguardian.com/us-news/rss", source: "Guardian US" },
      // TV Networks
      { url: "https://feeds.nbcnews.com/nbcnews/public/world", source: "NBC News" },
      { url: "https://feeds.nbcnews.com/nbcnews/public/politics", source: "NBC Politics" },
      { url: "https://feeds.cbsnews.com/CBSNewsWorld?format=xml", source: "CBS News" },
      { url: "https://abcnews.go.com/abcnews/internationalheadlines", source: "ABC News" },
      { url: "https://abcnews.go.com/abcnews/politicsheadlines", source: "ABC Politics" },
      // International - Nordic/European
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://rss.dw.com/rdf/rss-en-eu", source: "DW Europe" },
      { url: "https://rss.dw.com/rdf/rss-en-world", source: "DW News" },
      { url: "https://www.france24.com/en/europe/rss", source: "France 24 Europe" },
      { url: "https://www.politico.eu/feed/", source: "Politico EU" },
      { url: "https://www.euronews.com/rss", source: "Euronews" },
      // Financial
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
    ],
    keywords: ["Greenland", "Denmark", "Arctic", "NATO", "Thule", "Nuuk", "rare earth", "Trump", "Danish", "Nordic", "Copenhagen", "Frederiksen", "territory", "purchase", "annex"],
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
  earthquake: {
    feed: "all_day",
    minMagnitude: 3.0,
    focusRegion: {
      lat: 72.0,
      lon: -40.0,
      radiusKm: 3000,
    },
  },
  weather: {
    regions: {
      states: ["AK", "WA", "MT", "ND", "MN", "WI", "MI", "ME", "VT", "NH"], // Northern states
    },
    severityFilter: ["Extreme", "Severe", "Moderate"],
    includeMarine: true, // Include Arctic marine alerts
  },
  clock: {
    zones: [
      { city: "Nuuk", timezone: "America/Nuuk" },
      { city: "Copenhagen", timezone: "Europe/Copenhagen" },
      { city: "Washington DC", timezone: "America/New_York" },
      { city: "Moscow", timezone: "Europe/Moscow" },
      { city: "Ottawa", timezone: "America/Toronto" },
    ],
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
