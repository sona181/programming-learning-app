-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'instructor', 'admin');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'pending', 'published', 'archived');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('video', 'article', 'audio', 'mixed');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('video', 'article', 'audio', 'code_snippet');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('multiple_choice', 'true_false', 'fill_blank');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'completed', 'dropped');

-- CreateEnum
CREATE TYPE "PathLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "PathStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('multiple_choice', 'fill_blank', 'code_fix', 'match', 'order_lines');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "country" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "category_id" TEXT,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "thumbnail_url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lesson_type" "LessonType" NOT NULL,
    "order_index" INTEGER NOT NULL,
    "duration_seconds" INTEGER,
    "is_free_preview" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_contents" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "body" TEXT,
    "media_url" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "path_unit_id" TEXT,
    "title" TEXT NOT NULL,
    "pass_score" INTEGER NOT NULL DEFAULT 70,
    "time_limit_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "order_index" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'active',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_progress" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "completed_lessons" INTEGER NOT NULL DEFAULT 0,
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "last_accessed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "time_taken_seconds" INTEGER,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempt_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT,
    "text_answer" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" "PathLevel" NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" "PathStatus" NOT NULL DEFAULT 'draft',
    "estimated_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_units" (
    "id" TEXT NOT NULL,
    "path_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_lessons" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_activities" (
    "id" TEXT NOT NULL,
    "path_lesson_id" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "correct_answer" TEXT,
    "options" JSONB,
    "order_index" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "path_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_responses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_key" TEXT NOT NULL,
    "answer_value" TEXT NOT NULL,
    "responded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "path_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "assigned_level" "PathLevel" NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_answers" (
    "id" TEXT NOT NULL,
    "placement_attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "placement_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_path_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "path_id" TEXT NOT NULL,
    "level" "PathLevel" NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'active',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_path_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_path_progress" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "path_lesson_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_path_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT,
    "languages" TEXT,
    "hourly_rate" DECIMAL(10,2),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_available" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_slots" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_name_key" ON "course_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_slug_key" ON "course_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_course_id_order_index_key" ON "chapters"("course_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_chapter_id_order_index_key" ON "lessons"("chapter_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_chapter_id_key" ON "quizzes"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_path_unit_id_key" ON "quizzes"("path_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_enrollment_id_lesson_id_key" ON "lesson_progress"("enrollment_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_enrollment_id_key" ON "course_progress"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_slug_key" ON "learning_paths"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "path_units_path_id_order_index_key" ON "path_units"("path_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "path_lessons_unit_id_order_index_key" ON "path_lessons"("unit_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_responses_user_id_question_key_key" ON "onboarding_responses"("user_id", "question_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_path_enrollments_user_id_path_id_key" ON "user_path_enrollments"("user_id", "path_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_path_progress_enrollment_id_path_lesson_id_key" ON "user_path_progress"("enrollment_id", "path_lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_user_id_key" ON "instructor_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "course_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "course_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_contents" ADD CONSTRAINT "lesson_contents_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_path_unit_id_fkey" FOREIGN KEY ("path_unit_id") REFERENCES "path_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_units" ADD CONSTRAINT "path_units_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_lessons" ADD CONSTRAINT "path_lessons_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "path_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_activities" ADD CONSTRAINT "path_activities_path_lesson_id_fkey" FOREIGN KEY ("path_lesson_id") REFERENCES "path_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_attempts" ADD CONSTRAINT "placement_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_attempts" ADD CONSTRAINT "placement_attempts_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_placement_attempt_id_fkey" FOREIGN KEY ("placement_attempt_id") REFERENCES "placement_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_enrollments" ADD CONSTRAINT "user_path_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_enrollments" ADD CONSTRAINT "user_path_enrollments_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "user_path_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_path_lesson_id_fkey" FOREIGN KEY ("path_lesson_id") REFERENCES "path_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
