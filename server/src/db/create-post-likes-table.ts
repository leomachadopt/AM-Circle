import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function createPostLikesTable() {
  try {
    console.log('Criando tabela post_likes...')
    
    // Criar tabela
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "post_likes" (
        "id" SERIAL PRIMARY KEY NOT NULL,
        "post_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT now() NOT NULL,
        CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `)
    
    // Criar índice único
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_post_id_user_id_unique" ON "post_likes"("post_id", "user_id")
    `)
    
    console.log('Tabela post_likes criada com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('Erro ao criar tabela post_likes:', error)
    if (error.message && error.message.includes('already exists')) {
      console.log('Tabela post_likes já existe.')
      process.exit(0)
    } else {
      console.error('Detalhes:', error.message, error.stack)
      process.exit(1)
    }
  }
}

createPostLikesTable()

