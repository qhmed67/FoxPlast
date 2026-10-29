// Single home for Arabic UI copy (docs/05 tip). Keys are stable; values are the final strings.
export const copy = {
  heroLine: 'شنط دعاية صديقة للبيئة… بتحمل اسم براندك',
  primaryCta: 'اطلب عرض سعر',
  secondaryCta: 'شوف شغلنا',
  addToBasket: 'ضيف للطلب',
  minQty: (n: number) => `أقل كمية للموديل ده ${n} قطعة`,
  paymentStep: 'حوّل العربون وارفع صورة التحويل — هنأكد لك في أقرب وقت',
  waiting: 'طلبك وصلنا ✓ — بنراجع الدفع',
  confirmed: 'تم تأكيد الدفع. بدأنا التجهيز',
  error: 'حصلت مشكلة. جرّب تاني، ولو استمرت كلمنا واتساب',
  nav: {
    home: 'الرئيسية',
    catalog: 'المنتجات',
    portfolio: 'أعمالنا',
    about: 'من نحن',
    contact: 'اتصل بنا',
    basket: 'السلة',
  },
  currency: 'ج.م',
} as const
