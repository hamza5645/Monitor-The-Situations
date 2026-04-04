# Monitor The Situations — Full Application Audit Report

**Date:** 2026-04-04  
**Auditor:** GPT-5.3-Codex

## 1) Scope & Methodology

This audit covered:

- Frontend React/Next.js app behavior (desktop + mobile paths).
- API route reliability, security posture, caching behavior, and resilience.
- State management, localStorage persistence, and layout/feed customization logic.
- Build/test/lint/typecheck health in the current environment.

### Checks executed

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

## 2) Executive Summary

The app has a strong structure overall (clean panel separation, situation-based config model, and practical caching patterns), but there are important correctness and reliability issues that should be prioritized:

- **One functional regression on mobile:** custom feed panels can disappear because the mobile renderer drops unknown panel IDs.
- **Two stale-closure risks already flagged by lint:** effects can fetch using stale situation identity assumptions.
- **Build fragility:** production build fails in network-restricted environments due to runtime Google font fetch.
- **Security and resilience concerns in API layer:** unvalidated custom RSS URLs can be abused (SSRF risk), and in-memory cache key cardinality is unbounded.
- **Several logic/config mismatches:** some configuration fields exist but are not fully applied.

## 3) Detailed Findings

---

## High Severity

### H-1: Mobile view silently drops custom feed panels

**Where:** `components/MobileSwiper.tsx`  
**Issue:** Mobile panel rendering maps `visiblePanelIds` through `getPanelById(id)` only. Custom feeds use `custom-feed-*` IDs and are not part of the static panel registry, so they are filtered out and never rendered.

**Impact:** Users who enable custom RSS feed widgets in layout editing may not see them on mobile at all (data loss from UX perspective).

**Recommendation:**

- Add explicit custom-feed handling in mobile path (parallel to desktop `Dashboard.tsx` behavior using `isCustomFeedPanelId` and `SingleFeedPanel`).
- Add unit/integration coverage for custom feeds in mobile rendering.

---

### H-2: API route allows arbitrary feed URLs (SSRF risk)

**Where:** `app/api/news/route.ts`  
**Issue:** `feeds` query param is JSON-parsed and each `feed.url` is fetched server-side without URL validation/allowlist/egress restrictions.

**Impact:** Public API consumer can coerce server into making requests to attacker-chosen URLs (SSRF, internal service probing if network topology permits, and abuse of server resources).

**Recommendation:**

- Validate URLs (`https:` only, reject private/internal address spaces, optionally enforce known feed allowlist for non-authenticated requests).
- Add request timeout/size limits and per-request feed count caps.
- Consider moving custom feeds to client-side fetch proxy model with strict CORS handling if SSRF risk must be eliminated.

---

### H-3: Unbounded in-memory cache key cardinality

**Where:** `lib/api-cache.ts`, used by multiple API routes  
**Issue:** Cache is a process-wide `Map` with no max size and no periodic pruning aside from reads of exact keys. Routes such as `/api/news` and `/api/stocks` generate keys directly from user-provided serialized params.

**Impact:** Attackers or noisy clients can create high-cardinality keys leading to memory growth and potential worker/container instability.

**Recommendation:**

- Implement bounded LRU + TTL eviction.
- Normalize and hash cache keys with size limits.
- Rate-limit endpoints with high-cardinality parameters.

---

## Medium Severity

### M-1: Stale hook dependency warnings in core data panels

**Where:** `components/panels/NewsPanel.tsx`, `components/panels/StocksPanel.tsx`  
**Issue:** `useCallback` dependencies include config objects but omit `activeSituation.id`; lint correctly flags this. Logic currently uses refs to detect situation change, but callback closure can still become out-of-sync under some update patterns.

**Impact:** Potentially incorrect request parameterization after situation changes and harder-to-maintain behavior.

**Recommendation:**

- Include `activeSituation.id` in callback deps and simplify change-detection logic.
- Convert to explicit effect keyed by situation ID + config snapshot.

---

### M-2: Build fails when Google Fonts cannot be reached

