# Disease Visualizer

An interactive, real-time disease intelligence dashboard built with React 18 and TypeScript. Spin a 3D globe to explore outbreak burden by country, drill into epidemic history and drug intelligence panels, and visualize molecular structures — all sourced from seven public health APIs with no backend required.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What you will build

| Feature                | Description                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **3D Globe**           | Rotatable globe with per-country heat overlay driven by live WHO / disease.sh data                                         |
| **Disease Panel**      | Overview metrics, epidemic curve chart, historical timeline, country comparison                                            |
| **Drug Intelligence**  | 3D molecule viewer (3Dmol.js), 2D structure (PubChem), clinical tabs for mechanism, efficacy, interactions, adverse events |
| **Global Search**      | Keyboard-navigable search across countries, diseases, and drugs                                                            |
| **Data Freshness Bar** | Live spinner showing last-fetched timestamps for each API source                                                           |
| **Export**             | Download data as CSV or snapshot as PNG                                                                                    |
| **Accessibility**      | WCAG 2.1 AA — React Aria primitives, skip-to-content link, reduced-motion support                                          |

---

## Tech stack

| Layer         | Library                      | Why                                       |
| ------------- | ---------------------------- | ----------------------------------------- |
| UI            | React 18 + TypeScript strict | Type safety end-to-end                    |
| Styling       | Tailwind CSS v3              | Utility-first, dark-theme ready           |
| Accessibility | React Aria                   | Unstyled, accessible primitives           |
| State         | Zustand + persist            | Lightweight, no boilerplate               |
| Server state  | TanStack Query v5            | Caching, loading/error states             |
| Validation    | Zod                          | Every API response parsed at the boundary |
| Globe         | react-globe.gl + Three.js    | WebGL 3D globe                            |
| Charts        | Recharts                     | Composable SVG charts                     |
| Maps          | react-simple-maps            | SVG choropleth                            |
| Molecules     | 3Dmol.js + PubChem           | 3D/2D molecular rendering                 |
| Routing       | React Router v6              | Client-side SPA routing                   |
| Build         | Vite 5                       | Sub-second HMR                            |
| Testing       | Vitest + Testing Library     | Fast unit + component tests               |
| Linting       | ESLint + Prettier            | Enforced on every commit via Husky        |
| Commits       | commitlint                   | Conventional commit format                |

---

## Data sources (all public, no API key required)

