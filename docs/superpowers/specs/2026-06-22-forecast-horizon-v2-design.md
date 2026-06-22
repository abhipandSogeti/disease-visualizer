# Forecast Horizon v2 — Design Spec

**Date:** 2026-06-22
**Scope:** Extend the Place Health Check feature with a 14-day risk trend sparkline and headline per disease card.

---

## Goal

Each `RiskCard` (dengue, cholera) gains a one-line trend headline ("Rising ↑ — peak risk Jun 30") plus a compact 14-day area sparkline of the risk score, giving users a directional signal rather than a point-in-time snapshot.

---

## Approach

Additive extension of the existing v1 risk engine. Shared pure scoring helpers (extracted from `assessRisk`) are called per-day over a concatenated `[history, forecast]` series to produce the timeline. No v1 behaviour changes. `ClimateWindow` gains a required `forecast` field.

---

## Architecture

```
Open-Meteo (forecast_days=14)
        │
climate.service.ts  →  ClimateWindow { current, history[56], forecast[14] }
        │
risk-engine.ts
  ├── scoreDengue(tempC, humidity, laggedRain) → number   (pure, shared)
  ├── scoresCholera(tempC, laggedRain) → number            (pure, shared)
  ├── assessRisk(window, disease)         → RiskAssessment  (v1 "now", unchanged)
  ├── assessRiskTimeline(window, disease) → DayRisk[]       (NEW — 14-day forward)
  └── summarizeTrend(timeline)            → TrendSummary    (NEW)
        │
RiskCard
  ├── TrendBadge   (headline text)
  └── RiskSparkline (Recharts AreaChart 120×40px)
```

---

## Types

### `src/types/climate.schema.ts` — change

Add required field to `ClimateWindowSchema`:

```ts
forecast: z.array(DailyWeatherSchema) // today → +13, daily means
```

### `src/types/risk.types.ts` — additions

```ts
interface DayRisk {
  date: string // ISO-8601
  score: number // 0–1
  level: RiskLevel
}

type TrendDirection = 'rising' | 'falling' | 'stable'

interface TrendSummary {
  direction: TrendDirection
  peakDate: string // ISO-8601
  peakLevel: RiskLevel
  todayScore: number
  peakScore: number
}
```

---

## Engine Logic

### Shared scorers (extracted from `assessRisk`)

`scoreDengue(tempC: number, humidity: number, laggedRainMm: number): number`

- Triangular thermal suitability (Tmin=17.8, Topt=29.1, Tmax=34.5) gates the score
- Combined: `thermalSuit × (0.6 × rainScore(laggedRainMm) + 0.4 × humidScore(humidity))`

`scoreCholera(tempC: number, laggedRainMm: number): number`

- `0.7 × rainScore(laggedRainMm) + 0.3 × tempScore(tempC)`

### `assessRiskTimeline(window: ClimateWindow, diseaseId: RiskDiseaseId): DayRisk[]`

- `series = [...window.history, ...window.forecast]` (length 70)
- Iterates i = 56..69 (14 forecast days)
- **Dengue lag:** `laggedRain = sum(series[i-42 .. i-14].rainMm)` (weeks 2–6 behind)
- **Cholera lag:** `laggedRain = sum(series[i-28 .. i-7].rainMm)` (weeks 1–4 behind)
- Returns `DayRisk[]` length 14; index 0 = tomorrow

### `summarizeTrend(timeline: DayRisk[]): TrendSummary`

- `todayScore = timeline[0].score`
- `peakIdx = argmax(timeline, d => d.score)`
- `Δ = avg(timeline[10..13].score) − avg(timeline[0..3].score)`
- `direction`: Δ > +0.08 → 'rising'; Δ < −0.08 → 'falling'; else 'stable'

---

## Service Change

### `src/services/climate.service.ts`

`getClimateWindow` call: bump `forecast_days` from `1` to `14`.

Open-Meteo daily means for forecast use same field names as history:
`temperature_2m_mean`, `relative_humidity_2m_mean`, `precipitation_sum`.

Map `forecast` block into `DailyWeather[]` and attach to `ClimateWindow`.

---

## Components

### `src/components/risk/TrendBadge.tsx` (new)

