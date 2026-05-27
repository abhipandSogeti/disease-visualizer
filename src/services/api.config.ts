const who: string =
  (import.meta.env.VITE_WHO_BASE as string | undefined) ?? 'https://ghoapi.azureedge.net/api'
const disease: string =
  (import.meta.env.VITE_DISEASE_BASE as string | undefined) ?? 'https://disease.sh/v3'
const worldbank: string =
  (import.meta.env.VITE_WB_BASE as string | undefined) ?? 'https://api.worldbank.org/v2'
const openfda: string =
  (import.meta.env.VITE_FDA_BASE as string | undefined) ?? 'https://api.fda.gov'
const pubchem: string =
  (import.meta.env.VITE_PUBCHEM_BASE as string | undefined) ??
  'https://pubchem.ncbi.nlm.nih.gov/rest/pug'
const rxnorm: string =
  (import.meta.env.VITE_RXNORM_BASE as string | undefined) ?? 'https://rxnav.nlm.nih.gov/REST'
const chembl: string =
  (import.meta.env.VITE_CHEMBL_BASE as string | undefined) ??
  'https://www.ebi.ac.uk/chembl/api/data'

export const API_BASE = {
  who,
  disease,
  worldbank,
  openfda,
  pubchem,
  rxnorm,
  chembl,
} as const
