import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function addEventImageUrl() {
  console.log('Adicionando campo image_url na tabela events...')
  try {
    // Adicionar coluna image_url se não existir
    await db.execute(sql`
      ALTER TABLE "events" 
      ADD COLUMN IF NOT EXISTS "image_url" TEXT;
    `)

    console.log('Campo image_url adicionado com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('Erro ao adicionar campo image_url:', error)
    console.error('Detalhes:', error.message, error.stack)
    process.exit(1)
  }
}

addEventImageUrl()

