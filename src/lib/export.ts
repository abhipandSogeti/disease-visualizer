import { saveAs } from 'file-saver'

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildCsvContent(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvField).join(',')
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(','))
  return [headerLine, ...dataLines].join('\n')
}

export function exportAsCsv(filename: string, headers: string[], rows: string[][]): void {
  const csv = buildCsvContent(headers, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}.csv`)
}

export async function exportElementAsPng(element: HTMLElement, filename: string): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(element, { backgroundColor: '#020817', scale: 2 })
  canvas.toBlob((blob) => {
    if (blob) saveAs(blob, `${filename}.png`)
  })
}
