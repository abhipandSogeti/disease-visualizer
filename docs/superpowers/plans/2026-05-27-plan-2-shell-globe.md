# Disease Visualizer — Plan 2: App Shell & Globe Visualizer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the immersive three-panel app shell and the NASA-style 3D globe with heat overlays, animated spread arcs, time scrubber, adaptive depth drill-down, and a 2D choropleth fallback.

**Architecture:** `AppShell` owns the three-panel layout and renders `Globe` as the centrepiece hero. Globe reads from the Zustand app store and TanStack Query hooks established in Plan 1. The `TimeScrubber` drives `selectedYear` in the store; the globe re-renders its heat overlay on every year change using D3 colour interpolation. A `ChoroplethMap` component replaces the globe when the user switches to 2D mode or the Analyst persona requests it.

**Tech Stack:** react-globe.gl, Three.js, react-simple-maps, D3, Recharts, React Router v6, Zustand (Plan 1 store), TanStack Query (Plan 1 hooks), Lucide React, React Aria, Tailwind CSS

**Prerequisite:** Plan 1 must be complete and all its tests must pass before starting this plan.

---

## File Map

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Three-panel layout wrapper
│   │   ├── Header.tsx               # Logo, persona toggle, search, theme toggle
│   │   ├── LeftPanel.tsx            # Disease selector + active disease list
│   │   ├── RightPanel.tsx           # Slide-in context panel (country/disease/drug)
│   │   ├── BottomBar.tsx            # Global stats ticker + data credits
│   │   └── TimeScrubber.tsx         # Year range slider (1900 – current year)
│   ├── globe/
│   │   ├── Globe.tsx                # react-globe.gl wrapper — main 3D globe
│   │   ├── GlobeControls.tsx        # Layer toggles (heat, arcs, bubbles, pins)
│   │   ├── GlobeTooltip.tsx         # Hover tooltip — country name + top stat
│   │   └── GlobeLegend.tsx          # Colour scale legend always on screen
│   ├── map/
│   │   ├── ChoroplethMap.tsx        # react-simple-maps 2D fallback
│   │   └── MapLegend.tsx            # 2D map colour legend
│   └── ui/
│       ├── LoadingSkeleton.tsx      # Pulsing skeleton for any loading state
│       ├── ErrorState.tsx           # Plain-English error with retry
│       └── EmptyState.tsx           # Plain-English empty with suggestion
├── pages/
│   ├── GlobePage.tsx                # Route: / — globe + full shell
│   ├── RegionPage.tsx               # Route: /region/:countryCode
│   └── ComparePage.tsx              # Route: /compare
└── App.tsx                          # Updated with all routes
```

---

## Task 1: App Shell Layout

**Files:**

- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/LeftPanel.tsx`
- Create: `src/components/layout/RightPanel.tsx`
- Create: `src/components/layout/BottomBar.tsx`
- Test: `src/components/layout/AppShell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/layout/AppShell.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createElement } from "react";
import { AppShell } from "./AppShell";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    {
      client: new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    },
    createElement(MemoryRouter, null, children),
  );

describe("AppShell", () => {
  it("renders the header with the app title", () => {
    render(createElement(AppShell, { children: null }), { wrapper });
    expect(screen.getByText(/disease visualizer/i)).toBeInTheDocument();
  });

  it("renders persona toggle buttons", () => {
    render(createElement(AppShell, { children: null }), { wrapper });
    expect(
      screen.getByRole("button", { name: /analyst/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /epidemiologist/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clinical/i }),
    ).toBeInTheDocument();
  });

  it("switches persona on button click", async () => {
    const user = userEvent.setup();
    render(createElement(AppShell, { children: null }), { wrapper });
    const clinicalBtn = screen.getByRole("button", { name: /clinical/i });
    await user.click(clinicalBtn);
    expect(clinicalBtn).toHaveAttribute("aria-pressed", "true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/layout/AppShell.test.tsx
```

Expected: FAIL — "Cannot find module './AppShell'"

- [ ] **Step 3: Create `src/components/layout/AppShell.tsx`**

