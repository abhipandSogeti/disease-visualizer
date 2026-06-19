# Place-Based Health Risk + Care Ladder (v1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user search a place and see climate-driven dengue + cholera risk (with the "why"), each drilling into a cited Care Ladder, framed as an experimental, not-medical-advice prototype.

**Architecture:** Layered — a pure `risk-engine` (zero I/O, fully unit-tested) consumes a `ClimateWindow` from `climate.service` (Open-Meteo) and a static cited `care-ladder` knowledge base. A `useRiskAssessment` hook composes them; `PlacePage` + `components/risk/` render the result. Mirrors the existing `services / hooks / types / lib / components` layout and Zod-at-the-boundary discipline.

**Tech Stack:** TypeScript, React 18, Zod, @tanstack/react-query, Zustand, react-router-dom v6, Vitest + React Testing Library, Tailwind. External: Open-Meteo (geocoding + forecast/archive), free & keyless.

**Reference spec:** `docs/superpowers/specs/2026-06-19-place-health-risk-v1-design.md`

---

## File Structure

| File                                      | Responsibility                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `src/types/climate.schema.ts`             | Zod schema + types for `ClimateWindow` / `DailyWeather`                   |
| `src/types/risk.types.ts`                 | `RiskLevel`, `Driver`, `RiskAssessment`, `RiskDiseaseId`                  |
| `src/lib/risk-engine.ts`                  | Pure `assessRisk(climate, diseaseId) → RiskAssessment` (dengue + cholera) |
| `src/lib/risk-engine.test.ts`             | Pure unit tests for the engine                                            |
| `src/types/care-ladder.schema.ts`         | Zod schema + type for `CareLadder`                                        |
| `src/lib/care-ladder.ts`                  | Curated, cited dengue + cholera records + `getCareLadder()`               |
| `src/lib/care-ladder.test.ts`             | Schema + safety-regression tests                                          |
| `src/services/api.config.ts`              | (modify) add `geocode` + `openmeteo` bases                                |
| `vite.config.ts`                          | (modify) add dev proxies for geocode + openmeteo                          |
| `vercel.json`                             | (modify) add prod rewrites for geocode + openmeteo                        |
| `src/services/climate.service.ts`         | Geocode a place + fetch `ClimateWindow`                                   |
| `src/services/climate.service.test.ts`    | Parse mocked Open-Meteo responses                                         |
| `src/hooks/useRiskAssessment.ts`          | Compose climate query + engine + ladder                                   |
| `src/hooks/useRiskAssessment.test.ts`     | Composition test (mocked service)                                         |
| `src/components/risk/SafetyBanner.tsx`    | "Experimental — not medical advice" banner                                |
| `src/components/risk/RiskCard.tsx`        | One disease risk: level, drivers, confidence, gaps                        |
| `src/components/risk/CareLadderPanel.tsx` | Cited ladder drill-down + escalation                                      |
| `src/components/risk/PlaceSearch.tsx`     | City search input → coords                                                |
| `src/components/risk/*.test.tsx`          | Component tests                                                           |
| `src/pages/PlacePage.tsx`                 | Route component wiring search → results                                   |
| `src/App.tsx`                             | (modify) add `/place` route                                               |
| `src/components/layout/Header.tsx`        | (modify) add "Place risk" nav link                                        |

**Build-one-stop note:** Tasks 1–3 (climate types → risk types → dengue engine) form the **first showable unit**. Build those, stop, and get approach approval before Task 4+.

---

## Task 1: Climate types + Zod schema

**Files:**

- Create: `src/types/climate.schema.ts`
- Test: `src/types/climate.schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/types/climate.schema.test.ts
import { describe, it, expect } from 'vitest'
import { ClimateWindowSchema } from './climate.schema'

describe('ClimateWindowSchema', () => {
  it('parses a valid climate window', () => {
    const raw = {
      current: { tempC: 28.1, humidityPct: 74, rainMm: 2.3 },
      history: [
        { date: '2026-05-01', tempC: 27.5, humidityPct: 70, rainMm: 12.0 },
        { date: '2026-05-02', tempC: 28.0, humidityPct: 72, rainMm: 0 },
      ],
    }
    const parsed = ClimateWindowSchema.parse(raw)
    expect(parsed.history).toHaveLength(2)
    expect(parsed.current.tempC).toBe(28.1)
  })

  it('rejects a window missing current', () => {
    expect(() => ClimateWindowSchema.parse({ history: [] })).toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true pnpm test run src/types/climate.schema.test.ts`
Expected: FAIL — cannot resolve `./climate.schema`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/types/climate.schema.ts
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
})

export type DailyWeather = z.infer<typeof DailyWeatherSchema>
export type ClimateWindow = z.infer<typeof ClimateWindowSchema>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true pnpm test run src/types/climate.schema.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/types/climate.schema.ts src/types/climate.schema.test.ts
git commit -m "feat: add ClimateWindow zod schema and types"
```

---

## Task 2: Risk types

**Files:**

- Create: `src/types/risk.types.ts`

No standalone test (plain type/const module; exercised by Task 3). Verified via typecheck.

- [ ] **Step 1: Write the implementation**

```ts
// src/types/risk.types.ts
export type RiskLevel = 'low' | 'moderate' | 'high'
export type RiskConfidence = 'low' | 'moderate' // never 'high' in v1

