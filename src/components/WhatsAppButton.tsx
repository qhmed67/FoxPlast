import { usePublicConfig, whatsappLink } from '../features/config/api'

export function WhatsAppButton() {
  const { data } = usePublicConfig()
  const link = whatsappLink(
    data?.whatsappNumber ?? null,
    'عايز أستفسر عن شنط الدعاية من Fox Plast',
  )
  if (!link) return null

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 start-4 z-40 flex min-h-[48px] items-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-lg"
    >
      كلمنا واتساب
    </a>
  )
}
