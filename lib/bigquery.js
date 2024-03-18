import { BigQuery } from '@google-cloud/bigquery'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const keyFilename = path.join(__dirname, '..', 'googlekey.json')
const credentials = JSON.parse(fs.readFileSync(keyFilename, 'utf8'))

export const bigquery = new BigQuery({
    credentials: credentials
})

const RETRY_LIMIT = 5
const RETRY_WAITING_TIME = 5000
export async function saveToBigQuery(datasetId, tableId, rows) {
  let retries = 0
  while (retries < RETRY_LIMIT) {
    try {
      await bigquery
        .dataset(datasetId)
        .insert(rows);
      return
    } catch (error) {
      console.error('saveToBigQuery Error:', error)
      retries++
      if (retries < RETRY_LIMIT) {
        console.error(`========================================`)
        console.error(`Retry Start:${retries-1}`)
        console.error(`========================================`)
        await new Promise(resolve => setTimeout(resolve, RETRY_WAITING_TIME))
      }
    }
  }
}