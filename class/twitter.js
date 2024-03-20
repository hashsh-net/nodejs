import { TwitterApi } from 'twitter-api-v2'
import { getConigTwitter } from '../lib/config.js'
import { firestore } from '../lib/firebase.js'

export class Twitter {
  constructor(botId){
    // BotID(TwitterBot)
    this.botId = botId
    // 実行クラス
    this.twitter
  }

  // 初期化
  async initialize() {
    const botInfo = await getConigTwitter(this.botId)

    this.twitter = new TwitterApi({
      appKey: botInfo.TWITTER_APP_KEY,
      appSecret: botInfo.TWITTER_APP_SECRET,
      accessToken: botInfo.TWITTER_ACCESS_TOKEN,
      accessSecret: botInfo.TWITTER_ACCESS_SECRET,
    })
  }

  // ツイート
  // tweet example { text: tweetText, media: { media_ids: presentMedia } }
  // tweet example2 'ツイート'
  async tweet(tweet){
    try {
      const res = await this.twitter.v2.tweet(tweet)
      return res
    } catch (error) {
      console.error(`TweetBot Error BotId: ${this.botId}\ntweet: ${error}`)
      throw error
    }
  }

  // 画像付きツイート
  async tweetWithImages(text, mediaUrls) {
    try {
      const mediaIds = await this.uploadMedia(mediaUrls)
      const res = await this.twitter.v2.tweet({text, media: { media_ids: mediaIds }})

      return res
    } catch (error) {
      console.error(`TweetBot Error BotId: ${this.botId}\ntweetWithImages: ${error}`)
      throw error
    }
  }

  // リプライ
  async reply(tweetId, text){
    try {
      const res = await this.twitter.v2.reply(text, tweetId )
      return res
    } catch (error) {
      console.error(`TweetBot Error BotId: ${this.botId}\nreply: ${error}`)
      throw error
    }
  }

  // スレッド投稿
  async tweetThread(tweetArray) {
    try {
      const res = await this.twitter.v2.tweetThread(tweetArray)

      return res
    } catch (error) {
      console.error(`TweetBot Error BotId: ${this.botId}\tweetThread: ${error}`)
      throw error
    }
  }

  // 画像アップロード
  async uploadMedia(imageUrls){
    const mediaIds = []

    for (const imageUrl of imageUrls) {
      const mediaId = await this.twitter.v1.uploadMedia(imageUrl)      
      mediaIds.push(mediaId)
    }

    return mediaIds
  }

  // TweetBotのログを保存
  async saveTweetLog(data){
    const TwitterBotLog = firestore.collection("TwitterBotLog")
    const docRef = await firestore.addDoc(TwitterBotLog, data)
    return docRef.id
  }

}