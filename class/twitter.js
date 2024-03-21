import { TwitterApi } from 'twitter-api-v2'

export class Twitter {
  constructor(){
    // 実行クラス
    this.twitter
  }

  // 初期化
  async initialize() {

    this.twitter = new TwitterApi({
      appKey: 'ここに自分のKEY',
      appSecret: 'ここに自分のKEY',
      accessToken: 'ここに自分のKEY',
      accessSecret: 'ここに自分のKEY',
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
      console.error(`TweetBot Error tweet: ${error}`)
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
      console.error(`TweetBot Error \ntweetWithImages: ${error}`)
      throw error
    }
  }

  // リプライ
  async reply(tweetId, text){
    try {
      const res = await this.twitter.v2.reply(text, tweetId )
      return res
    } catch (error) {
      console.error(`TweetBot Error \nreply: ${error}`)
      throw error
    }
  }

  // スレッド投稿
  async tweetThread(tweetArray) {
    try {
      const res = await this.twitter.v2.tweetThread(tweetArray)

      return res
    } catch (error) {
      console.error(`TweetBot Error \tweetThread: ${error}`)
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

}