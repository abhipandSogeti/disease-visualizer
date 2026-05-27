# Disease Visualizer — Plan 4: Drug Visualizer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full-screen drug visualizer — a 3D rotating molecule viewer, a 2D structural diagram, a mandatory Plain English block, and a four-tab clinical intelligence panel (Overview, Mechanism, Efficacy, Interactions). Every technical term has a plain-English companion. Non-experts can understand every screen without prior medical knowledge.

**Architecture:** `DrugPage` (lazy-loaded route `/drug/:pubchemId`) renders a split layout: molecule viewers on the left, `DrugIntelligencePanel` on the right. The `MoleculeViewer3D` loads 3Dmol.js dynamically via a `useEffect` to avoid SSR and bundle-size issues. The `MoleculeViewer2D` renders the PubChem PNG directly. Both viewers are wrapped in `React.Suspense`. All drug data comes from Plan 1 hooks: `useDrugMolecule`, `useDrugLabel`, `useDrugInteractions`, `useDrugTargets`, `useAdverseEvents`.

**Tech Stack:** 3Dmol.js (dynamic import), PubChem PNG API, Recharts, Lucide React, TanStack Query (Plan 1 hooks), React Aria, Tailwind CSS

**Prerequisite:** Plans 1, 2, and 3 must be complete before starting this plan.

---

## File Map

```
src/
├── components/
│   └── drug/
│       ├── PlainEnglishBlock.tsx       # Collapsible plain-English drug summary (mandatory first)
│       ├── MoleculeViewer3D.tsx        # 3Dmol.js WebGL rotating molecule
│       ├── MoleculeViewer2D.tsx        # PubChem PNG structural diagram
│       ├── DrugIntelligencePanel.tsx   # Tabbed panel root (Overview/Mechanism/Efficacy/Interactions)
│       ├── DrugOverviewTab.tsx         # Name, class, formula, approval, plain description
│       ├── DrugMechanismTab.tsx        # Step-by-step mechanism + ChEMBL protein targets
│       ├── DrugEfficacyTab.tsx         # Cure rate bars + resistance timeline
│       ├── DrugInteractionsTab.tsx     # RxNorm interactions grouped by severity
│       └── AdverseEventsPanel.tsx      # OpenFDA adverse event bar chart
├── pages/
│   └── DrugPage.tsx                    # Full-screen route — replaces Plan 2 placeholder
└── lib/
    └── drug-intelligence.ts            # Curated mechanism steps + efficacy data per drug
```

---

## Task 1: Drug Intelligence Catalogue

**Files:**

- Create: `src/lib/drug-intelligence.ts`
- Test: `src/lib/drug-intelligence.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/drug-intelligence.test.ts
import { describe, it, expect } from "vitest";
import {
  getDrugPlainEnglish,
  getDrugMechanismSteps,
  getDrugEfficacyData,
  DRUG_INTELLIGENCE,
} from "./drug-intelligence";

describe("getDrugPlainEnglish", () => {
  it("returns plain English for artemisinin", () => {
    const text = getDrugPlainEnglish("artemisinin");
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(50);
  });

  it("returns a fallback for unknown drugs", () => {
    const text = getDrugPlainEnglish("unknownxyz");
    expect(text).toContain("a medicine");
  });
});

describe("getDrugMechanismSteps", () => {
  it("returns at least 2 steps for artemisinin", () => {
    const steps = getDrugMechanismSteps("artemisinin");
    expect(steps.length).toBeGreaterThanOrEqual(2);
    steps.forEach((s) => {
      expect(s).toHaveProperty("step");
      expect(s).toHaveProperty("title");
      expect(s).toHaveProperty("description");
      expect(s).toHaveProperty("icon");
    });
  });
});

describe("getDrugEfficacyData", () => {
  it("returns efficacy entries for artemisinin", () => {
    const data = getDrugEfficacyData("artemisinin");
    expect(data.length).toBeGreaterThan(0);
    data.forEach((d) => {
      expect(d).toHaveProperty("condition");
      expect(d).toHaveProperty("efficacyPercent");
      expect(d.efficacyPercent).toBeGreaterThan(0);
      expect(d.efficacyPercent).toBeLessThanOrEqual(100);
    });
  });
});

describe("DRUG_INTELLIGENCE", () => {
  it("has entries for all key malaria drugs", () => {
    expect(DRUG_INTELLIGENCE["artemisinin"]).toBeDefined();
    expect(DRUG_INTELLIGENCE["chloroquine"]).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/lib/drug-intelligence.test.ts
```

Expected: FAIL — "Cannot find module './drug-intelligence'"

- [ ] **Step 3: Create `src/lib/drug-intelligence.ts`**

