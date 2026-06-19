import { describe, it, expect } from 'vitest'
import {
  WHOResponseSchema,
  DiseaseShCountrySchema,
  WorldBankResponseSchema,
  PubChemCompoundSchema,
  RxNormInteractionSchema,
} from './who.schema'

describe('WHOResponseSchema', () => {
  it('parses a valid WHO response', () => {
    const raw = {
      value: [
        {
          Id: 1,
          IndicatorCode: 'MALARIA_CASES',
          SpatialDim: 'NGA',
          TimeDim: 2022,
          NumericValue: 68400000,
          Low: null,
          High: null,
          Dim1Type: null,
          Dim1: null,
          Dim2Type: null,
          Dim2: null,
        },
      ],
    }
    const result = WHOResponseSchema.parse(raw)
    expect(result.value[0].NumericValue).toBe(68400000)
  })

  it('allows null NumericValue', () => {
    const raw = {
      value: [
        {
          Id: 2,
          IndicatorCode: 'MALARIA_CASES',
          SpatialDim: 'USA',
          TimeDim: 2022,
          NumericValue: null,
          Low: null,
          High: null,
          Dim1Type: null,
          Dim1: null,
          Dim2Type: null,
          Dim2: null,
        },
      ],
    }
    expect(() => WHOResponseSchema.parse(raw)).not.toThrow()
  })
})

describe('DiseaseShCountrySchema', () => {
  it('parses a valid disease.sh country record', () => {
    const raw = {
      country: 'Nigeria',
      countryInfo: { iso2: 'NG', iso3: 'NGA', lat: 10, long: 8 },
      cases: 100000,
      todayCases: 500,
      deaths: 1200,
      todayDeaths: 5,
      recovered: 95000,
      active: 3800,
      critical: 100,
      updated: 1700000000000,
    }
    const result = DiseaseShCountrySchema.parse(raw)
    expect(result.country).toBe('Nigeria')
  })
})

describe('WorldBankResponseSchema', () => {
  it('parses a valid World Bank tuple response', () => {
    const raw = [
      { page: 1, total: 1 },
      [
        {
          indicator: { id: 'SP.POP.TOTL', value: 'Population, total' },
          country: { id: 'NG', value: 'Nigeria' },
          date: '2022',
          value: 218541212,
        },
      ],
    ]
    const [meta, data] = WorldBankResponseSchema.parse(raw)
    expect(meta.total).toBe(1)
    expect(data[0].value).toBe(218541212)
  })
})

describe('PubChemCompoundSchema', () => {
  it('parses a valid PubChem compound', () => {
    const raw = {
      cid: 2244,
      molecularFormula: 'C9H8O4',
      molecularWeight: '180.16',
      isomericSmiles: 'CC(=O)Oc1ccccc1C(=O)O',
      iupacName: '2-acetyloxybenzoic acid',
      inchiKey: 'BSYNRYMUTXBXSQ-UHFFFAOYSA-N',
    }
    const result = PubChemCompoundSchema.parse(raw)
    expect(result.cid).toBe(2244)
  })
})

describe('RxNormInteractionSchema', () => {
  it('parses a valid RxNorm interaction', () => {
    const raw = {
      minConceptItem: { rxcui: '1049502', name: 'Warfarin', tty: 'IN' },
      interactionPair: [
        {
          interactionConcept: [
            {
              minConceptItem: { name: 'Aspirin', rxcui: '1191' },
              sourceConceptItem: {
                name: 'Aspirin/Warfarin',
                description: 'Increased bleeding risk',
              },
            },
          ],
          severity: 'high',
          description: 'Concurrent use increases bleeding risk.',
        },
      ],
    }
    const result = RxNormInteractionSchema.parse(raw)
    expect(result.minConceptItem.name).toBe('Warfarin')
  })
})
