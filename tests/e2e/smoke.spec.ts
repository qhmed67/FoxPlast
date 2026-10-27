import { test, expect } from '@playwright/test'

test('home renders RTL at 360px', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('شنط')
  await page.screenshot({ path: 'tests/e2e/smoke-home.png', fullPage: true })
})
