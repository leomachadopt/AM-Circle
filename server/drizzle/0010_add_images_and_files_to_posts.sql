-- Adicionar campos de imagens e arquivos aos posts
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "images" jsonb;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "files" jsonb;


