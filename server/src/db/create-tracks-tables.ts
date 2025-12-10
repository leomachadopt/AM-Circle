import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function createTracksTables() {
  console.log('Criando tabelas de trilhas...')
  try {
    // Criar tabela tracks
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tracks" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "published" BOOLEAN DEFAULT false NOT NULL,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL
      );
    `)

    // Criar tabela track_items
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "track_items" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "track_id" INTEGER NOT NULL,
          "type" VARCHAR(50) NOT NULL,
          "item_id" INTEGER NOT NULL,
          "order" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT "track_items_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)

    console.log('Tabelas de trilhas criadas com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('Erro ao criar tabelas de trilhas:', error)
    console.error('Detalhes:', error.message, error.stack)
    process.exit(1)
  }
}

createTracksTables()