Props: `{ summary: TrendSummary }`

Output (one line, 12px, muted):

- Rising: `Rising ↑ — peak risk Jun 30`
- Falling: `Falling ↓ — improving after Jun 28`
- Stable: `Stable — moderate risk through Jul 4`

Colour: rising = amber-600, falling = green-600, stable = gray-500.

### `src/components/risk/RiskSparkline.tsx` (new)

Props: `{ timeline: DayRisk[]; disease: RiskDiseaseId }`

- Recharts `<AreaChart>` 120×40px, `margin={{ top: 2, bottom: 2, left: 0, right: 0 }}`
- No X/Y axis labels. `<Tooltip>` on hover: date + level badge.
- Fill colour: max level across timeline (green=#22c55e, amber=#f59e0b, red=#ef4444) at 30% opacity.
- `aria-label={`14-day ${disease} risk trend`}`
- Cholera: renders a `<title>` sub-text "(less reliable after day 3)".

### `src/components/risk/RiskCard.tsx` — modification

Below the existing confidence + drivers section, add:

```tsx
{
  forecast && (
    <>
      <TrendBadge summary={trend} />
      <RiskSparkline timeline={forecast} disease={assessment.diseaseId} />
    </>
  )
}
```

`forecast` and `trend` derived from `useRiskAssessment` result (see hook change).

---

## Hook Change

### `src/hooks/useRiskAssessment.ts`

`RiskResult` gains:

```ts
timeline: DayRisk[]
trend: TrendSummary
```

Computed inside the query alongside `assessRisk`:

```ts
const timeline = assessRiskTimeline(climate, id)
const trend = summarizeTrend(timeline)
```

---

## Data Flow

```
PlacePage
  └── useRiskAssessment(lat, lng)
        └── getClimateWindow(lat, lng)   → ClimateWindow (now w/ forecast[14])
        └── per disease:
              assessRisk(window, id)          → RiskAssessment
              assessRiskTimeline(window, id)  → DayRisk[]
              summarizeTrend(timeline)        → TrendSummary
              getCareLadder(id)               → CareLadder
        → RiskResult[]
  └── RiskCard × 2
        ├── level badge, drivers, care ladder (v1 unchanged)
        ├── TrendBadge
        └── RiskSparkline
```

---

## Testing

All tests TDD: write failing test → implement → pass.

| Test file                                    | What changes                                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/risk-engine.test.ts`                | New cases: `assessRiskTimeline` returns 14-item array; `summarizeTrend` direction thresholds; dengue lag window boundary (day 0 reads history indices 14–42) |
| `src/services/climate.service.test.ts`       | Fixture updated: mock returns `forecast: [14 items]`; verify mapped to `ClimateWindow.forecast`                                                              |
| `src/components/risk/RiskSparkline.test.tsx` | New file: renders without crash; aria-label present; correct item count passed to chart                                                                      |
| `src/components/risk/TrendBadge.test.tsx`    | New file: rising/falling/stable text + colour class                                                                                                          |
| `src/pages/PlacePage.test.tsx`               | Add `forecast: [14 items]` to `ClimateWindow` fixture (line 23–31)                                                                                           |

Coverage gate ≥ 80% must hold.

---

## v1 Impact (breaking changes, contained)

| File                              | Change                                  | Risk                                               |
| --------------------------------- | --------------------------------------- | -------------------------------------------------- |
| `src/types/climate.schema.ts`     | `forecast` field added (required)       | Low — one construction site (`climate.service.ts`) |
| `src/services/climate.service.ts` | Map forecast block + `forecast_days=14` | Low                                                |
| `src/types/risk.types.ts`         | Two new types added                     | Additive                                           |
| `src/hooks/useRiskAssessment.ts`  | `RiskResult` gains `timeline`+`trend`   | Additive                                           |
| `src/pages/PlacePage.test.tsx`    | Fixture gains `forecast`                | Test-only                                          |

`assessRisk` (now) logic: **unchanged**.

---

## Out of scope (v2)

- Malaria / typhoid forecast (v3)
- Historical trend (past 14 days) chart
- Push notifications / alerts
- Offline / PWA support
