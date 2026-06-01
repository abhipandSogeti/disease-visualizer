import { AlertTriangle, Clock, Shield, Stethoscope, Thermometer, Activity } from 'lucide-react'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { DEFAULT_DISEASES } from '@/types/app.types'
import { useAppStore } from '@/stores/app.store'

interface ClinicalProfile {
  caseDefinition: string
  incubation: string
  redFlags: string[]
  immediateActions: string[]
  isolationPPE: string
  whoAlert: string
}

const CLINICAL_PROFILES: Record<string, ClinicalProfile> = {
  malaria: {
    caseDefinition:
      'Fever ≥38°C (or history of fever) in last 48 h from endemic area or travel within 3 months.',
    incubation: '7–30 days (P. falciparum 7–14 d)',
    redFlags: [
      'Impaired consciousness / coma (cerebral malaria)',
      'Respiratory distress / pulmonary oedema',
      'Haemoglobin < 7 g/dL',
      'Parasitaemia > 5%',
      'Renal failure (creatinine > 265 µmol/L)',
      'Hypoglycaemia (glucose < 2.2 mmol/L)',
    ],
    immediateActions: [
      'Blood smear + RDT within 1 hour of presentation',
      'IV artesunate for severe malaria (preferred over quinine)',
      'Oral ACT (artemether-lumefantrine) for uncomplicated cases',
      'Glucose monitoring every 4 h during treatment',
      'Fluid management: caution — avoid overhydration',
    ],
    isolationPPE: 'No isolation required. Standard precautions. Vector control (nets, screens).',
    whoAlert: 'Notify malaria surveillance if travel-acquired. Report P. falciparum to NMCP.',
  },
  tuberculosis: {
    caseDefinition:
      'Cough ≥2 weeks + ≥1 of: haemoptysis, night sweats, weight loss, fever. Confirmed by sputum smear/culture/Xpert.',
    incubation: '2–12 weeks to primary infection; years to reactivation',
    redFlags: [
      'Haemoptysis > 200 mL / 24 h',
      'Oxygen saturation < 90% on air',
      'SpO₂ < 94% + respiratory rate > 30',
      'Altered mental status (TB meningitis)',
      'Suspected MDR-TB (prior treatment or known contact)',
    ],
    immediateActions: [
      'Sputum × 2 for AFB smear + Xpert MTB/RIF',
      'Chest X-ray: cavities, upper lobe infiltrates',
      'HIV test — mandatory in TB patients',
      'Start HRZE regimen pending results if high suspicion',
      'Contact tracing within 48 h of confirmed case',
    ],
    isolationPPE:
      'Airborne precautions: negative pressure room, N95 respirator, limit transport. Continue until 3 sputum smears negative.',
    whoAlert: 'Mandatory notifiable disease in most countries. Report MDR/XDR within 24 h.',
  },
  hiv: {
    caseDefinition:
      'Confirmed HIV-1/2 antibody + p24 antigen or RNA. Acute: viral syndrome within 2–4 weeks of exposure.',
    incubation: '2–4 weeks (acute syndrome); years to AIDS without ART',
    redFlags: [
      'CD4 < 200 cells/µL (AIDS-defining threshold)',
      'Unexplained weight loss > 10% body weight',
      'Oral candidiasis / oesophageal candidiasis',
      'PCP pneumonia: dry cough + desaturation on exertion',
      'Cryptococcal meningitis: severe headache + neck stiffness',
    ],
    immediateActions: [
      'HIV rapid test; if reactive: confirmatory Western Blot / viral load',
      'CD4 count + HIV RNA viral load at diagnosis',
      'ART initiation same day if patient is ready (WHO "Test and Treat")',
      'OI prophylaxis: cotrimoxazole if CD4 < 350',
      'Opportunistic infection screen before ART',
    ],
    isolationPPE:
      'Standard precautions. No isolation required. Universal blood/body-fluid precautions.',
    whoAlert: 'Report new diagnoses to national HIV registry. Anonymous in most jurisdictions.',
  },
  cholera: {
    caseDefinition:
      'Acute watery diarrhoea (≥3 loose stools/24 h) from an area with confirmed Vibrio cholerae O1/O139 circulation.',
    incubation: '2 hours – 5 days (median 12–24 h)',
    redFlags: [
      '"Rice-water" stool output > 1 L/h',
      'Severe dehydration: sunken eyes, skin tenting, no urine 6+ hours',
      'Altered consciousness / lethargy',
      'Unable to drink / persistent vomiting preventing ORS',
      'Hypotension: systolic BP < 90 mmHg',
    ],
    immediateActions: [
      "Rehydration is life-saving: Ringer's lactate IV for severe dehydration",
      'ORS (1 litre per loose stool) for mild-moderate dehydration',
      'Antibiotics halve duration: doxycycline 300 mg single oral dose',
      'Zinc supplementation in children < 5 (10–20 mg/day × 10 days)',
      'Stool culture + sensitivity if antibiotic resistance suspected',
    ],
    isolationPPE:
      'Contact precautions. Dedicated toilet/commode. Strict hand hygiene with soap. Disinfect all surfaces.',
    whoAlert: 'Immediately notifiable to WHO under IHR 2005. Report within 24 h of suspected case.',
  },
  polio: {
    caseDefinition:
      'Acute flaccid paralysis (AFP) in child < 15 years OR suspected polio in any age. Confirmed by stool virus isolation.',
    incubation: '6–20 days (range 3–35 days)',
    redFlags: [
      'Rapid ascending paralysis within 72 h',
      'Bulbar involvement: dysphagia, dysphonia, respiratory compromise',
      'Paradoxical breathing / diaphragm paralysis',
      'Acute flaccid myelitis pattern on MRI',
    ],
    immediateActions: [
      'Report ALL AFP cases within 24 h — public health emergency',
      'Collect 2 stool samples ≥24 h apart, within 14 days of paralysis onset',
      'No specific antiviral — management is supportive and rehabilitative',
      'Respiratory monitoring: spirometry, peak flow, BiPAP readiness',
      'Physical therapy early to prevent contractures',
    ],
    isolationPPE: 'Contact precautions for enteric secretions. Full PPE for stool/urine handling.',
    whoAlert:
      'Poliovirus isolation is a Public Health Emergency of International Concern (PHEIC). Immediate WHO notification required.',
  },
  dengue: {
    caseDefinition:
      'Acute febrile illness in endemic area/traveller: fever 2–7 d + ≥2 of: nausea, rash, aches, positive tourniquet test, leukopenia. NS1 Ag or IgM/IgG confirms.',
    incubation: '4–10 days (range 3–14 days)',
    redFlags: [
      'Severe abdominal pain or tenderness',
      'Persistent vomiting',
      'Clinical fluid accumulation (ascites, pleural effusion)',
      'Mucosal bleeding',
      'Lethargy / restlessness',
      'Liver enlargement > 2 cm',
      'Rapid decline in platelet count with rising haematocrit',
    ],
    immediateActions: [
      'NS1 antigen test in first 5 days; IgM from day 4+',
      'FBC daily during febrile phase: watch haematocrit + platelet trend',
      'Paracetamol only — AVOID NSAIDs and aspirin (bleeding risk)',
      'Oral hydration: 2.5 L/day in adults; IV if warning signs',
      'ICU for dengue shock syndrome: careful fluid titration',
    ],
    isolationPPE:
      'No person-to-person transmission. Prevent mosquito bites with nets and repellent. Aedes control around patient.',
    whoAlert:
      'Dengue is notifiable in most endemic countries. Report confirmed severe dengue within 24 h.',
  },
  covid19: {
    caseDefinition:
      'Fever, cough, or shortness of breath + positive SARS-CoV-2 PCR/rapid antigen test.',
    incubation: '2–14 days (median 5 days for Omicron variants)',
    redFlags: [
      'SpO₂ < 94% on room air (< 90% in known COPD)',
      'Respiratory rate > 30 breaths/min',
      'Chest pain / pressure',
      'Confusion or altered consciousness',
      'Silent hypoxaemia — SpO₂ < 94% despite no dyspnoea',
    ],
    immediateActions: [
      'SpO₂ monitoring — continuous in admitted patients',
      'Dexamethasone 6 mg/day × 10 days for patients requiring O₂',
      'Remdesivir 200 mg IV day 1, then 100 mg × 4 days if hospitalised',
      'Anticoagulation: LMWH prophylaxis for all hospitalised patients',
      'Prone positioning for severe ARDS (12–16 h/day)',
    ],
    isolationPPE:
      'Airborne + droplet + contact precautions. N95 for AGP. Negative pressure room preferred. Isolate for 10 days from symptom onset.',
    whoAlert: 'Report clusters and severe cases to national public health authority within 24 h.',
  },
  ebola: {
    caseDefinition:
      'Acute fever + haemorrhagic features OR epidemiological link to confirmed Ebola case in outbreak setting.',
    incubation: '2–21 days (median 8–10 days)',
    redFlags: [
      'Any haemorrhage: bleeding from gums, haematuria, melena',
      'Extreme prostration / unable to stand',
      'Shock: BP < 90/60, HR > 120',
      'Confusion or coma',
      'Suspected Ebola in healthcare worker (immediate escalation)',
    ],
    immediateActions: [
      'IMMEDIATE isolation in Ebola Treatment Unit — do NOT wait for lab confirmation',
      'Full PPE for ALL personnel: impermeable gown, double gloves, face shield, boot covers',
      'IV fluid resuscitation + electrolyte correction',
      'mAb therapy (INMAZEB/Ebanga) if available — reduces mortality',
      'Strict waste management: all materials incinerated on-site',
    ],
    isolationPPE:
      'STRICT contact and droplet precautions. Full PPE with buddy system and trained doff procedure. No visitors. Body bags sealed and not opened.',
    whoAlert:
      'Ebola is an IHR Category A pathogen. Notify WHO within 24 h. National emergency response activation required.',
  },
}