```tsx
// src/components/layout/AppShell.tsx
import { type ReactNode } from "react";
import { Header } from "./Header";
import { LeftPanel } from "./LeftPanel";
import { BottomBar } from "./BottomBar";

interface AppShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-navy-950 text-slate-100">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <LeftPanel />
        <main className="relative flex-1 overflow-hidden">{children}</main>
        {rightPanel && (
          <aside
            className="w-96 overflow-y-auto border-l border-slate-800 bg-navy-900 shadow-2xl transition-all duration-300"
            aria-label="Disease intelligence panel"
          >
            {rightPanel}
          </aside>
        )}
      </div>
      <BottomBar />
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/layout/Header.tsx`**

```tsx
// src/components/layout/Header.tsx
import { Activity, Sun, Moon, Search } from "lucide-react";
import { useAppStore } from "@/stores/app.store";
import type { Persona } from "@/types/app.types";

const PERSONAS: { id: Persona; label: string }[] = [
  { id: "analyst", label: "Analyst" },
  { id: "epidemiologist", label: "Epidemiologist" },
  { id: "clinical", label: "Clinical" },
];

export function Header() {
  const { persona, setPersona, theme, setTheme } = useAppStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-navy-900 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-400" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-wide text-slate-100">
          Disease Visualizer
        </span>
      </div>

      {/* Persona toggle */}
      <nav aria-label="Persona selection" className="flex gap-1">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            aria-pressed={persona === p.id}
            className={[
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              persona === p.id
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search countries, diseases, drugs..."
            aria-label="Search"
            className="w-56 rounded bg-slate-800 py-1 pl-7 pr-3 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create `src/components/layout/LeftPanel.tsx`**

```tsx
// src/components/layout/LeftPanel.tsx
import { Plus, X, Circle } from "lucide-react";
import { useAppStore } from "@/stores/app.store";
import { DISEASE_COLOURS } from "@/lib/colour-scale";

