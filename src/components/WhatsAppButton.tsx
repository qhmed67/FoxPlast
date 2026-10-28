import { usePublicConfig, whatsappLink } from '../features/config/api'

export function WhatsAppButton({ variant = 'classic' }: { variant?: 'classic' | 'editorial' }) {
  const { data } = usePublicConfig()
  const link = whatsappLink(
    data?.whatsappNumber ?? null,
    'عايز أستفسر عن شنط الدعاية من Fox Plast',
  )
  if (!link) return null

  const className =
    variant === 'editorial'
      ? 'fixed bottom-5 end-4 z-40 flex min-h-[46px] items-center gap-2 rounded-full bg-coal px-4 text-xs font-semibold text-bone shadow-xl ring-1 ring-white/10'
      : 'fixed bottom-4 start-4 z-40 flex min-h-[48px] items-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-lg'

  return (
    <a href={link} target="_blank" rel="noreferrer" className={className}>
      {variant === 'editorial' && <span className="h-2 w-2 rounded-full bg-[#25D366]" aria-hidden />}
      كلمنا واتساب
    </a>
  )
}
