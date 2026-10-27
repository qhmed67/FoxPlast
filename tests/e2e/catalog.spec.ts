import { test, expect } from '@playwright/test'

test('catalog and product render RTL with seed/live data', async ({ page }, testInfo) => {
  await page.goto('/catalog')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('المنتجات')

  const cards = page.locator('main ul > li')
  await expect(cards.first()).toBeVisible()
  await expect(cards.first().getByRole('heading', { level: 2 })).toBeVisible()
  await page.screenshot({
    path: `tests/e2e/catalog-${testInfo.project.name}.png`,
    fullPage: true,
  })

  await cards.first().getByRole('link').click()
  await expect(page).toHaveURL(/\/product\//)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'ضيف للطلب' })).toBeVisible()
  await page.screenshot({
    path: `tests/e2e/product-${testInfo.project.name}.png`,
    fullPage: true,
  })
})
