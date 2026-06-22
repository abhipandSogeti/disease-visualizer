import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/proxy/who': {
        target: 'https://ghoapi.azureedge.net',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/who/, '/api'),
      },
      '/proxy/disease': {
        target: 'https://disease.sh',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/disease/, '/v3'),
      },
      '/proxy/worldbank': {
        target: 'https://api.worldbank.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/worldbank/, '/v2'),
      },
      '/proxy/openfda': {
        target: 'https://api.fda.gov',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/openfda/, ''),
      },
      '/proxy/pubchem': {
        target: 'https://pubchem.ncbi.nlm.nih.gov',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/pubchem/, '/rest/pug'),
      },
      '/proxy/rxnorm': {
        target: 'https://rxnav.nlm.nih.gov',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/rxnorm/, '/REST'),
      },
      '/proxy/chembl': {
        target: 'https://www.ebi.ac.uk',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/proxy\/chembl/, '/chembl/api/data'),
      },
      '/proxy/geocode': {
        target: 'https://geocoding-api.open-meteo.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/geocode/, '/v1'),
      },
      '/proxy/openmeteo': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/openmeteo/, '/v1'),
      },
    },
  },
})
