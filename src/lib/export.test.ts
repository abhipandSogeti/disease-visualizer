import { describe, it, expect } from 'vitest'
import { buildCsvContent } from './export'

describe('buildCsvContent', () => {
  it('builds csv with headers and rows', () => {
    const csv = buildCsvContent(
      ['Country', 'Year', 'Cases'],
      [
        ['Nigeria', '2022', '68400000'],
        ['India', '2022', '5500000'],
      ],
    )
    expect(csv).toContain('Country,Year,Cases')
    expect(csv).toContain('Nigeria,2022,68400000')
    expect(csv).toContain('India,2022,5500000')
  })

  it('escapes commas in values', () => {
    const csv = buildCsvContent(['Name', 'Note'], [['Nigeria', 'High burden, endemic']])
    expect(csv).toContain('"High burden, endemic"')
  })

  it('escapes double-quotes in values', () => {
    const csv = buildCsvContent(['Name', 'Note'], [['Drug', 'Called "ACT"']])
    expect(csv).toContain('"Called ""ACT"""')
  })
})
