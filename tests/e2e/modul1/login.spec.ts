import { test, expect } from '../fixtures'

test.describe('Modul 1 - Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=Welcome Back')).toBeVisible()
    await expect(page.locator('input[name="username"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await page.screenshot({ path: 'test-results/screenshots/login-page.png', fullPage: true })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="username"]', 'wronguser')
    await page.fill('input[name="password"]', 'WrongPass123!')
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-red-600')).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: 'test-results/screenshots/login-error.png', fullPage: true })
  })

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Lupa password?')
    await expect(page).toHaveURL(/\/reset-password/)
    await page.screenshot({ path: 'test-results/screenshots/reset-password-link.png', fullPage: true })
  })
})
