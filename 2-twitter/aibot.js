import { Twitter } from '../../class/twitter.js'
import { getConigTwitter, setConfigTwitter } from '../../lib/config.js'
import { createImageDalle3 } from '../../lib/openai.js'

// 今日のキーワード取得
const config = await getConigTwitter('hotbox')
const keywordArray = config.aiImagePrompt

const keyword = keywordArray[0]

// Twitter処理開始
const twitter = new Twitter('hotbox')
await twitter.initialize()
// 一つ目のツイートここから
const tweetText = `AIが描いた「${keyword}」`
// Dalle3 APIで画像生成
const prompt = `TwitterなどのSNSで話題を生みそうな面白いアメコミ風の「${keyword}」の画像`
const outputPath = 'src/assets/images/hotboxAiImage.png'
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
  baseTweet,
  threadTweet,
])

// 最初のキーワードを取り出してconfigDataにセット
const configData = {
  aiImagePrompt: keywordArray.slice(1)
}

await setConfigTwitter('hotbox', configData)

console.log(tweet_res)