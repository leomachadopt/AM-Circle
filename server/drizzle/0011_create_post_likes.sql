-- CreateTable
CREATE TABLE IF NOT EXISTS "post_likes" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_post_id_user_id_unique" ON "post_likes"("post_id", "user_id");

