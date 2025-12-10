import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function addEventAddressAndRegistrations() {
  console.log('Adicionando campo address na tabela events e criando tabela event_registrations...')
  try {
    // Adicionar coluna address se não existir
    await db.execute(sql`
      ALTER TABLE "events" 
      ADD COLUMN IF NOT EXISTS "address" TEXT;
    `)

    // Criar tabela event_registrations se não existir
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "event_registrations" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "event_id" INTEGER NOT NULL,
          "user_id" INTEGER NOT NULL,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "event_registrations_event_id_user_id_unique" ON "event_registrations"("event_id", "user_id");
    `)

    console.log('Campo address e tabela event_registrations criados com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('Erro ao criar campo address e tabela event_registrations:', error)
    console.error('Detalhes:', error.message, error.stack)
    process.exit(1)
  }
}

addEventAddressAndRegistrations()


