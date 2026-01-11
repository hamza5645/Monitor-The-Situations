# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Monitor the Situations" is a meme-inspired situation room dashboard that displays real-time world monitoring data. It features a dark ops-center aesthetic with red accents, showing flight radar, stock markets, breaking news, and intel source links.

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server at localhost:3000

# Production build
npm run build         # Standard Next.js build
npm run lint          # Run ESLint

# Cloudflare deployment (manual)
npm run cf:build      # Build for Cloudflare Workers (uses OpenNext)
npm run cf:preview    # Build and preview locally with wrangler
npm run cf:deploy     # Build and deploy to Cloudflare Workers
```

**Live URL:** https://monitor-the-situations.hamzaosama5645.workers.dev

## CI/CD

GitHub Actions automatically deploys to Cloudflare Workers on every push to `main`. See `.github/workflows/deploy.yml`.

Required GitHub Secrets:
- `CLOUDFLARE_API_TOKEN` - API token with Workers Scripts (Edit) permission
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

## Architecture

### Stack
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS 4 (dark theme, red accents)
- **Deployment:** Cloudflare Workers via `@opennextjs/cloudflare`
- **Mobile:** Swiper.js for swipe navigation

### Component Structure

```
app/
├── page.tsx              # Main page with LoadingScreen → Dashboard/MobileSwiper
├── layout.tsx            # Root layout with JetBrains Mono font
├── globals.css           # Tailwind + custom panel styles, scanlines, ticker animations
└── api/
    ├── defcon/route.ts   # Fetches DEFCON level (scrapes defconlevel.com or VIX fallback)
    ├── stocks/route.ts   # Yahoo Finance proxy for stock quotes
    ├── news/route.ts     # BBC/Reuters RSS feed parser
    └── tweets/route.ts   # Twitter RSS bridge (RSSHub/Nitter - mostly broken)

components/
├── Dashboard.tsx         # CSS grid layout with crosshair resize (desktop)
├── MobileSwiper.tsx      # Swiper-based panel navigation (mobile)
├── Header.tsx            # Top bar with logo, threat level, monitoring counter
├── ThreatLevel.tsx       # DEFCON-style indicator (fetches /api/defcon)
├── MonitoringCounter.tsx # Fake visitor counter (fluctuates randomly)
├── LoadingScreen.tsx     # Splash screen with world leader "monitoring" quotes
└── panels/
    ├── TwitterPanel.tsx  # Intel sources with categorized X/Twitter links
    ├── FlightPanel.tsx   # ADS-B Exchange iframe embed
    ├── StocksPanel.tsx   # Live stock data display
    └── NewsPanel.tsx     # Breaking news ticker with scrolling headlines
```

### Key Patterns

- **Dynamic imports:** Dashboard and MobileSwiper use `next/dynamic` with `ssr: false` to avoid hydration issues with browser-only code
- **Panel data fetching:** Each panel fetches from internal API routes with caching headers
- **Responsive layout:** Uses `useIsMobile` hook to switch between Dashboard (grid) and MobileSwiper (swipe)
- **Session state:** LoadingScreen uses sessionStorage to show only once per session

### Dashboard Layout System

The Dashboard uses CSS Grid with a "crosshair" resize pattern:
- `splitX` and `splitY` percentages control grid track sizes (default 50%)
- In edit mode, a draggable handle at the center intersection resizes all 4 panels
- Panel order can be swapped via drag-and-drop
- Layout persists in localStorage (`mts-order-v1`, `mts-split-v1` keys)

### Cloudflare Deployment

Configured via `wrangler.toml` and `open-next.config.ts`:
- Uses OpenNext adapter to convert Next.js for Cloudflare Workers
- Static assets served from `.open-next/assets`
- API routes run as serverless functions
- Do NOT add `export const runtime = "edge"` to API routes (breaks OpenNext build)

### External Data Sources

| Panel | Source | Notes |
|-------|--------|-------|
| Flight Radar | ADS-B Exchange | iframe embed, shows military aircraft |
| Stocks | Yahoo Finance | Unofficial API, indices + defense + crypto |
| News | BBC/Reuters RSS | Parsed server-side, 5-min cache |
| DEFCON | defconlevel.com | Falls back to VIX-based estimation |
| Intel | X/Twitter | Links only (API access required for tweets) |
