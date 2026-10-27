// Meta Pixel is opt-in via VITE_META_PIXEL_ID. Without it, every call is a no-op.
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][] }

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

let initialized = false

export function initMetaPixel(): void {
  if (!PIXEL_ID || initialized || typeof window === 'undefined') return
  initialized = true

  // Official stub: queue calls until fbevents.js loads and replaces it.
  const fbq: Fbq = (...args: unknown[]) => {
    fbq.queue?.push(args)
  }
  fbq.queue = []
  window.fbq = fbq
  window._fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  fbq('init', PIXEL_ID)
  fbq('track', 'PageView')
}

export function trackLead(): void {
  window.fbq?.('track', 'Lead')
}
