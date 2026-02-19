# Monitor The Situations

A real-time, ops-center-style global monitoring dashboard that aggregates live data from multiple intelligence and data sources into a single, customizable view. Dark-themed command center aesthetic with scanline overlay and JetBrains Mono typography.

**Live:** [monitorthesituations.com](https://monitorthesituations.com)

---

## What It Monitors

Nine real-time data panels:

| Panel | Data Source | Refresh |
|---|---|---|
| **Flight Radar** | ADS-B Exchange (iframe with military filter toggle) | Live |
| **Market Data** | Yahoo Finance API (indices, commodities, defense stocks, crypto) | 10s |
| **Breaking News** | 13+ RSS feeds (BBC, Guardian, NPR, NYT, Al Jazeera, Bloomberg, etc.) | 20s |
| **Intel Sources** | Curated X/Twitter OSINT accounts | Static |
| **Seismic Monitor** | USGS Earthquake Hazards Program | 30s |
| **Weather Alerts** | NOAA National Weather Service | 60s |
| **Cyber Threats** | AlienVault OTX (canvas-rendered attack map with arc animations) | 5s |
| **Fear & Greed** | Crypto Fear & Greed Index (SVG gauge) | 60s |
| **World Clock** | Browser Intl API (configurable IANA timezones) | 1s |

A DEFCON-style threat level indicator in the header scrapes defconlevel.com with a VIX-based fallback.

---

## Preset Situations

10 pre-configured monitoring profiles, each tailoring flight radar coordinates, stock watchlists, news keywords, intel accounts, and earthquake regions:

**All Situations** (default) | **Venezuela** | **Gaza** | **Greenland** | **Taiwan Strait** | **Ukraine Conflict** | **Middle East** | **Cyber Attack** | **Economic Crisis** | **Natural Disaster**

Users can also create, edit, duplicate, and delete custom situations. All custom state persists in localStorage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Font** | JetBrains Mono |
| **Mobile** | Swiper.js for swipeable panel navigation |
| **Deployment** | Cloudflare Workers via OpenNext |

---

## Architecture

- **Situation-Driven Architecture**: Every panel reads its config from the active `SituationConfig` via React Context. Switching situations reconfigures all panels simultaneously.
- **Dynamic Grid Layout**: Custom CSS Grid with drag-to-reorder and crosshair resize handles. Auto-calculates based on visible panel count (1-12 panels).
- **API Proxy Layer**: All external fetches go through Next.js API routes (keeps keys off client, enables caching).
- **Canvas-Rendered Cyber Map**: Animated world map on HTML5 canvas with real-time attack arcs and pulsing dots — no mapping library.
- **Security Hardening**: Strict CSP, HSTS, X-Frame-Options DENY via middleware.
- **PWA Support**: Service worker, web app manifest.

---

## Key Features

- Drag-and-drop panel reordering with visual swap indicators
- Crosshair grid resizing for column/row proportions
- Widget selector to toggle panels on/off (1-12 supported)
- Custom RSS feeds as standalone panels
- Situation presets + custom situation builder
- Military aircraft filter toggle on flight radar
- News ticker with auto-scrolling headlines
- Configurable world clock with timezone search
- Dynamic OG images, JSON-LD, sitemap for SEO

---

## Running Locally

```bash
git clone https://github.com/hamza5645/Monitor-The-Situations.git
cd Monitor-The-Situations
npm install
npm run dev
```

No environment variables required — all external APIs are public.

### Cloudflare Deployment

```bash
npm run cf:build
npm run cf:deploy
```
