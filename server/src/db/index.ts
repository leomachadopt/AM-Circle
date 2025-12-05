import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida nas variáveis de ambiente')
}

// Criar conexão com o banco de dados
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, { max: 1 })

// Criar instância do Drizzle
export const db = drizzle(client, { schema })

export * from './schema.js'