```ts
// src/lib/drug-intelligence.ts

export interface MechanismStep {
  step: number;
  title: string;
  description: string;
  icon: "activity" | "zap" | "shield" | "flask" | "target" | "heart";
}

export interface EfficacyEntry {
  condition: string;
  efficacyPercent: number;
  note: string;
}

export interface DrugIntelligence {
  plainEnglish: string;
  mechanismSteps: MechanismStep[];
  efficacyData: EfficacyEntry[];
  resistanceNote: string;
  combinationNote: string;
}

export const DRUG_INTELLIGENCE: Record<string, DrugIntelligence> = {
  artemisinin: {
    plainEnglish: `Artemisinin is a medicine used to treat malaria — a disease spread by infected mosquito bites. It comes from a plant called Sweet Wormwood, which traditional Chinese doctors used for over 2,000 years to treat fevers. When you take artemisinin, it travels through your bloodstream, finds the malaria parasite hiding inside your red blood cells, and destroys it within 48 hours. It is the most effective malaria treatment in the world today and is recommended by the WHO as a first-line therapy.`,
    mechanismSteps: [
      {
        step: 1,
        title: "Enters the bloodstream",
        description:
          "Artemisinin is absorbed from the gut within 1–2 hours of taking an oral dose and travels through the blood to infected red blood cells.",
        icon: "activity",
      },
      {
        step: 2,
        title: "Activated by iron",
        description:
          "The malaria parasite (Plasmodium) contains high levels of iron-rich heme. Artemisinin reacts with this iron to produce highly reactive molecules called free radicals.",
        icon: "zap",
      },
      {
        step: 3,
        title: "Parasite membrane destroyed",
        description:
          "The free radicals damage the parasite's cell membrane and internal proteins, killing it within 48 hours before it can reproduce.",
        icon: "shield",
      },
    ],
    efficacyData: [
      {
        condition: "Uncomplicated malaria",
        efficacyPercent: 97,
        note: "When taken as a complete ACT course",
      },
      {
        condition: "Severe malaria",
        efficacyPercent: 89,
        note: "IV artesunate in hospital settings",
      },
      {
        condition: "Drug-resistant strains",
        efficacyPercent: 71,
        note: "Partial resistance in South-East Asia",
      },
    ],
    resistanceNote:
      "Partial resistance to artemisinin was first detected in Cambodia in 2008 and has since spread to 12 countries in South-East Asia. Resistance does not yet mean treatment failure — combination therapy (ACT) still works in most cases.",
    combinationNote:
      "Artemisinin is always used in combination with a partner drug (ACT — Artemisinin Combination Therapy) such as lumefantrine or amodiaquine. Using it alone accelerates resistance.",
  },

  chloroquine: {
    plainEnglish: `Chloroquine was the main malaria treatment for decades from the 1940s to the 1980s. It is a cheap, easy-to-produce pill that works by interfering with how the malaria parasite digests blood. Unfortunately, the parasite evolved to resist chloroquine in most parts of the world, making it largely ineffective today. It is still used in a few regions where resistance has not yet appeared, and also for other conditions like rheumatoid arthritis and lupus.`,
    mechanismSteps: [
      {
        step: 1,
        title: "Enters infected red blood cells",
        description:
          "Chloroquine is absorbed into red blood cells, where it concentrates inside the malaria parasite's digestive compartment (the food vacuole).",
        icon: "activity",
      },
      {
        step: 2,
        title: "Blocks heme detoxification",
        description:
          "The parasite digests haemoglobin from red blood cells, producing toxic heme as a by-product. Chloroquine prevents the parasite from neutralising this heme.",
        icon: "flask",
      },
      {
        step: 3,
        title: "Parasite poisoned",
        description:
          "Toxic heme accumulates inside the parasite and destroys its membranes, killing it.",
        icon: "shield",
      },
    ],
    efficacyData: [
      {
        condition: "Chloroquine-sensitive malaria",
        efficacyPercent: 95,
        note: "Central America, Caribbean, Middle East",
      },
      {
        condition: "Chloroquine-resistant malaria",
        efficacyPercent: 12,
        note: "Most of Africa, Asia, South America",
      },
    ],
    resistanceNote:
      "Chloroquine resistance emerged in the late 1950s in South-East Asia and spread globally by the 1980s. A single mutation in the PfCRT protein allows the parasite to pump chloroquine out before it can act.",
    combinationNote:
      "No longer recommended as a combination therapy for malaria in most regions. Still used alone for malaria prevention in the few resistant-free areas.",
  },

  isoniazid: {
    plainEnglish: `Isoniazid is one of the oldest and most important tuberculosis (TB) drugs, used since the 1950s. TB is a bacterial infection that mainly attacks the lungs, causing coughing, weight loss, and fatigue. Isoniazid works by stopping TB bacteria from building their protective outer coat. Without this coat, the bacteria cannot survive and die off. It is almost always used alongside other TB drugs for 6 months to ensure all bacteria are eliminated and resistance does not develop.`,
    mechanismSteps: [
      {
        step: 1,
        title: "Activated inside the bacteria",
        description:
          "Isoniazid is a prodrug — it is inactive until it is converted to its active form by an enzyme called KatG inside the TB bacterium.",
        icon: "flask",
      },
      {
        step: 2,
        title: "Blocks cell wall production",
        description:
          "The active form of isoniazid inhibits an enzyme called InhA, which is essential for producing mycolic acids — the key building blocks of the TB bacterium's thick outer wall.",
        icon: "target",
      },
      {
        step: 3,
        title: "Bacteria loses its protective coat",
        description:
          "Without mycolic acids, the TB bacterium cannot maintain its cell wall and dies. Isoniazid is particularly effective against actively dividing bacteria.",
        icon: "shield",
      },
    ],
    efficacyData: [
      {
        condition: "Drug-sensitive TB (6-month course)",
        efficacyPercent: 95,
        note: "When used in combination with rifampicin, pyrazinamide, ethambutol",
      },
      {
        condition: "Latent TB prevention",
        efficacyPercent: 90,
        note: "6–9 month preventive therapy in high-risk individuals",
      },
      {
        condition: "Isoniazid-resistant TB",
        efficacyPercent: 15,
        note: "Requires alternative drug regimens",
      },
    ],
    resistanceNote:
      "Resistance to isoniazid is caused by mutations in the KatG gene, which prevent activation of the drug. It affects approximately 10% of TB cases globally.",
    combinationNote:
      "Always used in combination — the standard TB regimen is HRZE (Isoniazid + Rifampicin + Pyrazinamide + Ethambutol) for the first 2 months, then HR for 4 more months.",
  },

  tenofovir: {
    plainEnglish: `Tenofovir is an antiretroviral medicine — a type of drug that fights HIV, the virus that causes AIDS. HIV attacks your immune system, specifically the white blood cells that help your body fight infections. Without treatment, HIV destroys so many of these cells that the immune system can no longer protect the body, leading to AIDS. Tenofovir works by blocking the virus from copying itself inside your cells. It does not cure HIV, but it keeps the viral load so low that people with HIV can live long, healthy lives and cannot transmit the virus to others.`,
    mechanismSteps: [
      {
        step: 1,
        title: "Absorbed and activated",
        description:
          "Tenofovir disoproxil fumarate (TDF) is absorbed from the gut and converted to its active form, tenofovir diphosphate, inside cells.",
        icon: "activity",
      },
      {
        step: 2,
        title: "Blocks reverse transcriptase",
        description:
          "HIV needs an enzyme called reverse transcriptase to convert its RNA into DNA inside human cells. Tenofovir diphosphate mimics a natural building block of DNA, fooling reverse transcriptase into incorporating it.",
        icon: "target",
      },
      {
        step: 3,
        title: "Viral replication halted",
        description:
          "When tenofovir is incorporated into the growing DNA chain, it acts as a chain terminator — the DNA cannot be extended further, and the virus cannot replicate.",
        icon: "shield",
      },
    ],
    efficacyData: [
      {
        condition: "HIV viral suppression (with combination ART)",
        efficacyPercent: 95,
        note: "Undetectable viral load after 48 weeks",
      },
      {
        condition: "HIV prevention (PrEP)",
        efficacyPercent: 99,
        note: "Daily oral PrEP in high-adherence users",
      },
      {
        condition: "HIV prevention (PrEP, lower adherence)",
        efficacyPercent: 74,
        note: "Real-world effectiveness with missed doses",
      },
    ],
    resistanceNote:
      "Resistance to tenofovir requires the K65R mutation in reverse transcriptase, which is uncommon when taken as directed. Resistance is far less likely than with older antiretrovirals.",
    combinationNote:
      "Tenofovir is always used as part of a combination ART regimen — typically with emtricitabine and a third agent. Single-drug HIV therapy is never recommended.",
  },

  dexamethasone: {
    plainEnglish: `Dexamethasone is a powerful steroid medicine — the same type of drug your body produces naturally to control inflammation. In severe COVID-19, the immune system sometimes overreacts and causes widespread inflammation in the lungs, which can be more dangerous than the virus itself. Dexamethasone calms this overreaction. A landmark clinical trial (the RECOVERY trial, 2020) proved it reduces deaths in patients on oxygen or ventilators by up to a third — making it the first drug proven to save lives in COVID-19.`,
    mechanismSteps: [
      {
        step: 1,
        title: "Enters cells and binds to receptors",
        description:
          "Dexamethasone crosses cell membranes easily and binds to glucocorticoid receptors inside immune cells throughout the body.",
        icon: "activity",
      },
      {
        step: 2,
        title: "Suppresses inflammatory signals",
        description:
          'The drug-receptor complex moves into the cell nucleus and switches off genes that produce pro-inflammatory cytokines — the signalling proteins that drive the dangerous "cytokine storm" seen in severe COVID-19.',
        icon: "target",
      },
      {
        step: 3,
        title: "Inflammation reduced, oxygen improves",
        description:
          "With fewer inflammatory signals, the lung inflammation subsides, oxygen levels improve, and the patient is less likely to need a ventilator or die.",
        icon: "heart",
      },
    ],
    efficacyData: [
      {
        condition: "Severe COVID-19 (on ventilator)",
        efficacyPercent: 36,
        note: "Reduction in mortality — RECOVERY trial 2020",
      },
      {
        condition: "Severe COVID-19 (on oxygen)",
        efficacyPercent: 20,
        note: "Reduction in mortality — RECOVERY trial 2020",
      },
      {
        condition: "Mild COVID-19 (no oxygen)",
        efficacyPercent: 0,
        note: "No benefit — may be harmful in mild cases",
      },
    ],
    resistanceNote:
      "Viruses do not develop resistance to dexamethasone because it targets the human immune response, not the virus itself.",
    combinationNote:
      "Used alongside antivirals (remdesivir, nirmatrelvir) in hospitalised patients. Only recommended when the patient requires supplemental oxygen — harmful if given to patients who do not need oxygen.",
  },
};

export function getDrugPlainEnglish(drugName: string): string {
  const key = drugName.toLowerCase();
  const entry = DRUG_INTELLIGENCE[key];
  if (entry) return entry.plainEnglish;
  return `This is a medicine used to treat or prevent a specific disease. Click the Overview tab for detailed clinical information sourced from the FDA and WHO databases.`;
}

export function getDrugMechanismSteps(drugName: string): MechanismStep[] {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.mechanismSteps ?? [];
}

export function getDrugEfficacyData(drugName: string): EfficacyEntry[] {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.efficacyData ?? [];
}

export function getDrugResistanceNote(drugName: string): string {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.resistanceNote ?? "";
}

export function getDrugCombinationNote(drugName: string): string {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.combinationNote ?? "";
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test src/lib/drug-intelligence.test.ts
```

