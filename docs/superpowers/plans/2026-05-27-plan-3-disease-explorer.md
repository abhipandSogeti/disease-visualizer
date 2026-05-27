# Disease Visualizer — Plan 3: Disease Explorer Panel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the slide-in Disease Intelligence Panel with four tabs — Overview (metric cards + epidemic curve), History (zoomable landmark timeline), Compare (side-by-side country view), and Drugs (treatment protocol + drug cards). Every number has context. Every technical term has a plain-English explanation. Content adapts to the active persona.

**Architecture:** `DiseasePanel` is the root component rendered inside `RightPanel` (Plan 2). It owns the tab state and delegates to four focused tab components. Each tab reads from TanStack Query hooks (Plan 1) and the Zustand store (Plan 1). Persona-specific sections are rendered conditionally — no separate components for each persona, just conditional blocks inside the same tab. The epidemic curve is a Recharts `AreaChart`. The history timeline is a custom D3-driven horizontal scroll component.

**Tech Stack:** Recharts, D3, Lucide React, TanStack Query (Plan 1 hooks), Zustand (Plan 1 store), React Aria, Tailwind CSS

**Prerequisite:** Plans 1 and 2 must be complete before starting this plan.

---

## File Map

```
src/
├── components/
│   ├── disease/
│   │   ├── DiseasePanel.tsx          # Root — owns tab state, renders RightPanel
│   │   ├── DiseaseOverviewTab.tsx    # Metric cards + epidemic curve
│   │   ├── DiseaseHistoryTab.tsx     # Zoomable landmark timeline
│   │   ├── DiseaseCompareTab.tsx     # Side-by-side country comparison
│   │   ├── DiseaseDrugsTab.tsx       # Treatment protocol + drug cards
│   │   ├── MetricCard.tsx            # Single stat card (value + trend + context)
│   │   ├── TrendBadge.tsx            # Trend icon + percent change label
│   │   └── EpidemicCurveChart.tsx    # Recharts area chart — cases over time
│   └── timeline/
│       ├── EpidemicTimeline.tsx      # Horizontal zoomable D3 timeline
│       └── TimelineEvent.tsx         # Single event pin on the timeline
├── pages/
│   └── RegionPage.tsx                # Updated to render DiseasePanel in right panel
```

---

## Task 1: MetricCard + TrendBadge

**Files:**

- Create: `src/components/disease/MetricCard.tsx`
- Create: `src/components/disease/TrendBadge.tsx`
- Test: `src/components/disease/MetricCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/disease/MetricCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";
import { TrendBadge } from "./TrendBadge";

describe("MetricCard", () => {
  it("renders the label and formatted value", () => {
    render(
      <MetricCard
        label="Total Cases"
        value={68400000}
        context="Highest burden country globally"
      />,
    );
    expect(screen.getByText("Total Cases")).toBeInTheDocument();
    expect(screen.getByText("68.4 Million")).toBeInTheDocument();
    expect(
      screen.getByText("Highest burden country globally"),
    ).toBeInTheDocument();
  });

  it("renders no data state gracefully", () => {
    render(<MetricCard label="Deaths" value={null} context="" />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});

describe("TrendBadge", () => {
  it("shows increasing trend with correct label", () => {
    render(<TrendBadge previous={100} current={112} />);
    expect(screen.getByText(/\+12\.0% from last year/i)).toBeInTheDocument();
  });

  it("shows decreasing trend with correct label", () => {
    render(<TrendBadge previous={100} current={92} />);
    expect(screen.getByText(/-8\.0% from last year/i)).toBeInTheDocument();
  });

  it("shows stable trend", () => {
    render(<TrendBadge previous={100} current={100.5} />);
    expect(screen.getByText(/stable/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/disease/MetricCard.test.tsx
```

Expected: FAIL — "Cannot find module './MetricCard'"

- [ ] **Step 3: Create `src/components/disease/MetricCard.tsx`**

