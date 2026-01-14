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
      { url: "https://www.theguardian.com/world/rss", source: "The Guardian" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
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
  layout: {
    order: ["world-clock", "flight", "stocks", "news"],
    visiblePanels: ["world-clock", "flight", "stocks", "news"],
    splitXs: [50],
    splitYs: [50],
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
        { symbol: "PBR", name: "Petrobras" },
      ],
    },
    {
      title: "Latin America",
      symbols: [
        { symbol: "EWZ", name: "Brazil ETF" },
        { symbol: "ARGT", name: "Argentina ETF" },
        { symbol: "ILF", name: "LatAm 40 ETF" },
        { symbol: "EWW", name: "Mexico ETF" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
        { symbol: "GC=F", name: "Gold" },
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
      { url: "https://www.theguardian.com/world/americas/rss", source: "Guardian Americas" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Americas.xml", source: "NY Times Americas" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
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
  layout: {
    order: ["weather", "flight", "stocks", "news", "fear-greed", "world-clock"],
    visiblePanels: ["weather", "flight", "stocks", "news", "fear-greed", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
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
        { symbol: "ESLT", name: "Elbit Systems" },
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
      title: "Safe Havens",
      symbols: [
        { symbol: "GC=F", name: "Gold" },
        { symbol: "^VIX", name: "VIX (Fear)" },
        { symbol: "TLT", name: "Treasury Bonds" },
      ],
    },
  ],
  news: {
    feeds: [
      // Regional BBC
      { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC Middle East" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      // Wire Services
      { url: "https://www.theguardian.com/world/middleeast/rss", source: "Guardian Middle East" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", source: "NY Times Middle East" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
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
  layout: {
    order: ["cyber", "flight", "stocks", "news", "fear-greed", "world-clock"],
    visiblePanels: ["cyber", "flight", "stocks", "news", "fear-greed", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
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
        { symbol: "HII", name: "Huntington Ingalls" },
      ],
    },
    {
      title: "Rare Earth & Mining",
      symbols: [
        { symbol: "MP", name: "MP Materials" },
        { symbol: "VALE", name: "Vale SA" },
        { symbol: "RIO", name: "Rio Tinto" },
        { symbol: "BHP", name: "BHP Group" },
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
      { url: "https://www.theguardian.com/world/europe-news/rss", source: "Guardian Europe" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml", source: "NY Times Europe" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", source: "NY Times Politics" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://feeds.washingtonpost.com/rss/politics", source: "WaPo Politics" },
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
  layout: {
    order: ["weather", "flight", "stocks", "news", "fear-greed", "world-clock"],
    visiblePanels: ["weather", "flight", "stocks", "news", "fear-greed", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
  },
};

// ========== NEW SITUATIONS ==========

export const TAIWAN_SITUATION: SituationConfig = {
  id: "taiwan",
  name: "Taiwan Strait",
  description: "Monitor Taiwan Strait tensions and semiconductor supply chain",
  isPreset: true,
  flight: {
    lat: 25.0,
    lon: 122.0,
    zoom: 6,
  },
  stocks: [
    {
      title: "Semiconductors",
      symbols: [
        { symbol: "TSM", name: "TSMC" },
        { symbol: "NVDA", name: "NVIDIA" },
        { symbol: "AMD", name: "AMD" },
        { symbol: "INTC", name: "Intel" },
      ],
    },
    {
      title: "Defense",
      symbols: [
        { symbol: "LMT", name: "Lockheed Martin" },
        { symbol: "RTX", name: "RTX Corp" },
        { symbol: "NOC", name: "Northrop" },
        { symbol: "BA", name: "Boeing" },
      ],
    },
    {
      title: "Asian Markets",
      symbols: [
        { symbol: "EWJ", name: "Japan ETF" },
        { symbol: "FXI", name: "China ETF" },
        { symbol: "EWY", name: "Korea ETF" },
        { symbol: "EWT", name: "Taiwan ETF" },
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
      { url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml", source: "BBC Asia" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://www.theguardian.com/world/asia-pacific/rss", source: "Guardian Asia" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml", source: "NY Times Asia" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://feeds.nbcnews.com/nbcnews/public/world", source: "NBC News" },
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
    ],
    keywords: ["Taiwan", "China", "Taipei", "Beijing", "semiconductor", "TSMC", "PLA", "Strait", "Xi Jinping", "chip", "military"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "DeptofDefense", name: "DoD", category: "Gov" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "IntelCrab", name: "Intel Crab", category: "OSINT" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "Gov", "OSINT"],
  },
  earthquake: {
    feed: "all_day",
    minMagnitude: 4.0,
    focusRegion: {
      lat: 25.0,
      lon: 122.0,
      radiusKm: 1500,
    },
  },
  clock: {
    zones: [
      { city: "Taipei", timezone: "Asia/Taipei" },
      { city: "Beijing", timezone: "Asia/Shanghai" },
      { city: "Tokyo", timezone: "Asia/Tokyo" },
      { city: "Seoul", timezone: "Asia/Seoul" },
      { city: "Washington DC", timezone: "America/New_York" },
    ],
  },
  layout: {
    order: ["cyber", "flight", "stocks", "news", "fear-greed", "world-clock"],
    visiblePanels: ["cyber", "flight", "stocks", "news", "fear-greed", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
  },
};

export const UKRAINE_SITUATION: SituationConfig = {
  id: "ukraine",
  name: "Ukraine Conflict",
  description: "Monitor Ukraine conflict and European energy security",
  isPreset: true,
  flight: {
    lat: 48.5,
    lon: 31.0,
    zoom: 5,
  },
  stocks: [
    {
      title: "Energy",
      symbols: [
        { symbol: "NG=F", name: "Natural Gas" },
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "XLE", name: "Energy ETF" },
        { symbol: "BP", name: "BP" },
        { symbol: "EQNR", name: "Equinor" },
      ],
    },
    {
      title: "Defense",
      symbols: [
        { symbol: "LMT", name: "Lockheed Martin" },
        { symbol: "RTX", name: "RTX Corp" },
        { symbol: "NOC", name: "Northrop" },
        { symbol: "BA", name: "Boeing" },
      ],
    },
    {
      title: "European Markets",
      symbols: [
        { symbol: "EWG", name: "Germany ETF" },
        { symbol: "EWU", name: "UK ETF" },
        { symbol: "VGK", name: "Europe ETF" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
        { symbol: "GC=F", name: "Gold" },
        { symbol: "DXY", name: "US Dollar Index" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml", source: "BBC Europe" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://www.theguardian.com/world/europe-news/rss", source: "Guardian Europe" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml", source: "NY Times Europe" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://rss.dw.com/rdf/rss-en-eu", source: "DW Europe" },
      { url: "https://www.politico.eu/feed/", source: "Politico EU" },
      { url: "https://www.euronews.com/rss", source: "Euronews" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
    ],
    keywords: ["Ukraine", "Russia", "Kyiv", "Moscow", "NATO", "Zelensky", "Putin", "Crimea", "Donbas", "Kharkiv", "gas", "energy", "sanctions"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "NATO", name: "NATO", category: "Gov" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "DeptofDefense", name: "DoD", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "IntelCrab", name: "Intel Crab", category: "OSINT" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "Gov", "OSINT"],
  },
  earthquake: {
    feed: "all_day",
    minMagnitude: 3.0,
    focusRegion: {
      lat: 48.5,
      lon: 31.0,
      radiusKm: 1500,
    },
  },
  weather: {
    regions: {
      states: ["NY", "PA", "OH", "MI", "WI", "MN", "ND", "MT"],
    },
    severityFilter: ["Extreme", "Severe"],
    includeMarine: false,
  },
  clock: {
    zones: [
      { city: "Kyiv", timezone: "Europe/Kyiv" },
      { city: "Moscow", timezone: "Europe/Moscow" },
      { city: "Brussels", timezone: "Europe/Brussels" },
      { city: "Warsaw", timezone: "Europe/Warsaw" },
      { city: "Washington DC", timezone: "America/New_York" },
    ],
  },
  layout: {
    order: ["weather", "flight", "stocks", "news", "fear-greed", "world-clock"],
    visiblePanels: ["weather", "flight", "stocks", "news", "fear-greed", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
  },
};

export const MIDDLE_EAST_SITUATION: SituationConfig = {
  id: "middle-east",
  name: "Middle East",
  description: "Monitor broader Middle East tensions and oil markets",
  isPreset: true,
  flight: {
    lat: 30.0,
    lon: 45.0,
    zoom: 5,
  },
  stocks: [
    {
      title: "Oil & Gold",
      symbols: [
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "BZ=F", name: "Brent Crude" },
        { symbol: "GC=F", name: "Gold" },
        { symbol: "SI=F", name: "Silver" },
      ],
    },
    {
      title: "Defense",
      symbols: [
        { symbol: "LMT", name: "Lockheed Martin" },
        { symbol: "RTX", name: "RTX Corp" },
        { symbol: "NOC", name: "Northrop" },
      ],
    },
    {
      title: "Regional",
      symbols: [
        { symbol: "EIS", name: "Israel ETF" },
        { symbol: "KSA", name: "Saudi ETF" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", source: "BBC Middle East" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://www.theguardian.com/world/middleeast/rss", source: "Guardian Middle East" },
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://www.france24.com/en/middle-east/rss", source: "France 24 Middle East" },
      { url: "https://rss.dw.com/rdf/rss-en-world", source: "DW News" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg" },
    ],
    keywords: ["Iran", "Saudi", "Israel", "Yemen", "Syria", "Iraq", "oil", "OPEC", "Hezbollah", "Houthi", "Red Sea", "Gulf", "Tehran"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "StateDept", name: "State Dept", category: "Gov" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "IntelCrab", name: "Intel Crab", category: "OSINT" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "Gov", "OSINT"],
  },
  earthquake: {
    feed: "all_day",
    minMagnitude: 4.0,
    focusRegion: {
      lat: 30.0,
      lon: 45.0,
      radiusKm: 2000,
    },
  },
  clock: {
    zones: [
      { city: "Tehran", timezone: "Asia/Tehran" },
      { city: "Riyadh", timezone: "Asia/Riyadh" },
      { city: "Tel Aviv", timezone: "Asia/Tel_Aviv" },
      { city: "Baghdad", timezone: "Asia/Baghdad" },
      { city: "Ankara", timezone: "Europe/Istanbul" },
    ],
  },
  layout: {
    order: ["fear-greed", "flight", "stocks", "news", "cyber", "world-clock"],
    visiblePanels: ["fear-greed", "flight", "stocks", "news", "cyber", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
  },
};

export const CYBER_ATTACK_SITUATION: SituationConfig = {
  id: "cyber-attack",
  name: "Cyber Attack",
  description: "Monitor global cyber threats and tech sector impact",
  isPreset: true,
  flight: {
    lat: 0,
    lon: 0,
    zoom: 2,
  },
  stocks: [
    {
      title: "Cybersecurity",
      symbols: [
        { symbol: "PANW", name: "Palo Alto" },
        { symbol: "CRWD", name: "CrowdStrike" },
        { symbol: "FTNT", name: "Fortinet" },
        { symbol: "ZS", name: "Zscaler" },
      ],
    },
    {
      title: "Tech Giants",
      symbols: [
        { symbol: "GOOGL", name: "Alphabet" },
        { symbol: "MSFT", name: "Microsoft" },
        { symbol: "AMZN", name: "Amazon" },
        { symbol: "META", name: "Meta" },
      ],
    },
    {
      title: "Infrastructure",
      symbols: [
        { symbol: "CSCO", name: "Cisco" },
        { symbol: "ANET", name: "Arista" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC Tech" },
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://www.theguardian.com/technology/rss", source: "Guardian Tech" },
      { url: "https://feeds.npr.org/1019/rss.xml", source: "NPR Tech" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", source: "NY Times Tech" },
      { url: "https://www.cnbc.com/id/19854910/device/rss/rss.html", source: "CNBC Tech" },
      { url: "https://feeds.bloomberg.com/technology/news.rss", source: "Bloomberg Tech" },
    ],
    keywords: ["cyber", "hack", "breach", "ransomware", "APT", "malware", "DDoS", "infrastructure", "critical", "security", "attack"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "ABORTEDALPHA", name: "Aborted Alpha", category: "OSINT" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "OSINT"],
  },
  clock: {
    zones: [
      { city: "San Francisco", timezone: "America/Los_Angeles" },
      { city: "New York", timezone: "America/New_York" },
      { city: "London", timezone: "Europe/London" },
      { city: "Beijing", timezone: "Asia/Shanghai" },
      { city: "Moscow", timezone: "Europe/Moscow" },
    ],
  },
  layout: {
    order: ["cyber", "stocks", "news", "fear-greed", "world-clock"],
    visiblePanels: ["cyber", "stocks", "news", "fear-greed", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
  },
};

export const ECONOMIC_SITUATION: SituationConfig = {
  id: "economic",
  name: "Economic Crisis",
  description: "Monitor global financial markets and economic indicators",
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
        { symbol: "^RUT", name: "Russell 2000" },
      ],
    },
    {
      title: "Volatility & Bonds",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
        { symbol: "TLT", name: "Treasury Bonds" },
        { symbol: "AGG", name: "Aggregate Bonds" },
        { symbol: "SHY", name: "Short Treasury" },
      ],
    },
    {
      title: "Commodities",
      symbols: [
        { symbol: "GC=F", name: "Gold" },
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "SI=F", name: "Silver" },
      ],
    },
    {
      title: "Banks",
      symbols: [
        { symbol: "JPM", name: "JPMorgan" },
        { symbol: "BAC", name: "Bank of America" },
        { symbol: "GS", name: "Goldman Sachs" },
        { symbol: "C", name: "Citigroup" },
      ],
    },
    {
      title: "Crypto",
      symbols: [
        { symbol: "BTC-USD", name: "Bitcoin" },
        { symbol: "ETH-USD", name: "Ethereum" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bloomberg.com/markets/news.rss", source: "Bloomberg Markets" },
      { url: "https://feeds.bloomberg.com/politics/news.rss", source: "Bloomberg Politics" },
      { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC Finance" },
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
      { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business" },
      { url: "https://www.theguardian.com/business/rss", source: "Guardian Business" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", source: "NY Times Business" },
      { url: "https://feeds.washingtonpost.com/rss/business", source: "WaPo Business" },
    ],
    keywords: ["recession", "inflation", "Fed", "rates", "GDP", "unemployment", "bank", "crisis", "default", "yield", "economy", "market"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "Polymarket", name: "Polymarket", category: "Markets" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "spectatorindex", name: "Spectator Index", category: "News" },
      { handle: "BNONews", name: "BNO News", category: "News" },
    ],
    categories: ["News", "Markets"],
  },
  clock: {
    zones: [
      { city: "New York", timezone: "America/New_York" },
      { city: "London", timezone: "Europe/London" },
      { city: "Frankfurt", timezone: "Europe/Berlin" },
      { city: "Tokyo", timezone: "Asia/Tokyo" },
      { city: "Hong Kong", timezone: "Asia/Hong_Kong" },
    ],
  },
  layout: {
    order: ["stocks", "fear-greed", "news", "world-clock"],
    visiblePanels: ["stocks", "fear-greed", "news", "world-clock"],
    splitXs: [50],
    splitYs: [50],
  },
};

export const NATURAL_DISASTER_SITUATION: SituationConfig = {
  id: "natural-disaster",
  name: "Natural Disaster",
  description: "Monitor earthquakes, severe weather, and emergency situations",
  isPreset: true,
  flight: {
    lat: 0,
    lon: 0,
    zoom: 2,
  },
  stocks: [
    {
      title: "Insurance",
      symbols: [
        { symbol: "ALL", name: "Allstate" },
        { symbol: "CB", name: "Chubb" },
        { symbol: "RE", name: "Everest Re" },
        { symbol: "PGR", name: "Progressive" },
        { symbol: "TRV", name: "Travelers" },
      ],
    },
    {
      title: "Utilities",
      symbols: [
        { symbol: "XLU", name: "Utilities ETF" },
        { symbol: "NEE", name: "NextEra Energy" },
        { symbol: "DUK", name: "Duke Energy" },
      ],
    },
    {
      title: "Commodities",
      symbols: [
        { symbol: "CL=F", name: "Crude Oil" },
        { symbol: "NG=F", name: "Natural Gas" },
      ],
    },
    {
      title: "Risk Indicators",
      symbols: [
        { symbol: "^VIX", name: "VIX (Fear)" },
      ],
    },
  ],
  news: {
    feeds: [
      { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
      { url: "https://feeds.npr.org/1004/rss.xml", source: "NPR World" },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times World" },
      { url: "https://feeds.washingtonpost.com/rss/world", source: "Washington Post" },
      { url: "https://feeds.nbcnews.com/nbcnews/public/news", source: "NBC News" },
      { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
      { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", source: "CNBC World" },
    ],
    keywords: ["earthquake", "tsunami", "hurricane", "tornado", "flood", "wildfire", "FEMA", "evacuation", "emergency", "disaster", "storm"],
  },
  intel: {
    accounts: [
      { handle: "Reuters", name: "Reuters", category: "News" },
      { handle: "AP", name: "AP News", category: "News" },
      { handle: "BNONews", name: "BNO News", category: "News" },
      { handle: "sentdefender", name: "OSINTdefender", category: "OSINT" },
    ],
    categories: ["News", "OSINT"],
  },
  earthquake: {
    feed: "all_hour",
    minMagnitude: 2.5,
  },
  weather: {
    regions: {
      states: [],
    },
    severityFilter: ["Extreme", "Severe", "Moderate", "Minor"],
    includeMarine: true,
  },
  clock: {
    zones: [
      { city: "Washington DC", timezone: "America/New_York" },
      { city: "Los Angeles", timezone: "America/Los_Angeles" },
      { city: "Tokyo", timezone: "Asia/Tokyo" },
      { city: "Sydney", timezone: "Australia/Sydney" },
      { city: "London", timezone: "Europe/London" },
    ],
  },
  layout: {
    order: ["earthquake", "weather", "news", "stocks", "flight", "world-clock"],
    visiblePanels: ["earthquake", "weather", "news", "stocks", "flight", "world-clock"],
    splitXs: [33, 66],
    splitYs: [50],
  },
};

export const PRESET_SITUATIONS: SituationConfig[] = [
  DEFAULT_SITUATION,
  VENEZUELA_SITUATION,
  GAZA_SITUATION,
  GREENLAND_SITUATION,
  TAIWAN_SITUATION,
  UKRAINE_SITUATION,
  MIDDLE_EAST_SITUATION,
  CYBER_ATTACK_SITUATION,
  ECONOMIC_SITUATION,
  NATURAL_DISASTER_SITUATION,
];

export function getPresetById(id: string): SituationConfig | undefined {
  return PRESET_SITUATIONS.find((s) => s.id === id);
}
