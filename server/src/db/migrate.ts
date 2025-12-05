import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  console.log('Executando migrações...')
  try {
    const migrationsFolder = path.join(__dirname, '../../drizzle')
    console.log('Pasta de migrações:', migrationsFolder)
    await migrate(db, { migrationsFolder })
    console.log('Migrações executadas com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('Erro ao executar migrações:', error)
    console.error('Detalhes:', error.message, error.stack)
    process.exit(1)
  }
}

runMigrations()


