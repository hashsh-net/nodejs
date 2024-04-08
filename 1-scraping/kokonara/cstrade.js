import { chromium } from 'playwright';


const siteUrlArray = [ 
    "https://csgoempire.com/withdraw/steam/market"
];


async function main() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    for(const siteUrl of siteUrlArray) {

      await page.goto(siteUrl)

      await page.waitForTimeout(2000)

      await page.screenshot({ path: "example.png" });

      // 正しいセレクターを使用して要素を取得する
      const elements = await page.$$('div[class^="relative rounded"]');
      console.log(elements)

      // 要素が見つかった場合
      if (elements) {
          // 要素からテキストを取得する
          for(element of elements){
            const paragraphElements = element.querySelectorAll('p');
            paragraphElements.forEach(paragraph => {
            const textInsideParagraph = paragraph.innerText;
            console.log(textInsideParagraph);
            });
          }
      } else {
          console.log('要素が見つかりませんでした');
      }
    }

    await browser.close();
}

main().catch(error => console.error(error));
