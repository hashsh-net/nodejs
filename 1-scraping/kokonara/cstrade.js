import { chromium } from 'playwright';

const siteUrlArray = [ 
    "https://csgoempire.com/withdraw/steam/market"
];

async function main() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    for(const siteUrl of siteUrlArray) {
        await page.goto(siteUrl);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: "example.png" });

        const elements = await page.$$('div[class^="relative rounded"]');
        console.log(elements);

        if (elements.length > 0) {
            for (const element of elements) {
                const paragraphElements = await element.$$('p');
                for (const paragraph of paragraphElements) {
                    const textInsideParagraph = await paragraph.innerText();
                    console.log(textInsideParagraph);
                }
            }
        } else {
            console.log('要素が見つかりませんでした');
        }
    }

    await browser.close();
}

main().catch(error => console.error(error));
