# Disease Visualizer — Design Specification

**Date:** 2026-05-27  
**Status:** Approved  
**Author:** Abhishek Pandit

---

## 1. Overview

A NASA-level, UN-grade interactive disease intelligence platform. It allows policy analysts, epidemiologists, and clinical/pharma researchers to explore long-lasting and current diseases across the globe — by country, region, history, affected population, and treatment — through a fully interactive 3D globe, epidemic timelines, and a full-stack pharmaceutical drug visualizer.

The platform is built as a pure frontend SPA today, with a strict service abstraction layer designed to slot in a FastAPI backend in Phase 2 with zero component rewrites.

---

## 2. User Personas

The platform serves three combined personas simultaneously. A persona toggle re-skins the depth of the right panel without changing the data or navigation:

| Persona               | Primary need                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Policy Analyst**    | Country comparisons, trend lines, exportable charts, policy impact notes                      |
| **Epidemiologist**    | R₀ curves, mortality/morbidity breakdowns, age cohort data, spread velocity, seasonality      |
| **Clinical / Pharma** | Treatment protocols, drug cards, 3D molecule viewer, efficacy timelines, interaction warnings |

---

## 3. Tech Stack

| Layer         | Choice                    | Reason                                            |
| ------------- | ------------------------- | ------------------------------------------------- |
| Framework     | React 18 + Vite           | Fast HMR, pure CSR, minimal config                |
| Language      | TypeScript strict         | No `any`, all API responses Zod-validated         |
| Globe (3D)    | react-globe.gl (Three.js) | NASA-style rotating globe, arcs, heatmaps         |
| Map (2D)      | react-simple-maps + D3    | Choropleth fallback, adaptive depth               |
| Molecule 3D   | 3Dmol.js                  | WebGL molecular viewer, PubChem-ready             |
| Molecule 2D   | @rdkit/rdkit (WASM)       | Render SMILES to 2D structure in-browser          |
| Charts        | Recharts + D3             | Epidemic curves, mortality timelines              |
| State         | Zustand                   | Disease config, selected country, active persona  |
| Server state  | TanStack Query v5         | Caching, background refresh, loading/error states |
| Styling       | Tailwind CSS v3           | Dark mode (NASA aesthetic), utility-first         |
| Accessibility | React Aria                | WCAG 2.1 AA on all interactive elements           |
| Validation    | Zod                       | Every API response parsed before use              |
| Routing       | React Router v6           | Client-side routing                               |
| Icons         | Lucide React              | Only icons — zero emojis, zero inline SVGs        |

---

## 4. Hard Rules

- **Zero emojis anywhere in the UI.** Every visual indicator uses a Lucide React icon component.
- **Zero inline SVGs.** Icons are Lucide React components only.
- **Every number has context.** Unit + comparison + plain-English meaning — always.
- **Every technical view has a Plain English block.** Written for a curious non-expert, not a specialist.
- **No jargon without explanation.** Every medical/scientific term is followed by a plain-English definition in a tooltip or inline parenthetical.
- **No `any` types.** TypeScript strict mode, Zod on every API response.
- **pnpm only.** Never npm or yarn.
- **No default exports** except page-level route components.
- **WCAG 2.1 AA.** Colour is never the only signal — icons + colour + text labels together.

---

## 5. Project Structure

