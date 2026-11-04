import { test as setup, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const authDir = path.join(__dirname, '..', '..', 'playwright', '.auth')
const ownerFile = path.join(authDir, 'owner.json')

const ownerUsername = process.env.E2E_OWNER_USERNAME ?? 'pohan'
const ownerPassword = process.env.E2E_OWNER_PASSWORD ?? 'owner123'

setup('authenticate as owner', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })
  await page.goto('/login')

  await page.fill('input[name="username"]', ownerUsername)
  await page.fill('input[name="password"]', ownerPassword)
  
  await page.click('button[type="submit"]')
  
  await page.waitForURL('**/dashboard**', { timeout: 15000 })
  
  await expect(page.locator('body')).toBeVisible()
  
  await page.context().storageState({ path: ownerFile })
})
