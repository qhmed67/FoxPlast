import { Link } from 'react-router'

export default function CheckoutPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">بيانات الطلب</h1>
      <p className="text-muted-foreground">
        TODO(client): نموذج بيانات الطلب (الاسم، الموبايل، العنوان) — الخطوة الجاية في Phase 2.
      </p>
      <Link to="/basket" className="mt-4 inline-block text-secondary underline underline-offset-4">
        رجوع للطلب
      </Link>
    </section>
  )
}
