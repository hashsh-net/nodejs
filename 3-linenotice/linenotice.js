import { sendTextMessage } from '../lib/lineNotify.js'

const token = 'e8rrMMHZLYDUG5hwacLfJn63uGNfrDoEO4EP2RPaYBO'
const message = 'test'
await sendTextMessage(token, message)