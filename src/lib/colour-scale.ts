import { scaleSequential } from 'd3-scale'
import { interpolateReds } from 'd3-scale-chromatic'

export function createBurdenColourScale(maxValue: number) {
  return scaleSequential(interpolateReds).domain([0, maxValue])
}

export function getBurdenColour(value: number | null, maxValue: number): string {
  if (value === null) return '#1e293b'
  return createBurdenColourScale(maxValue)(value)
}

export const DISEASE_COLOURS: Record<string, string> = {
  viral: '#ef4444',
  respiratory: '#f59e0b',
  parasitic: '#22c55e',
  bacterial: '#3b82f6',
  vectorborne: '#14b8a6',
}
