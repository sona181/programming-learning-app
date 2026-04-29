import "dotenv/config";

import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { Client } from "pg";

const require = createRequire(import.meta.url);

const { javaCourseSeed } = require("../lib/seed-data/java-course.ts") as {
  javaCourseSeed: typeof import("../lib/seed-data/java-course").javaCourseSeed;
};
const { javaPathSeed } = require("../lib/seed-data/java-path.ts") as {
  javaPathSeed: typeof import("../lib/seed-data/java-path").javaPathSeed;
};
const { javaQuizSeed } = require("../lib/seed-data/java-quizzes.ts") as {
  javaQuizSeed: typeof import("../lib/seed-data/java-quizzes").javaQuizSeed;
};

const seedTimestamp = new Date("2026-04-14T09:00:00.000Z");
const JAVA_COURSE_SLUG = javaCourseSeed.course.slug;
const JAVA_PATH_SLUG = javaPathSeed.path.slug;
const academyDevStudent = {
  displayName: "Academy Dev Student",
  email: "student.dev+academy@unilearn.local",
  id: "06ef614e-5ca3-4294-b0b3-8d22d9e58adc",
  key: "academy-dev-student",
  passwordHash: "$2b$10$AJuMtUNclEkbwtrfzuVHUOkyKFOMZQesY0ezvQrNBvEIQ3.fXlECC",
  role: "student",
} as const;

function stableUuid(key: string) {
  const chars = createHash("sha256")
    .update(`unilearn:${key}`)
    .digest("hex")
    .slice(0, 32)
    .split("");

  chars[12] = "4";

  const variant = Number.parseInt(chars[16] ?? "0", 16);
  chars[16] = ((variant & 0x3) | 0x8).toString(16);

  return `${chars.slice(0, 8).join("")}-${chars.slice(8, 12).join("")}-${chars
    .slice(12, 16)
    .join("")}-${chars.slice(16, 20).join("")}-${chars.slice(20, 32).join("")}`;
}

function toJson(value: unknown) {
  return value == null ? null : JSON.stringify(value);
}

