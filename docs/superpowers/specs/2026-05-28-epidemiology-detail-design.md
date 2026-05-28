# Epidemiology Detail Section — Design Spec

**Date:** 2026-05-28  
**Status:** Approved for implementation

---

## Overview

Replace the placeholder "Extended epidemiological breakdown" stub in `DiseaseOverviewTab` with two real, data-driven charts stacked vertically:

1. **Age / Sex Breakdown** — grouped bar chart, WHO GHO data
2. **Case Fatality Rate (CFR) over time** — line chart, WHO GHO data (derived)

Visible only for `epidemiologist` and `clinical` personas (unchanged from current gating).

---

## Data Sources (verified against live WHO GHO API)

### Age / Sex Breakdown

| Disease                                               | Indicator                    | Dim1                    | Dim2                                                 | Available |
| ----------------------------------------------------- | ---------------------------- | ----------------------- | ---------------------------------------------------- | --------- |
| Tuberculosis                                          | `TB_Notification_agesex_num` | SEX (SEX_MLE, SEX_FMLE) | AGEGROUP (<5, 5-14, 15-24, 25-34, 35-44, 55-64, 65+) | ✅        |
| HIV, Malaria, Cholera, Polio, Dengue, COVID-19, Ebola | —                            | —                       | —                                                    | ❌        |

For all diseases without data, render a message:

> "WHO does not currently publish age-stratified [Disease] data. Age breakdowns are available for tuberculosis."

### CFR (Case Fatality Rate = deaths / incidence × 100)

| Disease                             | Deaths indicator          | Incidence indicator  |
| ----------------------------------- | ------------------------- | -------------------- |
| Malaria                             | `MALARIA_EST_DEATHS`      | `MALARIA_CONF_CASES` |
| Tuberculosis                        | `TB_e_mort_exc_tbhiv_num` | `TB_e_inc_num`       |
| Cholera                             | `CHOLERA_0000000002`      | `CHOLERA_0000000001` |
| HIV, Polio, Dengue, COVID-19, Ebola | —                         | —                    |

For diseases without paired indicators, render:

> "WHO does not publish a case fatality rate for [Disease] via the GHO API."

---

## Architecture

### Schema extension

Extend `WHORecordSchema` in `src/types/who.schema.ts` to include dimension fields:

```ts
Dim1Type: z.string().nullable(),
Dim1: z.string().nullable(),
Dim2Type: z.string().nullable(),
Dim2: z.string().nullable(),
```

### New service function

Add `getDiseaseByCountryWithDims(iso3, indicator)` to `who.service.ts`. Identical to `getDiseaseByCountry` but returns records with `Dim1`/`Dim2` populated (same endpoint, schema now captures them).

### New hooks (`src/hooks/useEpidemiology.ts`)

```ts
useAgeSexBreakdown(iso3: string, diseaseId: string)
// Returns parsed { ageGroup, male, female }[] from TB_Notification_agesex_num
// Returns null for all other diseaseIds

useCFR(iso3: string, diseaseId: string)
// Fetches deaths + incidence indicators in parallel
// Returns { year, cfr }[] sorted ascending
// Returns null for diseases without paired indicators
```

### Disease catalogue additions (`src/lib/disease-catalogue.ts` or `src/lib/cfr-catalogue.ts`)

Static map of disease → CFR indicator pair (deaths indicator code + incidence indicator code). `null` for diseases without data.

### New components

**`AgeSexBreakdownChart`** (`src/components/disease/AgeSexBreakdownChart.tsx`)

- Grouped horizontal bar chart (male=blue `#60a5fa`, female=pink `#f472b6`)
- X-axis: case count. Y-axis: age group labels in natural order (<5 → 65+)
- Uses Recharts `BarChart` (already in project if present, else build with SVG like `EpidemicCurveChart`)
- Shows latest year with a "Recorded in [year]" caption
- No-data state: styled message box explaining WHO coverage

**`CaseFatalityRateChart`** (`src/components/disease/CaseFatalityRateChart.tsx`)

- Line chart of CFR % over years — reuse `EpidemicCurveChart` pattern (SVG, same dark theme)
- Y-axis label: "CFR %"
- Source caption: "Derived from WHO GHO deaths / incidence · [year range]"
- No-data state: styled message box

**`EpidemiologyDetailSection`** (`src/components/disease/EpidemiologyDetailSection.tsx`)

- Renders both charts stacked with a `<hr>` divider and section labels
- Accepts `{ iso3, disease }` props
- Replaces the current inline `<div>` placeholder in `DiseaseOverviewTab`

---

## Component tree (delta only)

```
DiseaseOverviewTab
  └── EpidemiologyDetailSection   ← new, replaces the stub div
        ├── AgeSexBreakdownChart  ← new
        └── CaseFatalityRateChart ← new
```

---

## Error / loading states

- Each chart independently shows `<LoadingSkeleton>` while fetching
- Each chart independently shows `<ErrorState>` on API failure with retry
- "No data for this disease" is a distinct styled state (not an error)

---

## What is NOT in scope

- Monthly / seasonal data
- R₀ / Rt estimation
- Age/sex data for HIV, Malaria, Cholera (not available in GHO)
- Any persona other than `epidemiologist` and `clinical`
