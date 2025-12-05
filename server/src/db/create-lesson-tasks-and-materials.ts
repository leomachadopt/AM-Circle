import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function createLessonTasksAndMaterialsTables() {
  console.log('📋 Criando tabelas de tarefas de ativação e materiais...')

  try {
    // Criar tabela lesson_activation_tasks
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "lesson_activation_tasks" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "lesson_id" INTEGER NOT NULL,
          "title" TEXT NOT NULL,
          "order" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT "lesson_activation_tasks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)

    // Criar tabela user_activation_tasks
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_activation_tasks" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "user_id" INTEGER NOT NULL,
          "task_id" INTEGER NOT NULL,
          "completed" BOOLEAN DEFAULT false NOT NULL,
          "completed_at" TIMESTAMP,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT "user_activation_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "user_activation_tasks_task_id_lesson_activation_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."lesson_activation_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)

    // Criar tabela lesson_materials
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "lesson_materials" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "lesson_id" INTEGER NOT NULL,
          "title" VARCHAR(255) NOT NULL,
          "file_url" TEXT,
          "file_type" VARCHAR(50),
          "file_size" INTEGER,
          "order" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT "lesson_materials_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)

    // Criar tabela lesson_comments
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "lesson_comments" (
          "id" SERIAL PRIMARY KEY NOT NULL,
          "lesson_id" INTEGER NOT NULL,
          "user_id" INTEGER NOT NULL,
          "parent_id" INTEGER,
          "author" VARCHAR(255) NOT NULL,
          "avatar" TEXT,
          "content" TEXT NOT NULL,
          "likes" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT now() NOT NULL,
          "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
          CONSTRAINT "lesson_comments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "lesson_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "lesson_comments_parent_id_lesson_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lesson_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `)

    console.log('✅ Tabelas de tarefas, materiais e comentários criadas com sucesso!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Erro ao criar tabelas:', error.message)
    console.error('Detalhes:', error.stack)
    process.exit(1)
  }
}

createLessonTasksAndMaterialsTables()