```
disease-visualizer/
├── public/
│   └── geo/                        # Natural Earth GeoJSON static assets
├── src/
│   ├── services/                   # FastAPI seam — all external API calls
│   │   ├── api.config.ts           # Base URLs — swap to FastAPI via .env
│   │   ├── who.service.ts          # WHO GHO OData API
│   │   ├── disease.service.ts      # disease.sh (COVID/Flu/Monkeypox)
│   │   ├── worldbank.service.ts    # World Bank population + health indicators
│   │   ├── openfda.service.ts      # Drug labels + adverse events
│   │   ├── pubchem.service.ts      # Molecular structures (2D + 3D)
│   │   ├── rxnorm.service.ts       # Drug names + interactions
│   │   └── chembl.service.ts       # Drug targets + bioactivity
│   ├── components/
│   │   ├── globe/                  # 3D interactive globe
│   │   ├── map/                    # 2D choropleth fallback
│   │   ├── disease/                # Disease explorer panels
│   │   ├── drug/                   # Drug visualizer (3D mol + cards)
│   │   ├── timeline/               # Epidemic history timeline
│   │   ├── charts/                 # D3 / Recharts wrappers
│   │   └── ui/                     # React Aria primitives (WCAG 2.1 AA)
│   ├── stores/                     # Zustand global state slices
│   ├── hooks/                      # TanStack Query hooks per service
│   ├── pages/                      # Route-level components
│   └── types/                      # Zod schemas + inferred TypeScript types
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-27-disease-visualizer-design.md
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. FastAPI Seam (Phase 2 Readiness)

All base URLs are environment-variable driven. Phase 2 migration = update `.env`. Zero component changes required.

```ts
// src/services/api.config.ts
export const API_BASE = {
  who: import.meta.env.VITE_WHO_BASE ?? "https://ghoapi.azureedge.net/api",
  disease:
    import.meta.env.VITE_DISEASE_BASE ?? "https://disease.sh/v3/covid-19",
  worldbank: import.meta.env.VITE_WB_BASE ?? "https://api.worldbank.org/v2",
  openfda: import.meta.env.VITE_FDA_BASE ?? "https://api.fda.gov",
  pubchem:
    import.meta.env.VITE_PUBCHEM_BASE ??
    "https://pubchem.ncbi.nlm.nih.gov/rest/pug",
  rxnorm: import.meta.env.VITE_RXNORM_BASE ?? "https://rxnav.nlm.nih.gov/REST",
  chembl:
    import.meta.env.VITE_CHEMBL_BASE ?? "https://www.ebi.ac.uk/chembl/api/data",
};
```

---

## 7. Data Sources

All APIs are free, no API key required, production-grade.

| Data Domain                              | API                   | Cache TTL    |
| ---------------------------------------- | --------------------- | ------------ |
| Disease burden by country (historical)   | WHO GHO OData API     | 24 hours     |
| Live outbreak data (COVID/Flu/Monkeypox) | disease.sh            | 10 minutes   |
| Population + health infrastructure       | World Bank API        | 7 days       |
| Drug labels + adverse events             | OpenFDA               | 1 hour       |
| Molecular structures (2D + 3D)           | PubChem REST API      | Permanent    |
| Drug names + interactions                | RxNorm (NIH)          | 1 hour       |
| Drug targets + bioactivity               | ChEMBL API            | 24 hours     |
| Geographic boundaries                    | Natural Earth GeoJSON | Static asset |

---

## 8. Application Shell & Navigation

### Layout

Three-panel immersive workspace. No page navigations — the globe is always the hero.

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Persona Toggle | Disease Config | Search | Theme    │
├──────────────┬──────────────────────────────────┬───────────────────┤
│  LEFT PANEL  │        GLOBE / MAP (hero)        │   RIGHT PANEL     │
│              │                                  │   (context panel) │
│  Disease     │  Rotating 3D globe               │                   │
│  Selector    │  Heat overlay per disease        │  Slides in on:    │
│              │  Country borders                 │  - Country click  │
│  Active:     │  Animated spread arcs            │  - Disease select │
│  Malaria     │  Population bubbles              │  - Drug selected  │
│  TB          │  Alert pins                      │                   │
│  HIV/AIDS    │                                  │                   │
│  + Add more  │  ──────────────────────────      │                   │
│              │  [ 1900 ─────●──────── 2024 ]    │                   │
└──────────────┴──────────────────────────────────┴───────────────────┘
│  BOTTOM BAR: Global stats ticker | Data source credits | Last sync  │
└─────────────────────────────────────────────────────────────────────┘
```

### Routes

```
/                             Globe home — all configured diseases, current year
/disease/:slug                Globe locked to one disease, full history
/drug/:pubchemId              Full-screen drug visualizer
/region/:countryCode          Country deep-dive — all diseases, all time
/region/:countryCode/:adm1    Admin-1 drill-down (adaptive — only when data exists)
/compare                      Side-by-side country comparison (Analyst persona)
```

### Key Interactions

