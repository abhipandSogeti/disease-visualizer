# Forecast Horizon v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 14-day risk trend sparkline and direction headline to each disease RiskCard on the Place Health Check page.

**Architecture:** Additive extension of the existing v1 risk engine — shared pure scoring helpers (extracted from `assessRisk`) are called per-day over a concatenated `[history(56), forecast(14)]` series. `ClimateWindow` gains a required `forecast` field; all v1 `assessRisk` logic remains unchanged. Two new components (`TrendBadge`, `RiskSparkline`) slot into the existing `RiskCard`.

**Tech Stack:** TypeScript + Zod, Vitest + React Testing Library, Recharts v2 (already installed), Open-Meteo daily forecast API (same proxy already configured).

---

## File Map

| Action | File                                         | Purpose                                                              |
| ------ | -------------------------------------------- | -------------------------------------------------------------------- |
| Modify | `src/types/risk.types.ts`                    | Add `DayRisk`, `TrendDirection`, `TrendSummary`                      |
| Modify | `src/types/climate.schema.ts`                | Add `forecast: z.array(DailyWeatherSchema)` to `ClimateWindowSchema` |
| Modify | `src/lib/risk-engine.ts`                     | Extract scorers, add `assessRiskTimeline`, `summarizeTrend`          |
| Modify | `src/lib/risk-engine.test.ts`                | Update `window()` helper + new timeline/trend tests                  |
| Modify | `src/services/climate.service.ts`            | `forecast_days=14`, split daily → history + forecast                 |
| Modify | `src/services/climate.service.test.ts`       | Update fixture + add forecast mapping assertion                      |
| Modify | `src/hooks/useRiskAssessment.ts`             | Add `timeline` + `trend` to `RiskResult`                             |
| Create | `src/components/risk/TrendBadge.tsx`         | Headline text: "Rising ↑ — peak risk Jun 30"                         |
| Create | `src/components/risk/TrendBadge.test.tsx`    | Rising/falling/stable text + colour class                            |
| Create | `src/components/risk/RiskSparkline.tsx`      | Recharts 120×40 area chart of DayRisk[]                              |
| Create | `src/components/risk/RiskSparkline.test.tsx` | Renders, aria-label, correct data                                    |
| Modify | `src/components/risk/RiskCard.tsx`           | Wire in TrendBadge + RiskSparkline                                   |
| Modify | `src/components/risk/RiskCard.test.tsx`      | Add `timeline` + `trend` to test fixture                             |
| Modify | `src/pages/PlacePage.test.tsx`               | Add `forecast: [14 items]` to ClimateWindow fixture                  |

---

## Task 1: New types in `risk.types.ts`

**Files:**

- Modify: `src/types/risk.types.ts`

- [ ] **Step 1: Add `DayRisk`, `TrendDirection`, `TrendSummary` to the types file**

```ts
// src/types/risk.types.ts — append after RiskAssessment

export interface DayRisk {
  date: string // ISO-8601 e.g. "2026-06-23"
  score: number // 0–1 composite
  level: RiskLevel
}

export type TrendDirection = 'rising' | 'falling' | 'stable'

export interface TrendSummary {
  direction: TrendDirection
  peakDate: string // ISO-8601 date of highest score
  peakLevel: RiskLevel
  todayScore: number // timeline[0].score
  peakScore: number
}
```

- [ ] **Step 2: Run typecheck — must pass with 0 errors**

```bash
pnpm typecheck
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/types/risk.types.ts
git commit -m "feat: add DayRisk and TrendSummary types for forecast horizon"
```

---

## Task 2: Add `forecast` to `ClimateWindow` schema + update ALL fixtures

`ClimateWindow` gains a required `forecast` field. This is a Zod schema change — TypeScript will error at every site that constructs a `ClimateWindow` without it. Fix all sites in one commit.

**Files:**

- Modify: `src/types/climate.schema.ts`
- Modify: `src/lib/risk-engine.test.ts` (the `window()` helper)
- Modify: `src/pages/PlacePage.test.tsx` (the `climate` fixture)
- Modify: `src/services/climate.service.test.ts` (the mock response)

- [ ] **Step 1: Update `ClimateWindowSchema`**