**Where:** `app/layout.tsx` (`next/font/google`)  
**Issue:** Build fetches JetBrains Mono from Google at build-time; in restricted CI/network contexts this fails hard.

**Impact:** Non-deterministic build/deploy failures depending on egress availability.

**Recommendation:**

- Self-host font via `next/font/local` with committed font files.
- Or provide fallback path/environment toggle for offline builds.

---

### M-3: World clock deletion and keys rely on `city`, not unique identity

**Where:** `components/panels/WorldClockPanel.tsx`  
**Issue:** Custom zones are keyed/removed by city name. Duplicate city labels across different timezones can collide and remove multiple entries unexpectedly.

**Impact:** User data integrity and UX confusion when editing clocks.

**Recommendation:**

- Store and operate on stable IDs (UUID) for custom zones.
- Use `timezone + id` as React key and removal target.

---

### M-4: localStorage synchronization ignores key removals

**Where:** `hooks/useLocalStorage.ts`  
**Issue:** Storage listener updates state only when `e.newValue` exists. If key is removed in another tab (`newValue === null`), state is not reset.

**Impact:** Cross-tab inconsistency and stale UI state.

**Recommendation:**

- Handle `e.newValue === null` by resetting to initial/default state.

---

## Low Severity / Improvement Opportunities

### L-1: `includeMarine` weather option exists but appears functionally unused

**Where:** `types/situation.ts`, `components/panels/WeatherAlertsPanel.tsx`, `app/api/weather-alerts/route.ts`  
**Issue:** Configuration includes marine toggling semantics, but request construction/API filtering does not apply a marine-specific control.

**Recommendation:**

- Either implement marine filtering behavior or remove/rename the config to avoid false expectations.

---

### L-2: Feed parsing is regex-based and brittle against varied RSS/Atom formats

**Where:** `app/api/news/route.ts`, `app/api/tweets/route.ts`  
**Issue:** Regex parsers can break on namespace-heavy XML, malformed CDATA edge cases, or uncommon tag ordering.

**Recommendation:**

- Use a small XML parser (`fast-xml-parser`) with schema-tolerant extraction.

---

### L-3: `useCustomFeeds` state updates can suffer from stale closure on rapid updates

**Where:** `hooks/useCustomFeeds.ts`  
**Issue:** Updates derive from `state.feeds` captured in callback dependencies instead of functional state updates.

**Recommendation:**

- Extend `useLocalStorage` setter to accept updater functions, then use functional updates for add/remove operations.

---

### L-4: Error handling consistency could be improved across APIs

**Where:** multiple routes  
**Issue:** Some endpoints return fallback successful payloads with embedded `error`, others return 502/500 directly. This mixed contract complicates client logic.

**Recommendation:**

- Standardize API error envelope and status policy by route type (hard-fail vs graceful degradation).

---

## 4) Positive Observations

- Situation-driven architecture is clean and composable.
- API caching + SWR headers are thoughtfully applied.
- UI update loops are generally cleaned up properly in effects.
- Panel modularity is good and supports future expansion.

## 5) Prioritized Remediation Plan

### Phase 1 (Immediate)

1. Fix mobile custom feed rendering parity.
2. Validate/sanitize RSS feed URLs and add SSRF protections.
3. Replace unbounded cache with bounded LRU/TTL implementation.
4. Resolve lint dependency warnings in News/Stocks panels.

### Phase 2 (Short term)

5. Self-host fonts for deterministic builds.
6. Refactor world clock custom zone identity model.
7. Fix storage-sync null-removal handling.

### Phase 3 (Hardening)

8. Move XML parsing from regex to parser library.
9. Add API contract tests and mobile regression tests for custom feeds.
10. Add endpoint-level rate limiting / request guards for heavy paths.

## 6) Validation Results Snapshot

- **Lint:** passes with 2 warnings (hook dependency warnings).
- **Typecheck:** passes.
- **Build:** fails in this environment due to Google Font fetch failure.

## 7) Final Risk Posture

Current posture is **moderate risk** overall, with specific **high-priority** items around mobile feature parity and backend request-safety hardening. Addressing Phase 1 items would materially improve stability and abuse resistance.
