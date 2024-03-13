import { TwitterApi } from 'twitter-api-v2'
import dotenv from 'dotenv'

dotenv.config()

export const twitter = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
})

async function getUserTweets(username, options) {
  try {
    const { data } = await twitter.get(`/users/by/username/${username}/tweets`, options)
    
    // ツイートのフィルタリング
    const filteredTweets = data.filter(tweet => !tweet.retweeted && !tweet.in_reply_to_user_id)
    
    return filteredTweets
  } catch (error) {
    console.error('Error fetching tweets:', error)
    throw error
  }
}