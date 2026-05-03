ALTER TABLE "path_lessons"
ADD COLUMN IF NOT EXISTS "learning_objective_ids" JSONB,
ADD COLUMN IF NOT EXISTS "source_card_ids" JSONB;

ALTER TABLE "path_activities"
ADD COLUMN IF NOT EXISTS "generation_run_id" UUID,
ADD COLUMN IF NOT EXISTS "learning_objective_ids" JSONB,
ADD COLUMN IF NOT EXISTS "source_card_ids" JSONB;

CREATE TABLE IF NOT EXISTS "learning_objectives" (
    "id" UUID NOT NULL,
    "track" VARCHAR(50) NOT NULL,
    "topic" VARCHAR(120) NOT NULL,
    "level" VARCHAR(30) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "prerequisite_objective_ids" JSONB,
    "source_card_ids" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_objectives_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "activity_validations" (
    "id" UUID NOT NULL,
    "path_activity_id" UUID NOT NULL,
    "generation_run_id" UUID,
    "validation_type" VARCHAR(80) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "summary" TEXT,
    "input_json" JSONB,
    "output_json" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_validations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "path_activities_generation_run_id_idx"
ON "path_activities"("generation_run_id");

CREATE INDEX IF NOT EXISTS "learning_objectives_track_idx"
ON "learning_objectives"("track");

CREATE INDEX IF NOT EXISTS "learning_objectives_topic_idx"
ON "learning_objectives"("topic");

CREATE INDEX IF NOT EXISTS "learning_objectives_level_idx"
ON "learning_objectives"("level");

CREATE INDEX IF NOT EXISTS "activity_validations_path_activity_id_idx"
ON "activity_validations"("path_activity_id");

CREATE INDEX IF NOT EXISTS "activity_validations_generation_run_id_idx"
ON "activity_validations"("generation_run_id");

CREATE INDEX IF NOT EXISTS "activity_validations_validation_type_idx"
ON "activity_validations"("validation_type");

CREATE INDEX IF NOT EXISTS "activity_validations_status_idx"
ON "activity_validations"("status");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'activity_validations_path_activity_id_fkey'
    ) THEN
        ALTER TABLE "activity_validations"
        ADD CONSTRAINT "activity_validations_path_activity_id_fkey"
        FOREIGN KEY ("path_activity_id") REFERENCES "path_activities"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