```ts
// src/types/climate.schema.ts — full file replacement:
import { z } from 'zod'

export const DailyWeatherSchema = z.object({
  date: z.string(),
  tempC: z.number(),
  humidityPct: z.number(),
  rainMm: z.number(),
})

export const ClimateWindowSchema = z.object({
  current: z.object({
    tempC: z.number(),
    humidityPct: z.number(),
    rainMm: z.number(),
  }),
  history: z.array(DailyWeatherSchema),
  forecast: z.array(DailyWeatherSchema),
})

export type DailyWeather = z.infer<typeof DailyWeatherSchema>
export type ClimateWindow = z.infer<typeof ClimateWindowSchema>
```

- [ ] **Step 2: Update `window()` helper in `risk-engine.test.ts`**

Find the `window` function (line 19) and update it:

```ts
function window(current: ClimateWindow['current'], history: DailyWeather[]): ClimateWindow {
  return { current, history, forecast: [] }
}
```

- [ ] **Step 3: Update `climate` fixture in `PlacePage.test.tsx`**

Find `const climate: ClimateWindow = {` (line 23) and add `forecast` after `history`:

```ts
const forecast14: DailyWeather[] = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-02-${String(i + 1).padStart(2, '0')}`,
  tempC: 29,
  humidityPct: 78,
  rainMm: 5,
}))

