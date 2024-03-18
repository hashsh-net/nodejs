import { chromium } from 'playwright';

import { page, retryPageLoad } from '../../lib/playwright.js';
import fs from 'fs';


const siteUrlArray = [
    "https://csgoempire.com/withdraw/steam/market"
];

const from = 1;
const to = 999;

async function main() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    for(const siteUrl of siteUrlArray) {
        for (let itemNumber = from; itemNumber <= to; itemNumber++) {
            await retryPageLoad(page, siteUrl);

            // 正しいセレクターを使用して要素を取得する
            const element = await page.$('img[src^="https://community.cloudflare.steamstatic.com/"]');

            // 要素が見つかった場合
            if (element) {
                // 要素からテキストを取得する
                const text = await page.evaluate(element => element.getAttribute('alt'), element);
                console.log(text); // 結果を出力
            } else {
                console.log('要素が見つかりませんでした');
            }
        }
    }

    await browser.close();
}

main().catch(error => console.error(error));
