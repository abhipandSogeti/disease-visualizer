import { scaleSequential } from 'd3-scale'
import { interpolateReds } from 'd3-scale-chromatic'

export function createBurdenColourScale(maxValue: number) {
  return scaleSequential(interpolateReds).domain([0, maxValue])
}

export function getBurdenColour(value: number | null, maxValue: number): string {
  if (value === null) return 'rgba(0,0,0,0)'
  // d3 returns "rgb(r,g,b)" — add alpha so the earth texture shows through
  const rgb = createBurdenColourScale(maxValue)(value)
  return rgb.replace('rgb(', 'rgba(').replace(')', ',0.72)')
}

export const DISEASE_COLOURS: Record<string, string> = {
  viral: '#ef4444',
  respiratory: '#f59e0b',
  parasitic: '#22c55e',
  bacterial: '#3b82f6',
  vectorborne: '#14b8a6',
}