Expected: PASS — all tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add curated drug intelligence catalogue with plain english, mechanism, efficacy"
```

---

## Task 2: Plain English Block + Molecule Viewers

**Files:**

- Create: `src/components/drug/PlainEnglishBlock.tsx`
- Create: `src/components/drug/MoleculeViewer2D.tsx`
- Create: `src/components/drug/MoleculeViewer3D.tsx`
- Test: `src/components/drug/PlainEnglishBlock.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/drug/PlainEnglishBlock.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlainEnglishBlock } from "./PlainEnglishBlock";

describe("PlainEnglishBlock", () => {
  it("renders the heading", () => {
    render(
      <PlainEnglishBlock
        drugName="Artemisinin"
        text="Artemisinin is a medicine used to treat malaria."
      />,
    );
    expect(screen.getByText(/what is artemisinin/i)).toBeInTheDocument();
  });

  it("renders the plain-english text", () => {
    render(
      <PlainEnglishBlock
        drugName="Artemisinin"
        text="Artemisinin is a medicine used to treat malaria."
      />,
    );
    expect(
      screen.getByText(/artemisinin is a medicine used to treat malaria/i),
    ).toBeInTheDocument();
  });

  it("can be collapsed after reading", async () => {
    const user = userEvent.setup();
    render(
      <PlainEnglishBlock
        drugName="Artemisinin"
        text="Artemisinin is a medicine used to treat malaria."
      />,
    );
    const toggle = screen.getByRole("button", { name: /collapse/i });
    await user.click(toggle);
    expect(
      screen.queryByText(/artemisinin is a medicine used to treat malaria/i),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/drug/PlainEnglishBlock.test.tsx
```

Expected: FAIL — "Cannot find module './PlainEnglishBlock'"

- [ ] **Step 3: Create `src/components/drug/PlainEnglishBlock.tsx`**

```tsx
// src/components/drug/PlainEnglishBlock.tsx
import { useState } from "react";
import { BookOpen, ChevronUp, ChevronDown } from "lucide-react";

interface PlainEnglishBlockProps {
  drugName: string;
  text: string;
}

export function PlainEnglishBlock({ drugName, text }: PlainEnglishBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded border border-blue-900/50 bg-blue-950/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-blue-300">
            What is {drugName} — in plain English
          </h2>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={
            collapsed
              ? `Expand plain English explanation`
              : `Collapse plain English explanation`
          }
          className="rounded p-1 text-blue-500 hover:bg-blue-900/30 hover:text-blue-300"
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {!collapsed && (
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{text}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/drug/MoleculeViewer2D.tsx`**

```tsx
// src/components/drug/MoleculeViewer2D.tsx
import { useState } from "react";
import { Download, Info } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { get2DImageUrl } from "@/services/pubchem.service";

interface MoleculeViewer2DProps {
  cid: number | null;
  drugName: string;
}

export function MoleculeViewer2D({ cid, drugName }: MoleculeViewer2DProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!cid) {
    return (
      <EmptyState
        message="2D structure not available."
        suggestion="PubChem does not have a 2D structure for this compound."
      />
    );
  }

  const imageUrl = get2DImageUrl(cid, 300);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          2D Structure
        </span>
        <a
          href={imageUrl}
          download={`${drugName}-2d.png`}
          aria-label={`Download 2D structure of ${drugName}`}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300"
        >
          <Download className="h-3 w-3" aria-hidden="true" />
          Download
        </a>
      </div>

      <div className="relative flex items-center justify-center rounded border border-slate-800 bg-white p-2">
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-slate-900">
            <LoadingSkeleton label="Loading 2D structure..." rows={2} />
          </div>
        )}
        {errored ? (
          <EmptyState
            message="Could not load 2D structure image."
            suggestion="PubChem may be temporarily unavailable."
          />
        ) : (
          <img
            src={imageUrl}
            alt={`2D chemical structure of ${drugName}`}
            className="h-36 w-36 object-contain"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
      </div>

      <div className="flex items-start gap-1.5 rounded bg-slate-900/40 p-2">
        <Info
          className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-600"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-slate-600">
          This is a flat map of the molecule — like a floor plan of its chemical
          structure. Each letter represents an atom; lines represent the bonds
          holding atoms together.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/drug/MoleculeViewer3D.tsx`**

```tsx
// src/components/drug/MoleculeViewer3D.tsx
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Download, Info } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { get3DStructureUrl } from "@/services/pubchem.service";

interface MoleculeViewer3DProps {
  cid: number | null;
  drugName: string;
}

type ViewStyle = "stick" | "sphere" | "line";

export function MoleculeViewer3D({ cid, drugName }: MoleculeViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{
    clear: () => void;
    spin: (axis: string, speed: number) => void;
    render: () => void;
    setStyle: (sel: object, style: object) => void;
    addModel: (data: string, fmt: string) => void;
    zoomTo: () => void;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [viewStyle, setViewStyle] = useState<ViewStyle>("stick");
  const [spinning, setSpinning] = useState(true);

  const styleMap: Record<ViewStyle, object> = {
    stick: { stick: {} },
    sphere: { sphere: { radius: 0.5 } },
    line: { line: {} },
  };

  useEffect(() => {
    if (!cid || !containerRef.current) return;

    let cancelled = false;

    async function loadViewer() {
      try {
        // 3Dmol.js loaded dynamically — keeps it out of the main bundle
        const $3Dmol = (await import("3dmol")) as {
          createViewer: (
            el: HTMLElement,
            opts: object,
          ) => typeof viewerRef.current;
        };
        if (cancelled || !containerRef.current) return;

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#020817",
          antialias: true,
        });
        viewerRef.current = viewer;

        const sdfUrl = get3DStructureUrl(cid!);
        const res = await fetch(sdfUrl);
        if (!res.ok) throw new Error(`PubChem 3D fetch failed: ${res.status}`);
        const sdfData = await res.text();
        if (cancelled) return;

        viewer.addModel(sdfData, "sdf");
        viewer.setStyle({}, styleMap[viewStyle]);
        viewer.zoomTo();
        if (spinning) viewer.spin("y", 1);
        viewer.render();
        setLoading(false);
      } catch {
        if (!cancelled) setErrored(true);
      }
    }

    void loadViewer();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  useEffect(() => {
    if (!viewerRef.current) return;
    viewerRef.current.setStyle({}, styleMap[viewStyle]);
    viewerRef.current.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStyle]);

  useEffect(() => {
    if (!viewerRef.current) return;
    viewerRef.current.spin("y", spinning ? 1 : 0);
  }, [spinning]);

  const resetView = () => {
    if (!viewerRef.current) return;
    viewerRef.current.clear();
    setLoading(true);
    setErrored(false);
  };

  if (!cid) {
    return (
      <EmptyState
        message="3D structure not available."
        suggestion="PubChem does not have a 3D conformer for this compound."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          3D Molecule
        </span>
        <div className="flex items-center gap-1">
          {(["stick", "sphere", "line"] as ViewStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setViewStyle(s)}
              aria-pressed={viewStyle === s}
              className={[
                "rounded px-2 py-0.5 text-xs transition-colors",
                viewStyle === s
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-300",
              ].join(" ")}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setSpinning((s) => !s)}
            aria-pressed={spinning}
            aria-label={spinning ? "Stop rotation" : "Start rotation"}
            className="ml-1 rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <a
            href={get3DStructureUrl(cid)}
            download={`${drugName}-3d.sdf`}
            aria-label={`Download 3D structure of ${drugName}`}
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <button
            onClick={resetView}
            aria-label="Reset 3D viewer"
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative h-52 w-full overflow-hidden rounded border border-slate-800 bg-navy-950">
        {loading && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSkeleton label="Loading 3D molecule..." rows={1} />
          </div>
        )}
        {errored ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              message="Could not load 3D molecule."
              suggestion="PubChem 3D conformer may not be available for this compound."
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            className="h-full w-full"
            aria-label={`3D molecular model of ${drugName}`}
          />
        )}
      </div>

      <div className="flex items-start gap-1.5 rounded bg-slate-900/40 p-2">
        <Info
          className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-600"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-slate-600">
          Each sphere is an atom. Sticks connecting them are chemical bonds —
          the forces holding the molecule together. Colours follow the CPK
          standard: grey = carbon, red = oxygen, blue = nitrogen, white =
          hydrogen.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test src/components/drug/PlainEnglishBlock.test.tsx
```

Expected: PASS — 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add plain english block, 2d and 3d molecule viewers"
```

---

## Task 3: Drug Overview + Mechanism Tabs

**Files:**

- Create: `src/components/drug/DrugOverviewTab.tsx`
- Create: `src/components/drug/DrugMechanismTab.tsx`
- Test: `src/components/drug/DrugOverviewTab.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/drug/DrugOverviewTab.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { DrugOverviewTab } from "./DrugOverviewTab";
import * as labelHook from "@/hooks/useDrugLabel";
import * as moleculeHook from "@/hooks/useDrugMolecule";

vi.mock("@/hooks/useDrugLabel");
vi.mock("@/hooks/useDrugMolecule");

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

describe("DrugOverviewTab", () => {
  it("renders drug name heading", () => {
    vi.mocked(labelHook.useDrugLabel).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof labelHook.useDrugLabel>);
    vi.mocked(moleculeHook.useDrugMolecule).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof moleculeHook.useDrugMolecule>);

    render(
      createElement(DrugOverviewTab, {
        drugName: "Artemisinin",
        pubchemId: 68827,
      }),
      { wrapper },
    );
    expect(screen.getByText("Artemisinin")).toBeInTheDocument();
  });

  it("renders molecular formula when molecule data available", () => {
    vi.mocked(labelHook.useDrugLabel).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof labelHook.useDrugLabel>);
    vi.mocked(moleculeHook.useDrugMolecule).mockReturnValue({
      data: {
        cid: 68827,
        molecularFormula: "C15H22O5",
        molecularWeight: "282.33",
        isomericSmiles: "CC1CCC2CC(=O)OC3OC1(C)C23",
        iupacName: "artemisinin",
        inchiKey: "ABC123",
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof moleculeHook.useDrugMolecule>);

    render(
      createElement(DrugOverviewTab, {
        drugName: "Artemisinin",
        pubchemId: 68827,
      }),
      { wrapper },
    );
    expect(screen.getByText("C15H22O5")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/drug/DrugOverviewTab.test.tsx
```

Expected: FAIL — "Cannot find module './DrugOverviewTab'"

- [ ] **Step 3: Create `src/components/drug/DrugOverviewTab.tsx`**

```tsx
// src/components/drug/DrugOverviewTab.tsx
import { FlaskConical, Weight, CheckCircle, BookOpen } from "lucide-react";
import { useDrugLabel } from "@/hooks/useDrugLabel";
import { useDrugMolecule } from "@/hooks/useDrugMolecule";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface DrugOverviewTabProps {
  drugName: string;
  pubchemId: number;
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: string }>;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 border-b border-slate-800 py-2 last:border-0">
      <Icon
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500"
        aria-hidden="true"
      />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export function DrugOverviewTab({ drugName, pubchemId }: DrugOverviewTabProps) {
  const { data: label, isLoading: labelLoading } = useDrugLabel(drugName);
  const { data: molecule, isLoading: molLoading } = useDrugMolecule(drugName);

  const isLoading = labelLoading || molLoading;

  if (isLoading)
    return (
      <LoadingSkeleton label={`Loading ${drugName} information...`} rows={4} />
    );

  const genericName = label?.openfda?.generic_name?.[0] ?? drugName;
  const brandNames = label?.openfda?.brand_name?.slice(0, 3).join(", ") ?? null;
  const description = label?.description?.[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Drug identity */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">{drugName}</h2>
        {brandNames && (
          <p className="mt-0.5 text-xs text-slate-500">
            Also known as: {brandNames}
          </p>
        )}
      </div>

      {/* Molecule properties */}
      {molecule && (
        <div className="rounded border border-slate-800 bg-slate-900/40">
          <InfoRow
            icon={FlaskConical}
            label="Molecular Formula"
            value={molecule.molecularFormula}
          />
          <InfoRow
            icon={Weight}
            label="Molecular Weight"
            value={`${molecule.molecularWeight} g/mol`}
          />
          <InfoRow
            icon={CheckCircle}
            label="IUPAC Name"
            value={molecule.iupacName}
          />
        </div>
      )}

      {/* FDA description */}
      {description && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BookOpen
              className="h-3.5 w-3.5 text-slate-500"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              FDA Description
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            {description.slice(0, 600)}
            {description.length > 600 ? "…" : ""}
          </p>
        </div>
      )}

      {/* Indications */}
      {label?.indications_and_usage?.[0] && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            What it is used for
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            {label.indications_and_usage[0].slice(0, 400)}
            {label.indications_and_usage[0].length > 400 ? "…" : ""}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-600">
        Source: FDA Drug Label Database · PubChem Compound ID: {pubchemId}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/drug/DrugMechanismTab.tsx`**

```tsx
// src/components/drug/DrugMechanismTab.tsx
import {
  Activity,
  Zap,
  Shield,
  FlaskConical,
  Target,
  Heart,
} from "lucide-react";
import { useDrugTargets } from "@/hooks/useDrugTargets";
import { getDrugMechanismSteps } from "@/lib/drug-intelligence";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const ICON_MAP = {
  activity: Activity,
  zap: Zap,
  shield: Shield,
  flask: FlaskConical,
  target: Target,
  heart: Heart,
} as const;

interface DrugMechanismTabProps {
  drugName: string;
}

export function DrugMechanismTab({ drugName }: DrugMechanismTabProps) {
  const steps = getDrugMechanismSteps(drugName);
  const { activities, isLoading } = useDrugTargets(drugName);

  return (
    <div className="flex flex-col gap-5">
      {/* Plain mechanism walkthrough */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          How {drugName} works — step by step
        </h3>

        {steps.length === 0 ? (
          <EmptyState
            message="Detailed mechanism steps are not yet curated for this drug."
            suggestion="Check the Overview tab for the FDA mechanism of action description."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {steps.map((step) => {
              const Icon = ICON_MAP[step.icon];
              return (
                <div
                  key={step.step}
                  className="flex gap-3 rounded border border-slate-800 bg-slate-900/40 p-3"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-950/50">
                    <Icon
                      className="h-3.5 w-3.5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Step {step.step} of {steps.length} — {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ChEMBL protein targets */}
      {isLoading ? (
        <LoadingSkeleton
          label="Loading protein targets from ChEMBL..."
          rows={2}
        />
      ) : (
        activities.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Known protein targets (ChEMBL)
            </h3>
            <p className="mb-2 text-xs text-slate-600">
              Proteins in the body or pathogen that this drug interacts with. A
              target is like a lock — the drug is the key.
            </p>
            <ul className="flex flex-col gap-1.5">
              {activities.slice(0, 8).map((a) => (
                <li
                  key={a.activity_id}
                  className="flex items-start gap-2 rounded bg-slate-900/40 px-3 py-2"
                >
                  <Target
                    className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      {a.target_pref_name ?? "Unknown target"}
                    </p>
                    {a.standard_type && a.standard_value && (
                      <p className="text-xs text-slate-600">
                        {a.standard_type}: {a.standard_value}{" "}
                        {a.standard_units ?? ""}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-600">
              Source: ChEMBL bioactivity database · European Bioinformatics
              Institute
            </p>
          </div>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/components/drug/DrugOverviewTab.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add drug overview and mechanism tabs"
```

---

## Task 4: Efficacy + Interactions + Adverse Events

**Files:**

- Create: `src/components/drug/DrugEfficacyTab.tsx`
- Create: `src/components/drug/DrugInteractionsTab.tsx`
- Create: `src/components/drug/AdverseEventsPanel.tsx`
- Test: `src/components/drug/DrugInteractionsTab.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/drug/DrugInteractionsTab.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { DrugInteractionsTab } from "./DrugInteractionsTab";
import * as interactionHook from "@/hooks/useDrugInteractions";
import type { RxNormInteraction } from "@/types/rxnorm.schema";

vi.mock("@/hooks/useDrugInteractions");

describe("DrugInteractionsTab", () => {
  it("shows empty state when no interactions", () => {
    vi.mocked(interactionHook.useDrugInteractions).mockReturnValue({
      rxcui: "12345",
      interactions: [],
      isLoading: false,
      isError: false,
    });
    render(createElement(DrugInteractionsTab, { drugName: "Artemisinin" }));
    expect(
      screen.getByText(/no significant drug interactions/i),
    ).toBeInTheDocument();
  });

  it("renders interaction pairs", () => {
    const mockInteraction: RxNormInteraction = {
      minConceptItem: { rxcui: "12345", name: "Artemisinin", tty: "IN" },
      interactionPair: [
        {
          interactionConcept: [
            {
              minConceptItem: { name: "Artemisinin", rxcui: "12345" },
              sourceConceptItem: {
                name: "Halofantrine",
                ddi_risk: "high",
                description: "Risk of fatal heart rhythm disorder",
              },
            },
          ],
          severity: "high",
          description: "Avoid combination — QT prolongation risk",
        },
      ],
    };

    vi.mocked(interactionHook.useDrugInteractions).mockReturnValue({
      rxcui: "12345",
      interactions: [mockInteraction],
      isLoading: false,
      isError: false,
    });

    render(createElement(DrugInteractionsTab, { drugName: "Artemisinin" }));
    expect(screen.getByText(/halofantrine/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/drug/DrugInteractionsTab.test.tsx
```

Expected: FAIL — "Cannot find module './DrugInteractionsTab'"

- [ ] **Step 3: Create `src/components/drug/DrugEfficacyTab.tsx`**

```tsx
// src/components/drug/DrugEfficacyTab.tsx
import {
  getDrugEfficacyData,
  getDrugResistanceNote,
  getDrugCombinationNote,
} from "@/lib/drug-intelligence";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertTriangle, Info } from "lucide-react";

interface DrugEfficacyTabProps {
  drugName: string;
}

export function DrugEfficacyTab({ drugName }: DrugEfficacyTabProps) {
  const efficacyData = getDrugEfficacyData(drugName);
  const resistanceNote = getDrugResistanceNote(drugName);
  const combinationNote = getDrugCombinationNote(drugName);

  if (efficacyData.length === 0) {
    return (
      <EmptyState
        message="Efficacy data not yet curated for this drug."
        suggestion="Check clinical trial databases such as ClinicalTrials.gov for the latest evidence."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Efficacy bars */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Clinical cure rates
        </h3>
        <p className="mb-3 text-xs text-slate-500">
          These percentages show how often the drug works in clinical trials for
          each condition. Higher is better.
        </p>
        <div className="flex flex-col gap-3">
          {efficacyData.map((entry) => (
            <div key={entry.condition}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  {entry.condition}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {entry.efficacyPercent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${entry.efficacyPercent}%` }}
                  role="progressbar"
                  aria-valuenow={entry.efficacyPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${entry.condition}: ${entry.efficacyPercent}% efficacy`}
                />
              </div>
              <p className="mt-0.5 text-xs text-slate-600">{entry.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resistance note */}
      {resistanceNote && (
        <div className="flex items-start gap-2 rounded border border-amber-900/40 bg-amber-950/20 p-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold text-amber-300">
              Drug Resistance
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {resistanceNote}
            </p>
          </div>
        </div>
      )}

      {/* Combination therapy note */}
      {combinationNote && (
        <div className="flex items-start gap-2 rounded border border-blue-900/40 bg-blue-950/20 p-3">
          <Info
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold text-blue-300">
              Combination Therapy
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {combinationNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/drug/DrugInteractionsTab.tsx`**

```tsx
// src/components/drug/DrugInteractionsTab.tsx
import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import { useDrugInteractions } from "@/hooks/useDrugInteractions";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const SEVERITY_CONFIG = {
  high: {
    label: "Severe — Avoid combining",
    Icon: AlertOctagon,
    colour: "text-red-400",
    bg: "bg-red-950/30 border-red-900/50",
    textBg: "bg-red-950/20",
  },
  medium: {
    label: "Moderate — Use with caution",
    Icon: AlertTriangle,
    colour: "text-amber-400",
    bg: "bg-amber-950/30 border-amber-900/50",
    textBg: "bg-amber-950/20",
  },
  low: {
    label: "Mild — Monitor",
    Icon: Info,
    colour: "text-slate-400",
    bg: "bg-slate-800/60 border-slate-700/50",
    textBg: "bg-slate-800/40",
  },
} as const;

type SeverityKey = keyof typeof SEVERITY_CONFIG;

function normaliseSeverity(raw: string | undefined): SeverityKey {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("high") || s.includes("major")) return "high";
  if (s.includes("medium") || s.includes("moderate")) return "medium";
  return "low";
}

interface DrugInteractionsTabProps {
  drugName: string;
}

export function DrugInteractionsTab({ drugName }: DrugInteractionsTabProps) {
  const { interactions, isLoading, isError } = useDrugInteractions(drugName);

  if (isLoading)
    return (
      <LoadingSkeleton
        label="Checking drug interactions via RxNorm..."
        rows={3}
      />
    );
  if (isError)
    return (
      <EmptyState
        message="Could not load interaction data."
        suggestion="RxNorm (NIH) may be temporarily unavailable."
      />
    );

  const allPairs = interactions.flatMap((interaction) =>
    interaction.interactionPair.map((pair) => ({
      severity: normaliseSeverity(pair.severity),
      name: pair.interactionConcept[1]?.minConceptItem.name ?? "Unknown drug",
      description:
        pair.description ??
        pair.interactionConcept[1]?.sourceConceptItem.description ??
        "Potential interaction — consult a healthcare professional.",
    })),
  );

  if (allPairs.length === 0) {
    return (
      <EmptyState
        message={`No significant drug interactions found for ${drugName}.`}
        suggestion="Always consult a healthcare professional before combining medications."
      />
    );
  }

  const grouped = {
    high: allPairs.filter((p) => p.severity === "high"),
    medium: allPairs.filter((p) => p.severity === "medium"),
    low: allPairs.filter((p) => p.severity === "low"),
  } satisfies Record<SeverityKey, typeof allPairs>;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Drug interactions sourced from NIH RxNorm database. Severity
        classifications are based on clinical evidence. Always consult a
        healthcare professional before combining medications.
      </p>

      {(Object.entries(grouped) as [SeverityKey, typeof allPairs][])
        .filter(([, pairs]) => pairs.length > 0)
        .map(([severity, pairs]) => {
          const { label, Icon, colour, bg, textBg } = SEVERITY_CONFIG[severity];
          return (
            <div key={severity}>
              <div
                className={`mb-2 flex items-center gap-2 rounded border p-2 ${bg}`}
              >
                <Icon className={`h-4 w-4 ${colour}`} aria-hidden="true" />
                <span className={`text-xs font-semibold ${colour}`}>
                  {label}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {pairs.map((pair, i) => (
                  <li key={i} className={`rounded p-2.5 text-xs ${textBg}`}>
                    <p className="font-semibold text-slate-200">{pair.name}</p>
                    <p className="mt-0.5 leading-relaxed text-slate-500">
                      {pair.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/drug/AdverseEventsPanel.tsx`**

```tsx
// src/components/drug/AdverseEventsPanel.tsx
import { AlertCircle } from "lucide-react";
import { useAdverseEvents } from "@/hooks/useDrugLabel";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface AdverseEventsPanelProps {
  drugName: string;
}

export function AdverseEventsPanel({ drugName }: AdverseEventsPanelProps) {
  const { data, isLoading } = useAdverseEvents(drugName);

  if (isLoading)
    return (
      <LoadingSkeleton label="Loading adverse events from FDA..." rows={4} />
    );

  const top = (data ?? []).slice(0, 8);
  const maxCount = Math.max(...top.map((e) => e.count), 1);

  if (top.length === 0) {
    return (
      <EmptyState
        message="No adverse event reports found in the FDA database for this drug."
        suggestion="This may mean the drug is new, rarely prescribed, or uses a different name in the FDA system."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Most Reported Side Effects (FDA)
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {top.map((event) => {
          const pct = Math.round((event.count / maxCount) * 100);
          return (
            <div key={event.reaction}>
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-xs capitalize text-slate-300">
                  {event.reaction.toLowerCase()}
                </span>
                <span className="text-xs text-slate-500">
                  {event.count.toLocaleString()} reports
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-amber-600/70"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${event.reaction}: ${event.count} reports`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-slate-600">
        These events are self-reported by patients and healthcare providers to
        the FDA. Many may be symptoms of the disease being treated rather than
        caused by the drug itself. Source: FDA Adverse Event Reporting System
        (FAERS).
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test src/components/drug/DrugInteractionsTab.test.tsx
```

Expected: PASS — 2 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add drug efficacy, interactions, and adverse events panels"
```

---

## Task 5: Drug Intelligence Panel + Drug Page

**Files:**

- Create: `src/components/drug/DrugIntelligencePanel.tsx`
- Modify: `src/pages/DrugPage.tsx` (replaces Plan 2 placeholder)
- Test: `src/components/drug/DrugIntelligencePanel.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/drug/DrugIntelligencePanel.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createElement } from "react";
import { DrugIntelligencePanel } from "./DrugIntelligencePanel";

vi.mock("@/hooks/useDrugLabel", () => ({
  useDrugLabel: () => ({ data: null, isLoading: false, isError: false }),
  useAdverseEvents: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/useDrugMolecule", () => ({
  useDrugMolecule: () => ({ data: null, isLoading: false, isError: false }),
  useDrug2DImageUrl: () => null,
  useDrug3DUrl: () => null,
}));
vi.mock("@/hooks/useDrugInteractions", () => ({
  useDrugInteractions: () => ({
    interactions: [],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock("@/hooks/useDrugTargets", () => ({
  useDrugTargets: () => ({
    molecule: null,
    activities: [],
    isLoading: false,
    isError: false,
  }),
}));

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

describe("DrugIntelligencePanel", () => {
  it("renders four tab buttons", () => {
    render(
      createElement(DrugIntelligencePanel, {
        drugName: "Artemisinin",
        pubchemId: 68827,
      }),
      { wrapper },
    );
    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /mechanism/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /efficacy/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /interactions/i }),
    ).toBeInTheDocument();
  });

  it("shows plain english block before tabs", () => {
    render(
      createElement(DrugIntelligencePanel, {
        drugName: "Artemisinin",
        pubchemId: 68827,
      }),
      { wrapper },
    );
    expect(screen.getByText(/what is artemisinin/i)).toBeInTheDocument();
  });

  it("switches tabs on click", async () => {
    const user = userEvent.setup();
    render(
      createElement(DrugIntelligencePanel, {
        drugName: "Artemisinin",
        pubchemId: 68827,
      }),
      { wrapper },
    );
    await user.click(screen.getByRole("tab", { name: /mechanism/i }));
    expect(screen.getByRole("tab", { name: /mechanism/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test src/components/drug/DrugIntelligencePanel.test.tsx
```

Expected: FAIL — "Cannot find module './DrugIntelligencePanel'"

- [ ] **Step 3: Create `src/components/drug/DrugIntelligencePanel.tsx`**

```tsx
// src/components/drug/DrugIntelligencePanel.tsx
import { useState } from "react";
import { PlainEnglishBlock } from "./PlainEnglishBlock";
import { DrugOverviewTab } from "./DrugOverviewTab";
import { DrugMechanismTab } from "./DrugMechanismTab";
import { DrugEfficacyTab } from "./DrugEfficacyTab";
import { DrugInteractionsTab } from "./DrugInteractionsTab";
import { AdverseEventsPanel } from "./AdverseEventsPanel";
import { getDrugPlainEnglish } from "@/lib/drug-intelligence";

type Tab = "overview" | "mechanism" | "efficacy" | "interactions";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "mechanism", label: "Mechanism" },
  { id: "efficacy", label: "Efficacy" },
  { id: "interactions", label: "Interactions" },
];

interface DrugIntelligencePanelProps {
  drugName: string;
  pubchemId: number;
}

export function DrugIntelligencePanel({
  drugName,
  pubchemId,
}: DrugIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const plainText = getDrugPlainEnglish(drugName);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Plain English block — always first, always visible */}
      <PlainEnglishBlock drugName={drugName} text={plainText} />

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Drug information sections"
        className="flex gap-1 border-b border-slate-800 pb-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`drug-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`drug-panel-${tab.id}`}
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

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`drug-panel-${activeTab}`}
        aria-labelledby={`drug-tab-${activeTab}`}
      >
        {activeTab === "overview" && (
          <DrugOverviewTab drugName={drugName} pubchemId={pubchemId} />
        )}
        {activeTab === "mechanism" && <DrugMechanismTab drugName={drugName} />}
        {activeTab === "efficacy" && <DrugEfficacyTab drugName={drugName} />}
        {activeTab === "interactions" && (
          <div className="flex flex-col gap-6">
            <DrugInteractionsTab drugName={drugName} />
            <AdverseEventsPanel drugName={drugName} />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/pages/DrugPage.tsx`**

```tsx
// src/pages/DrugPage.tsx
import { Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pill } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MoleculeViewer3D } from "@/components/drug/MoleculeViewer3D";
import { MoleculeViewer2D } from "@/components/drug/MoleculeViewer2D";
import { DrugIntelligencePanel } from "@/components/drug/DrugIntelligencePanel";
import { useDrugMolecule } from "@/hooks/useDrugMolecule";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// Map PubChem IDs to drug names for the page heading
const PUBCHEM_ID_TO_NAME: Record<string, string> = {
  "68827": "Artemisinin",
  "2719": "Chloroquine",
  "3034034": "Quinine",
  "3767": "Isoniazid",
  "5360416": "Rifampicin",
  "1046": "Pyrazinamide",
  "464205": "Tenofovir",
  "64139": "Efavirenz",
  "54726191": "Dolutegravir",
  "5743": "Dexamethasone",
  "121304016": "Remdesivir",
  "145996610": "Nirmatrelvir",
};

function DrugPageContent() {
  const { pubchemId } = useParams<{ pubchemId: string }>();
  const drugName =
    PUBCHEM_ID_TO_NAME[pubchemId ?? ""] ?? `Drug ${pubchemId ?? ""}`;
  const { data: molecule } = useDrugMolecule(drugName);

  if (!pubchemId) {
    return (
      <EmptyState
        message="No drug selected."
        suggestion="Navigate to a drug from the Disease Panel."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Drug page header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to globe
        </Link>
        <span className="text-slate-700" aria-hidden="true">
          /
        </span>
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h1 className="text-sm font-semibold text-slate-100">{drugName}</h1>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: molecule viewers */}
        <aside className="flex w-72 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-navy-900 p-4">
          <Suspense
            fallback={
              <LoadingSkeleton label="Loading 3D molecule..." rows={3} />
            }
          >
            <MoleculeViewer3D cid={molecule?.cid ?? null} drugName={drugName} />
          </Suspense>
          <MoleculeViewer2D cid={molecule?.cid ?? null} drugName={drugName} />
        </aside>

        {/* Right: intelligence panel */}
        <main className="flex-1 overflow-hidden">
          <DrugIntelligencePanel
            drugName={drugName}
            pubchemId={Number(pubchemId)}
          />
        </main>
      </div>
    </div>
  );
}

export default function DrugPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <LoadingSkeleton label="Loading drug visualizer..." rows={5} />
        }
      >
        <DrugPageContent />
      </Suspense>
    </AppShell>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test src/components/drug/DrugIntelligencePanel.test.tsx
```

Expected: PASS — 3 tests pass.

- [ ] **Step 6: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass across Plans 1–4.

- [ ] **Step 7: Run typecheck**

```bash
pnpm typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 8: Verify drug visualizer loads in browser**

```bash
pnpm dev
```

Navigate to `http://localhost:3000/drug/68827`. Expected: full-screen drug page with molecule viewer panel on the left, Plain English block and tabbed intelligence panel on the right.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add full drug visualizer — 3d molecule, 2d structure, clinical intelligence panel"
```

---

## Summary

Plan 4 complete. After executing this plan you will have:

- `PlainEnglishBlock` — collapsible, always shown first, written for non-experts
- `MoleculeViewer3D` — 3Dmol.js WebGL rotating molecule from PubChem 3D conformers
- `MoleculeViewer2D` — PubChem PNG structural diagram with download
- `DrugOverviewTab` — FDA label data + molecular properties + plain-English description
- `DrugMechanismTab` — step-by-step mechanism walkthrough + ChEMBL protein targets
- `DrugEfficacyTab` — efficacy progress bars + resistance note + combination therapy note
- `DrugInteractionsTab` — RxNorm interactions grouped by severity with plain-English descriptions
- `AdverseEventsPanel` — FDA FAERS adverse event bar chart with self-reporting caveat
- `DrugIntelligencePanel` — accessible tabbed root, Plain English block always first
- `DrugPage` — full-screen route with split molecule/intelligence layout
- Curated drug intelligence for: Artemisinin, Chloroquine, Isoniazid, Tenofovir, Dexamethasone
- All tests passing, typecheck clean

**Next:** Plan 5 — Polish, Accessibility, Export & Performance
