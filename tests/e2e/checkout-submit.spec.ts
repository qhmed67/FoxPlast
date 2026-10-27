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

const TICKET = {
  code: 'FP-ABC234',
  token: 'test-token',
  status: 'awaiting_payment',
  subtotalPiasters: 6_000_000,
  depositPiasters: 1_800_000,
  expiresAt: new Date(Date.now() + 72 * 3_600_000).toISOString(),
  items: [
    { name: 'شنطة D-cut صغيرة (نموذج)', color: 'أصفر', qty: 500, unitPricePiasters: 12000 },
  ],
}

async function reachReview(page: import('@playwright/test').Page) {
  await page.goto('/checkout')
  await page.getByRole('button', { name: 'التالي' }).click()
  await page.getByLabel('الاسم').fill('أحمد')
  await page.getByLabel('الموبايل').fill('01001234567')
  await page.getByLabel('المحافظة').selectOption('القاهرة')
  await page.getByRole('button', { name: 'التالي' }).click()
  await expect(page.getByText('معاينة')).toBeVisible()
}

test('checkout retries with the same idempotency key after a server error', async ({ page }, testInfo) => {
  await page.addInitScript((basket) => {
    localStorage.setItem('fox-plast:basket:v1', JSON.stringify(basket))
  }, BASKET)

  const keys: string[] = []
  let calls = 0
  await page.route('**/functions/v1/create-order', async (route) => {
    keys.push((route.request().postDataJSON() as { idempotency_key: string }).idempotency_key)
    calls += 1
    if (calls === 1) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'server_error' }),
      })
      return
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(TICKET),
    })
  })

  await reachReview(page)

  await page.getByRole('button', { name: 'أكد الطلب' }).click()
  await expect(page.getByText('حصلت مشكلة. جرّب تاني')).toBeVisible()

  await page.getByRole('button', { name: 'أكد الطلب' }).click()
  await expect(page.getByRole('heading', { name: 'تم استلام طلبك' })).toBeVisible()
  await expect(page.getByText('FP-ABC234')).toBeVisible()
  await expect(page.getByText('18000 ج.م').first()).toBeVisible()

  expect(calls).toBe(2)
  expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/)
  expect(keys[1]).toBe(keys[0])

  await page.screenshot({
    path: `tests/e2e/checkout-success-${testInfo.project.name}.png`,
    fullPage: true,
  })
})
