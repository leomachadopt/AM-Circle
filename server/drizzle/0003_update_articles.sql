-- Adicionar novas colunas à tabela articles
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "file_url" text;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "downloads" integer DEFAULT 0;

-- Criar tabela de comentários de artigos
CREATE TABLE IF NOT EXISTS "article_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"author" varchar(255) NOT NULL,
	"avatar" text,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Adicionar foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'article_comments_article_id_articles_id_fk'
    ) THEN
        ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_articles_id_fk" 
        FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'article_comments_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
END $$;
