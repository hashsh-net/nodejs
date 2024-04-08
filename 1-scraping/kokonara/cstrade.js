import { chromium } from 'playwright';


const siteUrlArray = [ 
    "https://csgoempire.com/withdraw/steam/market"
];


async function main() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    for(const siteUrl of siteUrlArray) {

      await page.goto(siteUrl)]

      await page.waitForTimeout(2000)

      // 正しいセレクターを使用して要素を取得する
      const element = await page.$('img[src^="https://community.cloudflare.steamstatic.com/"]');
      console.log(element)

      // 要素が見つかった場合
      if (element) {
          // 要素からテキストを取得する
          const text = await page.evaluate(element => element.getAttribute('alt'), element);
          console.log(text); // 結果を出力
      } else {
          console.log('要素が見つかりませんでした');
      }
    }

    await browser.close();
}

main().catch(error => console.error(error));
