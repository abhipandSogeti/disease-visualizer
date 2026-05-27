export interface LandmarkEvent {
  year: number
  title: string
  description: string
  type: 'outbreak' | 'intervention' | 'discovery' | 'milestone' | 'warning'
}

export const DISEASE_LANDMARKS: Record<string, LandmarkEvent[]> = {
  malaria: [
    {
      year: 1897,
      title: 'Mosquito transmission discovered',
      description:
        'Ronald Ross proved malaria is transmitted by the Anopheles mosquito, winning the Nobel Prize.',
      type: 'discovery',
    },
    {
      year: 1955,
      title: 'WHO Global Eradication Programme',
      description:
        'WHO launched a programme to eradicate malaria using DDT and chloroquine. Succeeded in 11 countries.',
      type: 'intervention',
    },
    {
      year: 1972,
      title: 'DDT banned in the US',
      description: 'Environmental concerns led to the US ban on DDT, slowing eradication efforts.',
      type: 'milestone',
    },
    {
      year: 1990,
      title: 'Chloroquine resistance spreads',
      description: 'Resistance to chloroquine spread to nearly all malaria-endemic regions.',
      type: 'warning',
    },
    {
      year: 2006,
      title: 'RTS,S vaccine trials begin',
      description:
        'Phase 3 trials of the first malaria vaccine candidate began in sub-Saharan Africa.',
      type: 'intervention',
    },
    {
      year: 2021,
      title: 'RTS,S vaccine approved',
      description:
        'WHO recommended the RTS,S/AS01 vaccine for broad use — the first malaria vaccine approved.',
      type: 'milestone',
    },
  ],
  tuberculosis: [
    {
      year: 1882,
      title: 'TB bacillus discovered',
      description:
        'Robert Koch identified Mycobacterium tuberculosis, winning the 1905 Nobel Prize.',
      type: 'discovery',
    },
    {
      year: 1921,
      title: 'BCG vaccine introduced',
      description:
        'The BCG vaccine began widespread use, offering partial protection against severe TB.',
      type: 'intervention',
    },
    {
      year: 1943,
      title: 'Streptomycin discovered',
      description:
        'The first antibiotic effective against TB was discovered, transforming treatment.',
      type: 'discovery',
    },
    {
      year: 1993,
      title: 'WHO declares TB global emergency',
      description:
        'TB was declared a global health emergency as cases surged amid the HIV epidemic.',
      type: 'warning',
    },
    {
      year: 2006,
      title: 'XDR-TB emerges',
      description: 'Extensively drug-resistant TB was identified in 49 countries.',
      type: 'warning',
    },
    {
      year: 2015,
      title: 'End TB Strategy launched',
      description:
        "WHO's End TB Strategy targeted 95% reduction in deaths and 90% reduction in cases by 2035.",
      type: 'intervention',
    },
  ],
  hiv: [
    {
      year: 1981,
      title: 'First AIDS cases reported',
      description: 'The CDC reported the first cases of AIDS in Los Angeles.',
      type: 'outbreak',
    },
    {
      year: 1983,
      title: 'HIV identified',
      description: 'Researchers at the Pasteur Institute identified the retrovirus causing AIDS.',
      type: 'discovery',
    },
    {
      year: 1987,
      title: 'AZT approved',
      description: 'Zidovudine became the first antiretroviral drug approved for HIV treatment.',
      type: 'intervention',
    },
    {
      year: 1996,
      title: 'HAART transforms treatment',
      description: 'Combination antiretroviral therapy dramatically reduced AIDS deaths worldwide.',
      type: 'milestone',
    },
    {
      year: 2003,
      title: 'PEPFAR launched',
      description: 'The US committed $15 billion to fight HIV globally through PEPFAR.',
      type: 'intervention',
    },
    {
      year: 2012,
      title: 'PrEP approved',
      description:
        'Pre-exposure prophylaxis offered near-complete protection for high-risk individuals.',
      type: 'milestone',
    },
  ],
  covid19: [
    {
      year: 2019,
      title: 'Novel coronavirus emerges',
      description: 'A novel coronavirus was identified in Wuhan, China in December 2019.',
      type: 'outbreak',
    },
    {
      year: 2020,
      title: 'WHO declares pandemic',
      description: 'WHO declared COVID-19 a pandemic on March 11, 2020.',
      type: 'outbreak',
    },
    {
      year: 2020,
      title: 'Vaccines authorised',
      description:
        'Multiple vaccines received emergency authorisation within 12 months — a record.',
      type: 'milestone',
    },
    {
      year: 2021,
      title: 'Delta variant dominates',
      description:
        'The Delta variant caused a major global resurgence in cases and hospitalisations.',
      type: 'warning',
    },
    {
      year: 2021,
      title: 'Omicron emerges',
      description: 'The highly transmissible Omicron variant was detected in southern Africa.',
      type: 'warning',
    },
    {
      year: 2023,
      title: 'WHO ends global emergency',
      description:
        'WHO declared the end of COVID-19 as a public health emergency of international concern.',
      type: 'milestone',
    },
  ],
  ebola: [
    {
      year: 1976,
      title: 'Ebola first identified',
      description: 'Ebola virus was first identified during outbreaks in what is now the DRC.',
      type: 'discovery',
    },
    {
      year: 2014,
      title: 'West Africa epidemic',
      description:
        'The largest Ebola outbreak in history killed over 11,000 in Guinea, Sierra Leone, and Liberia.',
      type: 'outbreak',
    },
    {
      year: 2016,
      title: 'West Africa declared Ebola-free',
      description: 'WHO declared the end of the West Africa Ebola epidemic.',
      type: 'milestone',
    },
    {
      year: 2019,
      title: 'First Ebola vaccine approved',
      description:
        'The rVSV-ZEBOV vaccine was approved, offering high efficacy against the Zaire strain.',
      type: 'milestone',
    },
  ],
  dengue: [
    {
      year: 1943,
      title: 'Dengue virus isolated',
      description: 'The dengue virus was first isolated in Japan, enabling scientific study.',
      type: 'discovery',
    },
    {
      year: 1981,
      title: 'Haemorrhagic fever epidemic',
      description: 'A major dengue haemorrhagic fever epidemic struck Cuba.',
      type: 'outbreak',
    },
    {
      year: 2019,
      title: 'Record global cases',
      description: '2019 saw a record 5.2 million dengue cases reported globally.',
      type: 'warning',
    },
  ],
  cholera: [
    {
      year: 1854,
      title: 'John Snow traces source',
      description:
        'John Snow mapped cholera cases in London, tracing the outbreak to a water pump — founding epidemiology.',
      type: 'discovery',
    },
    {
      year: 1961,
      title: 'Seventh pandemic begins',
      description:
        'The current seventh cholera pandemic began in Indonesia and has since spread globally.',
      type: 'outbreak',
    },
    {
      year: 2010,
      title: 'Haiti outbreak',
      description:
        'A devastating cholera outbreak followed the Haiti earthquake, killing over 10,000.',
      type: 'outbreak',
    },
    {
      year: 2016,
      title: 'Yemen crisis',
      description:
        "Yemen's conflict triggered one of the largest cholera outbreaks in recorded history.",
      type: 'outbreak',
    },
  ],
  polio: [
    {
      year: 1955,
      title: 'Salk vaccine approved',
      description: "Jonas Salk's inactivated polio vaccine was declared safe and effective.",
      type: 'milestone',
    },
    {
      year: 1961,
      title: 'Oral vaccine introduced',
      description: "Albert Sabin's oral polio vaccine enabled mass immunisation campaigns.",
      type: 'intervention',
    },
    {
      year: 1988,
      title: 'Global eradication initiative launched',
      description: "WHO's Global Polio Eradication Initiative reduced cases by over 99.9%.",
      type: 'intervention',
    },
    {
      year: 1994,
      title: 'Americas certified polio-free',
      description: 'The WHO Americas region was certified free of wild poliovirus.',
      type: 'milestone',
    },
    {
      year: 2020,
      title: 'Africa certified wild polio-free',
      description: 'The African region was certified free of wild poliovirus.',
      type: 'milestone',
    },
  ],
}
