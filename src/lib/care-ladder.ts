import type { CareLadder } from '@/types/care-ladder.schema'
import type { RiskDiseaseId } from '@/types/risk.types'

export const CARE_LADDERS: CareLadder[] = [
  {
    diseaseId: 'dengue',
    source: 'WHO Dengue Guidelines',
    updated: '2024-01-01',
    firstLine: 'Supportive care. Paracetamol (acetaminophen) for fever and pain.',
    ifUnavailable: ['Tepid sponging and rest to manage fever.'],
    supportiveNoMedicine: [
      'Drink plenty of fluids (oral rehydration solution or clean water).',
      'Rest and monitor closely for warning signs.',
    ],
    avoid: [
      'NSAIDs and aspirin (ibuprofen, aspirin, diclofenac) — they raise bleeding risk in dengue.',
    ],
    redFlags: [
      'Severe abdominal pain or persistent vomiting',
      'Bleeding gums or nose, blood in vomit or stool',
      'Lethargy, restlessness, or rapid breathing',
      '→ Seek a health facility immediately.',
    ],
    populationNotes:
      'Infants, pregnant people, and older adults are at higher risk of severe disease.',
  },
  {
    diseaseId: 'cholera',
    source: 'WHO Cholera Guidelines',
    updated: '2024-01-01',
    firstLine:
      'Oral rehydration solution (ORS) is the cornerstone. Antibiotics for severe cases per WHO guidance.',
    ifUnavailable: [
      'Homemade ORS (WHO): 1 litre clean water + 6 level teaspoons sugar + ½ level teaspoon salt.',
    ],
    supportiveNoMedicine: [
      'Keep drinking fluids continuously to replace losses.',
      'Continue eating/feeding as tolerated.',
    ],
    avoid: ['Motility-stopping anti-diarrhoeal medicines — not recommended in cholera.'],
    redFlags: [
      'Signs of severe dehydration: sunken eyes, no urine, skin that stays pinched, lethargy',
      '→ Seek urgent care; IV fluids may be needed.',
    ],
    populationNotes: 'Young children dehydrate very quickly — escalate early.',
  },
]

export function getCareLadder(diseaseId: RiskDiseaseId): CareLadder | undefined {
  return CARE_LADDERS.find((l) => l.diseaseId === diseaseId)
}
