import { usePublicConfig, whatsappLink } from '../features/config/api'

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.7 4.85-1.27A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.13 15.07l-.3-.18-2.87.75.77-2.8-.19-.3A8.1 8.1 0 0 1 12.04 3.8Zm-3.1 4.05c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.16 1.74 2.75 4.28 3.75 2.11.83 2.54.67 3 .62.46-.04 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.28-.25-.12-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.12-.17.25-.65.81-.8.98-.14.16-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.42h-.5Z" />
    </svg>
  )
}

/**
 * Single solid-green WhatsApp action everywhere, including the order flow.
 * The variants only change placement (classic bottom-start vs editorial bottom-end).
 */
export function WhatsAppButton({ variant = 'classic' }: { variant?: 'classic' | 'editorial' }) {
  const { data } = usePublicConfig()
  const link = whatsappLink(
    data?.whatsappNumber ?? null,
    'عايز أستفسر عن شنط الدعاية من Fox Plast',
  )
  if (!link) return null

  const className =
    variant === 'editorial'
      ? 'fixed bottom-5 end-4 z-40 flex min-h-[48px] items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-[#052e16] shadow-xl'
      : 'fixed bottom-4 start-4 z-40 flex min-h-[48px] items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-[#052e16] shadow-lg'

  return (
    <a href={link} target="_blank" rel="noreferrer" className={className}>
      <WhatsAppGlyph className="h-5 w-5" />
      كلمنا واتساب
    </a>
  )
}