export function ClinicalPanel() {
  const { activeDiseases } = useAppStore()
  const disease = activeDiseases[0] ?? DEFAULT_DISEASES[0]
  const profile = CLINICAL_PROFILES[disease.id]
  const colour = DISEASE_COLOURS[disease.category]

  if (!profile) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No clinical profile available for {disease.name}.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="h-1 w-full flex-shrink-0" style={{ background: colour }} />
      <div className="border-b border-black/[0.08] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h2 className="text-base font-bold tracking-tight text-gray-900">
            Clinical Quick Reference
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {disease.name} · Select a country on the globe for epidemiology data
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Case definition */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Case Definition
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-gray-700">{profile.caseDefinition}</p>
        </section>

        {/* Incubation */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Incubation Period
            </h3>
          </div>
          <p className="text-xs font-medium text-gray-700">{profile.incubation}</p>
        </section>

        {/* Red flags */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-red-500">
              Red Flags — Admit Immediately
            </h3>
          </div>
          <ul className="flex flex-col gap-1" role="list">
            {profile.redFlags.map((flag) => (
              <li key={flag} className="flex items-start gap-2 text-xs text-gray-700">
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"
                  aria-hidden="true"
                />
                {flag}
              </li>
            ))}
          </ul>
        </section>

        {/* Immediate actions */}
        <section>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Immediate Management
            </h3>
          </div>
          <ol className="flex flex-col gap-1.5" role="list">
            {profile.immediateActions.map((action, i) => (
              <li key={action} className="flex items-start gap-2 text-xs text-gray-700">
                <span
                  className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: colour }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </section>

        {/* Isolation / PPE */}
        <section className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Isolation & PPE
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-gray-700">{profile.isolationPPE}</p>
        </section>

        {/* WHO alert */}
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
              Reporting Requirement
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-amber-800">{profile.whoAlert}</p>
        </section>
      </div>
    </div>
  )
}
