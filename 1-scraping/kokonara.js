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
  for (let pageNumber = from; pageNumber <= to; pageNumber++) {
    console.log(pageNumber)
    await page.goto(`${categoryUrl}${pageNumber}`)
    // 商品一覧のリンクエレメントを取得
    const itemLinkElements = await page.$$('.c-searchPageItemList_inner')

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


// テスト用
// const itemLinkArray = [
//   'https://coconala.com/services/53600?ref_kind=category&ref_no=5719&service_order=5719&service_order_with_pr=5719&service_order_only_pr=null',
//   'https://coconala.com/services/406364?ref_kind=category&ref_no=5697&service_order=5697&service_order_with_pr=5697&service_order_only_pr=null',
//   'https://coconala.com/services/3144746?ref_kind=category&ref_no=6&pos=6&ref_sort=beginner&ref_page=&ref_category=656&service_order=5&service_order_with_pr=6&service_order_only_pr=null'
// ]

const errorLinks = []
let totalCount = 1
for(const itemLink of itemLinkArray){
  const itemData = {}

  try {
    await page.goto(itemLink)

    const detailButton = await page.$('.c-contentsFreeText_readMore a')

    if(detailButton){
      detailButton.click()
    }

    // =====================================================================
    // ID
    const idData = itemLink.match(/\/services\/(\d+)\?/)
    if(idData.length >= 2){
      itemData.id = idData[1]
    }else{
      itemData.id = itemLink
    }
    // タイトル
    try {
      const element = await page.$('.c-overview_overview')
      const text = await element.textContent()
      itemData.title = text.trim()
    } catch (error) {
      itemData.title = ''
    }
    // サブタイトル
    try {
      const element = await page.$('.c-overview_text')
      const text = await element.textContent()
      itemData.subtitle = text.trim()
    } catch (error) {
      itemData.subtitle = ''
    }
    // カテゴリ
    try {
      const element = await page.$('.c-contentHeader li:nth-child(3)')
      const text = await element.textContent()
      itemData.category = text.trim()
    } catch (error) {
      itemData.category = ''
    }
    // 小カテゴリ
    if (itemData.category == '占い全般' || itemData.category == 'その他占い' || itemData.category == '占いのやり方・アドバイス'){
      itemData.smallCategory = ''
    }else{
      try {
        const element = await page.$('.c-contentHeader li:nth-child(4)')
        const text = await element.textContent()
        itemData.smallCategory = text.trim()
      } catch (error) {
        itemData.smallCategory = ''
      }
    }
    // 価格
    try {
      const element = await page.$('.c-price_price')
      const text = await element.textContent()
      const number = text.trim().replace(/[^\d.-]/g, '')
      itemData.price = Number(number)
    } catch (error) {
      itemData.price = 0
    }
    // 出品者ID
    const shopLink = await page.$eval('.c-serviceDetailProvider_link', element => element.getAttribute('href'))
    itemData.shopId = shopLink.replace('/users/','')
    // 販売実績数
    try {
      const element = await page.$('.c-performance_sales .c-performance_content')
      const text = await element.textContent()
      const number = text.trim().replace(/[^\d.-]/g, '')
      itemData.sales = Number(number)
    } catch (error) {
      itemData.sales = 0
    }
    // 残枠数
    try {
      const element = await page.$('.c-performance_stock .c-performance_content strong:nth-child(1)')
      const text = await element.textContent()
      itemData.remainingSlot = Number(text.trim())
    } catch (error) {
      itemData.remainingSlot = 0
    }
    // お願い中
    try {
      const element = await page.$('.c-performance_stock .c-performance_content strong:nth-child(2)')
      const text = await element.textContent()
      itemData.requestedCustomer = Number(text.trim())
    } catch (error) {
      itemData.requestedCustomer = 0
    }
    // お気に入り登録数
    try {
      const element = await page.$('.c-serviceContentsMenuPc_items .c-favButtonTextCount_nu')
      const text = await element.textContent()
      itemData.favoriteCount = Number(text.trim())
    } catch (error) {
      itemData.favoriteCount = 0
    }
    // 評価件数
    try {
      const ratingCount = await page.$eval('.c-ratingIndicatorCount', element => element.textContent.trim())
      const match = ratingCount.match(/\(([\d,]+)\)/)
      itemData.ratingCount = Number(match[1])
    } catch (error) {
        itemData.ratingCount = 0
    }
    // 平均評価
    try {
        const averageRating = await page.$eval('.c-ratingIndicator', element => element.textContent.trim())
        itemData.averageRating = Number(averageRating.replace(/[^\d.-]/g, ''))
    } catch (error) {
        itemData.averageRating = 0
    }
    // 商品詳細・購入フロー
    try {
      const details = await page.$$eval('.c-contentsFreeText_text', elements => elements.map(element => element.textContent.trim()))
      itemData.itemDetail = details[0] || ''
      itemData.purchaseFlow = details[1] || ''
    } catch (error) {
        itemData.itemDetail = ''
        itemData.purchaseFlow = ''
    }

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
    // お届け日数
    const speedElement = await page.$$('.c-contentsSpecificationsInnerList_value span')
    const deliveryDays = await speedElement[0].textContent()
    itemData.deliveryDays = deliveryDays.trim()
    // 初回返答時間
    if (speedElement.length >= 2) {
      const firstResponseTime = await speedElement[1].textContent().catch(() => '')
      itemData.firstResponseTime = firstResponseTime.trim()
    } else {
        itemData.firstResponseTime = ''
    }
    // スタイル
    const styleArray = await page.$$eval('.c-contentsSpecificationsInnerList_tags th', ths => {
      for (const th of ths) {
        if (th.textContent.trim() === 'スタイル') {
          const tags = Array.from(th.nextElementSibling.querySelectorAll('a'))
          return tags.map(tag => tag.textContent.trim())
        }
      }
      return []
    })
    itemData.style = styleArray
    // 占術
    const divinationArray = await page.$$eval('.c-contentsSpecificationsInnerList_tags th', ths => {
      for (const th of ths) {
        if (th.textContent.trim() === '占術') {
          const tags = Array.from(th.nextElementSibling.querySelectorAll('a'))
          return tags.map(tag => tag.textContent.trim())
        }
      }
      return []
    })
    itemData.divination = divinationArray

  }catch(error){
    errorLinks.push(itemLink)
    console.log(itemLink)
    console.log(error)
  }

  // BigQueryに保存
  await saveToBigQuery('uranai', 'LogCoconalaUranaiItem', itemData)
  console.log(`${itemData.category}/${itemData.smallCategory}: ${totalCount}`)
  totalCount++
}

browser.close()

fs.writeFile('error_links.json', JSON.stringify(errorLinks), (err) => {
  if (err) {
    console.error('エラーリンクをファイルに書き込む際にエラーが発生しました:', err)
  } else {
    console.log(`エラーリンクが保存されました。`)
  }
})