const climate: ClimateWindow = {
  current: { tempC: 29, humidityPct: 80, rainMm: 5 },
  history: Array.from({ length: 56 }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    tempC: 29,
    humidityPct: 80,
    rainMm: 7,
  })),
  forecast: forecast14,
}
```

- [ ] **Step 4: Update `getClimateWindow` mock response in `climate.service.test.ts`**

The `getClimateWindow` test (line 42) mocks `daily` with 2 items. After the service change (Task 3), `forecast` will be the entries beyond index 56. For now the test only checks `history` mapping, so keep the mock as-is — the test will be updated properly in Task 3 when the service splits the array.

- [ ] **Step 5: Run typecheck — 0 errors**

```bash
pnpm typecheck
```

Expected: exits 0.

- [ ] **Step 6: Run tests — all must pass**

```bash
pnpm test --run
```

Expected: all green (the `window()` helper change and PlacePage fixture fix cover the schema change).

- [ ] **Step 7: Commit**

```bash
git add src/types/climate.schema.ts src/lib/risk-engine.test.ts src/pages/PlacePage.test.tsx
git commit -m "feat: add forecast field to ClimateWindow schema"
```

---

## Task 3: Update `climate.service.ts` — fetch 14 forecast days, split history/forecast

**Files:**

- Modify: `src/services/climate.service.ts`
- Modify: `src/services/climate.service.test.ts`

- [ ] **Step 1: Write the failing test first**

In `src/services/climate.service.test.ts`, add a new `it` block inside `describe('getClimateWindow', ...)`:

```ts
it('splits daily array into history (first 56) and forecast (remaining 14)', async () => {
  const allDays = Array.from(
    { length: 70 },
    (_, i) => `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
  )
  const temps = Array.from({ length: 70 }, () => 27.0)
  const humids = Array.from({ length: 70 }, () => 70)
  const rains = Array.from({ length: 70 }, (_, i) => (i < 56 ? 5.0 : 3.0))

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        current: { temperature_2m: 28.4, relative_humidity_2m: 75, precipitation: 1.2 },
        daily: {
          time: allDays,
          temperature_2m_mean: temps,
          relative_humidity_2m_mean: humids,
          precipitation_sum: rains,
        },
      }),
  })
  const w = await getClimateWindow(23.7, 90.4)
  expect(w.history).toHaveLength(56)
  expect(w.forecast).toHaveLength(14)
  expect(w.forecast[0].rainMm).toBe(3.0)
  expect(w.history[55].rainMm).toBe(5.0)
})
```

- [ ] **Step 2: Run the new test — verify it FAILS**

```bash
pnpm test --run src/services/climate.service.test.ts
```

Expected: FAIL — `w.forecast` is `undefined`.

- [ ] **Step 3: Update `getClimateWindow` in `climate.service.ts`**

```ts
export async function getClimateWindow(lat: number, lng: number): Promise<ClimateWindow> {
  const PAST_DAYS = 56
  const FORECAST_DAYS = 14
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,precipitation',
    daily: 'temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum',
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
  })
  const res = await fetch(`${API_BASE.openmeteo}/forecast?${params.toString()}`)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const raw = OpenMeteoSchema.parse(await res.json())

  const allDays = raw.daily.time.map((date, i) => ({
    date,
    tempC: raw.daily.temperature_2m_mean[i] ?? 0,
    humidityPct: raw.daily.relative_humidity_2m_mean[i] ?? 0,
    rainMm: raw.daily.precipitation_sum[i] ?? 0,
  }))

  return ClimateWindowSchema.parse({
    current: {
      tempC: raw.current.temperature_2m,
      humidityPct: raw.current.relative_humidity_2m,
      rainMm: raw.current.precipitation,
    },
    history: allDays.slice(0, PAST_DAYS),
    forecast: allDays.slice(PAST_DAYS),
  })
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
pnpm test --run src/services/climate.service.test.ts
```

Expected: all green (existing tests still pass because they mock 2-item daily arrays — `history` gets both items, `forecast` gets `[]`, which satisfies the schema).

- [ ] **Step 5: Commit**

```bash
git add src/services/climate.service.ts src/services/climate.service.test.ts
git commit -m "feat: fetch 14 forecast days from Open-Meteo, split into history/forecast"
```

---

## Task 4: Extend risk engine — extract scorers, add `assessRiskTimeline` + `summarizeTrend`

**Files:**

- Modify: `src/lib/risk-engine.ts`
- Modify: `src/lib/risk-engine.test.ts`

**Background:** `history` has 56 entries (indices 0–55). `forecast` has 14 entries (indices 0–13). For timeline scoring, we concatenate them: `series = [...history, ...forecast]` (indices 0–69). Forecast day `d` is at `series[56 + d]`. Lag windows reach backward into `series` by index arithmetic — all lag windows for both diseases stay fully within history for all 14 forecast days.

- [ ] **Step 1: Write failing tests for `assessRiskTimeline` and `summarizeTrend`**

Add to `src/lib/risk-engine.test.ts` (import the new exports at top):

```ts
import { assessRisk, assessRiskTimeline, summarizeTrend } from './risk-engine'
import type { DayRisk } from '@/types/risk.types'
```

Add at the bottom of the file:

```ts
function makeForecast(
  days: number,
  tempC: number,
  rainMm: number,
  humidityPct: number,
): DailyWeather[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    tempC,
    humidityPct,
    rainMm,
  }))
}

describe('assessRiskTimeline — dengue', () => {
  it('returns exactly 14 DayRisk entries', () => {
    const w: ClimateWindow = {
      current: { tempC: 29, humidityPct: 80, rainMm: 5 },
      history: makeHistory(56, 29, 7, 80),
      forecast: makeForecast(14, 29, 5, 78),
    }
    const timeline = assessRiskTimeline(w, 'dengue')
    expect(timeline).toHaveLength(14)
  })

  it('each entry has date, score 0–1, and a valid level', () => {
    const w: ClimateWindow = {
      current: { tempC: 29, humidityPct: 80, rainMm: 5 },
      history: makeHistory(56, 29, 7, 80),
      forecast: makeForecast(14, 29, 5, 78),
    }
    const timeline = assessRiskTimeline(w, 'dengue')
    timeline.forEach((d) => {
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.score).toBeGreaterThanOrEqual(0)
      expect(d.score).toBeLessThanOrEqual(1)
      expect(['low', 'moderate', 'high']).toContain(d.level)
    })
  })

  it('dengue lag window for day 0 reads history indices 14–42 (weeks 2–6)', () => {
    // Make history: indices 0–13 dry, indices 14–42 wet (4mm/day = 116mm total), 43–55 dry
    const dryDays = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      tempC: 29,
      humidityPct: 80,
      rainMm: 0,
    }))
    const wetDays = Array.from({ length: 29 }, (_, i) => ({
      date: `2026-01-${String(i + 15).padStart(2, '0')}`,
      tempC: 29,
      humidityPct: 80,
      rainMm: 4,
    }))
    const dryDays2 = Array.from({ length: 13 }, (_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, '0')}`,
      tempC: 29,
      humidityPct: 80,
      rainMm: 0,
    }))
    const w: ClimateWindow = {
      current: { tempC: 29, humidityPct: 80, rainMm: 0 },
      history: [...dryDays, ...wetDays, ...dryDays2],
      forecast: makeForecast(14, 29, 0, 80),
    }
    const timeline = assessRiskTimeline(w, 'dengue')
    // history[14..42] wet → laggedRain = 29*4 = 116mm → rainScore > 0 → score > 0
    expect(timeline[0].score).toBeGreaterThan(0)
  })
})

