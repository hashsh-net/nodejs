import { chromium } from 'playwright'
import { saveToBigQuery } from '../lib/bigquery.js'
import fs from 'fs'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

// 各カテゴリの検索結果画面
const categoryUrlArray = [
  'https://coconala.com/categories/656?service_kind=0&ref_c=1&y=0&business_flag=false&page=', // 恋愛
  'https://coconala.com/categories/657?ref_c=1&service_kind=0&y=0&business_flag=false&page=', // 結婚
  'https://coconala.com/categories/658?ref_c=1&service_kind=0&y=0&business_flag=false&page=', // 人生・スピリチュアル
  'https://coconala.com/categories/659?ref_c=1&service_kind=0&y=0&business_flag=false&page=', // 総合運
  'https://coconala.com/categories/660?ref_c=1&service_kind=0&y=0&business_flag=false&page=', // 仕事運
  'https://coconala.com/categories/661?ref_c=1&service_kind=0&y=0&business_flag=false&page=', // 占い全般
  'https://coconala.com/categories/80?ref_c=1&service_kind=0&y=0&business_flag=false&page=',  // 占いのやり方アドバイス
  'https://coconala.com/categories/79?ref_c=1&service_kind=0&y=0&page=',                      // その他(占い)
]

// fromページからtoページ目までアクセスして商品情報を取得
const from = 1
const to = 999
const itemLinkArray = []

for(const categoryUrl of categoryUrlArray){
  await page.goto(`${categoryUrl}1`)
  await page.waitForTimeout(200)

  for (let pageNumber = from; pageNumber <= to; pageNumber++) {
    await page.goto(`${categoryUrl}${pageNumber}`)
    // 商品一覧のリンクエレメントを取得
    const itemLinkElements = await page.$$('.c-searchPageItemList_inner')

    console.log(pageNumber)
    // 商品一覧がなくなったらループ終了
    if(itemLinkElements.length == 0){
      console.log(`${categoryUrl}${pageNumber}`)
      break
    }

    // リンクがある場合は配列に商品リンクを追加
    for (let element of itemLinkElements) {
      const link = await element.getAttribute('href')
      itemLinkArray.push(`https://coconala.com${link}`)
    }
  }
}


// // テスト用
// const itemLinkArray = [
//   'https://coconala.com/services/3157875?ref=category_popular_subcategories&ref_kind=category&ref_no=1&pos=1&ref_sort=beginner&ref_page=1&ref_category=661&service_order=1&service_order_with_pr=1&service_order_only_pr=null',
//   'https://coconala.com/services/3144746?ref_kind=category&ref_no=6&pos=6&ref_sort=beginner&ref_page=&ref_category=656&service_order=5&service_order_with_pr=6&service_order_only_pr=null'
// ]

