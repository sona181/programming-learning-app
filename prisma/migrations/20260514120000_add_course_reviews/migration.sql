CREATE TABLE IF NOT EXISTS "course_reviews" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "course_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "course_reviews_course_id_user_id_key"
ON "course_reviews"("course_id", "user_id");

CREATE INDEX IF NOT EXISTS "course_reviews_course_id_idx"
ON "course_reviews"("course_id");

CREATE INDEX IF NOT EXISTS "course_reviews_user_id_idx"
ON "course_reviews"("user_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'course_reviews_course_id_fkey'
    ) THEN
        ALTER TABLE "course_reviews"
        ADD CONSTRAINT "course_reviews_course_id_fkey"
        FOREIGN KEY ("course_id") REFERENCES "courses"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'course_reviews_user_id_fkey'
    ) THEN
        ALTER TABLE "course_reviews"
        ADD CONSTRAINT "course_reviews_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
