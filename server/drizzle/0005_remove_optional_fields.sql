-- Remover colunas: author, image_url, excerpt
ALTER TABLE "articles" DROP COLUMN IF EXISTS "author";
ALTER TABLE "articles" DROP COLUMN IF EXISTS "image_url";
ALTER TABLE "articles" DROP COLUMN IF EXISTS "excerpt";
