import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

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


// const baseLink = 'https://coconala.com/users/'
// for(const shop of shopArray){
//   const shopId = shop.shopId
// }

