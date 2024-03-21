import OpenAI from 'openai'
import axios from 'axios'
import { writeFileSync } from 'fs'
import { config } from 'dotenv'

config()

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function embedding (text) {
  try{
    const res = await axios.post('https://api.openai.com/v1/embeddings', {
      input: text,
      model: "text-embedding-ada-002"
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    })

    return res.data.data[0].embedding;
  } catch (e) {
    console.log(e.message);
  }
}

export async function createImageDalle3(prompt, outputPath){
  const generated = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt, // TwitterなどのSNSで話題を生みそうな面白いアメコミ風の「太巻きジョイントギャル」の画像
    size: '1024x1024',    
    quality: 'standard',
    n: 1,
  })
  
  const url = generated.data[0].url
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  writeFileSync(outputPath, buffer)

  return outputPath
}
