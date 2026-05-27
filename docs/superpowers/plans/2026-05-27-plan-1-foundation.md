# Disease Visualizer — Plan 1: Foundation & Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the React 18 + Vite project, configure all tooling, implement all API service functions with Zod validation, TanStack Query hooks, and Zustand stores — so every subsequent plan can import real, typed, cached data with zero setup.

**Architecture:** Pure CSR SPA. All API calls live in `src/services/` behind a config-driven base URL seam. Every response is Zod-parsed before it leaves the service layer. TanStack Query owns caching and background refresh. Zustand owns UI state (persona, selected country, active diseases, year).

**Tech Stack:** React 18, Vite, TypeScript strict, Zod, TanStack Query v5, Zustand, Tailwind CSS v3, React Router v6, Lucide React, Vitest, React Testing Library

---

## File Map

```
disease-visualizer/
├── public/
│   └── geo/
│       └── countries-110m.json          # Natural Earth TopoJSON (download in Task 2)
├── src/
│   ├── services/
│   │   ├── api.config.ts                # Base URLs — single FastAPI swap point
│   │   ├── who.service.ts               # WHO GHO OData — disease burden by country
│   │   ├── disease.service.ts           # disease.sh — live COVID/Flu/Monkeypox
│   │   ├── worldbank.service.ts         # World Bank — population + health indicators
│   │   ├── openfda.service.ts           # OpenFDA — drug labels + adverse events
│   │   ├── pubchem.service.ts           # PubChem — molecular structures 2D + 3D
│   │   ├── rxnorm.service.ts            # RxNorm — drug interactions
│   │   └── chembl.service.ts            # ChEMBL — drug targets + bioactivity
│   ├── types/
│   │   ├── who.schema.ts                # Zod schema + inferred types for WHO API
│   │   ├── disease.schema.ts            # Zod schema for disease.sh
│   │   ├── worldbank.schema.ts          # Zod schema for World Bank
│   │   ├── openfda.schema.ts            # Zod schema for OpenFDA
│   │   ├── pubchem.schema.ts            # Zod schema for PubChem
│   │   ├── rxnorm.schema.ts             # Zod schema for RxNorm
│   │   ├── chembl.schema.ts             # Zod schema for ChEMBL
│   │   └── app.types.ts                 # Shared app-level types (Disease, Persona, etc.)
│   ├── stores/
│   │   └── app.store.ts                 # Zustand — all UI state in one slice
│   ├── hooks/
│   │   ├── useCountryDisease.ts         # WHO GHO by country + indicator
│   │   ├── useLiveOutbreaks.ts          # disease.sh all countries
│   │   ├── useWorldBank.ts              # World Bank indicator by country
│   │   ├── useDrugLabel.ts              # OpenFDA drug label
│   │   ├── useDrugMolecule.ts           # PubChem compound (2D + 3D)
│   │   ├── useDrugInteractions.ts       # RxNorm interactions by rxcui
│   │   └── useDrugTargets.ts            # ChEMBL molecule + activity
│   ├── lib/
│   │   ├── format.ts                    # Number formatting (68400000 → "68.4 Million")
│   │   ├── colour-scale.ts              # D3 colour scales per disease category
│   │   └── disease-catalogue.ts         # Curated default diseases + landmark events
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Task 1: Scaffold Vite + React 18 + TypeScript Project

**Files:**

- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/abhishekpandit/projects/disease-visualizer
pnpm create vite@latest . --template react-ts
```

When prompted: confirm overwriting existing directory (yes).

- [ ] **Step 2: Install all dependencies**

```bash
pnpm add react-router-dom@6 @tanstack/react-query@5 zustand zod \
  tailwindcss@3 postcss autoprefixer \
  lucide-react \
  react-globe.gl three @types/three \
  react-simple-maps d3 @types/d3 \
  recharts \
  @react-aria/button @react-aria/dialog @react-aria/focus @react-aria/tooltip \
  @react-stately/tooltip
```

- [ ] **Step 3: Install dev dependencies**

```bash
pnpm add -D \
  vitest @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom \
  husky lint-staged \
  @commitlint/cli @commitlint/config-conventional \
  eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  prettier eslint-config-prettier eslint-plugin-react-hooks \
  @types/react @types/react-dom
```

- [ ] **Step 4: Initialise Tailwind**

```bash
npx tailwindcss init -p --ts
```

- [ ] **Step 5: Replace `tailwind.config.ts` with project config**

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020817",
          900: "#0a1628",
          800: "#0f2040",
          700: "#162a52",
        },
        disease: {
          viral: "#ef4444", // red     — viral haemorrhagic
          respiratory: "#f59e0b", // amber   — respiratory
          parasitic: "#22c55e", // green   — parasitic
          bacterial: "#3b82f6", // blue    — bacterial
          vectorborne: "#14b8a6", // teal    — vector-borne
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Replace `src/index.css`**

```css
/* src/index.css */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }
  body {
    @apply bg-navy-950 text-slate-100 antialiased;
  }
  * {
    @apply border-slate-700;
  }
}
```

- [ ] **Step 7: Replace `src/main.tsx`**

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 8: Create placeholder `src/App.tsx`**

```tsx
// src/App.tsx
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="p-8 text-white">Disease Visualizer — Foundation</div>
        }
      />
    </Routes>
  );
}
```

- [ ] **Step 9: Replace `vite.config.ts`**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 3000 },
});
```

- [ ] **Step 10: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 11: Create `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 12: Create `src/test-setup.ts`**

```ts
// src/test-setup.ts
import "@testing-library/jest-dom";
```

- [ ] **Step 13: Create `.env.example`**

```
# Disease Visualizer — API Base URLs
# All default to free public APIs. Override to point at FastAPI backend.

VITE_WHO_BASE=https://ghoapi.azureedge.net/api
VITE_DISEASE_BASE=https://disease.sh/v3
VITE_WB_BASE=https://api.worldbank.org/v2
VITE_FDA_BASE=https://api.fda.gov
VITE_PUBCHEM_BASE=https://pubchem.ncbi.nlm.nih.gov/rest/pug
VITE_RXNORM_BASE=https://rxnav.nlm.nih.gov/REST
VITE_CHEMBL_BASE=https://www.ebi.ac.uk/chembl/api/data
```

- [ ] **Step 14: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
*.local
.DS_Store
coverage
```

- [ ] **Step 15: Verify the app runs**

```bash
pnpm dev
```

Expected: browser opens at `http://localhost:3000` showing "Disease Visualizer — Foundation" on dark background.

- [ ] **Step 16: Commit**

```bash
git config user.email "abhishek.pandit@sogeti.com"
git config user.name "abhipandSogeti"
git add -A
git commit -m "chore: scaffold vite react-ts project with all dependencies"
```

---

## Task 2: Husky + Commitlint + ESLint + Prettier

**Files:**

- Create: `.husky/pre-commit`, `.husky/commit-msg`, `.eslintrc.cjs`, `.prettierrc`, `commitlint.config.cjs`

- [ ] **Step 1: Initialise Husky**

```bash
pnpm exec husky init
```

- [ ] **Step 2: Create pre-commit hook**

```bash
# .husky/pre-commit
#!/bin/sh
pnpm exec lint-staged
```