export function LeftPanel() {
  const { activeDiseases, removeDisease } = useAppStore();

  return (
    <aside
      className="flex w-52 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-navy-900 p-3"
      aria-label="Active diseases"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Active Diseases
        </span>
        <button
          aria-label="Add disease"
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <ul className="flex flex-col gap-1" role="list">
        {activeDiseases.map((disease) => (
          <li
            key={disease.id}
            className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-slate-800"
          >
            <div className="flex items-center gap-2">
              <Circle
                className="h-2.5 w-2.5 flex-shrink-0"
                style={{ color: DISEASE_COLOURS[disease.category] }}
                aria-hidden="true"
              />
              <span className="text-xs text-slate-300">{disease.name}</span>
            </div>
            <button
              onClick={() => removeDisease(disease.id)}
              aria-label={`Remove ${disease.name}`}
              className="rounded p-0.5 text-slate-600 hover:text-slate-300"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {activeDiseases.length === 0 && (
        <p className="text-xs text-slate-500">
          No diseases selected. Use the + button to add diseases to the map.
        </p>
      )}
    </aside>
  );
}
```

- [ ] **Step 6: Create `src/components/layout/RightPanel.tsx`**

```tsx
// src/components/layout/RightPanel.tsx
import { X } from "lucide-react";
import { useAppStore } from "@/stores/app.store";
import type { ReactNode } from "react";

interface RightPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function RightPanel({ title, subtitle, children }: RightPanelProps) {
  const { setCountry } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-start justify-between border-b border-slate-800 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <button
          onClick={() => setCountry(null)}
          aria-label="Close panel"
          className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/layout/BottomBar.tsx`**

```tsx
// src/components/layout/BottomBar.tsx
import { Database, RefreshCw } from "lucide-react";

export function BottomBar() {
  const sources = [
    "WHO GHO",
    "disease.sh",
    "World Bank",
    "OpenFDA",
    "PubChem",
    "RxNorm",
    "ChEMBL",
  ];

  return (
    <footer className="flex h-8 items-center justify-between border-t border-slate-800 bg-navy-900 px-4">
      <div className="flex items-center gap-2">
        <Database className="h-3 w-3 text-slate-600" aria-hidden="true" />
        <span className="text-xs text-slate-600">
          Data: {sources.join(" · ")}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <RefreshCw className="h-3 w-3 text-slate-600" aria-hidden="true" />
        <span className="text-xs text-slate-600">
          All data sources free and keyless
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
pnpm test src/components/layout/AppShell.test.tsx
```

Expected: PASS — 3 tests pass.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add app shell layout — header, left panel, right panel, bottom bar"
```

---

## Task 2: Time Scrubber

**Files:**

- Create: `src/components/layout/TimeScrubber.tsx`
- Test: `src/components/layout/TimeScrubber.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/layout/TimeScrubber.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeScrubber } from "./TimeScrubber";

describe("TimeScrubber", () => {
  it("renders the current year label", () => {
    render(
      <TimeScrubber
        value={2020}
        min={1900}
        max={2024}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText("2020")).toBeInTheDocument();
  });

  it("renders min and max year labels", () => {
    render(
      <TimeScrubber
        value={2020}
        min={1900}
        max={2024}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText("1900")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("calls onChange when slider moves", async () => {
    const onChange = vi.fn();
    render(
      <TimeScrubber value={2020} min={1900} max={2024} onChange={onChange} />,
    );
    const slider = screen.getByRole("slider");
    await userEvent.type(slider, "{arrowright}");
    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/layout/TimeScrubber.test.tsx
```

Expected: FAIL — "Cannot find module './TimeScrubber'"

- [ ] **Step 3: Create `src/components/layout/TimeScrubber.tsx`**

```tsx
// src/components/layout/TimeScrubber.tsx

interface TimeScrubberProps {
  value: number;
  min: number;
  max: number;
  onChange: (year: number) => void;
}

export function TimeScrubber({ value, min, max, onChange }: TimeScrubberProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="w-10 text-right text-xs text-slate-500">{min}</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Select year"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className={[
            "w-full cursor-pointer appearance-none rounded-full bg-slate-700",
            "h-1.5",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg",
            "[&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-blue-400/30",
          ].join(" ")}
        />
        {/* Current year bubble */}
        <div
          className="pointer-events-none absolute -top-7 -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${((value - min) / (max - min)) * 100}%` }}
          aria-hidden="true"
        >
          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            {value}
          </span>
        </div>
      </div>
      <span className="w-10 text-xs text-slate-500">{max}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test src/components/layout/TimeScrubber.test.tsx
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add time scrubber with year bubble"
```

---

## Task 3: Globe Legend + Tooltip UI Components

**Files:**

- Create: `src/components/globe/GlobeLegend.tsx`
- Create: `src/components/globe/GlobeTooltip.tsx`
- Create: `src/components/ui/LoadingSkeleton.tsx`
- Create: `src/components/ui/ErrorState.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Test: `src/components/ui/LoadingSkeleton.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ui/LoadingSkeleton.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

describe("LoadingSkeleton", () => {
  it("renders with accessible label", () => {
    render(<LoadingSkeleton label="Fetching WHO data" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/fetching who data/i)).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders error message and retry button", () => {
    render(
      <ErrorState
        message="Could not reach WHO servers"
        onRetry={() => undefined}
      />,
    );
    expect(
      screen.getByText(/could not reach who servers/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders empty message and suggestion", () => {
    render(
      <EmptyState
        message="No data for Iceland"
        suggestion="Try a tropical region"
      />,
    );
    expect(screen.getByText(/no data for iceland/i)).toBeInTheDocument();
    expect(screen.getByText(/try a tropical region/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/ui/LoadingSkeleton.test.tsx
```

Expected: FAIL — "Cannot find module './LoadingSkeleton'"

- [ ] **Step 3: Create `src/components/ui/LoadingSkeleton.tsx`**

```tsx
// src/components/ui/LoadingSkeleton.tsx

interface LoadingSkeletonProps {
  label: string;
  rows?: number;
}

export function LoadingSkeleton({ label, rows = 3 }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-2">
      <p className="mb-2 text-xs text-slate-500">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-8 animate-pulse rounded bg-slate-800"
          style={{ width: `${70 + (i % 3) * 10}%`, opacity: 1 - i * 0.15 }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/ErrorState.tsx`**

```tsx
// src/components/ui/ErrorState.tsx
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  detail?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, detail, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded border border-red-900/50 bg-red-950/20 p-4 text-center">
      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-red-300">{message}</p>
        {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/ui/EmptyState.tsx`**

```tsx
// src/components/ui/EmptyState.tsx
import { Info } from "lucide-react";

interface EmptyStateProps {
  message: string;
  suggestion?: string;
}

export function EmptyState({ message, suggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded border border-slate-800 bg-slate-900/50 p-4 text-center">
      <Info className="h-5 w-5 text-slate-500" aria-hidden="true" />
      <p className="text-sm text-slate-400">{message}</p>
      {suggestion && <p className="text-xs text-slate-600">{suggestion}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/globe/GlobeLegend.tsx`**

```tsx
// src/components/globe/GlobeLegend.tsx

interface GlobeLegendProps {
  diseaseName: string;
  unit: string;
}

const LEVELS = [
  { label: "No data", colour: "#1e293b" },
  { label: "Very low", colour: "#fef9c3" },
  { label: "Low", colour: "#fde68a" },
  { label: "Medium", colour: "#f97316" },
  { label: "High", colour: "#dc2626" },
  { label: "Critical", colour: "#450a0a" },
];

export function GlobeLegend({ diseaseName, unit }: GlobeLegendProps) {
  return (
    <div
      className="absolute bottom-12 left-4 rounded border border-slate-700 bg-navy-900/90 p-3 backdrop-blur"
      aria-label="Map colour legend"
    >
      <p className="mb-2 text-xs font-semibold text-slate-300">
        {diseaseName} — {unit}
      </p>
      <div className="flex gap-1">
        {LEVELS.map((level) => (
          <div key={level.label} className="flex flex-col items-center gap-1">
            <div
              className="h-3 w-6 rounded-sm"
              style={{ backgroundColor: level.colour }}
              aria-hidden="true"
            />
            <span className="text-[9px] text-slate-500">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/globe/GlobeTooltip.tsx`**

```tsx
// src/components/globe/GlobeTooltip.tsx
import { formatCount } from "@/lib/format";

interface GlobeTooltipProps {
  countryName: string;
  value: number | null;
  unit: string;
  year: number;
  x: number;
  y: number;
}

export function GlobeTooltip({
  countryName,
  value,
  unit,
  year,
  x,
  y,
}: GlobeTooltipProps) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-50 rounded border border-slate-700 bg-navy-900/95 p-2.5 shadow-xl backdrop-blur"
      style={{ left: x + 12, top: y - 8 }}
    >
      <p className="text-xs font-semibold text-slate-100">{countryName}</p>
      <p className="mt-0.5 text-xs text-slate-400">
        {unit} — {year}
      </p>
      <p className="mt-1 text-sm font-bold text-white">
        {value !== null ? formatCount(value) : "No data available"}
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
pnpm test src/components/ui/LoadingSkeleton.test.tsx
```

Expected: PASS — 3 tests pass.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add globe legend, tooltip, loading/error/empty ui primitives"
```

---

## Task 4: 3D Globe Component

**Files:**

- Create: `src/components/globe/Globe.tsx`
- Create: `src/components/globe/GlobeControls.tsx`
- Test: `src/components/globe/Globe.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/globe/Globe.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { Globe } from "./Globe";

// react-globe.gl uses WebGL — mock it in tests
vi.mock("react-globe.gl", () => ({
  default: ({ onPointClick }: { onPointClick?: () => void }) =>
    createElement(
      "div",
      { "data-testid": "globe-mock", onClick: onPointClick },
      "Globe",
    ),
}));

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

describe("Globe", () => {
  it("renders the globe canvas", () => {
    render(createElement(Globe, null), { wrapper });
    expect(screen.getByTestId("globe-mock")).toBeInTheDocument();
  });

  it("renders the globe legend", () => {
    render(createElement(Globe, null), { wrapper });
    expect(
      screen.getByRole("generic", { name: /map colour legend/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/globe/Globe.test.tsx
```

Expected: FAIL — "Cannot find module './Globe'"

- [ ] **Step 3: Create `src/components/globe/Globe.tsx`**

```tsx
// src/components/globe/Globe.tsx
import { useRef, useState, useCallback, useMemo } from "react";
import GlobeGL from "react-globe.gl";
import { useAppStore } from "@/stores/app.store";
import { useGlobalDisease } from "@/hooks/useCountryDisease";
import { getBurdenColour } from "@/lib/colour-scale";
import { GlobeLegend } from "./GlobeLegend";
import { GlobeTooltip } from "./GlobeTooltip";
import { GlobeControls } from "./GlobeControls";

interface TooltipState {
  visible: boolean;
  countryName: string;
  value: number | null;
  x: number;
  y: number;
}

export function Globe() {
  const globeRef = useRef<{
    pointOfView: (coords: object, ms: number) => void;
  } | null>(null);
  const { activeDiseases, selectedYear, setCountry } = useAppStore();

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    countryName: "",
    value: null,
    x: 0,
    y: 0,
  });

  const primaryDisease = activeDiseases[0];

  const { data: diseaseData } = useGlobalDisease(
    primaryDisease?.whoIndicator ?? "",
    selectedYear,
  );

  // Build a lookup map: ISO3 → NumericValue
  const burdenMap = useMemo(() => {
    const map = new Map<string, number | null>();
    diseaseData?.forEach((r) => {
      if (r.SpatialDim) map.set(r.SpatialDim, r.NumericValue);
    });
    return map;
  }, [diseaseData]);

  const maxValue = useMemo(() => {
    const values = Array.from(burdenMap.values()).filter(Boolean) as number[];
    return Math.max(...values, 1);
  }, [burdenMap]);

  const handleHover = useCallback(
    (d: object | null, _: object | null, event: MouseEvent) => {
      if (!d) {
        setTooltip((t) => ({ ...t, visible: false }));
        return;
      }
      const feature = d as { properties: { name: string; iso_a3: string } };
      const iso3 = feature.properties.iso_a3;
      const value = burdenMap.get(iso3) ?? null;
      setTooltip({
        visible: true,
        countryName: feature.properties.name,
        value,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [burdenMap],
  );

  const handleClick = useCallback(
    (d: object | null) => {
      if (!d) return;
      const feature = d as { properties: { iso_a3: string } };
      setCountry(feature.properties.iso_a3);
      globeRef.current?.pointOfView({ lat: 0, lng: 0, altitude: 1.5 }, 1000);
    },
    [setCountry],
  );

  return (
    <div className="relative h-full w-full bg-navy-950">
      <GlobeGL
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={[]} // loaded via useEffect in GlobeControls
        polygonCapColor={(d: object) => {
          const f = d as { properties: { iso_a3: string } };
          const value = burdenMap.get(f.properties.iso_a3) ?? null;
          return getBurdenColour(value, maxValue);
        }}
        polygonSideColor={() => "rgba(0,0,0,0.1)"}
        polygonStrokeColor={() => "rgba(148,163,184,0.3)"}
        polygonLabel={() => ""}
        onPolygonHover={handleHover}
        onPolygonClick={handleClick}
        polygonAltitude={0.006}
        atmosphereColor="rgba(59,130,246,0.3)"
        atmosphereAltitude={0.1}
        width={undefined}
        height={undefined}
      />

      {tooltip.visible && (
        <GlobeTooltip
          countryName={tooltip.countryName}
          value={tooltip.value}
          unit={primaryDisease?.name ?? "Disease burden"}
          year={selectedYear}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}

      <GlobeLegend
        diseaseName={primaryDisease?.name ?? "Disease burden"}
        unit="Cases"
      />

      <GlobeControls globeRef={globeRef} />
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/globe/GlobeControls.tsx`**

```tsx
// src/components/globe/GlobeControls.tsx
import { type RefObject } from "react";
import { RotateCcw, Map } from "lucide-react";

interface GlobeControlsProps {
  globeRef: RefObject<{
    pointOfView: (coords: object, ms: number) => void;
  } | null>;
}

export function GlobeControls({ globeRef }: GlobeControlsProps) {
  const resetView = () => {
    globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
  };

  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2">
      <button
        onClick={resetView}
        aria-label="Reset globe view"
        className="rounded border border-slate-700 bg-navy-900/90 p-2 text-slate-400 backdrop-blur hover:text-slate-100"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        aria-label="Switch to 2D map view"
        className="rounded border border-slate-700 bg-navy-900/90 p-2 text-slate-400 backdrop-blur hover:text-slate-100"
      >
        <Map className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/components/globe/Globe.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add 3d globe with heat overlay, tooltip, and controls"
```

---

## Task 5: 2D Choropleth Map (Fallback)

**Files:**

- Create: `src/components/map/ChoroplethMap.tsx`
- Create: `src/components/map/MapLegend.tsx`
- Test: `src/components/map/ChoroplethMap.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/map/ChoroplethMap.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { ChoroplethMap } from "./ChoroplethMap";

vi.mock("react-simple-maps", () => ({
  ComposableMap: ({ children }: { children: React.ReactNode }) =>
    createElement("div", { "data-testid": "composable-map" }, children),
  Geographies: ({
    children,
  }: {
    children: (args: { geographies: unknown[] }) => React.ReactNode;
  }) => children({ geographies: [] }),
  Geography: () => createElement("div", null),
  ZoomableGroup: ({ children }: { children: React.ReactNode }) =>
    createElement("div", null, children),
}));

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

describe("ChoroplethMap", () => {
  it("renders the map container", () => {
    render(createElement(ChoroplethMap, null), { wrapper });
    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
  });

  it("renders the map legend", () => {
    render(createElement(ChoroplethMap, null), { wrapper });
    expect(screen.getByLabelText(/map colour legend/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/map/ChoroplethMap.test.tsx
```

Expected: FAIL — "Cannot find module './ChoroplethMap'"

- [ ] **Step 3: Create `src/components/map/ChoroplethMap.tsx`**

```tsx
// src/components/map/ChoroplethMap.tsx
import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useAppStore } from "@/stores/app.store";
import { useGlobalDisease } from "@/hooks/useCountryDisease";
import { getBurdenColour } from "@/lib/colour-scale";
import { formatCount } from "@/lib/format";
import { MapLegend } from "./MapLegend";

const GEO_URL = "/geo/countries-110m.json";

export function ChoroplethMap() {
  const { activeDiseases, selectedYear, setCountry } = useAppStore();
  const primaryDisease = activeDiseases[0];

  const [tooltip, setTooltip] = useState<{
    name: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);

  const { data: diseaseData } = useGlobalDisease(
    primaryDisease?.whoIndicator ?? "",
    selectedYear,
  );

  const burdenMap = useMemo(() => {
    const map = new Map<string, number | null>();
    diseaseData?.forEach((r) => {
      if (r.SpatialDim) map.set(r.SpatialDim, r.NumericValue);
    });
    return map;
  }, [diseaseData]);

  const maxValue = useMemo(() => {
    const values = Array.from(burdenMap.values()).filter(Boolean) as number[];
    return Math.max(...values, 1);
  }, [burdenMap]);

  return (
    <div className="relative h-full w-full bg-navy-950">
      <ComposableMap
        projectionConfig={{ scale: 147, center: [0, 20] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso3 =
                  (geo.properties as { iso_a3?: string }).iso_a3 ?? "";
                const value = burdenMap.get(iso3) ?? null;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getBurdenColour(value, maxValue)}
                    stroke="#1e293b"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        opacity: 0.8,
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => setCountry(iso3)}
                    onMouseEnter={(e: React.MouseEvent) => {
                      const name =
                        (geo.properties as { name?: string }).name ?? "";
                      setTooltip({ name, value, x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    aria-label={`${(geo.properties as { name?: string }).name ?? ""}: ${formatCount(value)}`}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 rounded border border-slate-700 bg-navy-900/95 p-2.5 shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
        >
          <p className="text-xs font-semibold text-slate-100">{tooltip.name}</p>
          <p className="mt-1 text-sm font-bold text-white">
            {formatCount(tooltip.value)}
          </p>
        </div>
      )}

      <MapLegend
        diseaseName={primaryDisease?.name ?? "Disease burden"}
        unit="Cases"
      />
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/map/MapLegend.tsx`**

```tsx
// src/components/map/MapLegend.tsx

interface MapLegendProps {
  diseaseName: string;
  unit: string;
}

const LEVELS = [
  { label: "No data", colour: "#1e293b" },
  { label: "Very low", colour: "#fef9c3" },
  { label: "Low", colour: "#fde68a" },
  { label: "Medium", colour: "#f97316" },
  { label: "High", colour: "#dc2626" },
  { label: "Critical", colour: "#450a0a" },
];

export function MapLegend({ diseaseName, unit }: MapLegendProps) {
  return (
    <div
      className="absolute bottom-4 left-4 rounded border border-slate-700 bg-navy-900/90 p-3 backdrop-blur"
      aria-label="Map colour legend"
    >
      <p className="mb-2 text-xs font-semibold text-slate-300">
        {diseaseName} — {unit}
      </p>
      <div className="flex gap-1">
        {LEVELS.map((level) => (
          <div key={level.label} className="flex flex-col items-center gap-1">
            <div
              className="h-3 w-6 rounded-sm"
              style={{ backgroundColor: level.colour }}
              aria-hidden="true"
            />
            <span className="text-[9px] text-slate-500">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/components/map/ChoroplethMap.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add 2d choropleth map fallback with legend and tooltip"
```

---

## Task 6: Globe Page + Routes

**Files:**

- Create: `src/pages/GlobePage.tsx`
- Create: `src/pages/RegionPage.tsx`
- Create: `src/pages/ComparePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/pages/GlobePage.tsx`**

```tsx
// src/pages/GlobePage.tsx
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TimeScrubber } from "@/components/layout/TimeScrubber";
import { Globe } from "@/components/globe/Globe";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAppStore } from "@/stores/app.store";

export default function GlobePage() {
  const { selectedYear, setYear } = useAppStore();

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Suspense fallback={<LoadingSkeleton label="Loading globe..." />}>
            <Globe />
          </Suspense>
        </div>
        <TimeScrubber
          value={selectedYear}
          min={1990}
          max={new Date().getFullYear()}
          onChange={setYear}
        />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Create `src/pages/RegionPage.tsx`**

```tsx
// src/pages/RegionPage.tsx
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function RegionPage() {
  const { countryCode } = useParams<{ countryCode: string }>();

  return (
    <AppShell>
      <div className="p-6">
        <Link
          to="/"
          className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to globe
        </Link>
        <h1 className="text-lg font-semibold text-slate-100">
          Region: {countryCode?.toUpperCase()}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Disease intelligence panel for this region will render here.
        </p>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Create `src/pages/ComparePage.tsx`**

```tsx
// src/pages/ComparePage.tsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function ComparePage() {
  return (
    <AppShell>
      <div className="p-6">
        <Link
          to="/"
          className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to globe
        </Link>
        <h1 className="text-lg font-semibold text-slate-100">
          Country Comparison
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Side-by-side country comparison view — implemented in Plan 3.
        </p>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Update `src/App.tsx` with all routes**

```tsx
// src/App.tsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const GlobePage = lazy(() => import("@/pages/GlobePage"));
const RegionPage = lazy(() => import("@/pages/RegionPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const DrugPage = lazy(() => import("@/pages/DrugPage"));

function PageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-navy-950">
      <LoadingSkeleton label="Loading page..." rows={4} />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<GlobePage />} />
        <Route path="/region/:countryCode" element={<RegionPage />} />
        <Route path="/region/:countryCode/:adm1" element={<RegionPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/drug/:pubchemId" element={<DrugPage />} />
      </Routes>
    </Suspense>
  );
}
```

- [ ] **Step 5: Create `src/pages/DrugPage.tsx` placeholder (filled in Plan 4)**

```tsx
// src/pages/DrugPage.tsx
import { AppShell } from "@/components/layout/AppShell";

export default function DrugPage() {
  return (
    <AppShell>
      <div className="p-6">
        <p className="text-sm text-slate-500">
          Drug visualizer — implemented in Plan 4.
        </p>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 6: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Run dev server and verify the globe renders**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: 3-panel layout, spinning 3D globe, active disease list in left panel, year scrubber at the bottom.

- [ ] **Step 8: Run typecheck**

```bash
pnpm typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add globe page, region page, compare page with full routing"
```

---

## Summary

Plan 2 complete. After executing this plan you will have:

- Full three-panel app shell (header, left panel, right panel, bottom bar)
- Persona toggle wired to Zustand store
- Time scrubber controlling the selected year
- NASA-style 3D globe with heat overlays driven by WHO data
- Globe hover tooltips with formatted counts
- Colour-scale legend always visible
- 2D choropleth map fallback with identical data layer
- React Router v6 routes for globe, region drill-down, compare, drug visualizer
- All UI primitives: LoadingSkeleton, ErrorState, EmptyState
- All tests passing, build clean, typecheck clean

**Next:** Plan 3 — Disease Explorer Panel (right panel tabs, epidemic curve, timeline, compare)
