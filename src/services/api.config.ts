const who: string = (import.meta.env.VITE_WHO_BASE as string | undefined) ?? '/proxy/who'
const disease: string =
  (import.meta.env.VITE_DISEASE_BASE as string | undefined) ?? '/proxy/disease'
const worldbank: string = (import.meta.env.VITE_WB_BASE as string | undefined) ?? '/proxy/worldbank'
const openfda: string = (import.meta.env.VITE_FDA_BASE as string | undefined) ?? '/proxy/openfda'
const pubchem: string =
  (import.meta.env.VITE_PUBCHEM_BASE as string | undefined) ?? '/proxy/pubchem'
const rxnorm: string = (import.meta.env.VITE_RXNORM_BASE as string | undefined) ?? '/proxy/rxnorm'
const chembl: string = (import.meta.env.VITE_CHEMBL_BASE as string | undefined) ?? '/proxy/chembl'

export const API_BASE = {
  who,
  disease,
  worldbank,
  openfda,
  pubchem,
  rxnorm,
  chembl,
} as const
