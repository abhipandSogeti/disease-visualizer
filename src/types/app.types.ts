export type Persona = 'analyst' | 'epidemiologist' | 'clinical'

export type DiseaseCategory = 'viral' | 'respiratory' | 'parasitic' | 'bacterial' | 'vectorborne'

export const DISEASE_CATEGORIES: DiseaseCategory[] = [
  'viral',
  'respiratory',
  'parasitic',
  'bacterial',
  'vectorborne',
]

export interface Disease {
  id: string
  name: string
  category: DiseaseCategory
  whoIndicator: string
  colour: string
  description: string
}

export const DEFAULT_DISEASES: Disease[] = [
  {
    id: 'malaria',
    name: 'Malaria',
    category: 'parasitic',
    whoIndicator: 'MALARIA_CONF_CASES',
    colour: 'disease-parasitic',
    description: 'A life-threatening disease spread by infected mosquito bites.',
  },
  {
    id: 'tuberculosis',
    name: 'Tuberculosis',
    category: 'bacterial',
    whoIndicator: 'MDG_0000000020',
    colour: 'disease-bacterial',
    description: 'A bacterial infection that mainly affects the lungs.',
  },
  {
    id: 'hiv',
    name: 'HIV / AIDS',
    category: 'viral',
    whoIndicator: 'HIV_0000000001',
    colour: 'disease-viral',
    description: 'A virus that attacks the immune system, leading to AIDS if untreated.',
  },
  {
    id: 'cholera',
    name: 'Cholera',
    category: 'bacterial',
    whoIndicator: 'CHOLERA_0000000001',
    colour: 'disease-bacterial',
    description: 'A severe diarrhoeal disease caused by contaminated water.',
  },
  {
    id: 'polio',
    name: 'Polio',
    category: 'viral',
    whoIndicator: 'WHS4_544',
    colour: 'disease-viral',
    description: 'A viral disease that can cause permanent paralysis, mainly in children.',
  },
  {
    id: 'dengue',
    name: 'Dengue',
    category: 'vectorborne',
    whoIndicator: '',
    colour: 'disease-vectorborne',
    description: 'A mosquito-borne viral disease causing high fever and severe joint pain.',
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    category: 'respiratory',
    whoIndicator: '',
    colour: 'disease-respiratory',
    description: 'A coronavirus disease that caused the 2020 global pandemic.',
  },
  {
    id: 'ebola',
    name: 'Ebola',
    category: 'viral',
    whoIndicator: '',
    colour: 'disease-viral',
    description: 'A rare but deadly virus causing severe haemorrhagic fever.',
  },
]

export interface CountryFeature {
  type: 'Feature'
  properties: { name: string; iso_a3: string; iso_a2: string }
  geometry: { type: string; coordinates: unknown }
}