const errorLinks = []
for(const itemLink of itemLinkArray){
  try {
    console.log(itemLink)
    await page.goto(itemLink)

    const itemData = {}
    const detailButton = await page.$('.c-contentsFreeText_readMore a')

    if(detailButton){
      detailButton.click()
    }

    // =====================================================================
    // ID
    const idData = itemLink.match(/\/services\/(\d+)\?/)
    itemData.id = idData[1]
    // タイトル
    itemData.title = await page.$eval('.c-overview_overview', element => element.textContent.trim())
    // サブタイトル
    itemData.subtitle = await page.$eval('.c-overview_text', element => element.textContent.trim())
    // カテゴリ
    itemData.category = await page.$eval('.c-contentHeader li:nth-child(3)', element => element.textContent.trim())
    // 小カテゴリ
    if (itemData.category == '占い全般' || itemData.category == 'その他占い' || itemData.category == '占いのやり方・アドバイス'){
      itemData.smallCategory = ''
    }else{
      itemData.smallCategory = await page.$eval('.c-contentHeader li:nth-child(4)', element => element.textContent.trim())
    }
    // 価格
    const itemPrice = await page.$eval('.c-price_price', element => element.textContent.trim())
    itemData.price = Number(itemPrice.replace(/[^\d.-]/g, ''))
    // 出品者ID
    const shopLink = await page.$eval('.c-serviceDetailProvider_link', element => element.getAttribute('href'))
    itemData.shopId = shopLink.replace('/users/','')
    // 販売実績数
    const sales = await page.$eval('.c-performance_sales .c-performance_content', element => element.textContent.trim())
    itemData.sales = Number(sales.replace(/[^\d.-]/g, ''))
    // 残枠数
    itemData.remainingSlot = await page.$eval('.c-performance_stock .c-performance_content strong:nth-child(1)', element => Number(element.textContent.trim()))
    // お願い中
    itemData.requestedCustomer = await page.$eval('.c-performance_stock .c-performance_content strong:nth-child(2)', element => Number(element.textContent.trim()))
    // お気に入り登録数
    const favoriteCount = await page.$eval('.c-serviceContentsMenuPc_items .c-favButtonTextCount_num', element => element.textContent.trim())
    itemData.favoriteCount = Number(favoriteCount.replace(/[^\d.-]/g, ''))
    // 評価件数
    try {
      const ratingCount = await page.$eval('.c-ratingIndicatorCount', element => element.textContent.trim());
      const match = ratingCount.match(/\(([\d,]+)\)/);
      itemData.ratingCount = Number(match[1]);
    } catch (error) {
        console.error("評価件数の取得に失敗しました:", error.message);
        itemData.ratingCount = 0; // エラーが発生した場合、評価件数を0に設定するなどの処理を行う
    }
    // 平均評価
    try {
        const averageRating = await page.$eval('.c-ratingIndicator', element => element.textContent.trim());
        itemData.averageRating = Number(averageRating.replace(/[^\d.-]/g, ''));
    } catch (error) {
        console.error("平均評価の取得に失敗しました:", error.message);
        itemData.averageRating = 0; // エラーが発生した場合、平均評価を0に設定するなどの処理を行う
    }
    // 商品詳細・購入フロー
    const details = await page.$$eval('.c-contentsFreeText_text', elements => elements.map(element => element.textContent.trim()))
    itemData.itemDetail = details[0]
    itemData.purchaseFlow = details[1]

    // =======================================================
    // オプションここから

    // オプション名
    const optionName = await page.$$('.c-serviceOptionItem_text')
    const optionNameArray = []
    for (let element of optionName) {
      const text = await element.textContent()
      optionNameArray.push(text.trim())
    }
    // オプション価格
    const optionPrice = await page.$$('.c-serviceOptionItem_pricewot')
    const optionPriceArray = []
    for (let element of optionPrice) {
      const text = await element.textContent()    
      const price = Number(text.trim().replace(/[^\d.-]/g, ''))
      optionPriceArray.push(price)
    }
    const optionArray = []
    // オプションデータ整形
    if (optionNameArray.length === optionPriceArray.length) {
      for (let i = 0; i < optionNameArray.length; i++) {
          const optionObject = {
              name: optionNameArray[i],
              price: optionPriceArray[i]
          }
          optionArray.push(optionObject)
      }
    }
    itemData.option = optionArray

    // オプションここまで
    // =====================================================================

    // 鑑定・カウンセリング
    const boolElements = await page.$$('.c-contentsSpecificationsInnerList_check .coconala-icon')
    const appraisal = boolElements[0]
    itemData.appraisal = false
    if(appraisal) itemData.appraisal = await appraisal.evaluate(element => element.classList.contains('-check'))
    const counseling = boolElements[1]
    itemData.counseling = false
    if(counseling) itemData.counseling = await counseling.evaluate(element => element.classList.contains('-check'))
    // お届け日数・初回返答時間
    const speedElement = await page.$$('.c-contentsSpecificationsInnerList_value span')
    const deliveryDays = await speedElement[0].textContent()
    const firstResponseTime = await speedElement[1].textContent()
    itemData.deliveryDays = deliveryDays.trim()
    itemData.firstResponseTime = firstResponseTime.trim()
    // スタイル
    const tagElement = await page.$$('.c-tagList')
    const styleArray = []
    const styleElement = tagElement[0]
    const styleLinkElement = await styleElement.$$('a')
    for (const styleData of styleLinkElement) {
      const style = await styleData.textContent()
      styleArray.push(style.trim())
    }
    itemData.style = styleArray
    // 占術
    const divinationArray = []
    const divinationElement = tagElement[1]
    const divinationLinkElement = await divinationElement.$$('a')
    for (const divinationData of divinationLinkElement) {
      const divination = await divinationData.textContent()
      divinationArray.push(divination.trim())
    }
    itemData.divination = divinationArray

    // BigQueryに保存
    await saveToBigQuery('uranai', 'LogCoconalaUranaiItem', itemData)

  }catch(error){
    errorLinks.push(itemLink)
    console.log(itemLink)
    console.log(error)
  }
}

browser.close()

fs.writeFile('error_links.json', JSON.stringify(errorLinks), (err) => {
  if (err) {
    console.error('エラーリンクをファイルに書き込む際にエラーが発生しました:', err)
  } else {
    console.log(`エラーリンクが保存されました。`)
  }
})