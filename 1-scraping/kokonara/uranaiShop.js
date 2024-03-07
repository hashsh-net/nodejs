import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { 
  page,
  retryPageLoad,
  textData,
  attributeData,
  clickBottun,
  textDataArray,
} from '../../lib/playwright.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, 'basedata', 'uranaiShop.json')


let shopArray
try {
  const data = fs.readFileSync(filePath, 'utf8')
  shopArray = JSON.parse(data)
} catch (err) {
  console.error('ファイルを読み込めませんでした:', err)
  shopArray = []
}

// テスト用
// const shopArray = [
//   {shopId: 1302792},
//   {shopId: 2509300},
// ]

const baseLink = 'https://coconala.com/users/'
const skills = '/skills?anchor=licenses'
let totalCount = 1
for(const shop of shopArray){

  const shopData = {}

  await retryPageLoad(page, `${baseLink}${shop.shopId}`)
  // await retryPageLoad(page, `${baseLink}${shop.shopId}${skills}`)
  
  // ID
  shopData.id = String(shop.shopId)
  // 名前
  shopData.name = await textData(page, '.c-userName_text')
  // 性別
  shopData.gender = await textData(page, '.c-userProfile_text')
  // プロフ画像
  shopData.icon = await attributeData(page, '.d-userIcon', 'src')
  // ヘッダー画像
  shopData.header = await attributeData(page, '.c-banner_image', 'src')
  // 販売実績・平均評価・フォロワー・本人確認・機密保持契約(NDA)・インボイス発行事業者
  const userDatas = await page.$$('.c-additionalInfo .c-dataValue_list .c-dataValue_item')
  shopData.sales = 0
  shopData.averageRating = 0
  shopData.follower = 0
  shopData.identification = false
  shopData.nda = false
  shopData.invoice = false
  for (const item of userDatas) {
    const nameElement = await item.$('.c-dataValue_name')
    const name = await nameElement.innerText()
    const title = name.trim()

    switch(title){
      case '販売実績':
        const salesValueElement = await item.$('.c-dataValue_value')
        const sales = await salesValueElement.innerText()
        shopData.sales = Number(sales.trim().replace(',', ''))
        break

      case '評価':
        const ratingValueElement = await item.$('.c-dataValue_value')
        const averageRating = await ratingValueElement.innerText()
        shopData.averageRating = parseFloat(averageRating.trim())
        break

      case 'フォロワー':
        const followerValueElement = await item.$('.c-dataValue_value')
        const follower = await followerValueElement.innerText()
        shopData.follower = Number(follower.trim().replace(',', ''))
        break

      case '本人確認':
        const identityValueElement = await item.$('.c-dataValue_value')
        const identityIcon = await identityValueElement.$('.coconala-icon.-check.-is-ds2Primary600')
        shopData.identification = !!identityIcon
        break

      case '機密保持契約(NDA)':
        const ndaValueElement = await item.$('.c-dataValue_value')
        const nda = await ndaValueElement.$('.coconala-icon.-check.-is-ds2Primary600')
        shopData.nda = !!nda
        break

      case 'インボイス発行事業者':
        const invoiceValueElement = await item.$('.c-dataValue_value')
        const invoice = await invoiceValueElement.$('.coconala-icon.-check.-is-ds2Primary600')
        shopData.invoice = !!invoice
        break
    }
  }
  // プロフ文章
  await clickBottun(page, '.p-introduction_readMoreMessage')
  shopData.profile = await textData(page, '.p-introduction_message')
  // 対応スケジュール
  await clickBottun(page, 'c-readMoreSchedule')
  shopData.schedule = await textData(page, '.c-dataSchedule')
  // レビュー
  const review = []
  const reviewerArray = await textDataArray(page, '.c-ratingEvaluation_userName')
  const reviewTextArray = await textDataArray(page, '.c-ratingEvaluation_message')
  if (reviewerArray.length === reviewTextArray.length) {
    for (let i = 0; i < reviewerArray.length; i++) {
      const optionObject = {
        reviewer: reviewerArray[i],
        text: reviewTextArray[i]
      }
      review.push(optionObject)
    }
  }
  shopData.review = review

  await saveToBigQuery('uranai', 'LogCoconalaUranaiShop', shopData)
  totalCount++
  console.log(`${totalCount}: ${shopData.name}`)
}
