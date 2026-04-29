ALTER TABLE "path_activities"
ADD CONSTRAINT "path_activities_path_lesson_id_order_index_key"
UNIQUE ("path_lesson_id", "order_index");