- [ ] **Step 3: Create commit-msg hook**

```bash
# .husky/commit-msg
#!/bin/sh
pnpm exec commitlint --edit "$1"
```

- [ ] **Step 4: Create `commitlint.config.cjs`**

```js
// commitlint.config.cjs
module.exports = { extends: ["@commitlint/config-conventional"] };
```

- [ ] **Step 5: Add lint-staged config to `package.json`**

Add to `package.json` (merge into existing object):

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write src"
  }
}
```

- [ ] **Step 6: Create `.eslintrc.cjs`**

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  ignorePatterns: [
    "dist",
    ".eslintrc.cjs",
    "vitest.config.ts",
    "vite.config.ts",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react-hooks/exhaustive-deps": "warn",
  },
};
```

- [ ] **Step 7: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 8: Run lint to verify**

```bash
pnpm lint
```

Expected: no errors (only potential warnings on placeholder files).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: add husky, commitlint, eslint, prettier"
```

---

## Task 3: GeoJSON Static Asset

**Files:**

- Create: `public/geo/countries-110m.json`

- [ ] **Step 1: Download Natural Earth GeoJSON**

```bash
mkdir -p public/geo
curl -o public/geo/countries-110m.json \
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
```

- [ ] **Step 2: Verify file downloaded**

```bash
wc -c public/geo/countries-110m.json
```

Expected: file size greater than 100,000 bytes.

- [ ] **Step 3: Commit**

```bash
git add public/geo/countries-110m.json
git commit -m "chore: add natural earth geojson static asset"
```

---

## Task 4: API Config + Shared App Types

**Files:**

- Create: `src/services/api.config.ts`
- Create: `src/types/app.types.ts`
- Test: `src/types/app.types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/types/app.types.test.ts
import { describe, it, expect } from "vitest";
import { DISEASE_CATEGORIES, DEFAULT_DISEASES } from "./app.types";

