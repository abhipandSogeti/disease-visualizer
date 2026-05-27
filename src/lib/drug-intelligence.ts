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
