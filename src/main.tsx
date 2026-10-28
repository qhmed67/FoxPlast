import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
// Only the Arabic + Latin subsets actually used by the storefront.
import '@fontsource/readex-pro/arabic-600.css'
import '@fontsource/readex-pro/arabic-700.css'
import '@fontsource/readex-pro/latin-600.css'
import '@fontsource/readex-pro/latin-700.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css'
import '@fontsource/ibm-plex-sans-arabic/latin-400.css'
import '@fontsource/ibm-plex-sans-arabic/latin-500.css'
import '@fontsource/ibm-plex-sans-arabic/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import './styles/globals.css'
import './styles/morph.css'
import './styles/motion.css'
import './styles/ticket.css'
import './styles/editorial.css'
import { queryClient } from './lib/queryClient'
import { initMetaPixel } from './lib/meta'
import { captureUtm } from './lib/utm'
import App from './App.tsx'

initMetaPixel()
captureUtm()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
