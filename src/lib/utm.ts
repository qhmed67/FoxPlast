const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const KEY = 'fox-plast:utm:v1'

export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>

/** Captures UTM parameters once per tab so they survive navigation to checkout. */
export function captureUtm(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Utm = {}
    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) found[key] = value.slice(0, 120)
    }
    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(KEY, JSON.stringify(found))
    }
  } catch {
    // sessionStorage can be unavailable; attribution is optional.
  }
}

export function getUtm(): Utm {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Utm) : {}
  } catch {
    return {}
  }
}
