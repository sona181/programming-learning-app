DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'path_activities_generation_run_id_fkey'
    ) THEN
        ALTER TABLE "path_activities"
        ADD CONSTRAINT "path_activities_generation_run_id_fkey"
        FOREIGN KEY ("generation_run_id") REFERENCES "generation_runs"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'activity_validations_generation_run_id_fkey'
    ) THEN
        ALTER TABLE "activity_validations"
        ADD CONSTRAINT "activity_validations_generation_run_id_fkey"
        FOREIGN KEY ("generation_run_id") REFERENCES "generation_runs"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
