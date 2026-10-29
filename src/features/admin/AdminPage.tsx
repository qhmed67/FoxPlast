import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BrandMark } from '../../components/BrandLogo'
import { supabase } from '../../lib/supabase'
import {
  adminEmailFor,
  fetchAdminOrders,
  setOrderStatus,
  signProof,
  whatsappUrl,
} from './api'
import {
  NEXT_ACTIONS,
  STATUS_LABELS,
  STATUS_STYLES,
  type AdminOrder,
  type AdminProof,
  type OrderStatus,
} from './types'

type AdminSession = { userId: string; email: string; name: string }

const money = (piasters: number) => `${(piasters / 100).toLocaleString('en-US')} ج.م`

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'Africa/Cairo',
  }).format(new Date(iso))

function mapAuthError(message: string): string {
  const value = message.toLowerCase()
  if (value.includes('invalid login')) return 'اسم المستخدم أو كلمة المرور غلط.'
  if (value.includes('email not confirmed')) return 'الحساب مش مفعّل. فعّله من لوحة Supabase.'
  if (value.includes('too many')) return 'محاولات كثيرة. استنى شوية وجرّب تاني.'
  return 'تعذّر تسجيل الدخول. جرّب تاني.'
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function LoginScreen({
  error,
  onLogin,
}: {
  error: string | null
  onLogin: (username: string, password: string) => Promise<void>
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!username.trim() || !password) return
    setBusy(true)
    try {
      await onLogin(username, password)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bone px-4 py-12 text-coal">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-sand bg-white p-6 shadow-[0_1px_0_rgba(13,13,11,0.04)] sm:p-8"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <BrandMark size={38} />
          <span
            className="text-xl font-bold leading-none"
            style={{ fontFamily: 'Readex Pro, sans-serif' }}
          >
            Fox Plast
          </span>
        </div>

        <h1 className="text-center text-lg font-bold">لوحة الإدارة</h1>
        <p className="mt-1 text-center text-xs text-coal/55">
          ادخل باسم المستخدم وكلمة المرور
        </p>

        <div className="mt-7 space-y-4">
          <div>
            <label htmlFor="admin-username" className="mb-1.5 block text-xs font-semibold">
              اسم المستخدم
            </label>
            <input
              id="admin-username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              dir="ltr"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-12 w-full rounded-none border border-sand bg-bone/40 px-3 text-sm outline-none transition-colors focus:border-coal"
              placeholder="ahmed"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold">
              كلمة المرور
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-none border border-sand bg-bone/40 px-3 text-sm outline-none transition-colors focus:border-coal"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !username.trim() || !password}
          className="mt-6 h-12 w-full bg-coal text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black disabled:opacity-40"
        >
          {busy ? 'بندخل…' : 'دخول'}
        </button>

        <p className="mt-5 text-center text-[10px] leading-5 text-coal/45">
          لو عندك بريد إداري، اكتبه كامل مكان اسم المستخدم.
        </p>
        <a
          href="/"
          className="mt-4 block text-center text-[11px] font-medium text-clay underline-offset-4 hover:underline"
        >
          رجوع للمتجر
        </a>
      </form>
    </div>
  )
}

function ProofButton({ proof }: { proof: AdminProof }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function open() {
    setBusy(true)
    setError(null)
    try {
      const url = await signProof(proof.file_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('مش قادر أفتح الصورة.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-sand py-2 text-xs first:border-t-0">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {proof.amount_claimed_piasters
            ? money(proof.amount_claimed_piasters)
            : 'إيصال تحويل'}
        </p>
        <p className="text-[10px] text-coal/50">{formatDate(proof.created_at)}</p>
        {error && <p className="text-[10px] text-rose-700">{error}</p>}
      </div>
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className="shrink-0 border border-coal/20 px-2.5 py-1.5 text-[10px] font-semibold transition-colors hover:border-coal disabled:opacity-50"
      >
        {busy ? 'بيفتح…' : 'عرض'}
      </button>
    </div>
  )
}

function OrderDetail({
  order,
  onClose,
  onChanged,
}: {
  order: AdminOrder
  onClose: () => void
  onChanged: () => void
}) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<OrderStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const items = order.order_items ?? []
  const events = [...(order.order_events ?? [])].sort((a, b) => b.id - a.id)
  const proofs = [...(order.payment_proofs ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )
  const actions = NEXT_ACTIONS[order.status] ?? []
  const wa = whatsappUrl(
    order.phone,
    `مرحباً ${order.customer_name}، بخصوص طلبك ${order.code} من Fox Plast — عايزين نأكد الدفع والعنوان.`,
  )

  async function change(to: OrderStatus) {
    setBusy(to)
    setError(null)
    try {
      const result = await setOrderStatus(order.code, to, note.trim() || null)
      if (result.ok === false) {
        setError(
          result.error === 'invalid_transition'
            ? 'الحالة اتغيّرت من حد تاني. حدّث القائمة.'
            : 'مش قادر أعدّل الطلب.',
        )
      } else {
        setNote('')
        onChanged()
      }
    } catch {
      setError('حصل خطأ في الاتصال. جرّب تاني.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bone p-4 text-coal lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0">
      <div className="border border-sand bg-white lg:sticky lg:top-20">
        <div className="flex items-start justify-between gap-3 border-b border-sand p-4">
          <div>
            <p className="font-mono text-sm font-bold" dir="ltr">
              {order.code}
            </p>
            <p className="mt-0.5 text-[11px] text-coal/50">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-8 w-8 place-items-center border border-sand text-lg leading-none text-coal/60 transition-colors hover:border-coal hover:text-coal lg:hidden"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-5 p-4">
          {order.requires_manual_quote && (
            <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900">
              الطلب محتاج تسعير يدوي قبل الدفع.
            </p>
          )}

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/45">
              العميل
            </h3>
            <p className="text-sm font-semibold">{order.customer_name}</p>
            <p className="mt-0.5 text-xs text-coal/70" dir="ltr">
              {order.phone}
            </p>
            <p className="mt-1 text-xs text-coal/70">{order.governorate}</p>
            <p className="mt-2 border-s-2 border-clay/60 bg-bone/60 px-3 py-2 text-sm leading-6">
              {order.address || 'مفيش عنوان مسجل (طلب قديم).'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 bg-[#25D366] px-3 py-2 text-xs font-semibold text-[#052e16] transition-opacity hover:opacity-90"
              >
                تواصل واتساب
              </a>
              <a
                href={`tel:${order.phone}`}
                className="inline-flex min-h-10 items-center border border-coal/20 px-3 py-2 text-xs font-semibold transition-colors hover:border-coal"
              >
                اتصال
              </a>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/45">
              الأصناف
            </h3>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-xs">
                  <span>
                    <span className="font-semibold">{item.qty}×</span> {item.product_name}
                    {item.variant?.color ? (
                      <span className="text-coal/50"> — {item.variant.color}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-mono text-[11px]">
                    {money(item.line_total_piasters ?? item.qty * item.unit_price_piasters)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-sand pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-coal/55">الإجمالي</dt>
                <dd className="font-semibold">{money(order.subtotal_piasters)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-coal/55">العربون</dt>
                <dd className="font-semibold">{money(order.deposit_piasters)}</dd>
              </div>
            </dl>
          </section>

          {order.notes && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/45">
                ملاحظات العميل
              </h3>
              <p className="text-xs leading-6 text-coal/75">{order.notes}</p>
            </section>
          )}

          {proofs.length > 0 && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/45">
                إيصالات الدفع
              </h3>
              {proofs.map((proof) => (
                <ProofButton key={proof.id} proof={proof} />
              ))}
            </section>
          )}

          {actions.length > 0 && (
            <section className="border-t border-sand pt-4">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/45">
                تغيير الحالة
              </h3>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="ملاحظة اختيارية على التغيير"
                className="mb-2 h-10 w-full rounded-none border border-sand bg-bone/40 px-3 text-xs outline-none focus:border-coal"
              />
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => {
                  const destructive = action.to === 'cancelled'
                  return (
                    <button
                      key={action.to}
                      type="button"
                      onClick={() => change(action.to)}
                      disabled={busy !== null}
                      className={`min-h-10 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        destructive
                          ? 'border border-rose-300 text-rose-700 hover:bg-rose-50'
                          : 'bg-coal text-bone hover:bg-black'
                      }`}
                    >
                      {busy === action.to ? '…' : action.label}
                    </button>
                  )
                })}
              </div>
              {error && (
                <p role="alert" className="mt-2 text-[11px] text-rose-700">
                  {error}
                </p>
              )}
            </section>
          )}

          {events.length > 0 && (
            <section>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/45">
                سجل الحالة
              </h3>
              <ol className="space-y-2">
                {events.map((event) => (
                  <li key={event.id} className="text-[11px] leading-5 text-coal/65">
                    <span className="font-semibold text-coal">
                      {STATUS_LABELS[event.to_status]}
                    </span>{' '}
                    · {event.actor} · {formatDate(event.at)}
                    {event.note && <span className="block text-coal/45">{event.note}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AdminSession | null>(null)
  const [checking, setChecking] = useState(supabase !== null)
  const [authError, setAuthError] = useState<string | null>(
    supabase ? null : 'الموقع مش متظبط على قاعدة البيانات.',
  )
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const resolveAdmin = useCallback(async (userId: string, email: string) => {
    if (!supabase) throw new Error('no-backend')
    const { data, error } = await supabase
      .from('admins')
      .select('name')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('not-admin')

    const name =
      typeof (data as { name?: unknown }).name === 'string' && (data as { name: string }).name
        ? (data as { name: string }).name
        : email
    setSession({ userId, email, name })
  }, [])

  useEffect(() => {
    if (!supabase) return

    let alive = true
    void supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (user) {
        try {
          await resolveAdmin(user.id, user.email ?? '')
        } catch {
          if (alive) setAuthError('الحساب ده مش أدمن. كلّم صاحب الموقع.')
        }
      }
      if (alive) setChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!next?.user) setSession(null)
    })

    return () => {
      alive = false
      listener.subscription.unsubscribe()
    }
  }, [resolveAdmin])

  const login = useCallback(
    async (username: string, password: string) => {
      if (!supabase) return
      setAuthError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmailFor(username),
        password,
      })

      if (error) {
        setAuthError(mapAuthError(error.message))
        return
      }

      try {
        await resolveAdmin(data.user.id, data.user.email ?? adminEmailFor(username))
      } catch (error) {
        await supabase.auth.signOut()
        setAuthError(
          error instanceof Error && error.message === 'not-admin'
            ? 'الحساب ده مش مضاف كأدمن. ضيفه من لوحة Supabase.'
            : 'تعذّر التحقق من صلاحيات الحساب.',
        )
      }
    },
    [resolveAdmin],
  )

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAdminOrders,
    enabled: session !== null,
    staleTime: 0,
    refetchInterval: 20_000,
  })

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])

  const counts = useMemo(() => {
    const map = new Map<OrderStatus, number>()
    for (const order of orders) map.set(order.status, (map.get(order.status) ?? 0) + 1)
    return map
  }, [orders])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (!term) return true
      return [order.code, order.customer_name, order.phone, order.address ?? '', order.governorate]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [orders, search, statusFilter])

  const selected = orders.find((order) => order.id === selectedId) ?? null

  async function logout() {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setSelectedId(null)
    queryClient.removeQueries({ queryKey: ['admin-orders'] })
  }

  function exportCsv() {
    const header = [
      'code',
      'status',
      'name',
      'phone',
      'governorate',
      'address',
      'subtotal_egp',
      'deposit_egp',
      'created_at',
    ]
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
    const rows = filtered.map((order) =>
      [
        order.code,
        STATUS_LABELS[order.status],
        order.customer_name,
        order.phone,
        order.governorate,
        order.address ?? '',
        (order.subtotal_piasters / 100).toFixed(2),
        (order.deposit_piasters / 100).toFixed(2),
        order.created_at,
      ]
        .map(escape)
        .join(','),
    )
    const blob = new Blob([`\uFEFF${[header.join(','), ...rows].join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fox-plast-orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-bone text-sm text-coal/50">
        بنحمّل…
      </div>
    )
  }

  if (!session) return <LoginScreen error={authError} onLogin={login} />

  return (
    <div className="min-h-screen bg-bone pb-16 text-coal">
      <header className="sticky top-0 z-30 border-b border-coal/10 bg-coal text-bone">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4">
          <BrandMark size={28} tone="paper" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Fox Plast</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-bone/50">الإدارة</p>
          </div>
          <span className="ms-auto hidden text-xs text-bone/60 sm:inline">{session.name}</span>
          <a
            href="/"
            className="hidden border border-bone/25 px-3 py-2 text-[11px] font-semibold transition-colors hover:border-bone sm:inline-block"
          >
            المتجر
          </a>
          <button
            type="button"
            onClick={logout}
            className="border border-bone/25 px-3 py-2 text-[11px] font-semibold transition-colors hover:border-bone"
          >
            خروج
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">الطلبات</h1>
            <p className="mt-0.5 text-xs text-coal/50">
              {filtered.length} من {orders.length} طلب · بيتم التحديث كل 20 ثانية
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void ordersQuery.refetch()}
              className="min-h-10 border border-coal/20 px-3 py-2 text-xs font-semibold transition-colors hover:border-coal"
            >
              تحديث
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="min-h-10 border border-coal/20 px-3 py-2 text-xs font-semibold transition-colors hover:border-coal disabled:opacity-40"
            >
              تصدير CSV
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['submitted', 'جديدة'],
              ['awaiting_payment', 'بانتظار الدفع'],
              ['paid', 'مدفوعة'],
              ['in_production', 'في التجهيز'],
            ] as const
          ).map(([status, label]) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`border px-3 py-2.5 text-start transition-colors ${
                statusFilter === status
                  ? 'border-coal bg-coal text-bone'
                  : 'border-sand bg-white hover:border-coal/40'
              }`}
            >
              <span className="block text-lg font-bold leading-none">
                {counts.get(status) ?? 0}
              </span>
              <span className="mt-1 block text-[10px] opacity-60">{label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالكود، الاسم، الموبايل، أو العنوان"
            className="h-11 flex-1 rounded-none border border-sand bg-white px-3 text-sm outline-none focus:border-coal"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
            className="h-11 rounded-none border border-sand bg-white px-3 text-sm outline-none focus:border-coal"
          >
            <option value="all">كل الحالات</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {ordersQuery.isError && (
          <p role="alert" className="mb-4 border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            مش قادر أجيب الطلبات. تأكد إن حسابك أدمن وإن الـ RLS متظبط.
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="border border-sand bg-white">
            {ordersQuery.isPending ? (
              <p className="p-6 text-center text-xs text-coal/50">بنحمّل الطلبات…</p>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-xs text-coal/50">مفيش طلبات مطابقة.</p>
            ) : (
              <ul className="divide-y divide-sand">
                {filtered.map((order) => (
                  <li key={order.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(order.id)}
                      className={`w-full px-4 py-3 text-start transition-colors ${
                        selectedId === order.id ? 'bg-bone' : 'hover:bg-bone/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold" dir="ltr">
                          {order.code}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1.5 text-sm font-semibold">{order.customer_name}</p>
                      <p className="text-[11px] text-coal/55" dir="ltr">
                        {order.phone}
                      </p>
                      <p className="mt-1 line-clamp-1 text-[11px] text-coal/55">
                        {order.governorate}
                        {order.address ? ` — ${order.address}` : ''}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <span className="font-semibold">{money(order.subtotal_piasters)}</span>
                        <span className="text-coal/45">{formatDate(order.created_at)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected ? (
            <OrderDetail
              key={selected.id}
              order={selected}
              onClose={() => setSelectedId(null)}
              onChanged={() => void ordersQuery.refetch()}
            />
          ) : (
            <div className="hidden border border-dashed border-sand p-10 text-center text-xs text-coal/40 lg:block">
              اختار طلب من القائمة عشان تشوف التفاصيل وتغيّر حالته.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
