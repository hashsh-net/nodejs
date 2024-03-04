import { chromium } from 'playwright'
import fs from 'fs'

const browser = await chromium.launch({ headless: false })
const page = await browser.newPage()


// fromページからtoページ目までアクセスして商品情報を取得
const from = 1
const to = 1

const itemLinkArray = []
for (let pageNumber = from; pageNumber <= to; pageNumber++) {
  await page.goto(`https://coconala.com/categories/661?ref=category_popular_subcategories&price_min=1000&price_max=5000&ref_c=1&y=0&business_flag=false&page=${pageNumber}`)
  // 商品の一覧リスト追加
  const itemLinkElements = await page.$$('.c-searchPageItemList_inner')

  for (let element of itemLinkElements) {
    const link = await element.getAttribute('href')
    itemLinkArray.push(`https://coconala.com${link}`)
  }
}

// テスト用
// const itemLinkArray = ['https://coconala.com/services/3157875?ref=category_popular_subcategories&ref_kind=category&ref_no=1&pos=1&ref_sort=beginner&ref_page=1&ref_category=661&service_order=1&service_order_with_pr=1&service_order_only_pr=null']

const items = []
for(const itemLink of itemLinkArray){
  await page.goto(itemLink)

  const itemData = {}
  const detailButton = await page.$('.c-contentsFreeText_readMore a')

  if(detailButton){
    detailButton.click()
  }

  // 出品者URLの取得
  // =====================================================================
  const shopLink = await page.$eval('.c-serviceDetailProvider_link', element => element.getAttribute('href'))
  itemData.shopLink = `https://coconala.com${shopLink}`
  // =====================================================================

  // =====================================================================
  // 商品名の取得
  itemData.title = await page.$eval('.c-overview_overview', element => element.textContent.trim())
  itemData.subtitle = await page.$eval('.c-overview_text', element => element.textContent.trim())
  // 価格の取得
  const itemPrice = await page.$eval('.c-price_price', element => element.textContent.trim())
  itemData.price = Number(itemPrice.replace(/[^\d.-]/g, ''))
  // 評価の取得
  const itemRate = await page.$eval('.c-ratingIndicator', element => element.textContent.trim())
  itemData.rate = Number(itemRate.replace(/[^\d.-]/g, ''))
  const itemRateCount = await page.$eval('.c-ratingIndicatorCount', element => element.textContent.trim())
  const match = itemRateCount.match(/\(([\d,]+)\)/)
  itemData.rateCount = Number(match[1])
  // 販売数の取得 
  const salesCount = await page.$eval('.c-performance_sales .c-performance_content', element => element.textContent.trim())
  itemData.salesCount = Number(salesCount.replace(/[^\d.-]/g, ''))

  // 商品情報の取得
  const itemDetail = await page.$$('.c-serviceContentsSummary-consultation .c-contentsFreeText')
  const itemInfoArray = []
  for (let element of itemDetail) {
    const text = await element.textContent()
    itemInfoArray.push(text.trim())
  }
  itemData.detail = itemInfoArray
  // =====================================================================


  // =====================================================================
  // オプション名の取得
  const optionName = await page.$$('.c-serviceOptionItem_text')
  const optionNameArray = []
  for (let element of optionName) {
    const text = await element.textContent()
    optionNameArray.push(text.trim())
  }

  // オプション価格の取得
  const optionPrice = await page.$$('.c-serviceOptionItem_pricewot')
  const optionPriceArray = []
  for (let element of optionPrice) {
    const text = await element.textContent()    
    const price = Number(text.trim().replace(/[^\d.-]/g, ''))
    optionPriceArray.push(price)
  }

  const optionArray = []
  // オプションデータをまとめる
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
  // =====================================================================

  items.push(itemData)
}


function arrayToCSV(array) {
  let csv = 'price,salesCount,rate,rateCount,title,subtitle,detail,shopLink,optionName,optionPrice'
  for(const data of array){
    csv += '\n'
    csv += `${data.price},`
    csv += `${data.salesCount},`
    csv += `${data.rate},`
    csv += `${data.rateCount},`
    csv += `"${data.title.replace(/"/g, '""')}",`
    csv += `"${data.subtitle.replace(/"/g, '""')}",`
    csv += `"${data.detail.join('\n').replace(/"/g, '""')}",`
    csv += `${data.shopLink},`

    if(data.option.length == 0){
      csv += ',,'
    }else{
      let optionNumber = 1
      for(const option of data.option){
        if(optionNumber != 1){
          csv += '\n,,,,,,,,'
        }
        csv += `"${option.name}",${option.price}`
        optionNumber++
      }
    }
  }
  return csv
}

const csv = arrayToCSV(items)
fs.writeFileSync('kokonara_item.csv', csv)

await browser.close()