describe("app.types", () => {
  it("exports 5 disease categories", () => {
    expect(DISEASE_CATEGORIES).toHaveLength(5);
  });

  it("default diseases list contains Malaria", () => {
    expect(DEFAULT_DISEASES.some((d) => d.id === "malaria")).toBe(true);
  });

  it("every default disease has required fields", () => {
    DEFAULT_DISEASES.forEach((d) => {
      expect(d).toHaveProperty("id");
      expect(d).toHaveProperty("name");
      expect(d).toHaveProperty("category");
      expect(d).toHaveProperty("whoIndicator");
      expect(d).toHaveProperty("colour");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/types/app.types.test.ts
```

Expected: FAIL — "Cannot find module './app.types'"

- [ ] **Step 3: Create `src/services/api.config.ts`**

```ts
// src/services/api.config.ts
export const API_BASE = {
  who: import.meta.env.VITE_WHO_BASE ?? "https://ghoapi.azureedge.net/api",
  disease: import.meta.env.VITE_DISEASE_BASE ?? "https://disease.sh/v3",
  worldbank: import.meta.env.VITE_WB_BASE ?? "https://api.worldbank.org/v2",
  openfda: import.meta.env.VITE_FDA_BASE ?? "https://api.fda.gov",
  pubchem:
    import.meta.env.VITE_PUBCHEM_BASE ??
    "https://pubchem.ncbi.nlm.nih.gov/rest/pug",
  rxnorm: import.meta.env.VITE_RXNORM_BASE ?? "https://rxnav.nlm.nih.gov/REST",
  chembl:
    import.meta.env.VITE_CHEMBL_BASE ?? "https://www.ebi.ac.uk/chembl/api/data",
} as const;
```

- [ ] **Step 4: Create `src/types/app.types.ts`**

```ts
// src/types/app.types.ts

export type Persona = "analyst" | "epidemiologist" | "clinical";

export type DiseaseCategory =
  | "viral"
  | "respiratory"
  | "parasitic"
  | "bacterial"
  | "vectorborne";

export const DISEASE_CATEGORIES: DiseaseCategory[] = [
  "viral",
  "respiratory",
  "parasitic",
  "bacterial",
  "vectorborne",
];

export interface Disease {
  id: string;
  name: string;
  category: DiseaseCategory;
  whoIndicator: string; // WHO GHO indicator code
  colour: string; // tailwind colour token
  description: string; // plain-English one-liner
}

export const DEFAULT_DISEASES: Disease[] = [
  {
    id: "malaria",
    name: "Malaria",
    category: "parasitic",
    whoIndicator: "MALARIA_CASES",
    colour: "disease-parasitic",
    description:
      "A life-threatening disease spread by infected mosquito bites.",
  },
  {
    id: "tuberculosis",
    name: "Tuberculosis",
    category: "bacterial",
    whoIndicator: "MDG_0000000020",
    colour: "disease-bacterial",
    description: "A bacterial infection that mainly affects the lungs.",
  },
  {
    id: "hiv",
    name: "HIV / AIDS",
    category: "viral",
    whoIndicator: "HIV_0000000026",
    colour: "disease-viral",
    description:
      "A virus that attacks the immune system, leading to AIDS if untreated.",
  },
  {
    id: "cholera",
    name: "Cholera",
    category: "bacterial",
    whoIndicator: "CHOLERA_0000000001",
    colour: "disease-bacterial",
    description: "A severe diarrhoeal disease caused by contaminated water.",
  },
  {
    id: "polio",
    name: "Polio",
    category: "viral",
    whoIndicator: "WHS4_544",
    colour: "disease-viral",
    description:
      "A viral disease that can cause permanent paralysis, mainly in children.",
  },
  {
    id: "dengue",
    name: "Dengue",
    category: "vectorborne",
    whoIndicator: "DENGUE_CASES",
    colour: "disease-vectorborne",
    description:
      "A mosquito-borne viral disease causing high fever and severe joint pain.",
  },
  {
    id: "covid19",
    name: "COVID-19",
    category: "respiratory",
    whoIndicator: "COVID_19_CASES",
    colour: "disease-respiratory",
    description: "A coronavirus disease that caused the 2020 global pandemic.",
  },
  {
    id: "ebola",
    name: "Ebola",
    category: "viral",
    whoIndicator: "EBOLA_CASES",
    colour: "disease-viral",
    description: "A rare but deadly virus causing severe haemorrhagic fever.",
  },
];

export interface CountryFeature {
  type: "Feature";
  properties: { name: string; iso_a3: string; iso_a2: string };
  geometry: { type: string; coordinates: unknown };
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm test src/types/app.types.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add api config and shared app types"
```

---

## Task 5: Zod Schemas

**Files:**

- Create: `src/types/who.schema.ts`
- Create: `src/types/disease.schema.ts`
- Create: `src/types/worldbank.schema.ts`
- Create: `src/types/openfda.schema.ts`
- Create: `src/types/pubchem.schema.ts`
- Create: `src/types/rxnorm.schema.ts`
- Create: `src/types/chembl.schema.ts`
- Test: `src/types/schemas.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/types/schemas.test.ts
import { describe, it, expect } from "vitest";
import {
  WHOResponseSchema,
  DiseaseShCountrySchema,
  WorldBankResponseSchema,
  PubChemCompoundSchema,
  RxNormInteractionSchema,
} from "./who.schema";

describe("WHOResponseSchema", () => {
  it("parses a valid WHO response", () => {
    const raw = {
      value: [
        {
          Id: "1",
          IndicatorCode: "MALARIA_CASES",
          SpatialDim: "NGA",
          TimeDim: 2022,
          NumericValue: 68400000,
          Low: null,
          High: null,
        },
      ],
    };
    const result = WHOResponseSchema.parse(raw);
    expect(result.value[0].NumericValue).toBe(68400000);
  });

  it("allows null NumericValue", () => {
    const raw = {
      value: [
        {
          Id: "2",
          IndicatorCode: "MALARIA_CASES",
          SpatialDim: "USA",
          TimeDim: 2022,
          NumericValue: null,
          Low: null,
          High: null,
        },
      ],
    };
    expect(() => WHOResponseSchema.parse(raw)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/types/schemas.test.ts
```

Expected: FAIL — "Cannot find module './who.schema'"

- [ ] **Step 3: Create `src/types/who.schema.ts`**

```ts
// src/types/who.schema.ts
import { z } from "zod";

export const WHORecordSchema = z.object({
  Id: z.string(),
  IndicatorCode: z.string(),
  SpatialDim: z.string(),
  TimeDim: z.number(),
  NumericValue: z.number().nullable(),
  Low: z.number().nullable(),
  High: z.number().nullable(),
});

export const WHOResponseSchema = z.object({
  value: z.array(WHORecordSchema),
});

export type WHORecord = z.infer<typeof WHORecordSchema>;
export type WHOResponse = z.infer<typeof WHOResponseSchema>;

// Re-export other schemas for tests
export { DiseaseShCountrySchema } from "./disease.schema";
export { WorldBankResponseSchema } from "./worldbank.schema";
export { PubChemCompoundSchema } from "./pubchem.schema";
export { RxNormInteractionSchema } from "./rxnorm.schema";
```

- [ ] **Step 4: Create `src/types/disease.schema.ts`**

```ts
// src/types/disease.schema.ts
import { z } from "zod";

export const DiseaseShCountrySchema = z.object({
  country: z.string(),
  countryInfo: z.object({
    iso2: z.string().nullable(),
    iso3: z.string().nullable(),
    lat: z.number(),
    long: z.number(),
  }),
  cases: z.number(),
  todayCases: z.number(),
  deaths: z.number(),
  todayDeaths: z.number(),
  recovered: z.number(),
  active: z.number(),
  critical: z.number(),
  updated: z.number(),
});

export const DiseaseShResponseSchema = z.array(DiseaseShCountrySchema);

export type DiseaseShCountry = z.infer<typeof DiseaseShCountrySchema>;
export type DiseaseShResponse = z.infer<typeof DiseaseShResponseSchema>;
```

- [ ] **Step 5: Create `src/types/worldbank.schema.ts`**

```ts
// src/types/worldbank.schema.ts
import { z } from "zod";

export const WorldBankIndicatorValueSchema = z.object({
  indicator: z.object({ id: z.string(), value: z.string() }),
  country: z.object({ id: z.string(), value: z.string() }),
  date: z.string(),
  value: z.number().nullable(),
});

// World Bank wraps response in a 2-element array: [meta, data]
export const WorldBankResponseSchema = z.tuple([
  z.object({ page: z.number(), total: z.number() }),
  z.array(WorldBankIndicatorValueSchema),
]);

export type WorldBankIndicatorValue = z.infer<
  typeof WorldBankIndicatorValueSchema
>;
export type WorldBankResponse = z.infer<typeof WorldBankResponseSchema>;
```

- [ ] **Step 6: Create `src/types/openfda.schema.ts`**

```ts
// src/types/openfda.schema.ts
import { z } from "zod";

export const OpenFDADrugLabelSchema = z.object({
  openfda: z.object({
    brand_name: z.array(z.string()).optional(),
    generic_name: z.array(z.string()).optional(),
    manufacturer_name: z.array(z.string()).optional(),
    substance_name: z.array(z.string()).optional(),
  }),
  indications_and_usage: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  adverse_reactions: z.array(z.string()).optional(),
  dosage_and_administration: z.array(z.string()).optional(),
  description: z.array(z.string()).optional(),
  mechanism_of_action: z.array(z.string()).optional(),
});

export const OpenFDALabelResponseSchema = z.object({
  results: z.array(OpenFDADrugLabelSchema),
});

export const OpenFDAAdverseEventSchema = z.object({
  patient: z.object({
    reaction: z.array(
      z.object({
        reactionmeddrapt: z.string(),
        reactionoutcome: z.string().optional(),
      }),
    ),
    drug: z.array(
      z.object({
        medicinalproduct: z.string(),
      }),
    ),
  }),
});

export const OpenFDAAdverseResponseSchema = z.object({
  results: z.array(OpenFDAAdverseEventSchema),
  meta: z.object({ results: z.object({ total: z.number() }) }),
});

export type OpenFDADrugLabel = z.infer<typeof OpenFDADrugLabelSchema>;
export type OpenFDAAdverseEvent = z.infer<typeof OpenFDAAdverseEventSchema>;
export type OpenFDALabelResponse = z.infer<typeof OpenFDALabelResponseSchema>;
export type OpenFDAAdverseResponse = z.infer<
  typeof OpenFDAAdverseResponseSchema
>;
```

- [ ] **Step 7: Create `src/types/pubchem.schema.ts`**

```ts
// src/types/pubchem.schema.ts
import { z } from "zod";

export const PubChemPropertySchema = z.object({
  CID: z.number(),
  MolecularFormula: z.string(),
  MolecularWeight: z.string(),
  IsomericSMILES: z.string(),
  IUPACName: z.string().optional(),
  InChIKey: z.string().optional(),
});

export const PubChemPropertyResponseSchema = z.object({
  PropertyTable: z.object({
    Properties: z.array(PubChemPropertySchema),
  }),
});

export const PubChemCompoundSchema = z.object({
  cid: z.number(),
  molecularFormula: z.string(),
  molecularWeight: z.string(),
  isomericSmiles: z.string(),
  iupacName: z.string(),
  inchiKey: z.string(),
});

export type PubChemCompound = z.infer<typeof PubChemCompoundSchema>;
```

- [ ] **Step 8: Create `src/types/rxnorm.schema.ts`**

```ts
// src/types/rxnorm.schema.ts
import { z } from "zod";

export const RxNormDrugSchema = z.object({
  rxcui: z.string(),
  name: z.string(),
  tty: z.string(),
  umlscui: z.string().optional(),
});

export const RxNormDrugsResponseSchema = z.object({
  drugGroup: z.object({
    conceptGroup: z
      .array(
        z.object({
          tty: z.string().optional(),
          conceptProperties: z.array(RxNormDrugSchema).optional(),
        }),
      )
      .optional(),
  }),
});

export const RxNormInteractionSchema = z.object({
  minConceptItem: z.object({
    rxcui: z.string(),
    name: z.string(),
    tty: z.string(),
  }),
  interactionPair: z.array(
    z.object({
      interactionConcept: z.array(
        z.object({
          minConceptItem: z.object({ name: z.string(), rxcui: z.string() }),
          sourceConceptItem: z.object({
            name: z.string(),
            ddi_risk: z.string().optional(),
            description: z.string().optional(),
          }),
        }),
      ),
      severity: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
});

export const RxNormInteractionResponseSchema = z.object({
  interactionTypeGroup: z
    .array(
      z.object({
        interactionType: z.array(RxNormInteractionSchema),
      }),
    )
    .optional(),
});

export type RxNormDrug = z.infer<typeof RxNormDrugSchema>;
export type RxNormInteraction = z.infer<typeof RxNormInteractionSchema>;
export type RxNormInteractionResponse = z.infer<
  typeof RxNormInteractionResponseSchema
>;
```

- [ ] **Step 9: Create `src/types/chembl.schema.ts`**

```ts
// src/types/chembl.schema.ts
import { z } from "zod";

export const ChEMBLMoleculeSchema = z.object({
  molecule_chembl_id: z.string(),
  pref_name: z.string().nullable(),
  max_phase: z.number().nullable(),
  molecule_type: z.string().nullable(),
  molecule_properties: z
    .object({
      mw_freebase: z.string().nullable(),
      alogp: z.string().nullable(),
      hba: z.number().nullable(),
      hbd: z.number().nullable(),
    })
    .nullable(),
  molecule_structures: z
    .object({
      canonical_smiles: z.string().nullable(),
      molfile: z.string().nullable(),
    })
    .nullable(),
});

export const ChEMBLActivitySchema = z.object({
  activity_id: z.number(),
  assay_description: z.string().nullable(),
  target_pref_name: z.string().nullable(),
  standard_type: z.string().nullable(),
  standard_value: z.string().nullable(),
  standard_units: z.string().nullable(),
});

export const ChEMBLActivityResponseSchema = z.object({
  activities: z.array(ChEMBLActivitySchema),
});

export type ChEMBLMolecule = z.infer<typeof ChEMBLMoleculeSchema>;
export type ChEMBLActivity = z.infer<typeof ChEMBLActivitySchema>;
export type ChEMBLActivityResponse = z.infer<
  typeof ChEMBLActivityResponseSchema
>;
```

- [ ] **Step 10: Run tests to verify they pass**

```bash
pnpm test src/types/schemas.test.ts
```

Expected: PASS — all tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add zod schemas for all seven api sources"
```

---

## Task 6: Service Layer

**Files:**

- Create: `src/services/who.service.ts`
- Create: `src/services/disease.service.ts`
- Create: `src/services/worldbank.service.ts`
- Create: `src/services/openfda.service.ts`
- Create: `src/services/pubchem.service.ts`
- Create: `src/services/rxnorm.service.ts`
- Create: `src/services/chembl.service.ts`
- Test: `src/services/who.service.test.ts`

- [ ] **Step 1: Write the failing test for WHO service**

```ts
// src/services/who.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDiseaseByCountry, getDiseaseTimeSeries } from "./who.service";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("getDiseaseByCountry", () => {
  it("returns parsed WHO records for a country", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: "1",
            IndicatorCode: "MALARIA_CASES",
            SpatialDim: "NGA",
            TimeDim: 2022,
            NumericValue: 68400000,
            Low: null,
            High: null,
          },
        ],
      }),
    });

    const records = await getDiseaseByCountry("NGA", "MALARIA_CASES");
    expect(records).toHaveLength(1);
    expect(records[0].SpatialDim).toBe("NGA");
    expect(records[0].NumericValue).toBe(68400000);
  });

  it("throws when fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getDiseaseByCountry("NGA", "MALARIA_CASES")).rejects.toThrow(
      "WHO API error: 500",
    );
  });
});

describe("getDiseaseTimeSeries", () => {
  it("returns records sorted by TimeDim ascending", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: "2",
            IndicatorCode: "MALARIA_CASES",
            SpatialDim: "NGA",
            TimeDim: 2020,
            NumericValue: 60000000,
            Low: null,
            High: null,
          },
          {
            Id: "1",
            IndicatorCode: "MALARIA_CASES",
            SpatialDim: "NGA",
            TimeDim: 2019,
            NumericValue: 55000000,
            Low: null,
            High: null,
          },
        ],
      }),
    });

    const records = await getDiseaseTimeSeries("NGA", "MALARIA_CASES");
    expect(records[0].TimeDim).toBe(2019);
    expect(records[1].TimeDim).toBe(2020);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/services/who.service.test.ts
```

Expected: FAIL — "Cannot find module './who.service'"

- [ ] **Step 3: Create `src/services/who.service.ts`**

```ts
// src/services/who.service.ts
import { API_BASE } from "./api.config";
import { WHOResponseSchema, type WHORecord } from "@/types/who.schema";

export async function getDiseaseByCountry(
  iso3: string,
  indicator: string,
): Promise<WHORecord[]> {
  const url = `${API_BASE.who}/${indicator}?$filter=SpatialDim eq '${iso3}'`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WHO API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const parsed = WHOResponseSchema.parse(raw);
  return parsed.value;
}

export async function getDiseaseTimeSeries(
  iso3: string,
  indicator: string,
): Promise<WHORecord[]> {
  const records = await getDiseaseByCountry(iso3, indicator);
  return [...records].sort((a, b) => a.TimeDim - b.TimeDim);
}

export async function getDiseaseGlobal(
  indicator: string,
  year: number,
): Promise<WHORecord[]> {
  const url = `${API_BASE.who}/${indicator}?$filter=TimeDim eq ${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WHO API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const parsed = WHOResponseSchema.parse(raw);
  return parsed.value;
}
```

- [ ] **Step 4: Create `src/services/disease.service.ts`**

```ts
// src/services/disease.service.ts
import { API_BASE } from "./api.config";
import {
  DiseaseShResponseSchema,
  type DiseaseShCountry,
} from "@/types/disease.schema";

export async function getLiveOutbreaks(): Promise<DiseaseShCountry[]> {
  const url = `${API_BASE.disease}/covid-19/countries`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`disease.sh API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  return DiseaseShResponseSchema.parse(raw);
}

export async function getLiveHistorical(
  iso2: string,
  lastDays: number | "all" = "all",
): Promise<Record<string, number>> {
  const url = `${API_BASE.disease}/covid-19/historical/${iso2}?lastdays=${lastDays}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`disease.sh API error: ${res.status}`);
  const raw = (await res.json()) as {
    timeline?: { cases?: Record<string, number> };
  };
  return raw.timeline?.cases ?? {};
}
```

- [ ] **Step 5: Create `src/services/worldbank.service.ts`**

```ts
// src/services/worldbank.service.ts
import { API_BASE } from "./api.config";
import {
  WorldBankResponseSchema,
  type WorldBankIndicatorValue,
} from "@/types/worldbank.schema";

export async function getIndicator(
  iso2: string,
  indicator: string,
  perPage = 60,
): Promise<WorldBankIndicatorValue[]> {
  const url = `${API_BASE.worldbank}/country/${iso2}/indicator/${indicator}?format=json&per_page=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const [, data] = WorldBankResponseSchema.parse(raw);
  return data.filter((d) => d.value !== null);
}

// Common indicators
export const WB_INDICATORS = {
  population: "SP.POP.TOTL",
  hospitalBeds: "SH.MED.BEDS.ZS",
  infantMortality: "SP.DYN.IMRT.IN",
  lifeExpectancy: "SP.DYN.LE00.IN",
  gdpPerCapita: "NY.GDP.PCAP.CD",
} as const;
```

- [ ] **Step 6: Create `src/services/openfda.service.ts`**

```ts
// src/services/openfda.service.ts
import { API_BASE } from "./api.config";
import {
  OpenFDALabelResponseSchema,
  OpenFDAAdverseResponseSchema,
  type OpenFDADrugLabel,
} from "@/types/openfda.schema";

export async function getDrugLabel(
  genericName: string,
): Promise<OpenFDADrugLabel | null> {
  const url = `${API_BASE.openfda}/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(genericName)}"&limit=1`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`OpenFDA API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const parsed = OpenFDALabelResponseSchema.parse(raw);
  return parsed.results[0] ?? null;
}

export async function getAdverseEventCounts(
  drugName: string,
  limit = 100,
): Promise<{ reaction: string; count: number }[]> {
  const url = `${API_BASE.openfda}/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=${limit}`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`OpenFDA API error: ${res.status}`);
  const raw = (await res.json()) as {
    results?: { term: string; count: number }[];
  };
  return (raw.results ?? []).map((r) => ({ reaction: r.term, count: r.count }));
}
```

- [ ] **Step 7: Create `src/services/pubchem.service.ts`**

```ts
// src/services/pubchem.service.ts
import { API_BASE } from "./api.config";
import {
  PubChemPropertyResponseSchema,
  type PubChemCompound,
} from "@/types/pubchem.schema";

export async function getCompoundByName(
  name: string,
): Promise<PubChemCompound | null> {
  const props =
    "MolecularFormula,MolecularWeight,IsomericSMILES,IUPACName,InChIKey";
  const url = `${API_BASE.pubchem}/compound/name/${encodeURIComponent(name)}/property/${props}/JSON`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`PubChem API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const parsed = PubChemPropertyResponseSchema.parse(raw);
  const p = parsed.PropertyTable.Properties[0];
  if (!p) return null;
  return {
    cid: p.CID,
    molecularFormula: p.MolecularFormula,
    molecularWeight: p.MolecularWeight,
    isomericSmiles: p.IsomericSMILES,
    iupacName: p.IUPACName ?? name,
    inchiKey: p.InChIKey ?? "",
  };
}

export function get3DStructureUrl(cid: number): string {
  return `${API_BASE.pubchem}/compound/cid/${cid}/record/SDF?record_type=3d&response_type=save`;
}

export function get2DImageUrl(cid: number, size = 300): string {
  return `${API_BASE.pubchem}/compound/cid/${cid}/PNG?record_type=2d&image_size=${size}x${size}`;
}
```

- [ ] **Step 8: Create `src/services/rxnorm.service.ts`**

```ts
// src/services/rxnorm.service.ts
import { API_BASE } from "./api.config";
import {
  RxNormDrugsResponseSchema,
  RxNormInteractionResponseSchema,
  type RxNormDrug,
  type RxNormInteraction,
} from "@/types/rxnorm.schema";

export async function getRxCui(drugName: string): Promise<string | null> {
  const url = `${API_BASE.rxnorm}/drugs.json?name=${encodeURIComponent(drugName)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const raw = (await res.json()) as unknown;
  const parsed = RxNormDrugsResponseSchema.parse(raw);
  const groups = parsed.drugGroup.conceptGroup ?? [];
  for (const group of groups) {
    const props = group.conceptProperties;
    if (props && props.length > 0) return props[0].rxcui;
  }
  return null;
}

export async function getDrugInteractions(
  rxcui: string,
): Promise<RxNormInteraction[]> {
  const url = `${API_BASE.rxnorm}/interaction/interaction.json?rxcui=${rxcui}`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`RxNorm API error: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const parsed = RxNormInteractionResponseSchema.parse(raw);
  return (parsed.interactionTypeGroup ?? []).flatMap((g) => g.interactionType);
}
```

- [ ] **Step 9: Create `src/services/chembl.service.ts`**

```ts
// src/services/chembl.service.ts
import { API_BASE } from "./api.config";
import {
  ChEMBLMoleculeSchema,
  ChEMBLActivityResponseSchema,
  type ChEMBLMolecule,
  type ChEMBLActivity,
} from "@/types/chembl.schema";

export async function getMoleculeByName(
  name: string,
): Promise<ChEMBLMolecule | null> {
  const url = `${API_BASE.chembl}/molecule.json?pref_name__iexact=${encodeURIComponent(name)}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const raw = (await res.json()) as { molecules?: unknown[] };
  if (!raw.molecules?.length) return null;
  return ChEMBLMoleculeSchema.parse(raw.molecules[0]);
}

export async function getDrugActivities(
  chemblId: string,
  limit = 20,
): Promise<ChEMBLActivity[]> {
  const url = `${API_BASE.chembl}/activity.json?molecule_chembl_id=${chemblId}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const raw = (await res.json()) as unknown;
  const parsed = ChEMBLActivityResponseSchema.parse(raw);
  return parsed.activities;
}
```

- [ ] **Step 10: Run tests to verify they pass**

```bash
pnpm test src/services/who.service.test.ts
```

Expected: PASS — all 3 tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add all seven api service functions with zod validation"
```

---

## Task 7: TanStack Query Hooks

**Files:**

- Create: `src/hooks/useCountryDisease.ts`
- Create: `src/hooks/useLiveOutbreaks.ts`
- Create: `src/hooks/useWorldBank.ts`
- Create: `src/hooks/useDrugLabel.ts`
- Create: `src/hooks/useDrugMolecule.ts`
- Create: `src/hooks/useDrugInteractions.ts`
- Create: `src/hooks/useDrugTargets.ts`
- Test: `src/hooks/useCountryDisease.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/hooks/useCountryDisease.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useCountryDisease } from "./useCountryDisease";
import * as whoService from "@/services/who.service";

vi.mock("@/services/who.service");

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    {
      client: new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    },
    children,
  );

describe("useCountryDisease", () => {
  it("returns data when service resolves", async () => {
    vi.mocked(whoService.getDiseaseByCountry).mockResolvedValue([
      {
        Id: "1",
        IndicatorCode: "MALARIA_CASES",
        SpatialDim: "NGA",
        TimeDim: 2022,
        NumericValue: 68400000,
        Low: null,
        High: null,
      },
    ]);

    const { result } = renderHook(
      () => useCountryDisease("NGA", "MALARIA_CASES"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].NumericValue).toBe(68400000);
  });

  it("is disabled when iso3 is empty", () => {
    const { result } = renderHook(
      () => useCountryDisease("", "MALARIA_CASES"),
      { wrapper },
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/hooks/useCountryDisease.test.ts
```

Expected: FAIL — "Cannot find module './useCountryDisease'"

- [ ] **Step 3: Create `src/hooks/useCountryDisease.ts`**

```ts
// src/hooks/useCountryDisease.ts
import { useQuery } from "@tanstack/react-query";
import {
  getDiseaseByCountry,
  getDiseaseTimeSeries,
  getDiseaseGlobal,
} from "@/services/who.service";

export function useCountryDisease(iso3: string, indicator: string) {
  return useQuery({
    queryKey: ["who", "country", iso3, indicator],
    queryFn: () => getDiseaseByCountry(iso3, indicator),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!iso3 && !!indicator,
  });
}

export function useCountryDiseaseTimeSeries(iso3: string, indicator: string) {
  return useQuery({
    queryKey: ["who", "timeseries", iso3, indicator],
    queryFn: () => getDiseaseTimeSeries(iso3, indicator),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!iso3 && !!indicator,
  });
}

export function useGlobalDisease(indicator: string, year: number) {
  return useQuery({
    queryKey: ["who", "global", indicator, year],
    queryFn: () => getDiseaseGlobal(indicator, year),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!indicator && !!year,
  });
}
```

- [ ] **Step 4: Create `src/hooks/useLiveOutbreaks.ts`**

```ts
// src/hooks/useLiveOutbreaks.ts
import { useQuery } from "@tanstack/react-query";
import {
  getLiveOutbreaks,
  getLiveHistorical,
} from "@/services/disease.service";

export function useLiveOutbreaks() {
  return useQuery({
    queryKey: ["disease.sh", "outbreaks"],
    queryFn: getLiveOutbreaks,
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });
}

export function useLiveHistorical(iso2: string) {
  return useQuery({
    queryKey: ["disease.sh", "historical", iso2],
    queryFn: () => getLiveHistorical(iso2),
    staleTime: 1000 * 60 * 60,
    enabled: !!iso2,
  });
}
```

- [ ] **Step 5: Create `src/hooks/useWorldBank.ts`**

```ts
// src/hooks/useWorldBank.ts
import { useQuery } from "@tanstack/react-query";
import { getIndicator, WB_INDICATORS } from "@/services/worldbank.service";

export function usePopulation(iso2: string) {
  return useQuery({
    queryKey: ["worldbank", iso2, WB_INDICATORS.population],
    queryFn: () => getIndicator(iso2, WB_INDICATORS.population),
    staleTime: 1000 * 60 * 60 * 24 * 7,
    enabled: !!iso2,
  });
}

export function useHospitalBeds(iso2: string) {
  return useQuery({
    queryKey: ["worldbank", iso2, WB_INDICATORS.hospitalBeds],
    queryFn: () => getIndicator(iso2, WB_INDICATORS.hospitalBeds),
    staleTime: 1000 * 60 * 60 * 24 * 7,
    enabled: !!iso2,
  });
}
```

- [ ] **Step 6: Create `src/hooks/useDrugLabel.ts`**

```ts
// src/hooks/useDrugLabel.ts
import { useQuery } from "@tanstack/react-query";
import {
  getDrugLabel,
  getAdverseEventCounts,
} from "@/services/openfda.service";

export function useDrugLabel(genericName: string) {
  return useQuery({
    queryKey: ["openfda", "label", genericName],
    queryFn: () => getDrugLabel(genericName),
    staleTime: 1000 * 60 * 60,
    enabled: !!genericName,
  });
}

export function useAdverseEvents(drugName: string) {
  return useQuery({
    queryKey: ["openfda", "adverse", drugName],
    queryFn: () => getAdverseEventCounts(drugName),
    staleTime: 1000 * 60 * 60,
    enabled: !!drugName,
  });
}
```

- [ ] **Step 7: Create `src/hooks/useDrugMolecule.ts`**

```ts
// src/hooks/useDrugMolecule.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCompoundByName,
  get2DImageUrl,
  get3DStructureUrl,
} from "@/services/pubchem.service";

export function useDrugMolecule(drugName: string) {
  return useQuery({
    queryKey: ["pubchem", "compound", drugName],
    queryFn: () => getCompoundByName(drugName),
    staleTime: Infinity,
    enabled: !!drugName,
  });
}

export function useDrug2DImageUrl(cid: number | undefined) {
  return cid ? get2DImageUrl(cid) : null;
}

export function useDrug3DUrl(cid: number | undefined) {
  return cid ? get3DStructureUrl(cid) : null;
}
```

- [ ] **Step 8: Create `src/hooks/useDrugInteractions.ts`**

```ts
// src/hooks/useDrugInteractions.ts
import { useQuery } from "@tanstack/react-query";
import { getRxCui, getDrugInteractions } from "@/services/rxnorm.service";

export function useDrugInteractions(drugName: string) {
  const rxcuiQuery = useQuery({
    queryKey: ["rxnorm", "rxcui", drugName],
    queryFn: () => getRxCui(drugName),
    staleTime: 1000 * 60 * 60,
    enabled: !!drugName,
  });

  const interactionsQuery = useQuery({
    queryKey: ["rxnorm", "interactions", rxcuiQuery.data],
    queryFn: () => getDrugInteractions(rxcuiQuery.data!),
    staleTime: 1000 * 60 * 60,
    enabled: !!rxcuiQuery.data,
  });

  return {
    rxcui: rxcuiQuery.data,
    interactions: interactionsQuery.data ?? [],
    isLoading: rxcuiQuery.isLoading || interactionsQuery.isLoading,
    isError: rxcuiQuery.isError || interactionsQuery.isError,
  };
}
```

- [ ] **Step 9: Create `src/hooks/useDrugTargets.ts`**

```ts
// src/hooks/useDrugTargets.ts
import { useQuery } from "@tanstack/react-query";
import {
  getMoleculeByName,
  getDrugActivities,
} from "@/services/chembl.service";

export function useDrugTargets(drugName: string) {
  const moleculeQuery = useQuery({
    queryKey: ["chembl", "molecule", drugName],
    queryFn: () => getMoleculeByName(drugName),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!drugName,
  });

  const activitiesQuery = useQuery({
    queryKey: ["chembl", "activities", moleculeQuery.data?.molecule_chembl_id],
    queryFn: () => getDrugActivities(moleculeQuery.data!.molecule_chembl_id),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!moleculeQuery.data?.molecule_chembl_id,
  });

  return {
    molecule: moleculeQuery.data,
    activities: activitiesQuery.data ?? [],
    isLoading: moleculeQuery.isLoading || activitiesQuery.isLoading,
    isError: moleculeQuery.isError || activitiesQuery.isError,
  };
}
```

- [ ] **Step 10: Run tests to verify they pass**

```bash
pnpm test src/hooks/useCountryDisease.test.ts
```

Expected: PASS — 2 tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add tanstack query hooks for all seven data sources"
```

---

## Task 8: Zustand App Store

**Files:**

- Create: `src/stores/app.store.ts`
- Test: `src/stores/app.store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/stores/app.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./app.store";
import { DEFAULT_DISEASES } from "@/types/app.types";

beforeEach(() => {
  useAppStore.setState({
    activeDiseases: DEFAULT_DISEASES,
    selectedYear: new Date().getFullYear(),
    persona: "analyst",
    selectedCountry: null,
    compareCountry: null,
    theme: "dark",
  });
});

describe("useAppStore", () => {
  it("initialises with default diseases", () => {
    const { activeDiseases } = useAppStore.getState();
    expect(activeDiseases.length).toBeGreaterThan(0);
    expect(activeDiseases.some((d) => d.id === "malaria")).toBe(true);
  });

  it("removes a disease by id", () => {
    useAppStore.getState().removeDisease("malaria");
    const { activeDiseases } = useAppStore.getState();
    expect(activeDiseases.some((d) => d.id === "malaria")).toBe(false);
  });

  it("adds a disease without duplicates", () => {
    const store = useAppStore.getState();
    const malaria = DEFAULT_DISEASES.find((d) => d.id === "malaria")!;
    store.addDisease(malaria);
    store.addDisease(malaria);
    expect(
      useAppStore.getState().activeDiseases.filter((d) => d.id === "malaria"),
    ).toHaveLength(1);
  });

  it("sets selected country", () => {
    useAppStore.getState().setCountry("NGA");
    expect(useAppStore.getState().selectedCountry).toBe("NGA");
  });

  it("sets persona", () => {
    useAppStore.getState().setPersona("clinical");
    expect(useAppStore.getState().persona).toBe("clinical");
  });

  it("sets year within valid range", () => {
    useAppStore.getState().setYear(2000);
    expect(useAppStore.getState().selectedYear).toBe(2000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/stores/app.store.test.ts
```

Expected: FAIL — "Cannot find module './app.store'"

- [ ] **Step 3: Create `src/stores/app.store.ts`**

```ts
// src/stores/app.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_DISEASES,
  type Disease,
  type Persona,
} from "@/types/app.types";

interface AppState {
  // Disease selection
  activeDiseases: Disease[];
  addDisease: (disease: Disease) => void;
  removeDisease: (id: string) => void;

  // Time scrubber
  selectedYear: number;
  setYear: (year: number) => void;

  // Persona
  persona: Persona;
  setPersona: (persona: Persona) => void;

  // Country selection
  selectedCountry: string | null; // ISO3
  setCountry: (iso3: string | null) => void;

  // Compare country (second pin)
  compareCountry: string | null; // ISO3
  setCompareCountry: (iso3: string | null) => void;

  // Theme
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeDiseases: DEFAULT_DISEASES,
      selectedYear: new Date().getFullYear(),
      persona: "analyst",
      selectedCountry: null,
      compareCountry: null,
      theme: "dark",

      addDisease: (disease) => {
        const current = get().activeDiseases;
        if (current.some((d) => d.id === disease.id)) return;
        set({ activeDiseases: [...current, disease] });
      },

      removeDisease: (id) =>
        set({
          activeDiseases: get().activeDiseases.filter((d) => d.id !== id),
        }),

      setYear: (year) => set({ selectedYear: year }),
      setPersona: (persona) => set({ persona }),
      setCountry: (iso3) => set({ selectedCountry: iso3 }),
      setCompareCountry: (iso3) => set({ compareCountry: iso3 }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "disease-visualizer-state",
      partialize: (state) => ({
        activeDiseases: state.activeDiseases,
        persona: state.persona,
        theme: state.theme,
      }),
    },
  ),
);
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test src/stores/app.store.test.ts
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add zustand app store with persistence"
```

---

## Task 9: Utility Functions — Formatting + Colour Scales

**Files:**

- Create: `src/lib/format.ts`
- Create: `src/lib/colour-scale.ts`
- Create: `src/lib/disease-catalogue.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/format.test.ts
import { describe, it, expect } from "vitest";
import {
  formatCount,
  formatRate,
  formatPercent,
  formatTrend,
  getTrendDirection,
} from "./format";

describe("formatCount", () => {
  it("formats millions correctly", () => {
    expect(formatCount(68400000)).toBe("68.4 Million");
  });
  it("formats billions correctly", () => {
    expect(formatCount(1200000000)).toBe("1.2 Billion");
  });
  it("formats thousands correctly", () => {
    expect(formatCount(143000)).toBe("143,000");
  });
  it("formats small numbers", () => {
    expect(formatCount(42)).toBe("42");
  });
  it("returns no data label for null", () => {
    expect(formatCount(null)).toBe("No data available");
  });
});

describe("formatRate", () => {
  it("converts decimal to per-1000 rate", () => {
    expect(formatRate(0.0034)).toBe("3.4 per 1,000 people");
  });
  it("handles zero", () => {
    expect(formatRate(0)).toBe("0 per 1,000 people");
  });
});

describe("formatPercent", () => {
  it("formats decimal as percentage", () => {
    expect(formatPercent(0.78)).toBe("78.0%");
  });
  it("formats small percentage", () => {
    expect(formatPercent(0.0021)).toBe("0.2%");
  });
});

describe("getTrendDirection", () => {
  it("returns increasing for positive change", () => {
    expect(getTrendDirection(100, 112)).toBe("increasing");
  });
  it("returns decreasing for negative change", () => {
    expect(getTrendDirection(100, 92)).toBe("decreasing");
  });
  it("returns stable for small change", () => {
    expect(getTrendDirection(100, 100.5)).toBe("stable");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/format.test.ts
```

Expected: FAIL — "Cannot find module './format'"

- [ ] **Step 3: Create `src/lib/format.ts`**

```ts
// src/lib/format.ts

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "No data available";
  if (value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toFixed(1)} Billion`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Million`;
  if (value >= 1_000) return value.toLocaleString("en-US");
  return String(Math.round(value));
}

export function formatRate(value: number): string {
  return `${(value * 1000).toFixed(1)} per 1,000 people`;
}

export function formatPercent(value: number): string {
  const pct = value * 100;
  return pct < 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
}

export function formatYear(year: number): string {
  return String(year);
}

export type TrendDirection = "increasing" | "decreasing" | "stable";

export function getTrendDirection(
  previous: number,
  current: number,
): TrendDirection {
  const changePct = ((current - previous) / previous) * 100;
  if (changePct > 1) return "increasing";
  if (changePct < -1) return "decreasing";
  return "stable";
}

export function formatTrend(
  previous: number | null,
  current: number | null,
): string {
  if (previous === null || current === null) return "No comparison data";
  const changePct = ((current - previous) / previous) * 100;
  const sign = changePct >= 0 ? "+" : "";
  return `${sign}${changePct.toFixed(1)}% from last year`;
}

export function formatMagnitudeContext(value: number, label: string): string {
  if (value >= 1_000_000) {
    const cities = Math.round(value / 500_000);
    if (cities >= 2)
      return `Equivalent to ${cities} mid-sized cities losing their entire population`;
  }
  return `${formatCount(value)} ${label}`;
}
```

- [ ] **Step 4: Create `src/lib/colour-scale.ts`**

```ts
// src/lib/colour-scale.ts
import { scaleSequential } from "d3-scale";
import { interpolateReds } from "d3-scale-chromatic";

export function createBurdenColourScale(maxValue: number) {
  return scaleSequential(interpolateReds).domain([0, maxValue]);
}

export function getBurdenColour(
  value: number | null,
  maxValue: number,
): string {
  if (value === null) return "#1e293b"; // slate-800 — no data
  const scale = createBurdenColourScale(maxValue);
  return scale(value);
}

export const DISEASE_COLOURS: Record<string, string> = {
  viral: "#ef4444",
  respiratory: "#f59e0b",
  parasitic: "#22c55e",
  bacterial: "#3b82f6",
  vectorborne: "#14b8a6",
};
```

- [ ] **Step 5: Create `src/lib/disease-catalogue.ts`**

```ts
// src/lib/disease-catalogue.ts
// Curated landmark events per disease for the history timeline.
// Sources: WHO, CDC historical records.

export interface LandmarkEvent {
  year:        number
  title:       string
  description: string
  type:        'outbreak' | 'intervention' | 'discovery' | 'milestone' | 'warning'
}

export const DISEASE_LANDMARKS: Record<string, LandmarkEvent[]> = {
  malaria: [
    { year: 1897, title: 'Mosquito transmission discovered', description: 'Ronald Ross proved that malaria is transmitted by the Anopheles mosquito — a discovery that won him the Nobel Prize.', type: 'discovery' },
    { year: 1955, title: 'WHO Global Eradication Programme', description: 'WHO launched a global programme to eradicate malaria using DDT spraying and chloroquine. Succeeded in 11 countries.', type: 'intervention' },
    { year: 1972, title: 'DDT banned in the US', description: 'Growing evidence of environmental harm led to the US ban on DDT, slowing eradication efforts in many regions.', type: 'milestone' },
    { year: 1990, title: 'Chloroquine resistance spreads', description: 'Resistance to chloroquine — the main malaria drug — had spread to nearly all malaria-endemic regions, making treatment much harder.', type: 'warning' },
    { year: 2000, title: 'Roll Back Malaria partnership', description: 'A global framework created to halve malaria burden by 2010 through bed nets, indoor spraying, and combination therapies.', type: 'intervention' },
    { year: 2005, title: 'Artemisinin Combination Therapy adopted', description: 'WHO recommended ACT as the new standard treatment, replacing chloroquine. Highly effective against drug-resistant strains.', type: 'intervention' },
    { year: 2021, title: 'First malaria vaccine approved', description: 'RTS,S/AS01 (Mosquirix) became the first approved malaria vaccine after 30 years of development. 56% efficacy in young children.', type: 'milestone' },
    { year: 2023, title: 'R21/Matrix-M vaccine approved', description: 'A second malaria vaccine approved with 77% efficacy — more accessible and easier to produce at scale.', type: 'milestone' },
  ],
  tuberculosis: [
    { year: 1882, title: 'TB bacterium identified', description: 'Robert Koch discovered Mycobacterium tuberculosis, proving TB was an infectious disease rather than hereditary.', type: 'discovery' },
    { year: 1921, title: 'BCG vaccine introduced', description: 'The Bacille Calmette-Guerin (BCG) vaccine was first used in humans — still the only approved TB vaccine today.', type: 'intervention' },
    { year: 1943, title: 'Streptomycin discovered', description: 'The first antibiotic effective against TB was discovered, transforming it from a near-certain death sentence.', type: 'discovery' },
    { year: 1994, title: 'Multi-drug resistant TB declared crisis', description: 'WHO declared MDR-TB a global health crisis as strains resistant to the two main drugs emerged worldwide.', type: 'warning' },
    { year: 2006, title: 'Extensively drug-resistant TB', description: 'XDR-TB — resistant to nearly all available antibiotics — was identified in 49 countries, raising fears of untreatable TB.', type: 'warning' },
    { year: 2015, title: 'End TB Strategy launched', description: 'WHO set a target to end the TB epidemic by 2030 — reducing deaths by 95% and new cases by 90%.', type: 'milestone' },
  ],
  hiv: [
    { year: 1981, title: 'First AIDS cases reported', description: 'The CDC reported unusual lung infections and immune failure in five young gay men in Los Angeles — the first recognised AIDS cases.', type: 'outbreak' },
    { year: 1983, title: 'HIV virus isolated', description: 'Scientists at the Pasteur Institute isolated the virus causing AIDS, which would later be named HIV (Human Immunodeficiency Virus).', type: 'discovery' },
    { year: 1987, title: 'First HIV drug approved', description: 'AZT (zidovudine) became the first approved HIV treatment, extending life expectancy for people with AIDS.', type: 'intervention' },
    { year: 1996, title: 'Combination antiretroviral therapy', description: 'The introduction of HAART (Highly Active Antiretroviral Therapy) transformed HIV from a death sentence to a manageable chronic condition.', type: 'intervention' },
    { year: 2003, title: 'PEPFAR launched', description: "The US President's Emergency Plan for AIDS Relief committed $15 billion over 5 years — the largest health initiative in history targeting a single disease.', type: 'intervention' },
    { year: 2012, title: 'PrEP approved for prevention', description: 'Pre-exposure prophylaxis (PrEP) approved — a daily pill that reduces HIV infection risk by up to 99% in high-risk individuals.', type: 'intervention' },
  ],
  covid19: [
    { year: 2019, title: 'First cases identified', description: 'A cluster of pneumonia cases of unknown cause was reported in Wuhan, China in December 2019.', type: 'outbreak' },
    { year: 2020, title: 'WHO declares global pandemic', description: 'COVID-19 was declared a global pandemic on 11 March 2020 — the first pandemic caused by a coronavirus.', type: 'milestone' },
    { year: 2020, title: 'First vaccines approved', description: 'The Pfizer-BioNTech and Moderna mRNA vaccines received emergency authorisation in December 2020 — developed in record time using new technology.', type: 'intervention' },
    { year: 2021, title: 'Delta variant surge', description: 'The Delta variant became the dominant strain globally, proving significantly more transmissible than the original virus.', type: 'warning' },
    { year: 2022, title: 'Omicron variant displaces Delta', description: 'Omicron spread faster than any previous variant but caused less severe disease, particularly in vaccinated populations.', type: 'warning' },
  ],
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test src/lib/format.test.ts
```

Expected: PASS — all 11 tests pass.

- [ ] **Step 7: Run the full test suite**

```bash
pnpm test
```

Expected: All tests pass across all files.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add formatting utilities, colour scales, disease landmark catalogue"
```

---

## Task 10: Final Foundation Verification

- [ ] **Step 1: Run full typecheck**

```bash
pnpm typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 2: Run full test suite with coverage**

```bash
pnpm test:coverage
```

Expected: all tests pass, coverage thresholds met (80%+).

- [ ] **Step 3: Run the dev server**

```bash
pnpm dev
```

Expected: app loads at `http://localhost:3000` with dark background and "Disease Visualizer — Foundation" placeholder text.

- [ ] **Step 4: Build for production**

```bash
pnpm build
```

Expected: build completes with no errors. `dist/` folder created.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verify foundation — all tests pass, build succeeds"
```

---

## Summary

Plan 1 complete. After executing this plan you will have:

- Vite + React 18 + TypeScript strict project fully configured
- Husky + commitlint + ESLint + Prettier enforced on every commit
- Natural Earth GeoJSON downloaded as static asset
- 7 API service functions, each fetching + Zod-validating a real external API
- 7 TanStack Query hooks with correct cache TTLs
- Zustand app store with persistence for user preferences
- Number formatting utilities tested for all edge cases
- Disease landmark catalogue (curated historical events for Malaria, TB, HIV, COVID-19)
- All tests passing, build clean, typecheck clean

**Next:** Plan 2 — App Shell + Globe Visualizer
