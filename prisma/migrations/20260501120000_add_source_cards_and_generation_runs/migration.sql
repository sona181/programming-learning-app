CREATE TABLE IF NOT EXISTS "source_cards" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "track" VARCHAR(50) NOT NULL,
    "topic" VARCHAR(120) NOT NULL,
    "level" VARCHAR(30) NOT NULL,
    "source_name" VARCHAR(255) NOT NULL,
    "source_url" VARCHAR(1000) NOT NULL,
    "source_type" VARCHAR(80) NOT NULL,
    "credibility_tier" VARCHAR(30) NOT NULL,
    "license_note" TEXT,
    "safe_use" TEXT,
    "prohibited_use" TEXT,
    "concepts" JSONB NOT NULL,
    "learning_goals" JSONB NOT NULL,
    "exercise_types" JSONB NOT NULL,
    "common_mistakes" JSONB,
    "teach_later" JSONB,
    "test_requirements" JSONB,
    "reference_json" JSONB NOT NULL,
    "body" TEXT,
    "review_status" VARCHAR(30) NOT NULL DEFAULT 'pending_review',
    "reviewed_by" VARCHAR(255),
    "reviewed_at" TIMESTAMPTZ(6),
    "review_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "generation_runs" (
    "id" UUID NOT NULL,
    "run_type" VARCHAR(50) NOT NULL,
    "track" VARCHAR(50) NOT NULL,
    "topic" VARCHAR(120),
    "model" VARCHAR(100) NOT NULL,
    "prompt_version" VARCHAR(50),
    "input_json" JSONB,
    "output_json" JSONB,
    "source_card_ids" JSONB,
    "status" VARCHAR(30) NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "source_cards_slug_key"
ON "source_cards"("slug");

CREATE INDEX IF NOT EXISTS "source_cards_track_idx"
ON "source_cards"("track");

CREATE INDEX IF NOT EXISTS "source_cards_topic_idx"
ON "source_cards"("topic");

CREATE INDEX IF NOT EXISTS "source_cards_level_idx"
ON "source_cards"("level");

CREATE INDEX IF NOT EXISTS "source_cards_review_status_idx"
ON "source_cards"("review_status");

CREATE INDEX IF NOT EXISTS "source_cards_is_active_idx"
ON "source_cards"("is_active");

CREATE INDEX IF NOT EXISTS "source_cards_track_topic_idx"
ON "source_cards"("track", "topic");

CREATE INDEX IF NOT EXISTS "generation_runs_run_type_idx"
ON "generation_runs"("run_type");

CREATE INDEX IF NOT EXISTS "generation_runs_track_idx"
ON "generation_runs"("track");

CREATE INDEX IF NOT EXISTS "generation_runs_status_idx"
ON "generation_runs"("status");
