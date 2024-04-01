import { postMessageToChannel, postImageMessageToChannel } from '../lib/slack.js'


// 画像付き送信
// SLACK_NOTICE_CHANNEL_ID スラックのチャンネルID
// text 送信する文章
// imageUtl 画像のURL
await postImageMessageToChannel(SLACK_NOTICE_CHANNEL_ID, text, imageUrl)

// テキスト送信
// SLACK_NOTICE_CHANNEL_ID スラックのチャンネルID
// text 送信する文章
await postMessageToChannel(SLACK_NOTICE_CHANNEL_ID, text)