import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: false })

export const page = await browser.newPage()


const RETRY_LIMIT = 5
export async function retryPageLoad(page, url) {
  let retryCount = 1
  while (retryCount < RETRY_LIMIT) {
    try {
      await page.goto(url)
      return
    } catch (error) {
      console.error(`Failed to load page (${retryCount}/${RETRY_LIMIT}):`, error.message)
      await page.waitForTimeout(30000 * retryCount * 2)
      retryCount++
    }
  }
  console.error('Reached retry limit. Page load failed.')
}