async function clearJavaPathData(client: Client) {
  await client.query(
    `
      DELETE FROM daily_plan_items
      WHERE daily_plan_id IN (
        SELECT dp.id
        FROM daily_plans dp
        JOIN user_path_enrollments upe ON upe.id = dp.enrollment_id
        JOIN learning_paths lp ON lp.id = upe.path_id
        WHERE lp.slug = $1
      )
      OR review_item_id IN (
        SELECT rqi.id
        FROM review_queue_items rqi
        JOIN path_activities pa ON pa.id = rqi.path_activity_id
        JOIN path_lessons pl ON pl.id = pa.path_lesson_id
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
      OR path_activity_id IN (
        SELECT pa.id
        FROM path_activities pa
        JOIN path_lessons pl ON pl.id = pa.path_lesson_id
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM daily_plans
      WHERE enrollment_id IN (
        SELECT upe.id
        FROM user_path_enrollments upe
        JOIN learning_paths lp ON lp.id = upe.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM review_queue_items
      WHERE path_activity_id IN (
        SELECT pa.id
        FROM path_activities pa
        JOIN path_lessons pl ON pl.id = pa.path_lesson_id
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM xp_logs
      WHERE source_type = 'path_activity'
      AND source_id IN (
        SELECT pa.id
        FROM path_activities pa
        JOIN path_lessons pl ON pl.id = pa.path_lesson_id
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM xp_logs
      WHERE source_type = 'path_lesson_completion'
      AND source_id IN (
        SELECT pl.id
        FROM path_lessons pl
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM user_path_progress
      WHERE enrollment_id IN (
        SELECT upe.id
        FROM user_path_enrollments upe
        JOIN learning_paths lp ON lp.id = upe.path_id
        WHERE lp.slug = $1
      )
      OR path_lesson_id IN (
        SELECT pl.id
        FROM path_lessons pl
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM user_path_enrollments
      WHERE path_id IN (
        SELECT id
        FROM learning_paths
        WHERE slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM quiz_attempt_answers
      WHERE attempt_id IN (
        SELECT qa.id
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        JOIN path_units pu ON pu.id = q.path_unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM quiz_attempts
      WHERE quiz_id IN (
        SELECT q.id
        FROM quizzes q
        JOIN path_units pu ON pu.id = q.path_unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM answer_options
      WHERE question_id IN (
        SELECT qu.id
        FROM questions qu
        JOIN quizzes q ON q.id = qu.quiz_id
        JOIN path_units pu ON pu.id = q.path_unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM questions
      WHERE quiz_id IN (
        SELECT q.id
        FROM quizzes q
        JOIN path_units pu ON pu.id = q.path_unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM quizzes
      WHERE path_unit_id IN (
        SELECT pu.id
        FROM path_units pu
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM certificates
      WHERE path_id IN (
        SELECT id
        FROM learning_paths
        WHERE slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM path_activities
      WHERE path_lesson_id IN (
        SELECT pl.id
        FROM path_lessons pl
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM path_lessons
      WHERE unit_id IN (
        SELECT pu.id
        FROM path_units pu
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );

  await client.query(
    `
      DELETE FROM path_units
      WHERE path_id IN (
        SELECT id
        FROM learning_paths
        WHERE slug = $1
      )
    `,
    [JAVA_PATH_SLUG],
  );
}

async function clearJavaCourseData(client: Client) {
  await client.query(
    `
      DELETE FROM quiz_attempt_answers
      WHERE attempt_id IN (
        SELECT qa.id
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        JOIN chapters ch ON ch.id = q.chapter_id
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM quiz_attempts
      WHERE quiz_id IN (
        SELECT q.id
        FROM quizzes q
        JOIN chapters ch ON ch.id = q.chapter_id
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM answer_options
      WHERE question_id IN (
        SELECT qu.id
        FROM questions qu
        JOIN quizzes q ON q.id = qu.quiz_id
        JOIN chapters ch ON ch.id = q.chapter_id
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM questions
      WHERE quiz_id IN (
        SELECT q.id
        FROM quizzes q
        JOIN chapters ch ON ch.id = q.chapter_id
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM quizzes
      WHERE chapter_id IN (
        SELECT ch.id
        FROM chapters ch
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM lesson_progress
      WHERE enrollment_id IN (
        SELECT e.id
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE c.slug = $1
      )
      OR lesson_id IN (
        SELECT l.id
        FROM lessons l
        JOIN chapters ch ON ch.id = l.chapter_id
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM course_progress
      WHERE enrollment_id IN (
        SELECT e.id
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM certificates
      WHERE course_id IN (
        SELECT id
        FROM courses
        WHERE slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM enrollments
      WHERE course_id IN (
        SELECT id
        FROM courses
        WHERE slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM lesson_contents
      WHERE lesson_id IN (
        SELECT l.id
        FROM lessons l
        JOIN chapters ch ON ch.id = l.chapter_id
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM lessons
      WHERE chapter_id IN (
        SELECT ch.id
        FROM chapters ch
        JOIN courses c ON c.id = ch.course_id
        WHERE c.slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );

  await client.query(
    `
      DELETE FROM chapters
      WHERE course_id IN (
        SELECT id
        FROM courses
        WHERE slug = $1
      )
    `,
    [JAVA_COURSE_SLUG],
  );
}

async function upsertDevStudent(client: Client) {
  const userResult = await client.query<{ id: string }>(
    `
      INSERT INTO users (
        id,
        email,
        password_hash,
        role,
        is_active,
        is_verified,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE
      SET
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        is_verified = EXCLUDED.is_verified,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `,
    [
      academyDevStudent.id,
      academyDevStudent.email,
      academyDevStudent.passwordHash,
      academyDevStudent.role,
      true,
      true,
      seedTimestamp,
      seedTimestamp,
      null,
    ],
  );

  const userId = userResult.rows[0]?.id;

  if (!userId) {
    throw new Error("Failed to create or find the academy dev student.");
  }

  await client.query(
    `
      INSERT INTO user_profiles (
        id,
        user_id,
        display_name,
        avatar_url,
        bio,
        country,
        timezone,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE
      SET
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        updated_at = EXCLUDED.updated_at
    `,
    [
      stableUuid(`profile:${academyDevStudent.key}`),
      userId,
      academyDevStudent.displayName,
      null,
      "Temporary seeded student account for academy frontend testing.",
      null,
      "UTC",
      seedTimestamp,
      seedTimestamp,
    ],
  );

  await client.query(
    `
      INSERT INTO user_settings (
        id,
        user_id,
        email_notifications,
        language,
        dark_mode,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE
      SET
        language = EXCLUDED.language,
        updated_at = EXCLUDED.updated_at
    `,
    [
      stableUuid(`settings:${academyDevStudent.key}`),
      userId,
      false,
      "en",
      false,
      seedTimestamp,
    ],
  );

  return userId;
}

async function upsertAuthor(client: Client) {
  const userResult = await client.query<{ id: string }>(
    `
      INSERT INTO users (
        id,
        email,
        password_hash,
        role,
        is_active,
        is_verified,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE
      SET
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        is_verified = EXCLUDED.is_verified,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `,
    [
      stableUuid(`user:${javaCourseSeed.author.key}`),
      javaCourseSeed.author.email,
      javaCourseSeed.author.passwordHash,
      javaCourseSeed.author.role,
      true,
      true,
      seedTimestamp,
      seedTimestamp,
      null,
    ],
  );

  const userId = userResult.rows[0]?.id;

  if (!userId) {
    throw new Error("Failed to create or find the Java seed author.");
  }

  await client.query(
    `
      INSERT INTO user_profiles (
        id,
        user_id,
        display_name,
        avatar_url,
        bio,
        country,
        timezone,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id) DO UPDATE
      SET
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        updated_at = EXCLUDED.updated_at
    `,
    [
      stableUuid(`profile:${javaCourseSeed.author.key}`),
      userId,
      javaCourseSeed.author.displayName,
      null,
      "Seeded content author used for Java course ownership.",
      null,
      "UTC",
      seedTimestamp,
      seedTimestamp,
    ],
  );

  await client.query(
    `
      INSERT INTO user_settings (
        id,
        user_id,
        email_notifications,
        language,
        dark_mode,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE
      SET
        language = EXCLUDED.language,
        updated_at = EXCLUDED.updated_at
    `,
    [
      stableUuid(`settings:${javaCourseSeed.author.key}`),
      userId,
      false,
      "en",
      false,
      seedTimestamp,
    ],
  );

  await client.query(
    `
      INSERT INTO instructor_profiles (
        id,
        user_id,
        bio,
        specialties,
        languages,
        hourly_rate,
        rating,
        is_verified,
        is_available,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE
      SET
        bio = EXCLUDED.bio,
        specialties = EXCLUDED.specialties,
        languages = EXCLUDED.languages,
        is_verified = EXCLUDED.is_verified,
        is_available = EXCLUDED.is_available,
        updated_at = EXCLUDED.updated_at
    `,
    [
      stableUuid(`instructor:${javaCourseSeed.author.key}`),
      userId,
      "Seeded Java content author profile.",
      "Java, beginner programming",
      "English",
      null,
      null,
      true,
      false,
      seedTimestamp,
      seedTimestamp,
    ],
  );

  return userId;
}

async function upsertCourse(client: Client, authorId: string) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO courses (
        id,
        category_id,
        author_id,
        title,
        description,
        slug,
        level,
        status,
        is_premium,
        price,
        thumbnail_url,
        language,
        published_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (slug) DO UPDATE
      SET
        author_id = EXCLUDED.author_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        level = EXCLUDED.level,
        status = EXCLUDED.status,
        is_premium = EXCLUDED.is_premium,
        price = EXCLUDED.price,
        thumbnail_url = EXCLUDED.thumbnail_url,
        language = EXCLUDED.language,
        published_at = EXCLUDED.published_at,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `,
    [
      stableUuid(`course:${javaCourseSeed.course.key}`),
      null,
      authorId,
      javaCourseSeed.course.title,
      javaCourseSeed.course.description,
      javaCourseSeed.course.slug,
      javaCourseSeed.course.level,
      javaCourseSeed.course.status,
      javaCourseSeed.course.isPremium,
      null,
      null,
      javaCourseSeed.course.language,
      seedTimestamp,
      seedTimestamp,
      seedTimestamp,
    ],
  );

  const courseId = result.rows[0]?.id;

  if (!courseId) {
    throw new Error("Failed to create or find the Java Foundations course.");
  }

  await client.query(
    `
      INSERT INTO course_authors (
        id,
        course_id,
        user_id,
        author_role,
        added_at
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (course_id, user_id) DO UPDATE
      SET
        author_role = EXCLUDED.author_role,
        added_at = EXCLUDED.added_at
    `,
    [
      stableUuid(`course-author:${javaCourseSeed.course.key}`),
      courseId,
      authorId,
      "primary",
      seedTimestamp,
    ],
  );

  return courseId;
}

async function seedCourseContent(client: Client, courseId: string) {
  for (const chapter of javaCourseSeed.chapters) {
    const chapterId = stableUuid(`chapter:${chapter.key}`);

    await client.query(
      `
        INSERT INTO chapters (id, course_id, title, order_index, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET
          course_id = EXCLUDED.course_id,
          title = EXCLUDED.title,
          order_index = EXCLUDED.order_index
      `,
      [chapterId, courseId, chapter.title, chapter.orderIndex, seedTimestamp],
    );

    for (const lesson of chapter.lessons) {
      const lessonId = stableUuid(`lesson:${lesson.key}`);

      await client.query(
        `
          INSERT INTO lessons (
            id,
            chapter_id,
            title,
            lesson_type,
            order_index,
            duration_seconds,
            is_free_preview,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE
          SET
            chapter_id = EXCLUDED.chapter_id,
            title = EXCLUDED.title,
            lesson_type = EXCLUDED.lesson_type,
            order_index = EXCLUDED.order_index,
            duration_seconds = EXCLUDED.duration_seconds,
            is_free_preview = EXCLUDED.is_free_preview
        `,
        [
          lessonId,
          chapterId,
          lesson.title,
          lesson.lessonType,
          lesson.orderIndex,
          lesson.durationSeconds,
          lesson.isFreePreview,
          seedTimestamp,
        ],
      );

      for (const content of lesson.contents) {
        await client.query(
          `
            INSERT INTO lesson_contents (
              id,
              lesson_id,
              content_type,
              body,
              media_url,
              order_index,
              created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE
            SET
              lesson_id = EXCLUDED.lesson_id,
              content_type = EXCLUDED.content_type,
              body = EXCLUDED.body,
              media_url = EXCLUDED.media_url,
              order_index = EXCLUDED.order_index
          `,
          [
            stableUuid(`lesson-content:${content.key}`),
            lessonId,
            content.contentType,
            content.body,
            null,
            lesson.contents.findIndex((item) => item.key === content.key) + 1,
            seedTimestamp,
          ],
        );
      }
    }
  }
}

async function upsertLearningPath(client: Client) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO learning_paths (
        id,
        title,
        slug,
        description,
        level,
        language,
        status,
        estimated_days,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (slug) DO UPDATE
      SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        level = EXCLUDED.level,
        language = EXCLUDED.language,
        status = EXCLUDED.status,
        estimated_days = EXCLUDED.estimated_days,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `,
    [
      stableUuid(`path:${javaPathSeed.path.key}`),
      javaPathSeed.path.title,
      javaPathSeed.path.slug,
      javaPathSeed.path.description,
      javaPathSeed.path.level,
      javaPathSeed.path.language,
      javaPathSeed.path.status,
      javaPathSeed.path.estimatedDays,
      seedTimestamp,
      seedTimestamp,
    ],
  );

  const pathId = result.rows[0]?.id;

  if (!pathId) {
    throw new Error("Failed to create or find the Java beginner path.");
  }

  return pathId;
}

async function seedPathContent(client: Client, pathId: string) {
  for (const unit of javaPathSeed.units) {
    const unitId = stableUuid(`path-unit:${unit.key}`);

    await client.query(
      `
        INSERT INTO path_units (id, path_id, title, description, order_index, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE
        SET
          path_id = EXCLUDED.path_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          order_index = EXCLUDED.order_index
      `,
      [unitId, pathId, unit.title, unit.description, unit.orderIndex, seedTimestamp],
    );

    for (const lesson of unit.lessons) {
      const lessonId = stableUuid(`path-lesson:${lesson.key}`);

      await client.query(
        `
          INSERT INTO path_lessons (id, unit_id, title, order_index, xp_reward, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE
          SET
            unit_id = EXCLUDED.unit_id,
            title = EXCLUDED.title,
            order_index = EXCLUDED.order_index,
            xp_reward = EXCLUDED.xp_reward
        `,
        [lessonId, unitId, lesson.title, lesson.orderIndex, lesson.xpReward, seedTimestamp],
      );

      for (const activity of lesson.activities) {
        await client.query(
          `
            INSERT INTO path_activities (
              id,
              path_lesson_id,
              activity_type,
              prompt,
              correct_answer,
              options,
              order_index,
              xp_reward
            )
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            ON CONFLICT (id) DO UPDATE
            SET
              path_lesson_id = EXCLUDED.path_lesson_id,
              activity_type = EXCLUDED.activity_type,
              prompt = EXCLUDED.prompt,
              correct_answer = EXCLUDED.correct_answer,
              options = EXCLUDED.options,
              order_index = EXCLUDED.order_index,
              xp_reward = EXCLUDED.xp_reward
          `,
          [
            stableUuid(`path-activity:${activity.key}`),
            lessonId,
            activity.activityType,
            activity.prompt,
            activity.correctAnswer,
            toJson(activity.options ?? null),
            activity.orderIndex,
            activity.xpReward,
          ],
        );
      }
    }
  }
}

async function seedQuizzes(client: Client) {
  for (const quiz of javaQuizSeed) {
    const unitId = stableUuid(`path-unit:${quiz.pathUnitKey}`);
    const quizId = stableUuid(`quiz:${quiz.key}`);

    await client.query(
      `
        INSERT INTO quizzes (
          id,
          chapter_id,
          path_unit_id,
          title,
          pass_score,
          time_limit_seconds,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE
        SET
          chapter_id = EXCLUDED.chapter_id,
          path_unit_id = EXCLUDED.path_unit_id,
          title = EXCLUDED.title,
          pass_score = EXCLUDED.pass_score,
          time_limit_seconds = EXCLUDED.time_limit_seconds
      `,
      [quizId, null, unitId, quiz.title, quiz.passScore, quiz.timeLimitSeconds, seedTimestamp],
    );

    for (const question of quiz.questions) {
      const questionId = stableUuid(`question:${question.key}`);

      await client.query(
        `
          INSERT INTO questions (id, quiz_id, body, question_type, order_index, points)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE
          SET
            quiz_id = EXCLUDED.quiz_id,
            body = EXCLUDED.body,
            question_type = EXCLUDED.question_type,
            order_index = EXCLUDED.order_index,
            points = EXCLUDED.points
        `,
        [
          questionId,
          quizId,
          question.body,
          question.questionType,
          question.orderIndex,
          question.points,
        ],
      );

      for (const option of question.options) {
        await client.query(
          `
            INSERT INTO answer_options (id, question_id, body, is_correct, order_index)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE
            SET
              question_id = EXCLUDED.question_id,
              body = EXCLUDED.body,
              is_correct = EXCLUDED.is_correct,
              order_index = EXCLUDED.order_index
          `,
          [
            stableUuid(`answer-option:${option.key}`),
            questionId,
            option.body,
            option.isCorrect,
            option.orderIndex,
          ],
        );
      }
    }
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. This project injects it through prisma.config.ts and .env.",
    );
  }

  const client = new Client({ connectionString: databaseUrl });

  await client.connect();

  try {
    await client.query("BEGIN");

    await upsertDevStudent(client);
    await clearJavaPathData(client);
    await clearJavaCourseData(client);

    const authorId = await upsertAuthor(client);
    const courseId = await upsertCourse(client, authorId);
    await seedCourseContent(client, courseId);

    const pathId = await upsertLearningPath(client);
    await seedPathContent(client, pathId);
    await seedQuizzes(client);

    await client.query("COMMIT");

    const lessonCount = javaCourseSeed.chapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0,
    );
    const contentCount = javaCourseSeed.chapters.reduce(
      (total, chapter) =>
        total +
        chapter.lessons.reduce(
          (chapterTotal, lesson) => chapterTotal + lesson.contents.length,
          0,
        ),
      0,
    );
    const pathLessonCount = javaPathSeed.units.reduce(
      (total, unit) => total + unit.lessons.length,
      0,
    );
    const activityCount = javaPathSeed.units.reduce(
      (total, unit) =>
        total +
        unit.lessons.reduce(
          (lessonTotal, lesson) => lessonTotal + lesson.activities.length,
          0,
        ),
      0,
    );
    const questionCount = javaQuizSeed.reduce(
      (total, quiz) => total + quiz.questions.length,
      0,
    );

    console.log("Java Foundations seed complete.");
    console.log(
      `Course chapters: ${javaCourseSeed.chapters.length}, lessons: ${lessonCount}, content blocks: ${contentCount}`,
    );
    console.log(
      `Path units: ${javaPathSeed.units.length}, path lessons: ${pathLessonCount}, activities: ${activityCount}`,
    );
    console.log(`Quizzes: ${javaQuizSeed.length}, questions: ${questionCount}`);
    console.log(
      `Dev academy student: ${academyDevStudent.email} (${academyDevStudent.id})`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Java seed failed:", error);
  process.exit(1);
});
