import { test, expect } from '@playwright/test'

test('basket enforces min qty and survives reload', async ({ page }, testInfo) => {
  await page.goto('/product/nw-dcut-small')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('D-cut')

  const qty = page.locator('#qty')
  await qty.fill('5')
  await qty.blur()
  await expect(qty).toHaveValue('100')

  await page.getByRole('button', { name: 'ضيف للطلب' }).click()
  await expect(page.getByText('تمت الإضافة للطلب ✓')).toBeVisible()

  await page.goto('/basket')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('الطلب')
  await expect(page.getByText('شنطة D-cut صغيرة (نموذج)')).toBeVisible()

  await page.reload()
  await expect(page.getByText('شنطة D-cut صغيرة (نموذج)')).toBeVisible()

  const basketQty = page.getByLabel('كمية شنطة D-cut صغيرة (نموذج)')
  await basketQty.fill('1')
  await expect(basketQty).toHaveValue('100')

  await page.screenshot({
    path: `tests/e2e/basket-${testInfo.project.name}.png`,
    fullPage: true,
  })

  await page.getByRole('button', { name: 'حذف شنطة D-cut صغيرة (نموذج)' }).click()
  await expect(page.getByText('السلة فاضية. اختار منتج وابدأ طلبك.')).toBeVisible()
})
