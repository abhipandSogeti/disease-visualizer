import type { Disease } from '@/types/app.types'
import { AgeSexBreakdownChart } from './AgeSexBreakdownChart'
import { CaseFatalityRateChart } from './CaseFatalityRateChart'

interface EpidemiologyDetailSectionProps {
  iso3: string
  disease: Disease
}

export function EpidemiologyDetailSection({ iso3, disease }: EpidemiologyDetailSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Epidemiology Detail
      </h3>
      <AgeSexBreakdownChart iso3={iso3} diseaseId={disease.id} />
      <hr className="border-stone-300" />
      <CaseFatalityRateChart iso3={iso3} diseaseId={disease.id} />
    </div>
  )
}