| User action                 | Result                                                            |
| --------------------------- | ----------------------------------------------------------------- |
| Hover country               | Tooltip: country name + top stat                                  |
| Click country               | Right panel slides in with disease stats; globe rotates to centre |
| Drag time scrubber          | Heat overlay morphs smoothly between years                        |
| Click disease in left panel | Globe overlay switches to that disease                            |
| Switch persona              | Right panel morphs — instant, no re-fetch                         |
| Click drug name             | Routes to full drug visualizer                                    |
| Scroll on globe             | Zoom in — adaptive depth unlocks region boundaries                |
| Right-click country         | Pin for side-by-side comparison                                   |
| Search bar                  | Fuzzy search across countries, diseases, drugs                    |

### Visual Theme

Dark mode by default — deep navy/black background, glowing globe, neon accents colour-coded by disease category:

| Category           | Accent colour |
| ------------------ | ------------- |
| Viral haemorrhagic | Red           |
| Respiratory        | Amber         |
| Parasitic          | Green         |
| Bacterial          | Blue          |
| Vector-borne       | Teal          |

Light mode available for print and export.

---

## 9. Disease Configuration

User-configurable disease cohort. Default set includes:

**Historical:** Malaria, Tuberculosis, HIV/AIDS, Cholera, Smallpox, Plague, Polio, Spanish Flu  
**Modern:** COVID-19, Ebola, Monkeypox, Dengue, Zika

Analysts can add or remove diseases via a configuration panel. Each disease is stored in the Zustand `diseaseConfig` store.

---

## 10. Globe Visualizer

### Visual Layers (all toggleable)

| Layer              | Description                                               |
| ------------------ | --------------------------------------------------------- |
| Base               | Country borders, ocean, atmosphere glow                   |
| Heat overlay       | Disease burden gradient — grey to deep red                |
| Pulse rings        | Animated expanding rings on high-incidence countries      |
| Spread arcs        | Animated bezier arcs showing historical disease migration |
| Population bubbles | Scaled spheres sized by affected population count         |
| Alert pins         | WHO emergency alert indicators                            |

### Adaptive Depth

```
Level 0 — Globe view
  All countries heatmapped. Click any country to zoom.

Level 1 — Country view (always available)
  Country fills screen. Admin-1 regions shown IF data exists.
  Badge indicates: "Regional data available" or "Country-level data only"

Level 2 — Region/Province (when data exists)
  Region fills screen. District dots if city data available.
  Breadcrumb: Globe > Country > Region

Level 3 — City/District (rare — disease.sh COVID data only)
  Bar chart replaces map. Data source + last-updated timestamp shown.
```

### Time Scrubber

Horizontal slider from 1900 to current year. Dragging smoothly interpolates the globe heat overlay using D3 colour interpolation. Feels cinematic — the disease visibly spreads or recedes as you scrub.

---

## 11. Human-Readable Data Rules

Applied universally across every view.

### Number Formatting

| Raw value      | Display                             |
| -------------- | ----------------------------------- |
| 68400000       | 68.4 Million                        |
| 0.0034         | 3.4 per 1,000 people                |
| 1200000000     | 1.2 Billion                         |
| 0.78           | 78%                                 |
| null / missing | "No data available for this period" |

### Trend Indicators (icon + colour + text — never colour alone)

| Trend        | Icon          | Colour      | Text                           |
| ------------ | ------------- | ----------- | ------------------------------ |
| Increasing   | TrendingUp    | Amber / Red | "+12% from last year"          |
| Decreasing   | TrendingDown  | Green       | "-8% from last year"           |
| Stable       | Minus         | Grey        | "Stable — less than 1% change" |
| New outbreak | AlertTriangle | Red         | "First recorded outbreak"      |

### Contextual Framing

Every key metric is shown with three layers:

1. **The number** — formatted and with units
2. **The comparison** — vs global average, regional average, or prior year
3. **Plain-English meaning** — one sentence a non-expert can understand

Example:

```
Deaths: 143,000
4x the Sub-Saharan average
Roughly equivalent to a mid-sized city losing its entire population in one year.
```

---

## 12. Disease Explorer Panel

### Structure

Four tabs: Overview, History, Compare, Drugs.

### Overview Tab

- Headline metric cards: Total Cases, Deaths, Incidence Rate, Case Fatality Rate
- Each card: number + trend icon + plain-English context
- Epidemic curve: Recharts area chart from 1990 to current year
- Key historical events pinned to the chart

