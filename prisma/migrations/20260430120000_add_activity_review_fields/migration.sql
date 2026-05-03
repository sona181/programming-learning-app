ALTER TABLE "path_activities"
ADD COLUMN IF NOT EXISTS "review_status" VARCHAR(20) NOT NULL DEFAULT 'pending_review',
ADD COLUMN IF NOT EXISTS "quality_score" INTEGER,
ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMPTZ(6),
ADD COLUMN IF NOT EXISTS "reviewed_by" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "review_notes" TEXT,
ADD COLUMN IF NOT EXISTS "generation_count" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS "path_activities_review_status_idx"
ON "path_activities"("review_status");
