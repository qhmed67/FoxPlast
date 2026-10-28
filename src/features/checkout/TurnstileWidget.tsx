import { useEffect, useRef } from 'react'

type TurnstileOptions = {
  sitekey: string
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  callback: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_ID = 'cf-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('turnstile-script')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('turnstile-script')), { once: true })
    document.head.appendChild(script)
  })
}

type TurnstileWidgetProps = {
  siteKey: string | undefined
  onToken: (token: string | null) => void
}

/**
 * Cloudflare Turnstile widget. Renders nothing when VITE_TURNSTILE_SITE_KEY is
 * absent, which keeps local/dev and the current pre-key launch working; the
 * server also skips verification until TURNSTILE_SECRET is set.
 */
export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!siteKey || !container.current) return
    let widgetId: string | null = null
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return
        container.current.replaceChildren()
        widgetId = window.turnstile.render(container.current, {
          sitekey: siteKey,
          theme: 'light',
          language: 'ar',
          callback: (token) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        })
      })
      .catch(() => onToken(null))

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [siteKey, onToken])

  if (!siteKey) return null

  return (
    <div className="my-4 flex min-h-[65px] justify-center">
      <div ref={container} />
    </div>
  )
}
