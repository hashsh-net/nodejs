import { chromium } from 'playwright';
import { sendTextMessage } from '../../lib/lineNotify.js';

const siteUrlArray = ["https://csgoempire.com/withdraw/steam/market"];

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  let linetext = "てすとだよ";
  let lineUrl;
  let nyusatuelement;

  for (const siteUrl of siteUrlArray) {
    await page.goto(siteUrl);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "example.png" });
    const button = page.locator("h4.ellipsis").locator("text = Filters");
    button.click();
    await page.waitForTimeout(1000);
    const button2 = page.locator('[for="trade_type_filter_auctions_only"]').locator("svg.h-full.w-full");
    button2.click();
    await page.waitForTimeout(500);
    const elements = await page.$$('div[class^="relative rounded"]');

    if (elements.length > 0) {
      for (const element of elements) {
        const paragraphElements = await element.$$('.popover-container .size-medium');
        for (const paragraph of paragraphElements) {
          const textInsideParagraph = await paragraph.textContent();
          console.log(textInsideParagraph);
          linetext = textInsideParagraph;
          nyusatuelement = element;
          //console.log(nyusatuelement);
        }
      }
    } else {
      console.log('要素が見つかりませんでした');
    }

    const nyusatuelement2 = await nyusatuelement.$$eval('a[href^="/item/"]', nodes => nodes.length > 0 ? nodes[0].href : null);
    if (nyusatuelement2) {
    lineUrl = nyusatuelement2;
    }
  }

  const token = "r273lQRIbRaiiekIylt5P2LaoMoiBMm4byFCh8krBRv";
  await sendTextMessage(token, linetext);
  await sendTextMessage(token, lineUrl);

  await browser.close();
}

main().catch(error => console.error(error));