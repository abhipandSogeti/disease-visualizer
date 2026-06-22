import { ShieldAlert, Ban, Droplet, Pill } from 'lucide-react'
import type { CareLadder } from '@/types/care-ladder.schema'

function Section({
  title,
  items,
  icon,
  tone,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
  tone: string
}) {
  if (items.length === 0) return null
  return (
    <div className="mt-3">
      <p className={`flex items-center gap-1.5 text-xs font-semibold ${tone}`}>
        {icon}
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-6 text-xs text-gray-700">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  )
}

export function CareLadderPanel({ ladder }: { ladder: CareLadder }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <Section
        title="First-line"
        items={[ladder.firstLine]}
        icon={<Pill className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-gray-900"
      />
      <Section
        title="If medication is unavailable"
        items={ladder.ifUnavailable}
        icon={<Droplet className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-blue-700"
      />
      <Section
        title="When there is no medicine"
        items={ladder.supportiveNoMedicine}
        icon={<Droplet className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-blue-700"
      />
      <Section
        title="Do NOT use"
        items={ladder.avoid}
        icon={<Ban className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-red-700"
      />
      <Section
        title="Seek care now if"
        items={ladder.redFlags}
        icon={<ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />}
        tone="text-red-700"
      />
      {ladder.populationNotes && (
        <p className="mt-3 text-[11px] italic text-gray-500">{ladder.populationNotes}</p>
      )}
      <p className="mt-3 border-t border-stone-200 pt-2 text-[10px] text-gray-400">
        Source: {ladder.source} · updated {ladder.updated}
      </p>
    </div>
  )
}
