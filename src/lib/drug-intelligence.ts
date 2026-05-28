export interface MechanismStep {
  step: number
  title: string
  description: string
  icon: 'activity' | 'zap' | 'shield' | 'flask' | 'target' | 'heart'
}

export interface EfficacyEntry {
  condition: string
  efficacyPercent: number
  note: string
}

export interface DrugIntelligence {
  plainEnglish: string
  mechanismSteps: MechanismStep[]
  efficacyData: EfficacyEntry[]
  resistanceNote: string
  combinationNote: string
}

export const DRUG_INTELLIGENCE: Record<string, DrugIntelligence> = {
  artemisinin: {
    plainEnglish: `Artemisinin is a medicine used to treat malaria — a disease spread by infected mosquito bites. It comes from a plant called Sweet Wormwood, which traditional Chinese doctors used for over 2,000 years to treat fevers. When you take artemisinin, it travels through your bloodstream, finds the malaria parasite hiding inside your red blood cells, and destroys it within 48 hours. It is the most effective malaria treatment in the world today and is recommended by the WHO as a first-line therapy.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Enters the bloodstream',
        description:
          'Artemisinin is absorbed from the gut within 1–2 hours of taking an oral dose and travels through the blood to infected red blood cells.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Activated by iron',
        description:
          'The malaria parasite (Plasmodium) contains high levels of iron-rich heme. Artemisinin reacts with this iron to produce highly reactive molecules called free radicals.',
        icon: 'zap',
      },
      {
        step: 3,
        title: 'Parasite membrane destroyed',
        description:
          "The free radicals damage the parasite's cell membrane and internal proteins, killing it within 48 hours before it can reproduce.",
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Uncomplicated malaria',
        efficacyPercent: 97,
        note: 'When taken as a complete ACT course',
      },
      {
        condition: 'Severe malaria',
        efficacyPercent: 89,
        note: 'IV artesunate in hospital settings',
      },
      {
        condition: 'Drug-resistant strains',
        efficacyPercent: 71,
        note: 'Partial resistance in South-East Asia',
      },
    ],
    resistanceNote:
      'Partial resistance to artemisinin was first detected in Cambodia in 2008 and has since spread to 12 countries in South-East Asia. Resistance does not yet mean treatment failure — combination therapy (ACT) still works in most cases.',
    combinationNote:
      'Artemisinin is always used in combination with a partner drug (ACT — Artemisinin Combination Therapy) such as lumefantrine or amodiaquine. Using it alone accelerates resistance.',
  },
  chloroquine: {
    plainEnglish: `Chloroquine was the main malaria treatment for decades from the 1940s to the 1980s. It is a cheap, easy-to-produce pill that works by interfering with how the malaria parasite digests blood. Unfortunately, the parasite evolved to resist chloroquine in most parts of the world, making it largely ineffective today.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Enters infected red blood cells',
        description:
          "Chloroquine is absorbed into red blood cells, where it concentrates inside the malaria parasite's digestive compartment (the food vacuole).",
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Blocks heme detoxification',
        description:
          'The parasite digests haemoglobin from red blood cells, producing toxic heme as a by-product. Chloroquine prevents the parasite from neutralising this heme.',
        icon: 'flask',
      },
      {
        step: 3,
        title: 'Parasite poisoned',
        description:
          'Toxic heme accumulates inside the parasite and destroys its membranes, killing it.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Chloroquine-sensitive malaria',
        efficacyPercent: 95,
        note: 'Central America, Caribbean, Middle East',
      },
      {
        condition: 'Chloroquine-resistant malaria',
        efficacyPercent: 12,
        note: 'Most of Africa, Asia, South America',
      },
    ],
    resistanceNote:
      'Chloroquine resistance emerged in the late 1950s in South-East Asia and spread globally by the 1980s. A single mutation in the PfCRT protein allows the parasite to pump chloroquine out before it can act.',
    combinationNote: 'No longer recommended as combination therapy for malaria in most regions.',
  },
  isoniazid: {
    plainEnglish: `Isoniazid is one of the oldest and most important tuberculosis (TB) drugs, used since the 1950s. TB is a bacterial infection that mainly attacks the lungs. Isoniazid works by stopping TB bacteria from building their protective outer coat. It is almost always used alongside other TB drugs for 6 months.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Activated inside the bacteria',
        description:
          'Isoniazid is a prodrug — it is inactive until converted to its active form by an enzyme called KatG inside the TB bacterium.',
        icon: 'flask',
      },
      {
        step: 2,
        title: 'Blocks cell wall production',
        description:
          "The active form of isoniazid inhibits an enzyme called InhA, which is essential for producing mycolic acids — the key building blocks of the TB bacterium's thick outer wall.",
        icon: 'target',
      },
      {
        step: 3,
        title: 'Bacteria loses its protective coat',
        description:
          'Without mycolic acids, the TB bacterium cannot maintain its cell wall and dies.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Drug-sensitive TB (6-month course)',
        efficacyPercent: 95,
        note: 'When used in combination with rifampicin, pyrazinamide, ethambutol',
      },
      {
        condition: 'Latent TB prevention',
        efficacyPercent: 90,
        note: '6–9 month preventive therapy in high-risk individuals',
      },
      {
        condition: 'Isoniazid-resistant TB',
        efficacyPercent: 15,
        note: 'Requires alternative drug regimens',
      },
    ],
    resistanceNote:
      'Resistance to isoniazid is caused by mutations in the KatG gene, which prevent activation of the drug. It affects approximately 10% of TB cases globally.',
    combinationNote:
      'Always used in combination — the standard TB regimen is HRZE (Isoniazid + Rifampicin + Pyrazinamide + Ethambutol) for the first 2 months, then HR for 4 more months.',
  },
  tenofovir: {
    plainEnglish: `Tenofovir is an antiretroviral medicine — a type of drug that fights HIV, the virus that causes AIDS. Tenofovir works by blocking the virus from copying itself inside your cells. It does not cure HIV, but it keeps the viral load so low that people with HIV can live long, healthy lives.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed and activated',
        description:
          'Tenofovir disoproxil fumarate (TDF) is absorbed from the gut and converted to its active form, tenofovir diphosphate, inside cells.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Blocks reverse transcriptase',
        description:
          'HIV needs an enzyme called reverse transcriptase to convert its RNA into DNA inside human cells. Tenofovir diphosphate mimics a natural building block of DNA, fooling reverse transcriptase into incorporating it.',
        icon: 'target',
      },
      {
        step: 3,
        title: 'Viral replication halted',
        description:
          'When tenofovir is incorporated into the growing DNA chain, it acts as a chain terminator — the DNA cannot be extended further, and the virus cannot replicate.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'HIV viral suppression (with combination ART)',
        efficacyPercent: 95,
        note: 'Undetectable viral load after 48 weeks',
      },
      {
        condition: 'HIV prevention (PrEP)',
        efficacyPercent: 99,
        note: 'Daily oral PrEP in high-adherence users',
      },
      {
        condition: 'HIV prevention (PrEP, lower adherence)',
        efficacyPercent: 74,
        note: 'Real-world effectiveness with missed doses',
      },
    ],
    resistanceNote:
      'Resistance to tenofovir requires the K65R mutation in reverse transcriptase, which is uncommon when taken as directed.',
    combinationNote:
      'Tenofovir is always used as part of a combination ART regimen — typically with emtricitabine and a third agent. Single-drug HIV therapy is never recommended.',
  },
  dexamethasone: {
    plainEnglish: `Dexamethasone is a powerful steroid medicine. In severe COVID-19, the immune system sometimes overreacts and causes widespread inflammation in the lungs. Dexamethasone calms this overreaction. The RECOVERY trial (2020) proved it reduces deaths in patients on oxygen or ventilators by up to a third.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Enters cells and binds to receptors',
        description:
          'Dexamethasone crosses cell membranes easily and binds to glucocorticoid receptors inside immune cells throughout the body.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Suppresses inflammatory signals',
        description:
          'The drug-receptor complex moves into the cell nucleus and switches off genes that produce pro-inflammatory cytokines — the signalling proteins that drive the cytokine storm seen in severe COVID-19.',
        icon: 'target',
      },
      {
        step: 3,
        title: 'Inflammation reduced, oxygen improves',
        description:
          'With fewer inflammatory signals, the lung inflammation subsides, oxygen levels improve, and the patient is less likely to need a ventilator or die.',
        icon: 'heart',
      },
    ],
    efficacyData: [
      {
        condition: 'Severe COVID-19 (on ventilator)',
        efficacyPercent: 36,
        note: 'Reduction in mortality — RECOVERY trial 2020',
      },
      {
        condition: 'Severe COVID-19 (on oxygen)',
        efficacyPercent: 20,
        note: 'Reduction in mortality — RECOVERY trial 2020',
      },
      {
        condition: 'Mild COVID-19 (no oxygen)',
        efficacyPercent: 0,
        note: 'No benefit — may be harmful in mild cases',
      },
    ],
    resistanceNote:
      'Viruses do not develop resistance to dexamethasone because it targets the human immune response, not the virus itself.',
    combinationNote:
      'Used alongside antivirals in hospitalised patients. Only recommended when the patient requires supplemental oxygen — harmful if given to patients who do not need oxygen.',
  },
  quinine: {
    plainEnglish: `Quinine is one of the oldest malaria medicines, originally extracted from the bark of the Cinchona tree in South America. It has been used since the 17th century. Today it is mainly used for severe malaria that requires intravenous (IV) treatment in hospital, or when newer drugs are not available. It works by interfering with the malaria parasite's ability to digest blood inside red blood cells.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Enters red blood cells',
        description:
          'Quinine accumulates inside red blood cells infected by the Plasmodium parasite.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Blocks haem detoxification',
        description:
          'The parasite digests haemoglobin and must neutralise toxic haem byproducts. Quinine blocks this process, causing toxic haem to accumulate.',
        icon: 'zap',
      },
      {
        step: 3,
        title: 'Parasite dies from toxin build-up',
        description: 'The accumulation of toxic haem kills the parasite within 24–48 hours.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Severe falciparum malaria (IV)',
        efficacyPercent: 85,
        note: 'Used when artesunate is unavailable',
      },
      {
        condition: 'Uncomplicated malaria (oral)',
        efficacyPercent: 72,
        note: 'Longer course required — 7 days',
      },
    ],
    resistanceNote:
      'Resistance to quinine is emerging in South-East Asia. It remains effective in most of Africa and South America.',
    combinationNote:
      'Often combined with doxycycline or clindamycin to shorten the treatment course and reduce side effects.',
  },
  rifampicin: {
    plainEnglish: `Rifampicin (also called rifampin) is one of the most important antibiotics used to treat tuberculosis (TB). It has been a cornerstone of TB treatment since the 1960s. It works by blocking the machinery that bacteria use to copy their genetic instructions, effectively stopping TB bacteria from reproducing. It is always used with other antibiotics to prevent resistance.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Enters the bacterium',
        description: 'Rifampicin passes through the cell wall of Mycobacterium tuberculosis.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Blocks RNA polymerase',
        description:
          'It binds tightly to RNA polymerase — the enzyme bacteria use to read their DNA and make proteins. With this enzyme blocked, the bacteria cannot make the proteins they need to survive.',
        icon: 'zap',
      },
      {
        step: 3,
        title: 'Bacteria cannot reproduce',
        description:
          'Without functional RNA polymerase, TB bacteria stop growing and die over the course of treatment.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Drug-sensitive TB (6-month course)',
        efficacyPercent: 95,
        note: 'Combined with isoniazid, pyrazinamide, ethambutol',
      },
      {
        condition: 'TB preventive therapy',
        efficacyPercent: 78,
        note: '4-month rifampicin course for latent TB',
      },
    ],
    resistanceNote:
      'Rifampicin-resistant TB (RR-TB) is a major global health crisis. A single mutation in the rpoB gene is sufficient to cause high-level resistance. MDR-TB requires 9–20 months of second-line treatment.',
    combinationNote:
      'Always used in combination — never as monotherapy. Standard DOTS regimen: Rifampicin + Isoniazid + Pyrazinamide + Ethambutol for 2 months, then Rifampicin + Isoniazid for 4 months.',
  },
  pyrazinamide: {
    plainEnglish: `Pyrazinamide is a key drug in the first two months of tuberculosis treatment. It is especially effective at killing TB bacteria that are hiding inside cells in an acidic environment — a type of bacteria that other TB drugs struggle to reach. This makes it essential for shortening TB treatment from 9 months to just 6 months.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Activated inside bacteria',
        description:
          'Pyrazinamide is a prodrug — it is inactive until converted to pyrazinoic acid inside TB bacteria by an enzyme called PncA.',
        icon: 'flask',
      },
      {
        step: 2,
        title: 'Disrupts membrane function',
        description:
          'Pyrazinoic acid acidifies the interior of the bacterium and disrupts its cell membrane, interfering with energy production.',
        icon: 'zap',
      },
      {
        step: 3,
        title: 'Kills dormant bacteria',
        description:
          'It is uniquely effective against slow-growing or dormant TB bacteria inside macrophages (immune cells), which other drugs cannot easily reach.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Active TB (first 2 months)',
        efficacyPercent: 90,
        note: 'As part of 4-drug regimen — critical for sterilisation',
      },
    ],
    resistanceNote:
      'Resistance occurs when mutations inactivate the PncA enzyme. Pyrazinamide-resistant strains are harder to treat and require longer regimens.',
    combinationNote:
      'Used only in the first 2 months of standard TB treatment. It allows the total treatment duration to be shortened from 9 months to 6 months.',
  },
  efavirenz: {
    plainEnglish: `Efavirenz is an antiretroviral drug used to treat HIV. It belongs to a class called non-nucleoside reverse transcriptase inhibitors (NNRTIs). It works by blocking the HIV virus's ability to copy its genetic material inside human cells. It was a first-line HIV treatment for many years and is still widely used, especially in low- and middle-income countries, as part of combination therapy.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'HIV enters the cell',
        description:
          'HIV attaches to CD4 T-cells and injects its RNA genetic material into the human cell.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Blocks reverse transcriptase',
        description:
          'HIV needs to convert its RNA into DNA using an enzyme called reverse transcriptase. Efavirenz binds to a site on this enzyme and locks it in an inactive shape.',
        icon: 'target',
      },
      {
        step: 3,
        title: 'HIV cannot replicate',
        description:
          'Without functional reverse transcriptase, HIV cannot make DNA copies of itself, so it cannot reproduce and infect new cells.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'HIV viral suppression (1 year)',
        efficacyPercent: 73,
        note: 'Proportion achieving viral load < 50 copies/mL',
      },
      {
        condition: 'HIV viral suppression (2 years)',
        efficacyPercent: 68,
        note: 'Combined with tenofovir and lamivudine',
      },
    ],
    resistanceNote:
      'A single mutation (K103N) in reverse transcriptase causes high-level resistance to all NNRTIs. Efavirenz is being phased out in favour of dolutegravir, which has a higher genetic barrier to resistance.',
    combinationNote:
      'Used as TDF/3TC/EFV (tenofovir + lamivudine + efavirenz) — a once-daily single-pill combination widely used in sub-Saharan Africa.',
  },
  dolutegravir: {
    plainEnglish: `Dolutegravir is currently the preferred first-line HIV treatment recommended by the WHO. It belongs to a class called integrase strand transfer inhibitors (INSTIs). It works by blocking the step where HIV inserts its DNA into the human cell's chromosome — the critical moment when the virus establishes a permanent infection. It is highly effective, well-tolerated, and has a very high barrier to resistance.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'HIV makes a DNA copy',
        description:
          'After entering a CD4 T-cell, HIV converts its RNA to DNA using reverse transcriptase.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Blocks integrase enzyme',
        description:
          "HIV uses an enzyme called integrase to cut the human cell's DNA and insert its own DNA. Dolutegravir binds to integrase and blocks this insertion step.",
        icon: 'target',
      },
      {
        step: 3,
        title: 'HIV cannot establish permanent infection',
        description:
          "Without DNA integration, the virus cannot use the cell's machinery to make copies of itself. Viral replication halts.",
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'HIV viral suppression (48 weeks)',
        efficacyPercent: 90,
        note: 'GEMINI trials — non-inferior to standard of care',
      },
      {
        condition: 'Treatment-naive patients (1 year)',
        efficacyPercent: 88,
        note: 'WHO 2023 guidelines preferred first-line',
      },
    ],
    resistanceNote:
      'Dolutegravir has an exceptionally high genetic barrier to resistance — resistance mutations are extremely rare when taken correctly. This is a major advantage over older antiretrovirals.',
    combinationNote:
      "Recommended as TLD (Tenofovir + Lamivudine + Dolutegravir) — a once-daily single pill. WHO's preferred first-line regimen for adults and adolescents globally since 2019.",
  },
  doxycycline: {
    plainEnglish: `Doxycycline is a broad-spectrum antibiotic used to treat many bacterial infections, including cholera. It belongs to the tetracycline family and works by stopping bacteria from making the proteins they need to grow and multiply. For cholera, it is the first-line antibiotic recommended by the WHO when patients are severely dehydrated and need more than oral rehydration salts.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Enters the bacterium',
        description:
          'Doxycycline is transported into bacterial cells using the same protein channels the bacterium uses to import nutrients.',
        icon: 'activity',
      },
      {
        step: 2,
        title: 'Binds to ribosomes',
        description:
          'Inside the bacterium, doxycycline binds to the 30S ribosomal subunit — the molecular machine that reads genetic instructions and builds proteins.',
        icon: 'target',
      },
      {
        step: 3,
        title: 'Protein synthesis halted',
        description:
          'With ribosomes blocked, the bacterium cannot make essential proteins. It stops growing and dies. This effect is bacteriostatic — it halts growth rather than directly killing bacteria.',
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'Cholera (single dose)',
        efficacyPercent: 91,
        note: 'Reduces stool volume and duration by ~50%',
      },
      {
        condition: 'Cholera in children',
        efficacyPercent: 78,
        note: 'Azithromycin preferred under 8 years',
      },
    ],
    resistanceNote:
      'Doxycycline resistance in Vibrio cholerae is increasing in some regions. Susceptibility testing is recommended when available.',
    combinationNote:
      'Used alongside oral rehydration therapy (ORT) — antibiotics reduce duration but ORT saves lives by replacing fluids.',
  },
  remdesivir: {
    plainEnglish: `Remdesivir is an antiviral drug originally developed for Ebola, later found to be effective against COVID-19. It works by disguising itself as a building block that viruses use to copy their genetic material. When the virus incorporates remdesivir instead of the real building block, its replication machinery grinds to a halt. It is given by IV infusion in hospital settings.`,
    mechanismSteps: [
      {
        step: 1,
        title: 'Converted to active form',
        description:
          'Remdesivir is a prodrug — after entering cells it is converted to its active form, GS-443902, a nucleoside triphosphate analogue.',
        icon: 'flask',
      },
      {
        step: 2,
        title: 'Disguises itself as RNA building block',
        description:
          'GS-443902 mimics adenosine triphosphate (ATP), a natural building block RNA polymerase uses to copy viral RNA.',
        icon: 'zap',
      },
      {
        step: 3,
        title: 'Halts viral RNA replication',
        description:
          "When the virus's RNA polymerase incorporates remdesivir instead of ATP, replication stalls. The virus cannot make complete copies of itself.",
        icon: 'shield',
      },
    ],
    efficacyData: [
      {
        condition: 'COVID-19 hospitalised (5-day course)',
        efficacyPercent: 62,
        note: 'Reduces time to recovery vs placebo — ACTT-1 trial',
      },
      {
        condition: 'COVID-19 outpatient (early treatment)',
        efficacyPercent: 87,
        note: 'Reduces hospitalisation risk — PINETREE trial',
      },
    ],
    resistanceNote:
      'Resistance mutations in the viral RNA polymerase have been identified in vitro but are not yet a major clinical concern. Monitoring continues.',
    combinationNote:
      'For hospitalised COVID-19: combined with dexamethasone when patients require oxygen. Remdesivir alone is insufficient for severe disease — the inflammatory response must also be treated.',
  },
}

export function getDrugPlainEnglish(drugName: string): string {
  const key = drugName.toLowerCase()
  return (
    DRUG_INTELLIGENCE[key]?.plainEnglish ??
    `This is a medicine used to treat or prevent a specific disease. Click the Overview tab for detailed clinical information sourced from the FDA and WHO databases.`
  )
}

export function getDrugMechanismSteps(drugName: string): MechanismStep[] {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.mechanismSteps ?? []
}

export function getDrugEfficacyData(drugName: string): EfficacyEntry[] {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.efficacyData ?? []
}

export function getDrugResistanceNote(drugName: string): string {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.resistanceNote ?? ''
}

export function getDrugCombinationNote(drugName: string): string {
  return DRUG_INTELLIGENCE[drugName.toLowerCase()]?.combinationNote ?? ''
}
