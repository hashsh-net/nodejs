import axios from 'axios'
import qs from 'qs'
import dotenv from 'dotenv'

dotenv.config()

const lineNotifyApi = 'https://notify-api.line.me/api/notify'

export async function sendTextMessage(lineNotifyToken, message) {

    const sentText = `\n${message}`

    const headers = { 
        'Authorization': `Bearer ${lineNotifyToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const data = qs.stringify({ message: sentText })

    try {
      const response = await axios.post(lineNotifyApi, data, { headers })
      return true
    } catch (error) {
      return false
    }
}