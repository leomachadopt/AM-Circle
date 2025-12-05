-- Adicionar coluna parent_id para permitir respostas aos comentários
ALTER TABLE "article_comments" ADD COLUMN IF NOT EXISTS "parent_id" integer;

-- Adicionar foreign key para parent_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'article_comments_parent_id_article_comments_id_fk'
    ) THEN
        ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_parent_id_article_comments_id_fk" 
        FOREIGN KEY ("parent_id") REFERENCES "article_comments"("id") ON DELETE CASCADE;
    END IF;
END $$;