describe('assessRiskTimeline — cholera', () => {
  it('returns 14 entries with valid levels', () => {
    const w: ClimateWindow = {
      current: { tempC: 28, humidityPct: 70, rainMm: 5 },
      history: makeHistory(56, 28, 10, 70),
      forecast: makeForecast(14, 28, 5, 70),
    }
    const timeline = assessRiskTimeline(w, 'cholera')
    expect(timeline).toHaveLength(14)
    timeline.forEach((d) => expect(['low', 'moderate', 'high']).toContain(d.level))
  })
})

describe('summarizeTrend', () => {
  it('detects rising trend when late days are higher than early days', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: 0.1 + i * 0.06, // 0.10 → 0.88 — clear upward
      level: i < 3 ? 'low' : i < 8 ? 'moderate' : 'high',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.direction).toBe('rising')
    expect(trend.peakScore).toBeGreaterThan(trend.todayScore)
  })

  it('detects falling trend when late days are lower than early days', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: 0.9 - i * 0.06, // 0.90 → 0.12 — clear downward
      level: i < 3 ? 'high' : i < 8 ? 'moderate' : 'low',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.direction).toBe('falling')
  })

  it('detects stable trend when scores do not move by >0.08', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: 0.4 + (i % 3) * 0.01, // oscillates ±0.01 around 0.4
      level: 'moderate' as RiskLevel,
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.direction).toBe('stable')
  })

  it('peakDate matches the highest-score day', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: i === 7 ? 0.9 : 0.3,
      level: i === 7 ? 'high' : 'low',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.peakDate).toBe('2026-06-08')
  })
})
```

Also add `RiskLevel` to imports at the top of the test file (it's used in the stable-trend test):

```ts
import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'
import type { DayRisk, RiskLevel } from '@/types/risk.types'
```

- [ ] **Step 2: Run new tests — verify they FAIL**

```bash
pnpm test --run src/lib/risk-engine.test.ts
```

Expected: FAIL — `assessRiskTimeline` and `summarizeTrend` not exported.

- [ ] **Step 3: Implement in `risk-engine.ts`**

Add the following to `src/lib/risk-engine.ts`. Insert after the existing `assessRisk` export:

```ts
import type { DayRisk, TrendSummary } from '@/types/risk.types'
import type { DailyWeather } from '@/types/climate.schema'
```

(Add these to the existing import block at the top.)

Then add after `assessRisk`:

```ts
// --- Shared per-day scorers (used by assessRisk internals and timeline) ---

function dengueScoreForDay(tempC: number, humidityPct: number, laggedRainMm: number): number {
  const tempScore = clamp01(dengueTempSuitability(tempC))
  const rainScore = clamp01((laggedRainMm - 20) / (150 - 20))
  const humidScore = clamp01((humidityPct - 50) / (80 - 50))
  return tempScore * (0.6 * rainScore + 0.4 * humidScore)
}

function choleraScoreForDay(tempC: number, laggedRainMm: number): number {
  const rainScore = clamp01((laggedRainMm - 30) / (200 - 30))
  const tempScore = clamp01((tempC - 20) / (30 - 20))
  return 0.7 * rainScore + 0.3 * tempScore
}

// Sum rain from a flat series array over [i - toAgo, i - fromAgo] (inclusive both ends).
function seriesRain(series: DailyWeather[], i: number, fromAgo: number, toAgo: number): number {
  let sum = 0
  for (let ago = fromAgo; ago <= toAgo; ago++) {
    const idx = i - ago
    if (idx >= 0 && idx < series.length) sum += series[idx].rainMm
  }
  return sum
}

export function assessRiskTimeline(window: ClimateWindow, diseaseId: RiskDiseaseId): DayRisk[] {
  const series: DailyWeather[] = [...window.history, ...window.forecast]
  const forecastStart = window.history.length

  return window.forecast.map((day, d) => {
    const i = forecastStart + d
    let score: number
    if (diseaseId === 'dengue') {
      const laggedRain = seriesRain(series, i, 14, 42)
      score = dengueScoreForDay(day.tempC, day.humidityPct, laggedRain)
    } else {
      const laggedRain = seriesRain(series, i, 7, 28)
      score = choleraScoreForDay(day.tempC, laggedRain)
    }
    return { date: day.date, score, level: levelFromScore(score) }
  })
}

