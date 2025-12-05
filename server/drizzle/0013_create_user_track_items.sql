-- CreateTable
CREATE TABLE IF NOT EXISTS "user_track_items" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "user_id" INTEGER NOT NULL,
    "track_item_id" INTEGER NOT NULL,
    "completed" BOOLEAN DEFAULT false NOT NULL,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT "user_track_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "user_track_items_track_item_id_track_items_id_fk" FOREIGN KEY ("track_item_id") REFERENCES "public"."track_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_track_items_user_id_track_item_id_unique" ON "user_track_items"("user_id", "track_item_id");

