export interface CfrIndicators {
  deathsIndicator: string
  incidenceIndicator: string
}

export const CFR_INDICATORS: Record<string, CfrIndicators | null> = {
  malaria: {
    deathsIndicator: 'MALARIA_EST_DEATHS',
    incidenceIndicator: 'MALARIA_CONF_CASES',
  },
  tuberculosis: {
    deathsIndicator: 'TB_e_mort_exc_tbhiv_num',
    incidenceIndicator: 'TB_e_inc_num',
  },
  cholera: {
    deathsIndicator: 'CHOLERA_0000000002',
    incidenceIndicator: 'CHOLERA_0000000001',
  },
  hiv: null,
  polio: null,
  dengue: null,
  covid19: null,
  ebola: null,
}
