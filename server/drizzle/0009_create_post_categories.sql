-- Criar tabela de categorias de posts da comunidade
CREATE TABLE IF NOT EXISTS "post_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "post_categories_slug_unique" UNIQUE("slug")
);


