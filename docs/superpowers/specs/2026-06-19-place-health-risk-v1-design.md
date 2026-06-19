# Place-Based Health Risk + Care Ladder — v1 Design

**Date:** 2026-06-19
**Status:** Approved (design); pending implementation plan
**Scope (cut A):** Thinnest provable vertical slice — one place, two diseases
(dengue + cholera), **current risk only**, online-only, as a new route inside the
existing `disease-visualizer` app.

---

## 1. Purpose

Turn the disease visualizer from a passive global map into a **place-aware health
companion**: point at a place and learn the climate-driven disease risk _right now_,
_why_ (environmental drivers), and a **Care Ladder** — what's advised, what to take,
what to use if medication is unavailable, what NOT to take, and when to seek care.

v1 proves the full loop **climate → risk → Care Ladder** end-to-end on a thin slice.
Forecast horizon, the "who" (population modifier), more diseases, local burden data,
and offline/PWA are explicitly **out of scope for v1** (v2+).

## 2. Trust posture (decided: A — experimental prototype)

- Risk shown with a prominent **"Experimental — not medical advice"** banner.
- **Confidence always visible**; data gaps stated plainly.
- Care Ladder framed strictly as **relayed from WHO / named authority**, stamped with
  source + date. The app is a messenger, never an author of medical advice.
- **Escalation ("seek care") always one tap away.**
- The engine computes **environmental suitability / risk signal**, NOT an outbreak
  prediction — language reflects this everywhere.
