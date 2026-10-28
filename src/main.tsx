import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/readex-pro/600.css'
import '@fontsource/readex-pro/700.css'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'
import '@fontsource/ibm-plex-mono/500.css'
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
