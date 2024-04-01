import { WebClient }  from '@slack/web-api'
import { config } from 'dotenv'

config()

const slack = new WebClient(process.env.SLACK_TOKEN)

export async function postMessageToChannel(channelId, text){
  const result = await slack.chat.postMessage({
    channel: channelId,
    text: text,
  })
}

export async function postImageMessageToChannel(channelId, text, imageUrl) {
  const result = await slack.chat.postMessage({
    channel: channelId,
    text: text,
    attachments: [
      {
        "fallback": "Required plain-text summary of the attachment.",
        "image_url": imageUrl,
        "alt_text": "Example image"
      }
    ]
  })
}