- Backtesting against past outbreaks is a success criterion but **not** a v1 release
  blocker (this is a prototype, not guidance-grade — that bar is v2 before real users
  in harm's way).

## 3. Architecture (Approach 1 — layered services + pure engine)

Mirrors existing `services / hooks / types / lib / components` layout and Zod-at-the-
boundary discipline.

```
PlacePage
  └─ place search (Open-Meteo geocoding) → { lat, lng, name, country, admin }
        │
        ▼
  useRiskAssessment(lat, lng)              ← react-query
        ├─ climate.service: current + last ~8 weeks (temp, humidity, rain)
        ├─ risk-engine(climate, 'dengue')  → RiskAssessment  (pure)
        ├─ risk-engine(climate, 'cholera') → RiskAssessment  (pure)
        └─ care-ladder lookup by disease   → CareLadder (cited, static)
        │
        ▼
  RiskCard ×2  +  CareLadder drill-down  +  "experimental / not medical advice" banner
```

### Module boundaries

| Unit                          | Does                                 | Input → Output                                | Depends on                   |
| ----------------------------- | ------------------------------------ | --------------------------------------------- | ---------------------------- |
| `services/climate.service.ts` | Fetch + parse weather                | place coords → `ClimateWindow` (Zod)          | Open-Meteo, axios            |
| `lib/risk-engine.ts`          | Climate → risk + reason              | `(ClimateWindow, Disease)` → `RiskAssessment` | nothing (pure)               |
| `lib/care-ladder/`            | Cited treatment/fallback content     | `Disease` → `CareLadder` (Zod)                | nothing (static)             |
| `hooks/useRiskAssessment.ts`  | Compose the above                    | coords → `{ assessments[], ladders[] }`       | the three above, react-query |
| `components/risk/`            | Render card + ladder + safety banner | props                                         | UI primitives                |
| `pages/PlacePage.tsx`         | Place search + route                 | —                                             | search + risk components     |

The **pure-engine boundary is the key design decision**: `risk-engine` does zero I/O so
the science is unit-tested in isolation and data sources can be swapped without touching it.

## 4. Core types (shape; finalized in implementation)

```ts
ClimateWindow = {
  current: { tempC: number; humidityPct: number; rainMm: number }
  history: DailyWeather[]   // ≈ 56 days: { date, tempC, humidityPct, rainMm }
}

RiskAssessment = {
  disease: Disease
  level: 'low' | 'moderate' | 'high'
  drivers: Driver[]                 // the "why": which factor fired + value
  confidence: 'low' | 'moderate'    // never 'high' in v1
  dataGaps: string[]
}

CareLadder = {
  disease: Disease
  source: string                    // e.g. "WHO Dengue Guidelines"
  updated: string                   // ISO date of the cited source
  firstLine: string
  ifUnavailable: string[]
  supportiveNoMedicine: string[]
  avoid: string[]                   // critical — "what NOT to take"
  redFlags: string[]                // escalate to facility now
  populationNotes?: string
}
```

## 5. Risk-engine science

The engine returns level **+ drivers (reasoning) + dataGaps** — explainability is the
trust feature. **Exact constants are finalized against primary literature during
implementation (TDD cases derived from the cited papers).**

### Dengue (mosquito-borne — relatively strong climate signal)

- **Temperature** — _Aedes aegypti_ transmission range ≈ 17.8–34.5 °C, optimum ≈ 29 °C
  (Mordecai et al. 2017, _eLife_). Modeled as triangular suitability: 1.0 near 29 °C,
  → 0 at the edges.
- **Rainfall (lagged)** — breeding sites form after rain; risk lags rainfall ≈ 2–6 weeks.
  Meaningful cumulative rain in the t-2…t-6 week window raises risk.
- **Humidity** — RH > ~60 % aids mosquito survival; scales the score.
- Combine → `low/moderate/high` with named drivers. **Confidence up to `moderate`.**

### Cholera (water-borne — WEAK climate proxy, flagged loudly)

- **Heavy rainfall / flooding anomaly** in prior ≈ 1–4 weeks → water contamination.
- **Warm temperature** → _V. cholerae_ growth.
- **Honest cap:** true driver is sanitation/water infrastructure, invisible to climate.
  Confidence capped at `moderate`; always carries `dataGaps` note: _"climate signal
  only — actual risk depends on local water & sanitation."_ Never present as certainty.

## 6. Care Ladder content (cited, curated; verified against live WHO source at curation)

**Dengue**

- First-line: supportive; **paracetamol** for fever/pain.
- **Avoid (critical): NSAIDs / aspirin / ibuprofen** — bleeding risk.
- If unavailable: tepid sponging, rest.
- No-medicine: oral hydration, rest, monitor.
- Red flags (WHO warning signs): severe abdominal pain, persistent vomiting, bleeding
  gums/nose, lethargy, fast breathing → facility now.

**Cholera**

- First-line: **ORS** (cornerstone); antibiotics for severe cases per WHO.
- If unavailable: **WHO homemade ORS** (1 L clean water + 6 tsp sugar + ½ tsp salt).
- No-medicine: continuous fluids, keep feeding.
- Avoid: motility-stopping anti-diarrheals (not recommended in cholera).
- Red flags: severe dehydration (sunken eyes, no urine, skin tenting, lethargy) →
  urgent care / IV.

## 7. Degradation & error handling

- Geocoding fails / place not found → clear retry, no crash.
- Climate fetch fails → still show Care Ladder (static) + "risk unavailable, weather
  data down."
- Missing/partial history → reduce confidence, note the gap; compute from what's present.
- Burden/case data **out of scope v1** — risk is climate-only and explicitly labeled.

## 8. Testing

- `risk-engine` — pure unit tests (bulk of coverage): known inputs → expected level +
  drivers; edge temps (17 / 29 / 35 °C); lag windows; confidence caps. Cases cited to
  literature.
- `care-ladder` — Zod schema validation + test asserting every record has `source`,
  `redFlags`, and the dengue NSAID-avoid entry (safety regression).
- `climate.service` — parse mocked Open-Meteo responses (existing service-test pattern).
- `useRiskAssessment` — composition with mocked service.
- Coverage gate ≥ 80 % (CI).

## 9. Reuse vs new

| Reuse                                         | New                                        |
| --------------------------------------------- | ------------------------------------------ |
| Zustand, react-query, Zod boundary discipline | `climate.service.ts` (Open-Meteo)          |
| Proxy pattern (`/proxy/*`), axios instance    | `risk-engine.ts` (pure, tested)            |
| `services/hooks/types/lib` structure          | `care-ladder/` curated cited KB            |
| openFDA / RxNorm (drug detail, later)         | `useRiskAssessment.ts`                     |
| Globe/map → become _explore_ mode             | `pages/PlacePage.tsx` + `components/risk/` |

## 10. Out of scope (v2+)

16-day forecast horizon; population "who" modifier; offline/PWA + cached Ladder;
additional diseases; local burden/case + wastewater/genomic fusion; ML risk model;
guidance-grade validation/backtesting gate.

## 11. Success criteria (v1)

1. Search a place → see climate-driven dengue + cholera risk with explicit drivers,
   confidence, and data gaps.
2. Each risk drills into a cited Care Ladder including the no-medicine fallback and the
   dengue NSAID-avoid warning.
3. "Experimental — not medical advice" + escalation always present.
4. Graceful degradation on every external failure.
5. Risk engine pure + unit-tested; suite green; coverage ≥ 80 %.