export function summarizeTrend(timeline: DayRisk[]): TrendSummary {
  const avg = (arr: DayRisk[]) => arr.reduce((s, d) => s + d.score, 0) / arr.length

  const early = avg(timeline.slice(0, 4))
  const late = avg(timeline.slice(10, 14))
  const delta = late - early

  const direction = delta > 0.08 ? 'rising' : delta < -0.08 ? 'falling' : 'stable'

  let peakIdx = 0
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].score > timeline[peakIdx].score) peakIdx = i
  }

  return {
    direction,
    peakDate: timeline[peakIdx].date,
    peakLevel: timeline[peakIdx].level,
    todayScore: timeline[0].score,
    peakScore: timeline[peakIdx].score,
  }
}
```

Also update the existing imports at the top of `risk-engine.ts`:

```ts
import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'
import type {
  DayRisk,
  Driver,
  RiskAssessment,
  RiskConfidence,
  RiskDiseaseId,
  RiskLevel,
  TrendSummary,
} from '@/types/risk.types'
```

- [ ] **Step 4: Run all tests — must pass**

```bash
pnpm test --run src/lib/risk-engine.test.ts
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/risk-engine.ts src/lib/risk-engine.test.ts
git commit -m "feat: add assessRiskTimeline and summarizeTrend to risk engine"
```

---

## Task 5: Update `useRiskAssessment` hook — add `timeline` and `trend` to `RiskResult`

**Files:**

- Modify: `src/hooks/useRiskAssessment.ts`

- [ ] **Step 1: Update `RiskResult` and the query computation**

Full file replacement:

```ts
import { useQuery } from '@tanstack/react-query'
import { getClimateWindow } from '@/services/climate.service'
import { assessRisk, assessRiskTimeline, summarizeTrend } from '@/lib/risk-engine'
import { getCareLadder } from '@/lib/care-ladder'
import {
  RISK_DISEASE_IDS,
  type RiskAssessment,
  type DayRisk,
  type TrendSummary,
} from '@/types/risk.types'
import type { CareLadder } from '@/types/care-ladder.schema'

export interface RiskResult {
  assessment: RiskAssessment
  ladder: CareLadder | undefined
  timeline: DayRisk[]
  trend: TrendSummary
}

export interface UseRiskAssessment {
  results: RiskResult[]
  isLoading: boolean
  isError: boolean
}

export function useRiskAssessment(lat: number | null, lng: number | null): UseRiskAssessment {
  const enabled = lat !== null && lng !== null
  const query = useQuery({
    queryKey: ['climate', lat, lng],
    queryFn: () => getClimateWindow(lat as number, lng as number),
    enabled,
    staleTime: 36e5,
  })

  const results: RiskResult[] = query.data
    ? RISK_DISEASE_IDS.map((id) => {
        const timeline = assessRiskTimeline(query.data, id)
        return {
          assessment: assessRisk(query.data, id),
          ladder: getCareLadder(id),
          timeline,
          trend: summarizeTrend(timeline),
        }
      })
    : []

  return { results, isLoading: enabled && query.isLoading, isError: query.isError }
}
```

- [ ] **Step 2: Run typecheck — 0 errors**

```bash
pnpm typecheck
```

Expected: exits 0.

- [ ] **Step 3: Update `RiskCard.test.tsx` fixture to satisfy `RiskResult` shape**

`RiskCard.test.tsx` line 8 defines `const result: RiskResult = {...}`. It now needs `timeline` and `trend`. Update:

```ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiskCard } from './RiskCard'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { getCareLadder } from '@/lib/care-ladder'
import type { DayRisk } from '@/types/risk.types'

const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-06-${String(i + 1).padStart(2, '0')}`,
  score: 0.5 + i * 0.02,
  level: 'moderate' as const,
}))

const result: RiskResult = {
  assessment: {
    diseaseId: 'dengue',
    level: 'high',
    score: 0.8,
    drivers: [{ factor: 'temperature', value: 29, contribution: 1, note: '29°C — favourable' }],
    confidence: 'moderate',
    dataGaps: [],
  },
  ladder: getCareLadder('dengue'),
  timeline,
  trend: {
    direction: 'rising',
    peakDate: '2026-06-14',
    peakLevel: 'high',
    todayScore: 0.5,
    peakScore: 0.76,
  },
}
```

- [ ] **Step 4: Run all tests**

```bash
pnpm test --run
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRiskAssessment.ts src/components/risk/RiskCard.test.tsx
git commit -m "feat: extend RiskResult with timeline and trend from forecast engine"
```

---