| Source                                                                         | What it provides                            |
| ------------------------------------------------------------------------------ | ------------------------------------------- |
| [WHO GHO API](https://www.who.int/data/gho/info/gho-odata-api)                 | Global health burden indicators             |
| [disease.sh](https://disease.sh)                                               | Live COVID-19 outbreak counts by country    |
| [World Bank](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392) | Mortality and development indicators        |
| [OpenFDA](https://open.fda.gov/apis/)                                          | Drug labels, adverse events                 |
| [PubChem](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest)                      | Molecular structure (CID, SMILES, 2D image) |
| [RxNorm](https://lhncbc.nlm.nih.gov/RxNav/APIs/)                               | Drug interactions                           |
| [ChEMBL](https://www.ebi.ac.uk/chembl/api/data)                                | Bioactivity data, drug targets              |

---

## Prerequisites

| Tool    | Version | Install                                              |
| ------- | ------- | ---------------------------------------------------- |
| Node.js | ≥ 20    | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| pnpm    | ≥ 9     | `npm install -g pnpm`                                |
| Git     | any     | [git-scm.com](https://git-scm.com)                   |

> This project uses **pnpm** exclusively. `npm install` and `yarn` will not produce a correct lockfile.

---

## Local setup

### 1. Clone the repo

```bash
git clone https://github.com/abhipandSogeti/disease-visualizer.git
cd disease-visualizer
```

### 2. Install dependencies

```bash
pnpm install
```

This also runs `husky install` via the `prepare` script, which wires up the pre-commit hooks.

### 3. Environment variables (optional)

All APIs have public default base URLs baked in. You only need a `.env.local` if you want to proxy requests or override an endpoint.

```bash
cp .env.example .env.local   # then edit as needed
```

| Variable            | Default                                     |
| ------------------- | ------------------------------------------- |
| `VITE_WHO_BASE`     | `https://ghoapi.azureedge.net/api`          |
| `VITE_DISEASE_BASE` | `https://disease.sh/v3`                     |
| `VITE_WB_BASE`      | `https://api.worldbank.org/v2`              |
| `VITE_FDA_BASE`     | `https://api.fda.gov`                       |
| `VITE_PUBCHEM_BASE` | `https://pubchem.ncbi.nlm.nih.gov/rest/pug` |
| `VITE_RXNORM_BASE`  | `https://rxnav.nlm.nih.gov/REST`            |
| `VITE_CHEMBL_BASE`  | `https://www.ebi.ac.uk/chembl/api/data`     |

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The globe loads within a few seconds as the WHO and disease.sh calls resolve.

---

## Available scripts

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm dev`           | Start Vite dev server with HMR on port 3000                         |
| `pnpm build`         | Type-check then produce an optimised production bundle in `dist/`   |
| `pnpm preview`       | Serve the production build locally to sanity-check before deploying |
| `pnpm test`          | Run the Vitest suite in watch mode                                  |
| `pnpm test:coverage` | Run tests once and print a V8 coverage report                       |
| `pnpm typecheck`     | Run `tsc --noEmit` — same check that runs in CI                     |
| `pnpm lint`          | Run ESLint across `src/`                                            |
| `pnpm format`        | Auto-format everything under `src/` with Prettier                   |

---

## Project structure

```
src/
├── components/
│   ├── disease/        # DiseasePanel + four tabs (overview, history, compare, drugs)
│   ├── drug/           # DrugIntelligencePanel + molecule viewers + clinical tabs
│   ├── globe/          # Globe, GlobeControls, GlobeLegend, GlobeTooltip
│   ├── layout/         # AppShell, Header, LeftPanel, RightPanel, DataFreshnessBar
│   ├── map/            # ChoroplethMap, MapLegend
│   ├── search/         # GlobalSearch overlay, SearchResult
│   ├── timeline/       # EpidemicTimeline, TimelineEvent
│   └── ui/             # LoadingSkeleton, EmptyState, ErrorState, SkipLink
├── hooks/              # TanStack Query hooks for every API source
├── lib/
│   ├── colour-scale.ts        # D3-based burden colour ramp
│   ├── disease-catalogue.ts   # Curated disease metadata + landmark events
│   ├── drug-intelligence.ts   # Curated drug catalogue with plain-English descriptions
│   ├── export.ts              # CSV and PNG export utilities
│   ├── format.ts              # Number, date, percentage formatters
│   ├── search-index.ts        # In-memory search across countries, diseases, drugs
│   └── use-reduced-motion.ts  # prefers-reduced-motion media query hook
├── pages/
│   └── DrugPage.tsx           # Full-page drug visualizer (lazy-loaded)
├── services/           # One fetch function per API, every response Zod-parsed
├── stores/
│   └── app.store.ts    # Zustand store — active diseases, year, country, persona, theme
├── types/              # Zod schemas + inferred TypeScript types for all seven APIs
└── App.tsx             # Route definitions
```

---

## Architecture walkthrough

### Data flow

```
User interaction
      │
      ▼
  Zustand store          ← persists persona, theme, active diseases
  (selectedCountry,
   selectedYear,
   activeDiseases)
      │
      ▼
 TanStack Query hook     ← deduplicates, caches, retries
      │
      ▼
  Service function       ← plain fetch()
      │
      ▼
  Zod schema.parse()     ← throws on unexpected shape — no silent failures
      │
      ▼
  Component renders
```

### Key design decisions

**Zod at every API boundary** — All seven services parse their responses with Zod schemas before returning data. If an API changes its shape, you get a loud error at the network layer, not a silent `undefined` six components deep.

**Zustand with `partialize` persistence** — Only user preferences (persona, theme, active diseases) are persisted to `localStorage`. Transient UI state (selected country, year) resets on reload — intentional, so deep-links don't land users in stale state.

**Lazy-loaded DrugPage** — The 3D molecule viewer pulls in Three.js and 3Dmol.js (~1 MB). It is code-split with `React.lazy` so the globe page's initial bundle stays fast.

**No backend** — Every API is called directly from the browser. CORS is open on all seven sources. This makes the project deployable to any static host (GitHub Pages, Netlify, Vercel) with zero server configuration.

---

## How commits are organized

The git history is structured in seven logical milestones so you can check out any point and have a working slice of the app:

| Milestone            | What you get                                                                    |
| -------------------- | ------------------------------------------------------------------------------- |
| Project scaffold     | Vite, TypeScript strict, Husky, commitlint, ESLint, Prettier                    |
| Data foundation      | Zod schemas for all 7 APIs, fetch services, TanStack Query hooks, Zustand store |
| Layout & Globe       | App shell, time scrubber, interactive 3D globe with burden heat overlay         |
| Disease intelligence | Metric cards, epidemic curve, overview / history / compare / drugs tabs         |
| Drug visualizer      | 2D/3D molecule viewers, drug intelligence panel, clinical tabs                  |
| UX polish            | CSV/PNG export, global search overlay, reduced motion, data freshness bar       |
| App wiring           | Routes connected — globe page and drug page live end-to-end                     |

---

## Running the tests

```bash
# watch mode (re-runs on file save)
pnpm test

# single run with coverage
pnpm test:coverage
```

Tests live next to their source files (`Component.test.tsx`, `hook.test.ts`). The suite covers Zod schema parsing, Zustand store actions, utility functions, and key component render paths.

---

## Building for production

```bash
pnpm build
```

Output lands in `dist/`. To preview locally before deploying:

```bash
pnpm preview
```

### Deploying to Netlify (one command)

```bash
netlify deploy --dir=dist --prod
```

### Deploying to GitHub Pages

Add this workflow at `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

> Set `base: '/disease-visualizer/'` in `vite.config.ts` if deploying to a sub-path.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) — the pre-commit hook will reject anything that doesn't conform
3. Run `pnpm test` and `pnpm typecheck` before opening a PR
4. Open a PR against `main`

---

## License

MIT — use it, learn from it, ship with it.
