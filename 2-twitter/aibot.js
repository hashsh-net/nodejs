// import { Twitter } from '../class/twitter.js'
import { createImageDalle3 } from '../lib/openai.js'

// 今日のキーワード
const keyword = '太巻きジョイント大好きギャル'

// Twitter処理開始
// const twitter = new Twitter('hotbox')
// await twitter.initialize()
// 一つ目のツイートここから
const tweetText = `AIが考える「${keyword}」`
// Dalle3 APIで画像生成
const prompt = `TwitterなどのSNSで話題を生みそうな面白いアメコミ風の「${keyword}」の画像`
const outputPath = '2-twitter/images/hotboxAiImage.png'
const imagePath = await createImageDalle3(prompt, outputPath)
const presentMedia = await twitter.uploadMedia([imagePath])
// ツイートと画像まとめ
const baseTweet = { text: tweetText, media: { media_ids: presentMedia } }
const threadTweet =
`🎁毎日プレゼント企画開催中🎁

✍️ブログも書いてます✍️
https://x.gd/9CDUK

ご購入はこちらから✅

🚚UberWeed（各エリア）💨
http://t.me/HotBox_JP

🛍️オンラインストア🛍️
https://hotbox-japan.com/collections/all

#毎日吸いたい`
// ツイート実行
const tweet_res = await twitter.tweetThread([
  baseTweet, // 一つ目の画像付きツイート
  threadTweet, // 二つ目の宣伝ツイート
])

console.log(tweet_res)