CREATE TABLE IF NOT EXISTS "path_lesson_source_cards" (
    "id" UUID NOT NULL,
    "path_lesson_id" UUID NOT NULL,
    "source_card_id" UUID NOT NULL,
    "purpose" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_lesson_source_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "path_activity_source_cards" (
    "id" UUID NOT NULL,
    "path_activity_id" UUID NOT NULL,
    "source_card_id" UUID NOT NULL,
    "purpose" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_activity_source_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "learning_objective_source_cards" (
    "id" UUID NOT NULL,
    "learning_objective_id" UUID NOT NULL,
    "source_card_id" UUID NOT NULL,
    "purpose" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_objective_source_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "path_lesson_source_cards_path_lesson_id_source_card_id_key"
ON "path_lesson_source_cards"("path_lesson_id", "source_card_id");

CREATE INDEX IF NOT EXISTS "path_lesson_source_cards_path_lesson_id_idx"
ON "path_lesson_source_cards"("path_lesson_id");

CREATE INDEX IF NOT EXISTS "path_lesson_source_cards_source_card_id_idx"
ON "path_lesson_source_cards"("source_card_id");

CREATE UNIQUE INDEX IF NOT EXISTS "path_activity_source_cards_path_activity_id_source_card_id_key"
ON "path_activity_source_cards"("path_activity_id", "source_card_id");

CREATE INDEX IF NOT EXISTS "path_activity_source_cards_path_activity_id_idx"
ON "path_activity_source_cards"("path_activity_id");

CREATE INDEX IF NOT EXISTS "path_activity_source_cards_source_card_id_idx"
ON "path_activity_source_cards"("source_card_id");

CREATE UNIQUE INDEX IF NOT EXISTS "learning_objective_source_cards_learning_objective_id_source_card_id_key"
ON "learning_objective_source_cards"("learning_objective_id", "source_card_id");

CREATE INDEX IF NOT EXISTS "learning_objective_source_cards_learning_objective_id_idx"
ON "learning_objective_source_cards"("learning_objective_id");

CREATE INDEX IF NOT EXISTS "learning_objective_source_cards_source_card_id_idx"
ON "learning_objective_source_cards"("source_card_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'path_lesson_source_cards_path_lesson_id_fkey'
    ) THEN
        ALTER TABLE "path_lesson_source_cards"
        ADD CONSTRAINT "path_lesson_source_cards_path_lesson_id_fkey"
        FOREIGN KEY ("path_lesson_id") REFERENCES "path_lessons"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'path_lesson_source_cards_source_card_id_fkey'
    ) THEN
        ALTER TABLE "path_lesson_source_cards"
        ADD CONSTRAINT "path_lesson_source_cards_source_card_id_fkey"
        FOREIGN KEY ("source_card_id") REFERENCES "source_cards"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'path_activity_source_cards_path_activity_id_fkey'
    ) THEN
        ALTER TABLE "path_activity_source_cards"
        ADD CONSTRAINT "path_activity_source_cards_path_activity_id_fkey"
        FOREIGN KEY ("path_activity_id") REFERENCES "path_activities"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'path_activity_source_cards_source_card_id_fkey'
    ) THEN
        ALTER TABLE "path_activity_source_cards"
        ADD CONSTRAINT "path_activity_source_cards_source_card_id_fkey"
        FOREIGN KEY ("source_card_id") REFERENCES "source_cards"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'learning_objective_source_cards_learning_objective_id_fkey'
    ) THEN
        ALTER TABLE "learning_objective_source_cards"
        ADD CONSTRAINT "learning_objective_source_cards_learning_objective_id_fkey"
        FOREIGN KEY ("learning_objective_id") REFERENCES "learning_objectives"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'learning_objective_source_cards_source_card_id_fkey'
    ) THEN
        ALTER TABLE "learning_objective_source_cards"
        ADD CONSTRAINT "learning_objective_source_cards_source_card_id_fkey"
        FOREIGN KEY ("source_card_id") REFERENCES "source_cards"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