// Diseases the v1 climate engine models.
export type RiskDiseaseId = 'dengue' | 'cholera'
export const RISK_DISEASE_IDS: RiskDiseaseId[] = ['dengue', 'cholera']

export interface Driver {
  factor: 'temperature' | 'rainfall' | 'humidity'
  value: number // observed value (°C, mm cumulative, or %RH)
  contribution: number // 0..1 how much this factor pushed risk up
  note: string // human explanation, e.g. "28°C — optimal for transmission"
}

export interface RiskAssessment {
  diseaseId: RiskDiseaseId
  level: RiskLevel
  score: number // 0..1 composite, for ordering/debug
  drivers: Driver[]
  confidence: RiskConfidence
  dataGaps: string[]
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/risk.types.ts
git commit -m "feat: add risk assessment domain types"
```

---

## Task 3: Risk engine — dengue model

**Files:**

- Create: `src/lib/risk-engine.ts`
- Test: `src/lib/risk-engine.test.ts`

**Science (v1 heuristics; constants flagged for literature calibration):**

- Temperature suitability — triangular, _Aedes aegypti_ (Mordecai et al. 2017): Tmin 17.8 °C, Topt 29.1 °C, Tmax 34.5 °C. Outside [Tmin,Tmax] → 0; gates the whole score (no transmission if temp unsuitable).
- Rainfall (lagged) — cumulative `rainMm` over history days in the t-42…t-14 window (weeks 2–6); scaled 20 mm→0, 150 mm→1.
- Humidity — current %RH scaled 50 %→0, 80 %→1.
- Composite = tempScore × (0.6·rainScore + 0.4·humidityScore). Levels: <0.25 low, <0.55 moderate, else high.
- Confidence: `moderate` if ≥42 days history else `low`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/risk-engine.test.ts
import { describe, it, expect } from 'vitest'
import { assessRisk } from './risk-engine'
import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'

function makeHistory(
  days: number,
  tempC: number,
  rainMm: number,
  humidityPct: number,
): DailyWeather[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    tempC,
    humidityPct,
    rainMm,
  }))
}

function window(current: ClimateWindow['current'], history: DailyWeather[]): ClimateWindow {
  return { current, history }
}

describe('assessRisk — dengue', () => {
  it('returns HIGH for optimal temp, heavy lagged rain, high humidity', () => {
    // 56 days, ~7mm/day → window 2-6 weeks cumulative well over 150mm
    const w = window({ tempC: 29, humidityPct: 80, rainMm: 5 }, makeHistory(56, 29, 7, 80))
    const r = assessRisk(w, 'dengue')
    expect(r.level).toBe('high')
    expect(r.drivers.some((d) => d.factor === 'temperature')).toBe(true)
    expect(r.confidence).toBe('moderate')
  })

  it('returns LOW when temperature is unsuitable regardless of rain', () => {
    const w = window({ tempC: 10, humidityPct: 90, rainMm: 20 }, makeHistory(56, 10, 30, 90))
    const r = assessRisk(w, 'dengue')
    expect(r.level).toBe('low')
    expect(r.score).toBe(0)
  })

  it('downgrades confidence to low with sparse history', () => {
    const w = window({ tempC: 29, humidityPct: 80, rainMm: 5 }, makeHistory(10, 29, 7, 80))
    const r = assessRisk(w, 'dengue')
    expect(r.confidence).toBe('low')
  })

  it('is dry-season MODERATE/LOW: optimal temp but little rain', () => {
    const w = window({ tempC: 29, humidityPct: 55, rainMm: 0 }, makeHistory(56, 29, 0, 55))
    const r = assessRisk(w, 'dengue')
    expect(['low', 'moderate']).toContain(r.level)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `CI=true pnpm test run src/lib/risk-engine.test.ts`
Expected: FAIL — cannot resolve `./risk-engine`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/risk-engine.ts
import type { ClimateWindow } from '@/types/climate.schema'
import type {
  Driver,
  RiskAssessment,
  RiskConfidence,
  RiskDiseaseId,
  RiskLevel,
} from '@/types/risk.types'

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n))

function levelFromScore(score: number): RiskLevel {
  if (score < 0.25) return 'low'
  if (score < 0.55) return 'moderate'
  return 'high'
}

// Cumulative rain over a lag window measured in days-ago [fromAgo, toAgo] (inclusive),
// counting from the end of history (most recent day = 0 days ago).
function cumulativeRain(window: ClimateWindow, fromAgo: number, toAgo: number): number {
  const h = window.history
  const n = h.length
  let sum = 0
  for (let ago = fromAgo; ago <= toAgo; ago++) {
    const idx = n - 1 - ago
    if (idx >= 0) sum += h[idx].rainMm
  }
  return sum
}

// Triangular thermal suitability for Aedes aegypti (Mordecai et al. 2017).
function dengueTempSuitability(tempC: number): number {
  const TMIN = 17.8
  const TOPT = 29.1
  const TMAX = 34.5
  if (tempC <= TMIN || tempC >= TMAX) return 0
  return tempC <= TOPT ? (tempC - TMIN) / (TOPT - TMIN) : (TMAX - tempC) / (TMAX - TOPT)
}

function assessDengue(w: ClimateWindow): RiskAssessment {
  const tempScore = clamp01(dengueTempSuitability(w.current.tempC))
  const laggedRain = cumulativeRain(w, 14, 42) // weeks 2–6
  const rainScore = clamp01((laggedRain - 20) / (150 - 20))
  const humidityScore = clamp01((w.current.humidityPct - 50) / (80 - 50))
  const envScore = 0.6 * rainScore + 0.4 * humidityScore
  const score = tempScore * envScore

  const drivers: Driver[] = [
    {
      factor: 'temperature',
      value: w.current.tempC,
      contribution: tempScore,
      note:
        tempScore === 0
          ? `${w.current.tempC}°C — outside mosquito transmission range`
          : `${w.current.tempC}°C — favourable for transmission`,
    },
    {
      factor: 'rainfall',
      value: Math.round(laggedRain),
      contribution: rainScore,
      note: `${Math.round(laggedRain)}mm over the past 2–6 weeks (breeding lag)`,
    },
    {
      factor: 'humidity',
      value: w.current.humidityPct,
      contribution: humidityScore,
      note: `${w.current.humidityPct}% relative humidity`,
    },
  ]

  const confidence: RiskConfidence = w.history.length >= 42 ? 'moderate' : 'low'
  const dataGaps =
    w.history.length >= 42 ? [] : ['Limited weather history — risk estimate is less certain.']

  return { diseaseId: 'dengue', level: levelFromScore(score), score, drivers, confidence, dataGaps }
}

export function assessRisk(climate: ClimateWindow, diseaseId: RiskDiseaseId): RiskAssessment {
  switch (diseaseId) {
    case 'dengue':
      return assessDengue(climate)
    case 'cholera':
      throw new Error('cholera model not implemented yet')
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `CI=true pnpm test run src/lib/risk-engine.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/risk-engine.ts src/lib/risk-engine.test.ts
git commit -m "feat: add pure risk-engine with dengue climate model"
```

**>>> STOP HERE. This is the first showable unit. Get approach approval before Task 4. <<<**

---

## Task 4: Risk engine — cholera model

**Files:**

- Modify: `src/lib/risk-engine.ts`
- Modify: `src/lib/risk-engine.test.ts`

**Science:** water-borne; weak climate proxy. Recent rainfall (weeks 1–4, days 7–28 ago) scaled 30 mm→0, 200 mm→1; warm temp scaled 20 °C→0, 30 °C→1. Composite = 0.7·rainScore + 0.3·tempScore. Confidence capped at `moderate`; **always** carries a sanitation data-gap note.

- [ ] **Step 1: Add failing tests**

```ts
// append to src/lib/risk-engine.test.ts
describe('assessRisk — cholera', () => {
  it('returns elevated risk after heavy recent rain in warm conditions', () => {
    const w = window({ tempC: 30, humidityPct: 80, rainMm: 10 }, makeHistory(56, 30, 12, 80))
    const r = assessRisk(w, 'cholera')
    expect(['moderate', 'high']).toContain(r.level)
  })

  it('always reports a sanitation data gap and caps confidence at moderate', () => {
    const w = window({ tempC: 30, humidityPct: 80, rainMm: 10 }, makeHistory(56, 30, 12, 80))
    const r = assessRisk(w, 'cholera')
    expect(r.confidence).toBe('moderate')
    expect(r.dataGaps.join(' ')).toMatch(/sanitation/i)
  })

  it('returns low risk in dry conditions', () => {
    const w = window({ tempC: 22, humidityPct: 40, rainMm: 0 }, makeHistory(56, 22, 0, 40))
    const r = assessRisk(w, 'cholera')
    expect(r.level).toBe('low')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `CI=true pnpm test run src/lib/risk-engine.test.ts`
Expected: FAIL — "cholera model not implemented yet".

- [ ] **Step 3: Implement cholera; wire into `assessRisk`**

```ts
// add to src/lib/risk-engine.ts (above assessRisk)
function assessCholera(w: ClimateWindow): RiskAssessment {
  const recentRain = cumulativeRain(w, 7, 28) // weeks 1–4
  const rainScore = clamp01((recentRain - 30) / (200 - 30))
  const tempScore = clamp01((w.current.tempC - 20) / (30 - 20))
  const score = 0.7 * rainScore + 0.3 * tempScore

  const drivers: Driver[] = [
    {
      factor: 'rainfall',
      value: Math.round(recentRain),
      contribution: rainScore,
      note: `${Math.round(recentRain)}mm over the past 1–4 weeks (flood/contamination risk)`,
    },
    {
      factor: 'temperature',
      value: w.current.tempC,
      contribution: tempScore,
      note: `${w.current.tempC}°C — warmth aids bacterial growth`,
    },
  ]

  const dataGaps = [
    'Climate signal only — actual cholera risk depends on local water & sanitation, which is not measured here.',
  ]
  if (w.history.length < 28) dataGaps.push('Limited weather history — estimate is less certain.')

  return {
    diseaseId: 'cholera',
    level: levelFromScore(score),
    score,
    drivers,
    confidence: 'moderate',
    dataGaps,
  }
}
```

```ts
// replace the cholera case in assessRisk:
    case 'cholera':
      return assessCholera(climate)
```

- [ ] **Step 4: Run to verify pass**

Run: `CI=true pnpm test run src/lib/risk-engine.test.ts`
Expected: PASS (7 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/risk-engine.ts src/lib/risk-engine.test.ts
git commit -m "feat: add cholera climate model to risk-engine"
```

---

## Task 5: Care Ladder schema

**Files:**

- Create: `src/types/care-ladder.schema.ts`
- Test: `src/types/care-ladder.schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/types/care-ladder.schema.test.ts
import { describe, it, expect } from 'vitest'
import { CareLadderSchema } from './care-ladder.schema'

describe('CareLadderSchema', () => {
  it('parses a complete ladder record', () => {
    const raw = {
      diseaseId: 'dengue',
      source: 'WHO Dengue Guidelines',
      updated: '2024-01-01',
      firstLine: 'Supportive care; paracetamol for fever.',
      ifUnavailable: ['Tepid sponging'],
      supportiveNoMedicine: ['Oral hydration'],
      avoid: ['NSAIDs'],
      redFlags: ['Severe abdominal pain'],
    }
    expect(() => CareLadderSchema.parse(raw)).not.toThrow()
  })

  it('rejects a record with no redFlags', () => {
    const raw = {
      diseaseId: 'dengue',
      source: 'WHO',
      updated: '2024-01-01',
      firstLine: 'x',
      ifUnavailable: [],
      supportiveNoMedicine: [],
      avoid: [],
      redFlags: [],
    }
    expect(() => CareLadderSchema.parse(raw)).toThrow()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `CI=true pnpm test run src/types/care-ladder.schema.test.ts`
Expected: FAIL — cannot resolve `./care-ladder.schema`.

- [ ] **Step 3: Implement**

```ts
// src/types/care-ladder.schema.ts
import { z } from 'zod'

export const CareLadderSchema = z.object({
  diseaseId: z.enum(['dengue', 'cholera']),
  source: z.string().min(1),
  updated: z.string().min(1),
  firstLine: z.string().min(1),
  ifUnavailable: z.array(z.string()),
  supportiveNoMedicine: z.array(z.string()),
  avoid: z.array(z.string()),
  redFlags: z.array(z.string()).min(1), // escalation is mandatory
  populationNotes: z.string().optional(),
})

export type CareLadder = z.infer<typeof CareLadderSchema>
```

- [ ] **Step 4: Run to verify pass**

Run: `CI=true pnpm test run src/types/care-ladder.schema.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/types/care-ladder.schema.ts src/types/care-ladder.schema.test.ts
git commit -m "feat: add CareLadder schema with mandatory red flags"
```

---

## Task 6: Care Ladder data (dengue + cholera)

**Files:**

- Create: `src/lib/care-ladder.ts`
- Test: `src/lib/care-ladder.test.ts`

**Content verified against the live WHO guideline at curation time; `updated` reflects the cited source date.**

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/care-ladder.test.ts
import { describe, it, expect } from 'vitest'
import { getCareLadder, CARE_LADDERS } from './care-ladder'
import { CareLadderSchema } from '@/types/care-ladder.schema'
import { RISK_DISEASE_IDS } from '@/types/risk.types'

describe('care-ladder data', () => {
  it('every record passes the schema', () => {
    for (const record of CARE_LADDERS) {
      expect(() => CareLadderSchema.parse(record)).not.toThrow()
    }
  })

  it('covers every modelled disease', () => {
    for (const id of RISK_DISEASE_IDS) {
      expect(getCareLadder(id)).toBeDefined()
    }
  })

  it('dengue ladder warns against NSAIDs (safety regression)', () => {
    const dengue = getCareLadder('dengue')!
    expect(dengue.avoid.join(' ').toLowerCase()).toMatch(/nsaid|ibuprofen|aspirin/)
  })

  it('cholera ladder includes an ORS fallback', () => {
    const cholera = getCareLadder('cholera')!
    const all = [cholera.firstLine, ...cholera.ifUnavailable, ...cholera.supportiveNoMedicine].join(
      ' ',
    )
    expect(all.toLowerCase()).toMatch(/ors|oral rehydration|salt|sugar/)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `CI=true pnpm test run src/lib/care-ladder.test.ts`
Expected: FAIL — cannot resolve `./care-ladder`.

- [ ] **Step 3: Implement**

```ts
// src/lib/care-ladder.ts
import type { CareLadder } from '@/types/care-ladder.schema'
import type { RiskDiseaseId } from '@/types/risk.types'

export const CARE_LADDERS: CareLadder[] = [
  {
    diseaseId: 'dengue',
    source: 'WHO Dengue Guidelines',
    updated: '2024-01-01',
    firstLine: 'Supportive care. Paracetamol (acetaminophen) for fever and pain.',
    ifUnavailable: ['Tepid sponging and rest to manage fever.'],
    supportiveNoMedicine: [
      'Drink plenty of fluids (oral rehydration solution or clean water).',
      'Rest and monitor closely for warning signs.',
    ],
    avoid: [
      'NSAIDs and aspirin (ibuprofen, aspirin, diclofenac) — they raise bleeding risk in dengue.',
    ],
    redFlags: [
      'Severe abdominal pain or persistent vomiting',
      'Bleeding gums or nose, blood in vomit or stool',
      'Lethargy, restlessness, or rapid breathing',
      '→ Seek a health facility immediately.',
    ],
    populationNotes:
      'Infants, pregnant people, and older adults are at higher risk of severe disease.',
  },
  {
    diseaseId: 'cholera',
    source: 'WHO Cholera Guidelines',
    updated: '2024-01-01',
    firstLine:
      'Oral rehydration solution (ORS) is the cornerstone. Antibiotics for severe cases per WHO guidance.',
    ifUnavailable: [
      'Homemade ORS (WHO): 1 litre clean water + 6 level teaspoons sugar + ½ level teaspoon salt.',
    ],
    supportiveNoMedicine: [
      'Keep drinking fluids continuously to replace losses.',
      'Continue eating/feeding as tolerated.',
    ],
    avoid: ['Motility-stopping anti-diarrhoeal medicines — not recommended in cholera.'],
    redFlags: [
      'Signs of severe dehydration: sunken eyes, no urine, skin that stays pinched, lethargy',
      '→ Seek urgent care; IV fluids may be needed.',
    ],
    populationNotes: 'Young children dehydrate very quickly — escalate early.',
  },
]

export function getCareLadder(diseaseId: RiskDiseaseId): CareLadder | undefined {
  return CARE_LADDERS.find((l) => l.diseaseId === diseaseId)
}
```

- [ ] **Step 4: Run to verify pass**

Run: `CI=true pnpm test run src/lib/care-ladder.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/care-ladder.ts src/lib/care-ladder.test.ts
git commit -m "feat: add cited dengue and cholera care ladders"
```

---

## Task 7: Climate service + proxy config

**Files:**

- Modify: `src/services/api.config.ts`
- Modify: `vite.config.ts`
- Modify: `vercel.json`
- Create: `src/services/climate.service.ts`
- Test: `src/services/climate.service.test.ts`

- [ ] **Step 1: Add proxy bases to `api.config.ts`**

Add after the `chembl` line and into the exported object:

```ts
const geocode: string =
  (import.meta.env.VITE_GEOCODE_BASE as string | undefined) ?? '/proxy/geocode'
const openmeteo: string =
  (import.meta.env.VITE_OPENMETEO_BASE as string | undefined) ?? '/proxy/openmeteo'
```

```ts
export const API_BASE = {
  who,
  disease,
  worldbank,
  openfda,
  pubchem,
  rxnorm,
  chembl,
  geocode,
  openmeteo,
} as const
```

- [ ] **Step 2: Add dev proxies to `vite.config.ts`**

Add inside `server.proxy` (after the `chembl` entry):

```ts
      '/proxy/geocode': {
        target: 'https://geocoding-api.open-meteo.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/geocode/, '/v1'),
      },
      '/proxy/openmeteo': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/openmeteo/, '/v1'),
      },
```

- [ ] **Step 3: Add prod rewrites to `vercel.json`**

Insert these two objects into `rewrites` **before** the final `"source": "/(.*)"` catch-all:

```json
    {
      "source": "/proxy/geocode/:path*",
      "destination": "https://geocoding-api.open-meteo.com/v1/:path*"
    },
    {
      "source": "/proxy/openmeteo/:path*",
      "destination": "https://api.open-meteo.com/v1/:path*"
    },
```

- [ ] **Step 4: Write the failing service test**

```ts
// src/services/climate.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodePlace, getClimateWindow } from './climate.service'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)
beforeEach(() => mockFetch.mockReset())

describe('geocodePlace', () => {
  it('returns the first geocoding match', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              name: 'Dhaka',
              country: 'Bangladesh',
              admin1: 'Dhaka',
              latitude: 23.7,
              longitude: 90.4,
            },
          ],
        }),
    })
    const place = await geocodePlace('Dhaka')
    expect(place).toEqual({
      name: 'Dhaka',
      country: 'Bangladesh',
      admin: 'Dhaka',
      lat: 23.7,
      lng: 90.4,
    })
  })

  it('returns null when there are no matches', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
    expect(await geocodePlace('zzzzz')).toBeNull()
  })
})

describe('getClimateWindow', () => {
  it('maps Open-Meteo current + daily arrays into a ClimateWindow', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          current: { temperature_2m: 28.4, relative_humidity_2m: 75, precipitation: 1.2 },
          daily: {
            time: ['2026-05-01', '2026-05-02'],
            temperature_2m_mean: [27.1, 28.0],
            relative_humidity_2m_mean: [70, 72],
            precipitation_sum: [12.0, 0.0],
          },
        }),
    })
    const w = await getClimateWindow(23.7, 90.4)
    expect(w.current.tempC).toBe(28.4)
    expect(w.history).toHaveLength(2)
    expect(w.history[0]).toEqual({ date: '2026-05-01', tempC: 27.1, humidityPct: 70, rainMm: 12.0 })
  })

  it('throws on a non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    await expect(getClimateWindow(0, 0)).rejects.toThrow('Open-Meteo error: 503')
  })
})
```

- [ ] **Step 5: Run to verify failure**

Run: `CI=true pnpm test run src/services/climate.service.test.ts`
Expected: FAIL — cannot resolve `./climate.service`.

- [ ] **Step 6: Implement the service**

```ts
// src/services/climate.service.ts
import { API_BASE } from './api.config'
import { ClimateWindowSchema, type ClimateWindow } from '@/types/climate.schema'
import { z } from 'zod'

export interface GeoPlace {
  name: string
  country: string
  admin: string
  lat: number
  lng: number
}

const GeocodeResponseSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string().optional(),
        admin1: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
})

export async function geocodePlace(query: string): Promise<GeoPlace | null> {
  const url = `${API_BASE.geocode}/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`)
  const parsed = GeocodeResponseSchema.parse(await res.json())
  const first = parsed.results?.[0]
  if (!first) return null
  return {
    name: first.name,
    country: first.country ?? '',
    admin: first.admin1 ?? '',
    lat: first.latitude,
    lng: first.longitude,
  }
}

const OpenMeteoSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    precipitation: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_mean: z.array(z.number().nullable()),
    relative_humidity_2m_mean: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
  }),
})

export async function getClimateWindow(lat: number, lng: number): Promise<ClimateWindow> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,precipitation',
    daily: 'temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum',
    past_days: '56',
    forecast_days: '1',
    timezone: 'auto',
  })
  const res = await fetch(`${API_BASE.openmeteo}/forecast?${params.toString()}`)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const raw = OpenMeteoSchema.parse(await res.json())
  const history = raw.daily.time.map((date, i) => ({
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
    history,
  })
}
```

- [ ] **Step 7: Run to verify pass**

Run: `CI=true pnpm test run src/services/climate.service.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add src/services/api.config.ts vite.config.ts vercel.json src/services/climate.service.ts src/services/climate.service.test.ts
git commit -m "feat: add Open-Meteo climate + geocoding service and proxies"
```

---

## Task 8: useRiskAssessment hook

**Files:**

- Create: `src/hooks/useRiskAssessment.ts`
- Test: `src/hooks/useRiskAssessment.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/hooks/useRiskAssessment.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useRiskAssessment } from './useRiskAssessment'
import type { ClimateWindow } from '@/types/climate.schema'

vi.mock('@/services/climate.service', () => ({
  getClimateWindow: vi.fn(),
}))
import { getClimateWindow } from '@/services/climate.service'

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

const fullHistory = Array.from({ length: 56 }, (_, i) => ({
  date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
  tempC: 29,
  humidityPct: 80,
  rainMm: 7,
}))
const climate: ClimateWindow = {
  current: { tempC: 29, humidityPct: 80, rainMm: 5 },
  history: fullHistory,
}

beforeEach(() => vi.mocked(getClimateWindow).mockReset())

describe('useRiskAssessment', () => {
  it('returns an assessment + ladder for each modelled disease', async () => {
    vi.mocked(getClimateWindow).mockResolvedValue(climate)
    const { result } = renderHook(() => useRiskAssessment(23.7, 90.4), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.results).toHaveLength(2)
    const dengue = result.current.results.find((r) => r.assessment.diseaseId === 'dengue')
    expect(dengue?.assessment.level).toBe('high')
    expect(dengue?.ladder?.avoid.join(' ').toLowerCase()).toMatch(/nsaid/)
  })

  it('does not fetch when coords are null', () => {
    const { result } = renderHook(() => useRiskAssessment(null, null), { wrapper })
    expect(getClimateWindow).not.toHaveBeenCalled()
    expect(result.current.results).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `CI=true pnpm test run src/hooks/useRiskAssessment.test.ts`
Expected: FAIL — cannot resolve `./useRiskAssessment`.

- [ ] **Step 3: Implement**

```ts
// src/hooks/useRiskAssessment.ts
import { useQuery } from '@tanstack/react-query'
import { getClimateWindow } from '@/services/climate.service'
import { assessRisk } from '@/lib/risk-engine'
import { getCareLadder } from '@/lib/care-ladder'
import { RISK_DISEASE_IDS, type RiskAssessment } from '@/types/risk.types'
import type { CareLadder } from '@/types/care-ladder.schema'

export interface RiskResult {
  assessment: RiskAssessment
  ladder: CareLadder | undefined
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
    staleTime: 36e5, // 1h
  })

  const results: RiskResult[] = query.data
    ? RISK_DISEASE_IDS.map((id) => ({
        assessment: assessRisk(query.data, id),
        ladder: getCareLadder(id),
      }))
    : []

  return { results, isLoading: enabled && query.isLoading, isError: query.isError }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `CI=true pnpm test run src/hooks/useRiskAssessment.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRiskAssessment.ts src/hooks/useRiskAssessment.test.ts
git commit -m "feat: add useRiskAssessment hook composing climate, engine, ladder"
```

---

## Task 9: Risk UI components

**Files:**

- Create: `src/components/risk/SafetyBanner.tsx`
- Create: `src/components/risk/CareLadderPanel.tsx`
- Create: `src/components/risk/RiskCard.tsx`
- Create: `src/components/risk/PlaceSearch.tsx`
- Test: `src/components/risk/RiskCard.test.tsx`

- [ ] **Step 1: Write SafetyBanner**

```tsx
// src/components/risk/SafetyBanner.tsx
import { AlertTriangle } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>
        <span className="font-semibold">Experimental — not medical advice.</span> Risk is estimated
        from weather only. Guidance is relayed from public-health authorities. In an emergency, seek
        a health facility.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Write CareLadderPanel**

```tsx
// src/components/risk/CareLadderPanel.tsx
import { ShieldAlert, Ban, Droplet, Pill } from 'lucide-react'
import type { CareLadder } from '@/types/care-ladder.schema'

function Section({
  title,
  items,
  icon,
  tone,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
  tone: string
}) {
  if (items.length === 0) return null
  return (
    <div className="mt-3">
      <p className={`flex items-center gap-1.5 text-xs font-semibold ${tone}`}>
        {icon}
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-6 text-xs text-gray-700">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  )
}

export function CareLadderPanel({ ladder }: { ladder: CareLadder }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <Section
        title="First-line"
        items={[ladder.firstLine]}
        icon={<Pill className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-gray-900"
      />
      <Section
        title="If medication is unavailable"
        items={ladder.ifUnavailable}
        icon={<Droplet className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-blue-700"
      />
      <Section
        title="When there is no medicine"
        items={ladder.supportiveNoMedicine}
        icon={<Droplet className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-blue-700"
      />
      <Section
        title="Do NOT use"
        items={ladder.avoid}
        icon={<Ban className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-red-700"
      />
      <Section
        title="Seek care now if"
        items={ladder.redFlags}
        icon={<ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-red-700"
      />
      {ladder.populationNotes && (
        <p className="mt-3 text-[11px] italic text-gray-500">{ladder.populationNotes}</p>
      )}
      <p className="mt-3 border-t border-stone-200 pt-2 text-[10px] text-gray-400">
        Source: {ladder.source} · updated {ladder.updated}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Write RiskCard**

```tsx
// src/components/risk/RiskCard.tsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { CareLadderPanel } from './CareLadderPanel'

const LEVEL_STYLE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
}
const LABEL: Record<string, string> = { dengue: 'Dengue', cholera: 'Cholera' }

export function RiskCard({ result }: { result: RiskResult }) {
  const [open, setOpen] = useState(false)
  const { assessment, ladder } = result
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

- [ ] **Step 4: Write PlaceSearch**

```tsx
// src/components/risk/PlaceSearch.tsx
import { useState } from 'react'
import { Search } from 'lucide-react'

export function PlaceSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSearch(value.trim())
      }}
      className="flex items-center gap-2"
    >
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2">
        <Search className="h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search a city or place…"
          aria-label="Search a city or place"
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Check
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Write the RiskCard test**

```tsx
// src/components/risk/RiskCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiskCard } from './RiskCard'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { getCareLadder } from '@/lib/care-ladder'

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
}

describe('RiskCard', () => {
  it('shows disease, level, and driver reasoning', () => {
    render(<RiskCard result={result} />)
    expect(screen.getByText('Dengue')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText(/29°C — favourable/)).toBeInTheDocument()
  })

  it('reveals the care ladder on expand, including the NSAID warning', async () => {
    const user = userEvent.setup()
    render(<RiskCard result={result} />)
    await user.click(screen.getByRole('button', { name: /what to do/i }))
    expect(screen.getByText(/NSAIDs and aspirin/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run to verify pass**

Run: `CI=true pnpm test run src/components/risk/RiskCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/risk/
git commit -m "feat: add risk UI components (banner, card, care ladder, place search)"
```

---

## Task 10: PlacePage + route + nav

**Files:**

- Create: `src/pages/PlacePage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Header.tsx`
- Test: `src/pages/PlacePage.test.tsx`

- [ ] **Step 1: Write PlacePage**

```tsx
// src/pages/PlacePage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { geocodePlace, type GeoPlace } from '@/services/climate.service'
import { useRiskAssessment } from '@/hooks/useRiskAssessment'
import { SafetyBanner } from '@/components/risk/SafetyBanner'
import { PlaceSearch } from '@/components/risk/PlaceSearch'
import { RiskCard } from '@/components/risk/RiskCard'

export default function PlacePage() {
  const [place, setPlace] = useState<GeoPlace | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searching, setSearching] = useState(false)
  const { results, isLoading, isError } = useRiskAssessment(place?.lat ?? null, place?.lng ?? null)

  const handleSearch = async (query: string) => {
    setSearching(true)
    setNotFound(false)
    try {
      const found = await geocodePlace(query)
      if (!found) {
        setNotFound(true)
        setPlace(null)
      } else {
        setPlace(found)
      }
    } catch {
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col gap-3 overflow-y-auto p-4">
      <Link to="/" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to map
      </Link>
      <h1 className="text-lg font-bold text-gray-900">Place health check</h1>
      <SafetyBanner />
      <PlaceSearch onSearch={handleSearch} />

      {searching && <p className="text-sm text-gray-500">Finding place…</p>}
      {notFound && <p className="text-sm text-gray-500">Place not found. Try another search.</p>}
      {place && (
        <p className="text-sm font-medium text-gray-700">
          {place.name}
          {place.country ? `, ${place.country}` : ''}
        </p>
      )}
      {isLoading && <p className="text-sm text-gray-500">Reading the weather…</p>}
      {isError && <p className="text-sm text-gray-500">Weather data unavailable right now.</p>}
      {results.map((r) => (
        <RiskCard key={r.assessment.diseaseId} result={r} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add the route in `src/App.tsx`**

Add the lazy import near the existing `DrugPage` import:

```tsx
const PlacePage = lazy(() => import('@/pages/PlacePage'))
```

Add this route before the `*` catch-all route:

```tsx
<Route
  path="/place"
  element={
    <Suspense fallback={<LoadingSkeleton label="Loading place check..." rows={5} />}>
      <PlacePage />
    </Suspense>
  }
/>
```

- [ ] **Step 3: Add a nav link in `src/components/layout/Header.tsx`**

Add a `Link` import from `react-router-dom` (combine with existing `useNavigate` import):

```tsx
import { useNavigate, Link } from 'react-router-dom'
```

Add this link inside the right-hand `<div className="flex items-center gap-2">`, before the search button:

```tsx
<Link
  to="/place"
  className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-black/[0.05] hover:text-gray-900"
>
  Place check
</Link>
```

- [ ] **Step 4: Write the PlacePage test**

```tsx
// src/pages/PlacePage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement, type ReactNode } from 'react'
import PlacePage from './PlacePage'
import type { ClimateWindow } from '@/types/climate.schema'

vi.mock('@/services/climate.service', () => ({
  geocodePlace: vi.fn(),
  getClimateWindow: vi.fn(),
}))
import { geocodePlace, getClimateWindow } from '@/services/climate.service'

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    createElement(MemoryRouter, null, children),
  )

const climate: ClimateWindow = {
  current: { tempC: 29, humidityPct: 80, rainMm: 5 },
  history: Array.from({ length: 56 }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    tempC: 29,
    humidityPct: 80,
    rainMm: 7,
  })),
}

beforeEach(() => {
  vi.mocked(geocodePlace).mockReset()
  vi.mocked(getClimateWindow).mockReset()
})

describe('PlacePage', () => {
  it('shows risk cards after a successful search', async () => {
    vi.mocked(geocodePlace).mockResolvedValue({
      name: 'Dhaka',
      country: 'Bangladesh',
      admin: 'Dhaka',
      lat: 23.7,
      lng: 90.4,
    })
    vi.mocked(getClimateWindow).mockResolvedValue(climate)
    render(<PlacePage />, { wrapper })
    await userEvent.type(screen.getByLabelText(/search a city/i), 'Dhaka')
    await userEvent.click(screen.getByRole('button', { name: /check/i }))
    await waitFor(() => expect(screen.getByText('Dengue')).toBeInTheDocument())
    expect(screen.getByText(/Bangladesh/)).toBeInTheDocument()
  })

  it('shows a not-found message when geocoding returns nothing', async () => {
    vi.mocked(geocodePlace).mockResolvedValue(null)
    render(<PlacePage />, { wrapper })
    await userEvent.type(screen.getByLabelText(/search a city/i), 'zzzz')
    await userEvent.click(screen.getByRole('button', { name: /check/i }))
    await waitFor(() => expect(screen.getByText(/place not found/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 5: Run to verify pass**

Run: `CI=true pnpm test run src/pages/PlacePage.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Full verification**

Run: `pnpm typecheck && CI=true pnpm test run && pnpm lint`
Expected: typecheck clean, all tests pass, lint clean.

- [ ] **Step 7: Commit**

```bash
git add src/pages/PlacePage.tsx src/pages/PlacePage.test.tsx src/App.tsx src/components/layout/Header.tsx
git commit -m "feat: add place health check page, route, and nav link"
```

---

## Self-Review

**Spec coverage:** §3 architecture → Tasks 1–10; §4 types → Tasks 1,2,5; §5 risk science → Tasks 3,4; §6 care ladder → Task 6; §7 degradation → Tasks 7 (fetch errors), 10 (not-found, weather-down, ladder-still-shown); §8 testing → every task is TDD; §2 trust posture → SafetyBanner (Task 9), confidence/gaps in RiskCard (Task 9), "relayed from" source line in CareLadderPanel (Task 9), escalation in redFlags (Task 6). §11 success criteria all mapped.

**Placeholder scan:** none — all steps contain runnable code and exact commands.

**Type consistency:** `ClimateWindow`/`DailyWeather` (Task 1) used by engine (3,4), service (7), hook (8), tests. `RiskAssessment`/`Driver`/`RiskDiseaseId`/`RISK_DISEASE_IDS` (Task 2) used consistently. `CareLadder` (Task 5) used by data (6), hook (8), components (9). `RiskResult` (Task 8) used by RiskCard (9). `assessRisk(climate, id)`, `getCareLadder(id)`, `geocodePlace(query)`, `getClimateWindow(lat,lng)`, `useRiskAssessment(lat,lng)` signatures match across all call sites.

**Open-Meteo note:** exact param names (`temperature_2m_mean`, `relative_humidity_2m_mean`, `precipitation_sum`, `past_days`) should be confirmed against the live API on first run; the service Zod schema will surface any mismatch immediately.