```tsx
// src/components/disease/MetricCard.tsx
import { formatCount } from "@/lib/format";
import { TrendBadge } from "./TrendBadge";

interface MetricCardProps {
  label: string;
  value: number | null;
  context: string;
  previous?: number | null;
  unit?: string;
}

export function MetricCard({
  label,
  value,
  context,
  previous,
  unit,
}: MetricCardProps) {
  return (
    <div className="rounded border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-100">
        {formatCount(value)}
        {unit && value !== null && (
          <span className="ml-1 text-sm font-normal text-slate-400">
            {unit}
          </span>
        )}
      </p>
      {previous !== undefined && previous !== null && value !== null && (
        <div className="mt-1">
          <TrendBadge previous={previous} current={value} />
        </div>
      )}
      {context && (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          {context}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/disease/TrendBadge.tsx`**

```tsx
// src/components/disease/TrendBadge.tsx
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getTrendDirection, formatTrend } from "@/lib/format";

interface TrendBadgeProps {
  previous: number;
  current: number;
}

export function TrendBadge({ previous, current }: TrendBadgeProps) {
  const direction = getTrendDirection(previous, current);
  const label = formatTrend(previous, current);

  const config = {
    increasing: {
      icon: TrendingUp,
      color: "text-red-400",
      bg: "bg-red-950/40",
    },
    decreasing: {
      icon: TrendingDown,
      color: "text-green-400",
      bg: "bg-green-950/40",
    },
    stable: {
      icon: Minus,
      color: "text-slate-400",
      bg: "bg-slate-800/60",
    },
  }[direction];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${config.color} ${config.bg}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {direction === "stable" ? "Stable — less than 1% change" : label}
    </span>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/components/disease/MetricCard.test.tsx
```

Expected: PASS — 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add metric card and trend badge components"
```

---

## Task 2: Epidemic Curve Chart

**Files:**

- Create: `src/components/disease/EpidemicCurveChart.tsx`
- Test: `src/components/disease/EpidemicCurveChart.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/disease/EpidemicCurveChart.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EpidemicCurveChart } from "./EpidemicCurveChart";

// Recharts uses ResizeObserver — mock it
global.ResizeObserver = class {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
};

const mockData = [
  { year: 2018, value: 55000000 },
  { year: 2019, value: 60000000 },
  { year: 2020, value: 58000000 },
  { year: 2021, value: 63000000 },
  { year: 2022, value: 68400000 },
];