## Task 6: Create `TrendBadge` component

**Files:**

- Create: `src/components/risk/TrendBadge.tsx`
- Create: `src/components/risk/TrendBadge.test.tsx`

- [ ] **Step 1: Write failing tests**

```ts
// src/components/risk/TrendBadge.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendBadge } from './TrendBadge'
import type { TrendSummary } from '@/types/risk.types'

const risingSummary: TrendSummary = {
  direction: 'rising',
  peakDate: '2026-06-30',
  peakLevel: 'high',
  todayScore: 0.3,
  peakScore: 0.8,
}

const fallingSummary: TrendSummary = {
  direction: 'falling',
  peakDate: '2026-06-22',
  peakLevel: 'moderate',
  todayScore: 0.6,
  peakScore: 0.6,
}

const stableSummary: TrendSummary = {
  direction: 'stable',
  peakDate: '2026-06-28',
  peakLevel: 'moderate',
  todayScore: 0.4,
  peakScore: 0.45,
}

describe('TrendBadge', () => {
  it('shows rising arrow and peak date', () => {
    render(<TrendBadge summary={risingSummary} />)
    expect(screen.getByText(/rising/i)).toBeInTheDocument()
    expect(screen.getByText(/jun 30/i)).toBeInTheDocument()
  })

  it('shows falling arrow', () => {
    render(<TrendBadge summary={fallingSummary} />)
    expect(screen.getByText(/falling/i)).toBeInTheDocument()
  })

  it('shows stable text', () => {
    render(<TrendBadge summary={stableSummary} />)
    expect(screen.getByText(/stable/i)).toBeInTheDocument()
  })

  it('uses amber colour class for rising', () => {
    const { container } = render(<TrendBadge summary={risingSummary} />)
    expect(container.querySelector('.text-amber-600')).toBeTruthy()
  })

  it('uses green colour class for falling', () => {
    const { container } = render(<TrendBadge summary={fallingSummary} />)
    expect(container.querySelector('.text-green-600')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
pnpm test --run src/components/risk/TrendBadge.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `TrendBadge.tsx`**

```tsx
// src/components/risk/TrendBadge.tsx
import type { TrendSummary, TrendDirection } from '@/types/risk.types'

const DIRECTION_CONFIG: Record<
  TrendDirection,
  { label: string; arrow: string; className: string }