### History Tab — Epidemic Timeline

- Full-width zoomable horizontal timeline
- Zoom levels: 10yr, 25yr, 50yr, All
- Landmark events as pins — hover expands plain-English description
- Data sources: WHO GHO + curated landmark events dataset bundled with app
- Export button: PNG image of timeline

### Compare Tab

- Side-by-side country comparison
- Triggered by right-clicking a second country on the globe, or via the tab
- Shared overlay trend chart with two lines
- Difference callout: "Nigeria has 52x the malaria burden of India per capita"

### Drugs Tab (Clinical persona)

- Treatment protocol: first-line, second-line, resistance notes
- Drug cards — clickable, routes to full drug visualizer
- Resistance timeline chart
- Vaccine status card: approved / trial phase / none

### Persona-Specific Additions

**Epidemiologist adds:**

- R-naught (R₀) indicator with plain-English interpretation
- Age cohort breakdown bar chart
- Seasonality chart (12-month rolling average)
- Healthcare capacity overlay (hospital beds per 1,000 vs case load)

**Policy Analyst adds:**

- Year-over-year comparison table (last 5 years)
- Regional neighbours comparison bar chart
- Export button: CSV data + PNG charts
- Plain-English WHO intervention notes

---

## 13. Drug Visualizer

### Entry Points

1. Click a drug name in the Disease Panel (Clinical persona)
2. Direct URL: `/drug/:pubchemId`
3. Search bar result

### Layout

Split screen: 3D molecule viewer (left) + Drug Intelligence Panel (right).

### Plain English Block (mandatory — shown first in every drug view)

Before any technical data, every drug view opens with a "What is this?" block:

```
WHAT IS ARTEMISININ — IN PLAIN ENGLISH

Artemisinin is a medicine used to treat malaria, a disease spread by
mosquito bites. It comes from a plant called Sweet Wormwood, which
traditional Chinese doctors have used for over 2,000 years.

When you take artemisinin, it travels through your blood, finds the
malaria parasite hiding inside your red blood cells, and destroys it
within 48 hours. It is currently the most effective malaria treatment
in the world and is recommended by the WHO.
```

This block is always shown first, collapsible after first read, and written at a general reading level.

### 3D Molecule Viewer (3Dmol.js + PubChem)

- Rotating WebGL 3D model from PubChem 3D conformers
- Display modes: Ball-and-stick (default), Space-fill, Wireframe
- Controls: Rotate, Zoom, Spin toggle, Reset view
- Download button: save 3D structure file
- Colour coding: standard CPK (Carbon=grey, Oxygen=red, Nitrogen=blue, Hydrogen=white)
- Plain English label: "Each sphere is an atom. The sticks connecting them are chemical bonds — the forces holding the molecule together."

### 2D Structure (RDKit WASM)

- Rendered from SMILES string retrieved from PubChem
- Download as PNG
- Plain English label: "This is a map of the molecule laid flat — like a floor plan of its chemical structure."

### Drug Intelligence Panel Tabs

#### Overview Tab

- Full name, drug class, molecular formula, molecular weight, WHO status
- Plain English block (see above)
- Approval history timeline
- Available forms: tablet / injection / IV / topical

#### Mechanism Tab

- Step-by-step how the drug works — plain numbered steps, no jargon without explanation
- Each step has a Lucide icon and a one-sentence plain-English description
- Target proteins from ChEMBL — with plain-English explanation of what each protein does

#### Efficacy Tab

- Clinical cure rates as horizontal progress bars with percentages
- Resistance timeline area chart (1990–present)
- Plain-English resistance explanation: "Resistance means the drug stops working because the parasite has evolved to survive it."
- Combination therapy notes when applicable

#### Interactions Tab

- Drug-drug interactions from RxNorm, grouped by severity:
  - SEVERE — avoid combining (AlertOctagon icon, red)
  - MODERATE — use with caution (AlertTriangle icon, amber)
  - MILD — monitor (Info icon, grey)
- Each interaction has plain-English explanation of what could go wrong
- Disclaimer: "Always consult a healthcare professional. This data is sourced from the NIH RxNorm database."

### Adverse Events Panel (OpenFDA)

