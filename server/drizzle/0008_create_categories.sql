-- Criar tabela de categorias de artigos
CREATE TABLE IF NOT EXISTS "article_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
