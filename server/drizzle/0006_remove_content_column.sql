-- Remover coluna content que não é mais usada
ALTER TABLE "articles" DROP COLUMN IF EXISTS "content";
