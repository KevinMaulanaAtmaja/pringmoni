import { test as setup, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { loginAs, ownerCredentials } from './fixtures'

const authDir = path.join(__dirname, '..', '..', 'playwright', '.auth')
const ownerFile = path.join(authDir, 'owner.json')

setup('authenticate as e2e owner', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })

  await loginAs(page, ownerCredentials())

  await expect(page.locator('body')).toBeVisible()

  await page.context().storageState({ path: ownerFile })
})