> = {
  rising: { label: 'Rising', arrow: '↑', className: 'text-amber-600' },
  falling: { label: 'Falling', arrow: '↓', className: 'text-green-600' },
  stable: { label: 'Stable', arrow: '→', className: 'text-gray-500' },
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function TrendBadge({ summary }: { summary: TrendSummary }) {
  const { label, arrow, className } = DIRECTION_CONFIG[summary.direction]
  const peakFormatted = formatDate(summary.peakDate)

  let text: string
  if (summary.direction === 'rising') {
    text = `${label} ${arrow} — peak risk ${peakFormatted}`
  } else if (summary.direction === 'falling') {
    text = `${label} ${arrow} — improving after ${peakFormatted}`
  } else {
    text = `${label} — ${summary.peakLevel} risk through ${peakFormatted}`
  }

  return <p className={`text-[11px] ${className}`}>{text}</p>
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
pnpm test --run src/components/risk/TrendBadge.test.tsx
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/components/risk/TrendBadge.tsx src/components/risk/TrendBadge.test.tsx
git commit -m "feat: add TrendBadge component for forecast direction headline"
```

---

## Task 7: Create `RiskSparkline` component

**Files:**

- Create: `src/components/risk/RiskSparkline.tsx`
- Create: `src/components/risk/RiskSparkline.test.tsx`

**Note:** Recharts components render SVG in jsdom, but `ResponsiveContainer` requires a measured DOM width and will render nothing in tests. Use `AreaChart` directly (not wrapped in `ResponsiveContainer`) with explicit `width` and `height` props.

- [ ] **Step 1: Write failing tests**

```ts
// src/components/risk/RiskSparkline.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskSparkline } from './RiskSparkline'
import type { DayRisk } from '@/types/risk.types'

const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-06-${String(i + 1).padStart(2, '0')}`,
  score: 0.3 + i * 0.03,
  level: i < 5 ? 'low' : i < 10 ? 'moderate' : 'high',
}))

describe('RiskSparkline', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <RiskSparkline timeline={timeline} disease="dengue" />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('has an accessible aria-label mentioning the disease', () => {
    render(<RiskSparkline timeline={timeline} disease="dengue" />)
    expect(screen.getByRole('img', { name: /dengue/i })).toBeInTheDocument()
  })

  it('renders a cholera variant without crashing', () => {
    const { container } = render(
      <RiskSparkline timeline={timeline} disease="cholera" />,
    )
    expect(container.firstChild).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — verify FAIL**

```bash
pnpm test --run src/components/risk/RiskSparkline.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `RiskSparkline.tsx`**

```tsx
// src/components/risk/RiskSparkline.tsx
import { AreaChart, Area, Tooltip, YAxis } from 'recharts'
import type { DayRisk, RiskLevel } from '@/types/risk.types'

const PEAK_COLOUR: Record<RiskLevel, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#ef4444',
}

function peakLevel(timeline: DayRisk[]): RiskLevel {
  return timeline.reduce((best, d) => (d.score > best.score ? d : best)).level
}

export function RiskSparkline({ timeline, disease }: { timeline: DayRisk[]; disease: string }) {
  const colour = PEAK_COLOUR[peakLevel(timeline)]
  const data = timeline.map((d) => ({ date: d.date, score: d.score, level: d.level }))

  return (
    <div role="img" aria-label={`14-day ${disease} risk trend`}>
      <AreaChart
        width={120}
        height={40}
        data={data}
        margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
      >
        <YAxis domain={[0, 1]} hide />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as { date: string; level: string }
            return (
              <div className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow">
                {d.date} · {d.level}
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke={colour}
          fill={colour}
          fillOpacity={0.3}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
pnpm test --run src/components/risk/RiskSparkline.test.tsx
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/components/risk/RiskSparkline.tsx src/components/risk/RiskSparkline.test.tsx
git commit -m "feat: add RiskSparkline component — 14-day Recharts area chart"
```

---

## Task 8: Wire `TrendBadge` and `RiskSparkline` into `RiskCard`

**Files:**

- Modify: `src/components/risk/RiskCard.tsx`

- [ ] **Step 1: Update `RiskCard` to render the new components**

```tsx
// src/components/risk/RiskCard.tsx — full file replacement:
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { CareLadderPanel } from './CareLadderPanel'
import { TrendBadge } from './TrendBadge'
import { RiskSparkline } from './RiskSparkline'

const LEVEL_STYLE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
}
const LABEL: Record<string, string> = { dengue: 'Dengue', cholera: 'Cholera' }

export function RiskCard({ result }: { result: RiskResult }) {
  const [open, setOpen] = useState(false)
  const { assessment, ladder, timeline, trend } = result
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{LABEL[assessment.diseaseId]}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${LEVEL_STYLE[assessment.level]}`}
        >
          {assessment.level}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500">Confidence: {assessment.confidence}</p>
      <ul className="mt-2 space-y-0.5 text-xs text-gray-700">
        {assessment.drivers.map((d) => (
          <li key={d.factor}>· {d.note}</li>
        ))}
      </ul>
      {assessment.dataGaps.map((g) => (
        <p key={g} className="mt-1 text-[11px] italic text-gray-500">
          {g}
        </p>
      ))}
      {timeline.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <TrendBadge summary={trend} />
          </div>
          <RiskSparkline timeline={timeline} disease={assessment.diseaseId} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        {open ? 'Hide' : 'What to do'}
      </button>
      {open && ladder && (
        <div className="mt-2">
          <CareLadderPanel ladder={ladder} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
pnpm test --run
```

Expected: all green.

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

Expected: exits 0.

- [ ] **Step 4: Run coverage — must stay ≥ 80%**

```bash
pnpm test:coverage
```

Expected: coverage gate passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/risk/RiskCard.tsx
git commit -m "feat: wire TrendBadge and RiskSparkline into RiskCard"
```

---

## Task 9: Final integration verification

- [ ] **Step 1: Start dev server and navigate to `/place`**

```bash
pnpm dev
```

Open `http://localhost:3000/place`. Search "Dhaka" or any city. Verify:

- Both RiskCards show the trend headline (e.g. "Rising ↑ — peak risk Jun 30")
- Both RiskCards show a small sparkline below the headline
- "What to do" still expands the care ladder
- Tooltip appears on sparkline hover

- [ ] **Step 2: Run full test suite one final time**

```bash
pnpm test --run
```

Expected: all green, 0 failures.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: 0 errors, 0 warnings.