- Horizontal bar chart of top reported adverse events
- Each bar: event name + percentage of reports
- Caveat block: "These events are self-reported by patients. Some may be symptoms of the disease being treated, not the drug itself."

### Treatment Efficacy Timeline per Disease

- Vertical timeline of treatment history per disease
- Each entry: year, drug name, effectiveness note, current status badge
- Status badges: Current Standard / Largely Obsolete / In Trials / Approved
- Plain-English note on why treatments changed over time

---

## 14. State Management

### Zustand Stores

```ts
// Disease configuration store
interface DiseaseConfigStore {
  activeDiseases: Disease[];
  addDisease: (d: Disease) => void;
  removeDisease: (id: string) => void;
  selectedYear: number;
  setYear: (y: number) => void;
  persona: "analyst" | "epidemiologist" | "clinical";
  setPersona: (p: Persona) => void;
  selectedCountry: string | null; // ISO3
  setCountry: (iso3: string | null) => void;
  compareCountry: string | null; // ISO3 — second pinned country
  setCompareCountry: (iso3: string | null) => void;
  theme: "dark" | "light";
  setTheme: (t: Theme) => void;
}
```

### TanStack Query Caching

```ts
// Cache times aligned with data freshness
useQuery({ staleTime: 1000 * 60 * 60 * 24 }); // WHO historical — 24h
useQuery({ staleTime: 1000 * 60 * 10 }); // disease.sh live — 10min
useQuery({ staleTime: 1000 * 60 * 60 * 24 * 7 }); // World Bank — 7 days
useQuery({ staleTime: Infinity }); // PubChem molecules — permanent
```

---

## 15. Zod Validation

Every external API response is parsed through a Zod schema before reaching any component. If parsing fails, TanStack Query marks the query as errored and the error state UI renders — no silent bad data, no runtime crashes from unexpected shapes.

Key schemas: `WHORecordSchema`, `DiseaseShCountrySchema`, `WorldBankIndicatorSchema`, `OpenFDADrugLabelSchema`, `PubChemCompoundSchema`, `RxNormInteractionSchema`, `ChEMBLMoleculeSchema`.

---

## 16. Loading, Error & Empty States

Every data-dependent component has three states:

| State        | Treatment                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Loading      | Skeleton UI with pulse animation + contextual message ("Fetching WHO data for Nigeria...")                                         |
| Error        | Plain-English error + last cached data if available ("Could not reach WHO servers. Showing data from 3 hours ago.")                |
| No data      | Explanation of why + suggestion ("WHO has no recorded malaria data for Iceland — likely no endemic cases. Try a tropical region.") |
| Partial data | Count badge + explanation ("Showing 142 of 195 countries — 53 countries have incomplete WHO records for this indicator.")          |

---

## 17. Accessibility

- All interactive elements use React Aria primitives
- WCAG 2.1 AA compliance throughout
- Colour is never the only signal — icons + colour + text labels always used together
- Full keyboard navigation with visible focus rings
- Screen reader labels on all globe interactions and charts
- Reduced motion support — animations respect `prefers-reduced-motion`

---

## 18. Performance

- TanStack Query deduplication prevents duplicate API calls across components
- PubChem molecules cached permanently (Infinity staleTime)
- Natural Earth GeoJSON served as static public asset — no runtime fetch
- 3Dmol.js and RDKit WASM loaded lazily (React.lazy + Suspense) — only on drug visualizer route
- Globe renders at 60fps on modern hardware; graceful degradation to 2D map on low-end devices

---

## 19. Phase 2 — FastAPI Backend (Future)

When the FastAPI backend is ready:

1. Set environment variables in `.env` to point to FastAPI endpoints
2. FastAPI handles: WHO/PubChem response caching in Redis, rate limit pooling, background data refresh jobs, authentication, audit logging for UN compliance
3. Zero changes to React components or service function signatures
4. New capabilities unlocked: user accounts, saved disease configs, scheduled reports, export queuing

---

## 20. Out of Scope (Phase 1)

- User authentication
- Saved configurations / user accounts
- Scheduled PDF report generation
- Push notifications for outbreak alerts
- Mobile responsive layout (desktop-first for UN analyst workstations)
- Offline mode / service worker
- E2E tests (Playwright — Phase 2 roadmap)
- Visual regression (Chromatic — Phase 2 roadmap)
