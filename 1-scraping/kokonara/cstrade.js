import { chromium } from 'playwright';
import { sendTextMessage } from '../../lib/lineNotify.js';

//ランダムな時間を返す
function RT(time){
    return Math.random()*time/4 + time;
}

const siteUrlArray = ["https://csgoempire.com/withdraw/steam/market"];

async function main() {
  //console.log(randTime(500));
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  let linetext;
  let lineUrl;
  let lineName;
  let linePrice;
  let nyusatuelement;

  for (const siteUrl of siteUrlArray) {
    await page.goto(siteUrl);
    await page.waitForTimeout(RT(5000));
    await page.screenshot({ path: "example.png" });
    const button = page.locator("h4.ellipsis").locator("text = Filters");
    button.click();
    await page.waitForTimeout(RT(1000));
    const button2 = page.locator('[for="trade_type_filter_auctions_only"]').locator("svg.h-full.w-full");
    button2.click();

    await page.waitForTimeout(RT(500));
    //プライスの範囲を入力してアプライ
    await page.locator("#scrollable-sidebar-element > div:nth-child(1) > div.price-range.mt-lg.flex.items-center.justify-between > div:nth-child(1) > input").fill("50");
    await page.waitForTimeout(RT(300));
    const button3 = page.locator("text = Apply");
    button3.click();
    //プライス範囲入力終了

    await page.waitForTimeout(RT(500));
    const elements = await page.$$('div[class^="relative rounded"]');

    if (elements.length > 0) {
      for (const element of elements) {
        const paragraphElements = await element.$$('.popover-container .size-medium');
        for (const paragraph of paragraphElements) {
          const textInsideParagraph = await paragraph.textContent();
          console.log(textInsideParagraph);
          if (textInsideParagraph == "1" || textInsideParagraph == "2") {
            linetext = textInsideParagraph;
            nyusatuelement = element;
          }
        }
      }
    } else {
      console.log('要素が見つかりませんでした');
    }

    if (nyusatuelement) {
      const nyusatuelement2 = await nyusatuelement.$$eval('a[href^="/item/"]', nodes => nodes.length > 0 ? nodes[0].href : null);
      if (nyusatuelement2) {
        lineUrl = nyusatuelement2;
      }

      const nyusatuelement3 = await nyusatuelement.$eval('p.size-medium', el => el ? el.textContent.trim() : null);
      if (nyusatuelement3) {
        lineName = nyusatuelement3;
      } else {
        console.log('武器が取得できませんでした');
      }

      const priceElement = await nyusatuelement.$eval('span[data-v-cacaa161]', el => el ? el.textContent.trim() : null);
      if (priceElement) {
        const priceText = priceElement.replace(/[^0-9.]/g, '');
        linePrice = parseFloat(priceText);
      }
    }
  }

  const token = "r273lQRIbRaiiekIylt5P2LaoMoiBMm4byFCh8krBRv";
  if (linetext) {
    await sendTextMessage(token, linetext);
  } else {
    console.log('入札数が取得できませんでした');
  }

  if (lineUrl) {
    await sendTextMessage(token, lineUrl);
  } else {
    console.log('URLが取得できませんでした');
  }

  if (lineName) {
    await sendTextMessage(token, lineName);
  } else {
    console.log('武器の名前が取得できませんでした');
  }

  if (linePrice !== undefined) {
    await sendTextMessage(token, linePrice.toString());
  } else {
    console.log('価格が取得できませんでした');
  }

  await browser.close();
}

main().catch(error => console.error(error));