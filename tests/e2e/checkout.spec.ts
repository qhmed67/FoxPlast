import { test, expect } from '@playwright/test'

const BASKET = [
  {
    slug: 'nw-dcut-small',
    name: 'شنطة D-cut صغيرة (نموذج)',
    color: 'yellow',
    minQty: 100,
    qty: 500,
    tiers: [
      { minQty: 100, unitPricePiasters: 15000 },
      { minQty: 500, unitPricePiasters: 12000 },
    ],
  },
]

test('checkout validates contact data and previews the ticket', async ({ page }, testInfo) => {
  await page.addInitScript((basket) => {
    localStorage.setItem('fox-plast:basket:v1', JSON.stringify(basket))
  }, BASKET)

  await page.goto('/checkout')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('بيانات الطلب')
  await expect(page.getByText('شنطة D-cut صغيرة (نموذج)')).toBeVisible()

  await page.getByRole('button', { name: 'التالي' }).click()

  await page.getByLabel('الاسم').fill('أحمد')
  await page.locator('#phone').fill('123')
  await page.getByLabel('المحافظة').selectOption('القاهرة')
  await page.getByRole('button', { name: 'التالي' }).click()
  await expect(page.getByText('اكتب رقم موبايل مصري صحيح')).toBeVisible()

  await page.locator('#phone').fill('+20 100 123 4567')
  await page.getByRole('button', { name: 'التالي' }).click()
  await expect(page.getByText('اكتب العنوان بالتفصيل')).toBeVisible()

  await page.locator('#address').fill('شارع 45، العطارين، أمام مسجد النور')
  await page.getByRole('button', { name: 'التالي' }).click()

  await expect(page.getByText('العربون المطلوب')).toBeVisible()
  await expect(page.getByText('18000 ج.م').first()).toBeVisible()
  await expect(page.getByText('معاينة')).toBeVisible()

  await page.screenshot({
    path: `tests/e2e/checkout-ticket-${testInfo.project.name}.png`,
    fullPage: true,
  })
})
