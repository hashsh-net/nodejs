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

export async function saveToBigQuery (datasetId, tableId, rows){
  try {
    await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert(rows)
  } catch (error) {
    console.error('saveToBigQuery Error:', error)
  }
}