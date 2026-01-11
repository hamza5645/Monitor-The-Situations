# Ideas & Future Improvements

A collection of potential enhancements for Monitor the Situations.

---

## New Panels / Data Sources

- [ ] **Earthquake Monitor** - USGS real-time JSON API for global seismic activity
- [ ] **Vessel Tracker** - MarineTraffic or VesselFinder embed (like flight radar but for ships)
- [ ] **Cyber Threat Map** - Kaspersky/Fortinet live attack visualization maps
- [ ] **Weather Alerts** - NOAA severe weather warnings
- [ ] **VIX Fear Gauge** - Visual meter showing market volatility
- [ ] **Gold/Oil/Crypto** - Expand stocks panel with commodities
- [ ] **World Clock** - Key time zones (DC, Moscow, Beijing, Jerusalem, Kyiv)

---

## UX Enhancements

- [ ] **Sound Alerts** - Optional audio beep when DEFCON changes or breaking news arrives
- [ ] **Keyboard Shortcuts** - Press 1-4 to maximize a panel, Esc to exit
- [ ] **Full-screen Panel** - Double-click a panel to expand it to 100%
- [ ] **Notification API** - Browser push notifications for critical alerts
- [ ] **CRT Effect Toggle** - Heavier scanlines + screen flicker for extra aesthetic

---

## Technical Upgrades

- [ ] **PWA Support** - Add manifest so users can "install" as an app
- [ ] **WebSocket/SSE** - True real-time for news instead of polling
- [ ] **Custom Feeds** - Let users add their own RSS or Twitter accounts
- [ ] **Shareable Layouts** - Export/import panel configs via URL params
- [ ] **Offline Mode** - Cache last known data for when network drops

---

## Quick Wins

- [ ] **Fix Reuters RSS** - Currently failing with ENOTFOUND, switch to working feed or remove
- [ ] **Stock Sparklines** - Add intraday trend mini-charts
- [ ] **Last Major Event Banner** - Scrolling banner at top with latest critical update

---

## Layout System

- [x] **Fix Twitter Panel** - Investigated embed options; Twitter API requires $200/month, free embeds are rate-limited. Links panel is the reliable solution.
- [x] **Save Layouts** - Persist custom panel arrangements to localStorage/cloud
- [ ] **Pre-loaded Situation Layouts** - Quick-switch configs for monitoring specific scenarios:
 x - **Greenland Crisis** - Arctic flight paths, Nordic news sources, relevant stocks
 x - **Venezuela Watch** - South America focus, oil prices, regional news feeds
  - **Taiwan Strait** - Pacific flight radar, Asian markets, defense stocks
  - **Ukraine Conflict** - Eastern Europe focus, energy prices, NATO sources
  - **Middle East** - Israel/Iran news, oil & gold, regional flight activity
 x - **Gaza**
  - **Cyber Attack** - Threat maps, tech stocks, security news feeds
  - **Economic Crisis** - All markets, VIX prominent, financial news
  - **Natural Disaster** - Earthquake + weather panels, emergency feeds

---

## Stretch Goals

- [ ] **AI Situation Summary** - LLM-generated brief of current global status
- [ ] **Sentiment Analysis** - Color-code news by tone (negative/neutral/positive)
- [ ] **Historical Timeline** - Scrollable log of major events from the session
- [ ] **Multi-monitor Mode** - Pop out panels into separate windows
- [ ] **Mobile Widgets** - iOS/Android home screen widgets for key data
- [ ] **Discord/Slack Bot** - Push alerts to external channels
- [ ] **Embeddable Widgets** - Let others embed panels on their sites

---

## Notes

Priority should be:
1. Fix broken functionality (Reuters RSS)
2. Layout save/load system
3. Pre-loaded situation templates
4. New data panels
5. Polish and extras
