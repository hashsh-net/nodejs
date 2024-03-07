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

export async function textData(page, selector) {
  try {
    const element = await page.$(selector)
    const text = await element.textContent()
    return text.trim()
  } catch (error) {
    return ''
  }
}

export async function textDataArray(page, selector) {

  try {
    const elements = await page.$$(selector)
    const textArray = []
    for (let element of elements) {
      const text = await element.textContent()
      textArray.push(text.trim())
    }
    return textArray 
  } catch (error) {
    return ''
  }
}

export async function attributeData(page, selector, attribute){
  try {
    const element = await page.$(selector)

    const data = await element.getAttribute(attribute)
    return data
  } catch (err) {
    console.log(`attributeData error:${attribute}:${selector}`)
    return ''
  }
}

export async function clickBottun(page, selector) {
  const readMoreButton = await page.$(selector)
  if (readMoreButton) {
    await readMoreButton.click()
  }
}