describe("EpidemicCurveChart", () => {
  it("renders the chart container", () => {
    render(
      <EpidemicCurveChart
        data={mockData}
        diseaseName="Malaria"
        colour="#22c55e"
      />,
    );
    expect(
      screen.getByRole("img", { name: /malaria cases over time/i }),
    ).toBeInTheDocument();
  });

  it("renders no data state when data is empty", () => {
    render(
      <EpidemicCurveChart data={[]} diseaseName="Malaria" colour="#22c55e" />,
    );
    expect(screen.getByText(/no historical data/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/disease/EpidemicCurveChart.test.tsx
```

Expected: FAIL — "Cannot find module './EpidemicCurveChart'"

- [ ] **Step 3: Create `src/components/disease/EpidemicCurveChart.tsx`**

```tsx
// src/components/disease/EpidemicCurveChart.tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCount } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

interface DataPoint {
  year: number;
  value: number;
}

interface EpidemicCurveChartProps {
  data: DataPoint[];
  diseaseName: string;
  colour: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-slate-700 bg-navy-900 p-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-200">{label}</p>
      <p className="mt-0.5 text-slate-400">{formatCount(payload[0].value)}</p>
    </div>
  );
}

export function EpidemicCurveChart({
  data,
  diseaseName,
  colour,
}: EpidemicCurveChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        message="No historical data available for this disease and country."
        suggestion="Try selecting a different country or disease from the left panel."
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${diseaseName} cases over time`}
      className="h-40 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`gradient-${diseaseName}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={colour} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colour} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCount(v)}
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2}
            fill={`url(#gradient-${diseaseName})`}
            dot={false}
            activeDot={{ r: 4, fill: colour }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test src/components/disease/EpidemicCurveChart.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add epidemic curve chart with recharts area chart"
```

---

## Task 3: Disease Overview Tab

**Files:**

- Create: `src/components/disease/DiseaseOverviewTab.tsx`
- Test: `src/components/disease/DiseaseOverviewTab.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/disease/DiseaseOverviewTab.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { DiseaseOverviewTab } from "./DiseaseOverviewTab";
import * as hooks from "@/hooks/useCountryDisease";
import type { WHORecord } from "@/types/who.schema";

global.ResizeObserver = class {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
};

vi.mock("@/hooks/useCountryDisease");

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

const makeRecord = (year: number, value: number): WHORecord => ({
  Id: String(year),
  IndicatorCode: "MALARIA_CASES",
  SpatialDim: "NGA",
  TimeDim: year,
  NumericValue: value,
  Low: null,
  High: null,
});

describe("DiseaseOverviewTab", () => {
  it("renders metric cards when data is available", async () => {
    vi.mocked(hooks.useCountryDiseaseTimeSeries).mockReturnValue({
      data: [makeRecord(2021, 60000000), makeRecord(2022, 68400000)],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof hooks.useCountryDiseaseTimeSeries>);

    render(
      createElement(DiseaseOverviewTab, {
        iso3: "NGA",
        disease: {
          id: "malaria",
          name: "Malaria",
          category: "parasitic",
          whoIndicator: "MALARIA_CASES",
          colour: "disease-parasitic",
          description: "",
        },
        persona: "analyst",
      }),
      { wrapper },
    );

    expect(screen.getByText(/most recent cases/i)).toBeInTheDocument();
    expect(screen.getByText("68.4 Million")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    vi.mocked(hooks.useCountryDiseaseTimeSeries).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof hooks.useCountryDiseaseTimeSeries>);

    render(
      createElement(DiseaseOverviewTab, {
        iso3: "NGA",
        disease: {
          id: "malaria",
          name: "Malaria",
          category: "parasitic",
          whoIndicator: "MALARIA_CASES",
          colour: "disease-parasitic",
          description: "",
        },
        persona: "analyst",
      }),
      { wrapper },
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/disease/DiseaseOverviewTab.test.tsx
```

Expected: FAIL — "Cannot find module './DiseaseOverviewTab'"

- [ ] **Step 3: Create `src/components/disease/DiseaseOverviewTab.tsx`**

```tsx
// src/components/disease/DiseaseOverviewTab.tsx
import { useMemo } from "react";
import { useCountryDiseaseTimeSeries } from "@/hooks/useCountryDisease";
import { usePopulation } from "@/hooks/useWorldBank";
import { DISEASE_COLOURS } from "@/lib/colour-scale";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { MetricCard } from "./MetricCard";
import { EpidemicCurveChart } from "./EpidemicCurveChart";
import type { Disease, Persona } from "@/types/app.types";

interface DiseaseOverviewTabProps {
  iso3: string;
  disease: Disease;
  persona: Persona;
}

export function DiseaseOverviewTab({
  iso3,
  disease,
  persona,
}: DiseaseOverviewTabProps) {
  const { data, isLoading, isError, refetch } = useCountryDiseaseTimeSeries(
    iso3,
    disease.whoIndicator,
  );
  const { data: popData } = usePopulation(iso3.slice(0, 2));

  const latestPop = useMemo(
    () => popData?.find((d) => d.value !== null)?.value ?? null,
    [popData],
  );

  const sorted = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.TimeDim - b.TimeDim),
    [data],
  );

  const latest = sorted.at(-1);
  const previous = sorted.at(-2);

  const chartData = useMemo(
    () =>
      sorted
        .filter((r) => r.NumericValue !== null)
        .map((r) => ({ year: r.TimeDim, value: r.NumericValue as number })),
    [sorted],
  );

  const incidenceRate = useMemo(() => {
    if (!latest?.NumericValue || !latestPop) return null;
    return latest.NumericValue / latestPop;
  }, [latest, latestPop]);

  if (isLoading)
    return (
      <LoadingSkeleton
        label={`Fetching ${disease.name} data for this country...`}
      />
    );
  if (isError)
    return (
      <ErrorState
        message={`Could not load ${disease.name} data.`}
        detail="WHO servers may be temporarily unavailable."
        onRetry={() => void refetch()}
      />
    );

  const colour = DISEASE_COLOURS[disease.category];

  return (
    <div className="flex flex-col gap-4">
      {/* Metric cards grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Most Recent Cases"
          value={latest?.NumericValue ?? null}
          previous={previous?.NumericValue ?? null}
          context={latest ? `Recorded in ${latest.TimeDim}` : ""}
        />
        <MetricCard
          label="Incidence Rate"
          value={incidenceRate}
          unit="per person"
          context="Cases relative to total population"
        />
      </div>

      {/* Epidemic curve */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cases over time
        </h3>
        <EpidemicCurveChart
          data={chartData}
          diseaseName={disease.name}
          colour={colour}
        />
        <p className="mt-1 text-xs text-slate-600">
          Source: WHO Global Health Observatory · Data from{" "}
          {chartData[0]?.year ?? "—"} to {chartData.at(-1)?.year ?? "—"}
        </p>
      </div>

      {/* Epidemiologist-specific section */}
      {(persona === "epidemiologist" || persona === "clinical") && (
        <div className="rounded border border-slate-800 bg-slate-900/40 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Epidemiology Detail
          </h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Extended epidemiological breakdown — age cohort data, seasonality,
            and R-naught curves — will appear here when WHO sub-indicator data
            is available for the selected country.
          </p>
        </div>
      )}

      {/* Policy analyst export */}
      {persona === "analyst" && (
        <button className="w-full rounded border border-slate-700 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100">
          Export data as CSV
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test src/components/disease/DiseaseOverviewTab.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add disease overview tab with metric cards and epidemic curve"
```

---

## Task 4: Epidemic Timeline

**Files:**

- Create: `src/components/timeline/TimelineEvent.tsx`
- Create: `src/components/timeline/EpidemicTimeline.tsx`
- Create: `src/components/disease/DiseaseHistoryTab.tsx`
- Test: `src/components/timeline/EpidemicTimeline.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/timeline/EpidemicTimeline.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EpidemicTimeline } from "./EpidemicTimeline";
import type { LandmarkEvent } from "@/lib/disease-catalogue";

const events: LandmarkEvent[] = [
  {
    year: 2000,
    title: "Roll Back Malaria",
    type: "intervention",
    description: "A global partnership to halve malaria by 2010.",
  },
  {
    year: 2021,
    title: "First vaccine approved",
    type: "milestone",
    description: "RTS,S became the first approved malaria vaccine.",
  },
];

describe("EpidemicTimeline", () => {
  it("renders all event titles", () => {
    render(<EpidemicTimeline events={events} diseaseName="Malaria" />);
    expect(screen.getByText("Roll Back Malaria")).toBeInTheDocument();
    expect(screen.getByText("First vaccine approved")).toBeInTheDocument();
  });

  it("renders the disease name heading", () => {
    render(<EpidemicTimeline events={events} diseaseName="Malaria" />);
    expect(screen.getByText(/malaria/i)).toBeInTheDocument();
  });

  it("renders empty state when no events", () => {
    render(<EpidemicTimeline events={[]} diseaseName="Malaria" />);
    expect(screen.getByText(/no historical events/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/timeline/EpidemicTimeline.test.tsx
```

Expected: FAIL — "Cannot find module './EpidemicTimeline'"

- [ ] **Step 3: Create `src/components/timeline/TimelineEvent.tsx`**

```tsx
// src/components/timeline/TimelineEvent.tsx
import { Zap, Shield, FlaskConical, Flag, AlertTriangle } from "lucide-react";
import type { LandmarkEvent } from "@/lib/disease-catalogue";

interface TimelineEventProps {
  event: LandmarkEvent;
  isLast: boolean;
}

const TYPE_CONFIG = {
  outbreak: {
    Icon: Zap,
    colour: "text-red-400",
    bg: "bg-red-950/40",
    label: "Outbreak",
  },
  intervention: {
    Icon: Shield,
    colour: "text-blue-400",
    bg: "bg-blue-950/40",
    label: "Intervention",
  },
  discovery: {
    Icon: FlaskConical,
    colour: "text-purple-400",
    bg: "bg-purple-950/40",
    label: "Discovery",
  },
  milestone: {
    Icon: Flag,
    colour: "text-green-400",
    bg: "bg-green-950/40",
    label: "Milestone",
  },
  warning: {
    Icon: AlertTriangle,
    colour: "text-amber-400",
    bg: "bg-amber-950/40",
    label: "Warning",
  },
} as const;

export function TimelineEvent({ event, isLast }: TimelineEventProps) {
  const { Icon, colour, bg, label } = TYPE_CONFIG[event.type];

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${bg}`}
        >
          <Icon className={`h-3.5 w-3.5 ${colour}`} aria-hidden="true" />
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-slate-800" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">{event.year}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colour} ${bg}`}
          >
            {label}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-slate-200">
          {event.title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {event.description}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/timeline/EpidemicTimeline.tsx`**

```tsx
// src/components/timeline/EpidemicTimeline.tsx
import { TimelineEvent } from "./TimelineEvent";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LandmarkEvent } from "@/lib/disease-catalogue";

interface EpidemicTimelineProps {
  events: LandmarkEvent[];
  diseaseName: string;
}

export function EpidemicTimeline({
  events,
  diseaseName,
}: EpidemicTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        message={`No historical events recorded for ${diseaseName}.`}
        suggestion="Historical landmark data is available for Malaria, TB, HIV, and COVID-19."
      />
    );
  }

  const sorted = [...events].sort((a, b) => a.year - b.year);

  return (
    <div aria-label={`${diseaseName} historical timeline`}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {diseaseName} — Historical Timeline
      </h3>
      <div className="flex flex-col">
        {sorted.map((event, i) => (
          <TimelineEvent
            key={`${event.year}-${event.title}`}
            event={event}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/disease/DiseaseHistoryTab.tsx`**

```tsx
// src/components/disease/DiseaseHistoryTab.tsx
import { EpidemicTimeline } from "@/components/timeline/EpidemicTimeline";
import { EpidemicCurveChart } from "./EpidemicCurveChart";
import { useCountryDiseaseTimeSeries } from "@/hooks/useCountryDisease";
import { DISEASE_LANDMARKS } from "@/lib/disease-catalogue";
import { DISEASE_COLOURS } from "@/lib/colour-scale";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useMemo } from "react";
import type { Disease } from "@/types/app.types";

interface DiseaseHistoryTabProps {
  iso3: string;
  disease: Disease;
}

export function DiseaseHistoryTab({ iso3, disease }: DiseaseHistoryTabProps) {
  const { data, isLoading } = useCountryDiseaseTimeSeries(
    iso3,
    disease.whoIndicator,
  );

  const chartData = useMemo(
    () =>
      (data ?? [])
        .filter((r) => r.NumericValue !== null)
        .sort((a, b) => a.TimeDim - b.TimeDim)
        .map((r) => ({ year: r.TimeDim, value: r.NumericValue as number })),
    [data],
  );

  const landmarks = DISEASE_LANDMARKS[disease.id] ?? [];

  if (isLoading)
    return (
      <LoadingSkeleton label={`Loading ${disease.name} history...`} rows={5} />
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Full history chart */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cases — full recorded history
        </h3>
        <EpidemicCurveChart
          data={chartData}
          diseaseName={disease.name}
          colour={DISEASE_COLOURS[disease.category]}
        />
      </div>

      {/* Landmark events */}
      <EpidemicTimeline events={landmarks} diseaseName={disease.name} />
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test src/components/timeline/EpidemicTimeline.test.tsx
```

Expected: PASS — 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add epidemic timeline with landmark events and history tab"
```

---

## Task 5: Compare Tab

**Files:**

- Create: `src/components/disease/DiseaseCompareTab.tsx`
- Test: `src/components/disease/DiseaseCompareTab.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/disease/DiseaseCompareTab.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { DiseaseCompareTab } from "./DiseaseCompareTab";
import * as hooks from "@/hooks/useCountryDisease";

vi.mock("@/hooks/useCountryDisease");

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

describe("DiseaseCompareTab", () => {
  it("shows prompt when no compare country is selected", () => {
    render(
      createElement(DiseaseCompareTab, {
        iso3Primary: "NGA",
        iso3Compare: null,
        disease: {
          id: "malaria",
          name: "Malaria",
          category: "parasitic",
          whoIndicator: "MALARIA_CASES",
          colour: "disease-parasitic",
          description: "",
        },
      }),
      { wrapper },
    );
    expect(
      screen.getByText(/right-click a second country/i),
    ).toBeInTheDocument();
  });

  it("renders two country columns when compare country is set", () => {
    vi.mocked(hooks.useCountryDisease).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof hooks.useCountryDisease>);

    render(
      createElement(DiseaseCompareTab, {
        iso3Primary: "NGA",
        iso3Compare: "IND",
        disease: {
          id: "malaria",
          name: "Malaria",
          category: "parasitic",
          whoIndicator: "MALARIA_CASES",
          colour: "disease-parasitic",
          description: "",
        },
      }),
      { wrapper },
    );
    expect(screen.getByText("NGA")).toBeInTheDocument();
    expect(screen.getByText("IND")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/disease/DiseaseCompareTab.test.tsx
```

Expected: FAIL — "Cannot find module './DiseaseCompareTab'"

- [ ] **Step 3: Create `src/components/disease/DiseaseCompareTab.tsx`**

```tsx
// src/components/disease/DiseaseCompareTab.tsx
import { useMemo } from "react";
import { MapPin } from "lucide-react";
import {
  useCountryDisease,
  useCountryDiseaseTimeSeries,
} from "@/hooks/useCountryDisease";
import { formatCount, getTrendDirection } from "@/lib/format";
import { DISEASE_COLOURS } from "@/lib/colour-scale";
import { EpidemicCurveChart } from "./EpidemicCurveChart";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Disease } from "@/types/app.types";

interface DiseaseCompareTabProps {
  iso3Primary: string;
  iso3Compare: string | null;
  disease: Disease;
}

function CountryColumn({ iso3, disease }: { iso3: string; disease: Disease }) {
  const { data } = useCountryDisease(iso3, disease.whoIndicator);
  const { data: series } = useCountryDiseaseTimeSeries(
    iso3,
    disease.whoIndicator,
  );

  const latest = data?.sort((a, b) => b.TimeDim - a.TimeDim)[0];
  const previous = data?.sort((a, b) => b.TimeDim - a.TimeDim)[1];

  const trend =
    latest?.NumericValue && previous?.NumericValue
      ? getTrendDirection(previous.NumericValue, latest.NumericValue)
      : null;

  const chartData = useMemo(
    () =>
      (series ?? [])
        .filter((r) => r.NumericValue !== null)
        .sort((a, b) => a.TimeDim - b.TimeDim)
        .map((r) => ({ year: r.TimeDim, value: r.NumericValue as number })),
    [series],
  );

  return (
    <div className="flex-1 rounded border border-slate-800 bg-slate-900/40 p-3">
      <p className="mb-2 text-xs font-bold text-slate-300">{iso3}</p>
      <p className="text-lg font-bold text-slate-100">
        {formatCount(latest?.NumericValue ?? null)}
      </p>
      {trend && (
        <p
          className={`mt-0.5 text-xs ${trend === "increasing" ? "text-red-400" : trend === "decreasing" ? "text-green-400" : "text-slate-500"}`}
        >
          {trend === "increasing"
            ? "Increasing"
            : trend === "decreasing"
              ? "Decreasing"
              : "Stable"}
        </p>
      )}
      <div className="mt-3">
        <EpidemicCurveChart
          data={chartData}
          diseaseName={iso3}
          colour={DISEASE_COLOURS[disease.category]}
        />
      </div>
    </div>
  );
}

export function DiseaseCompareTab({
  iso3Primary,
  iso3Compare,
  disease,
}: DiseaseCompareTabProps) {
  if (!iso3Compare) {
    return (
      <EmptyState
        message="No comparison country selected."
        suggestion="Right-click a second country on the globe to compare it with the current selection."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3 w-3" aria-hidden="true" />
        Comparing {disease.name} burden
      </div>
      <div className="flex gap-2">
        <CountryColumn iso3={iso3Primary} disease={disease} />
        <CountryColumn iso3={iso3Compare} disease={disease} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test src/components/disease/DiseaseCompareTab.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add disease compare tab with side-by-side country columns"
```

---

## Task 6: Drugs Tab + Disease Panel Root

**Files:**

- Create: `src/components/disease/DiseaseDrugsTab.tsx`
- Create: `src/components/disease/DiseasePanel.tsx`
- Test: `src/components/disease/DiseasePanel.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/disease/DiseasePanel.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createElement } from "react";
import { DiseasePanel } from "./DiseasePanel";

vi.mock("@/hooks/useCountryDisease", () => ({
  useCountryDisease: () => ({ data: [], isLoading: false, isError: false }),
  useCountryDiseaseTimeSeries: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useGlobalDisease: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@/hooks/useWorldBank", () => ({
  usePopulation: () => ({ data: [] }),
  useHospitalBeds: () => ({ data: [] }),
}));

global.ResizeObserver = class {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
};

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

describe("DiseasePanel", () => {
  it("renders the four tab buttons", () => {
    render(
      createElement(DiseasePanel, {
        iso3: "NGA",
        disease: {
          id: "malaria",
          name: "Malaria",
          category: "parasitic",
          whoIndicator: "MALARIA_CASES",
          colour: "disease-parasitic",
          description: "",
        },
      }),
      { wrapper },
    );
    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /compare/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /drugs/i })).toBeInTheDocument();
  });

  it("switches to history tab on click", async () => {
    const user = userEvent.setup();
    render(
      createElement(DiseasePanel, {
        iso3: "NGA",
        disease: {
          id: "malaria",
          name: "Malaria",
          category: "parasitic",
          whoIndicator: "MALARIA_CASES",
          colour: "disease-parasitic",
          description: "",
        },
      }),
      { wrapper },
    );
    await user.click(screen.getByRole("tab", { name: /history/i }));
    expect(screen.getByRole("tab", { name: /history/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/disease/DiseasePanel.test.tsx
```

Expected: FAIL — "Cannot find module './DiseasePanel'"

- [ ] **Step 3: Create `src/components/disease/DiseaseDrugsTab.tsx`**

```tsx
// src/components/disease/DiseaseDrugsTab.tsx
import { useNavigate } from "react-router-dom";
import { Pill, ChevronRight } from "lucide-react";
import type { Disease } from "@/types/app.types";

// Curated first-line treatment drugs per disease
const DISEASE_DRUGS: Record<
  string,
  { name: string; role: string; pubchemId: number }[]
> = {
  malaria: [
    {
      name: "Artemisinin",
      role: "First-line treatment (ACT component)",
      pubchemId: 68827,
    },
    {
      name: "Chloroquine",
      role: "Historical first-line (now largely resistant)",
      pubchemId: 2719,
    },
    {
      name: "Quinine",
      role: "Severe malaria — IV treatment",
      pubchemId: 3034034,
    },
  ],
  tuberculosis: [
    { name: "Isoniazid", role: "First-line TB drug", pubchemId: 3767 },
    { name: "Rifampicin", role: "First-line TB drug", pubchemId: 5360416 },
    { name: "Pyrazinamide", role: "First-line TB drug", pubchemId: 1046 },
  ],
  hiv: [
    {
      name: "Tenofovir",
      role: "Antiretroviral — first-line",
      pubchemId: 464205,
    },
    {
      name: "Efavirenz",
      role: "Antiretroviral — first-line",
      pubchemId: 64139,
    },
    {
      name: "Dolutegravir",
      role: "Antiretroviral — preferred",
      pubchemId: 54726191,
    },
  ],
  covid19: [
    {
      name: "Dexamethasone",
      role: "Reduces mortality in severe cases",
      pubchemId: 5743,
    },
    {
      name: "Remdesivir",
      role: "Antiviral — hospitalised patients",
      pubchemId: 121304016,
    },
    {
      name: "Nirmatrelvir",
      role: "Oral antiviral — early treatment",
      pubchemId: 145996610,
    },
  ],
};

interface DiseaseDrugsTabProps {
  disease: Disease;
}

export function DiseaseDrugsTab({ disease }: DiseaseDrugsTabProps) {
  const navigate = useNavigate();
  const drugs = DISEASE_DRUGS[disease.id] ?? [];

  if (drugs.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No curated drug data available for {disease.name} yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-slate-400">
        The drugs below are used to treat {disease.name}. Click any drug to open
        the full molecular visualizer with 3D structure, mechanism of action,
        and drug interaction warnings.
      </p>
      <ul className="flex flex-col gap-2" role="list">
        {drugs.map((drug) => (
          <li key={drug.name}>
            <button
              onClick={() => navigate(`/drug/${drug.pubchemId}`)}
              className="flex w-full items-center justify-between rounded border border-slate-800 bg-slate-900/60 p-3 text-left hover:border-blue-700 hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label={`Open ${drug.name} drug visualizer`}
            >
              <div className="flex items-center gap-2">
                <Pill
                  className="h-4 w-4 flex-shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {drug.name}
                  </p>
                  <p className="text-xs text-slate-500">{drug.role}</p>
                </div>
              </div>
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-600"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/disease/DiseasePanel.tsx`**

```tsx
// src/components/disease/DiseasePanel.tsx
import { useState } from "react";
import { useAppStore } from "@/stores/app.store";
import { RightPanel } from "@/components/layout/RightPanel";
import { DiseaseOverviewTab } from "./DiseaseOverviewTab";
import { DiseaseHistoryTab } from "./DiseaseHistoryTab";
import { DiseaseCompareTab } from "./DiseaseCompareTab";
import { DiseaseDrugsTab } from "./DiseaseDrugsTab";
import type { Disease } from "@/types/app.types";

type Tab = "overview" | "history" | "compare" | "drugs";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "history", label: "History" },
  { id: "compare", label: "Compare" },
  { id: "drugs", label: "Drugs" },
];

interface DiseasePanelProps {
  iso3: string;
  disease: Disease;
}

export function DiseasePanel({ iso3, disease }: DiseasePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { persona, compareCountry } = useAppStore();

  return (
    <RightPanel
      title={disease.name}
      subtitle={`${iso3} · ${disease.description}`}
    >
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Disease information sections"
        className="-mt-2 mb-4 flex gap-1 border-b border-slate-800 pb-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-200",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "overview" && (
          <DiseaseOverviewTab iso3={iso3} disease={disease} persona={persona} />
        )}
        {activeTab === "history" && (
          <DiseaseHistoryTab iso3={iso3} disease={disease} />
        )}
        {activeTab === "compare" && (
          <DiseaseCompareTab
            iso3Primary={iso3}
            iso3Compare={compareCountry}
            disease={disease}
          />
        )}
        {activeTab === "drugs" && <DiseaseDrugsTab disease={disease} />}
      </div>
    </RightPanel>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/components/disease/DiseasePanel.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Run full test suite**

```bash
pnpm test
```

Expected: all tests across all plans pass.

- [ ] **Step 7: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add disease panel with four tabs — overview, history, compare, drugs"
```

---

## Summary

Plan 3 complete. After executing this plan you will have:

- `MetricCard` — every stat with formatted value, trend badge, and plain-English context
- `TrendBadge` — icon + colour + text label (never colour alone)
- `EpidemicCurveChart` — Recharts area chart with accessible container and custom tooltip
- `DiseaseOverviewTab` — persona-aware metric cards, epidemic curve, export button for analysts
- `DiseaseHistoryTab` — full history chart + vertical landmark event timeline
- `EpidemicTimeline` — icon-coded events (outbreak/intervention/discovery/milestone/warning)
- `DiseaseCompareTab` — side-by-side country columns with shared disease data
- `DiseaseDrugsTab` — curated drug cards linking to the Drug Visualizer (Plan 4)
- `DiseasePanel` — accessible tabbed root component wired to the Zustand store
- All tests passing, typecheck clean

**Next:** Plan 4 — Drug Visualizer (3D molecule, 2D structure, Plain English block, clinical intelligence tabs)
