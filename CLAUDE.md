# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rules

- **NEVER commit, push, or deploy without explicit user permission.** Always wait for the user to explicitly ask before running git commit, git push, or any deploy commands.

## Project Overview

"Monitor the Situations" is a meme-inspired situation room dashboard that displays real-time world monitoring data. It features a dark ops-center aesthetic with red accents, showing flight radar, stock markets, breaking news, earthquakes, cyber threats, and intel source links.

## Commands

```bash
npm run dev           # Start Next.js dev server at localhost:3000
npm run build         # Standard Next.js build
npm run lint          # Run ESLint
npm run cf:build      # Build for Cloudflare Workers (uses OpenNext)
npm run cf:preview    # Build and preview locally with wrangler
npm run cf:deploy     # Build and deploy to Cloudflare Workers
```

**Live URL:** https://monitor-the-situations.hamzaosama5645.workers.dev

## CI/CD

GitHub Actions automatically deploys to Cloudflare Workers on every push to `main`. See `.github/workflows/deploy.yml`.

## Architecture

### Stack
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS 4 (dark theme, red accents)
- **Deployment:** Cloudflare Workers via `@opennextjs/cloudflare`
- **Mobile:** Swiper.js for swipe navigation

### Key Directories

- `app/` - Next.js App Router pages and API routes
- `app/api/` - Backend API routes (defcon, stocks, news, earthquake, cyber-threats, tweets, fear-greed, weather-alerts)
- `components/` - React components (Dashboard, Header, LoadingScreen, WidgetSelector, etc.)
- `components/panels/` - Individual dashboard panels (Flight, Stocks, News, Earthquake, CyberThreat, Twitter, FearGreed, WeatherAlerts, WorldClock, SingleFeed)
- `hooks/` - Custom React hooks (useMediaQuery, useLocalStorage, useCustomFeeds)

### Key Patterns

- **Dynamic imports:** Dashboard and MobileSwiper use `next/dynamic` with `ssr: false` to avoid hydration issues
- **Responsive layout:** `useMediaQuery` hook switches between Desktop (CSS Grid) and Mobile (Swiper)
- **Panel data fetching:** Each panel fetches from internal API routes with caching headers
- **Layout persistence:** Dashboard layout (panel order, split ratios) persists in localStorage

### Dashboard Layout System

The Dashboard uses CSS Grid with a "crosshair" resize pattern:
- `splitX` and `splitY` percentages control grid track sizes
- In edit mode, a draggable handle at the center resizes all panels
- Panel order can be swapped via drag-and-drop
- Layout persists in localStorage (`mts-order-v1`, `mts-split-v1` keys)

### Cloudflare Deployment Constraints

- Do NOT add `export const runtime = "edge"` to API routes or pages (breaks OpenNext build)
- Uses OpenNext adapter to convert Next.js for Cloudflare Workers
- Configured via `wrangler.toml` and `open-next.config.ts`

### External Data Sources

| Panel | API Route | Source |
|-------|-----------|--------|
| Flight Radar | - | ADS-B Exchange iframe embed |
| Stocks | /api/stocks | Yahoo Finance (unofficial) |
| News | /api/news | BBC/Reuters/NYT RSS feeds |
| DEFCON | /api/defcon | defconlevel.com, VIX fallback |
| Earthquakes | /api/earthquake | USGS earthquake feed |
| Cyber Threats | /api/cyber-threats | Threat intelligence sources |
| Fear & Greed | /api/fear-greed | CNN Fear & Greed Index |
| Weather Alerts | /api/weather-alerts | NWS alerts API |
| World Clock | - | Client-side time zones |
| Custom Feeds | - | User-configured RSS feeds via SingleFeedPanel |
