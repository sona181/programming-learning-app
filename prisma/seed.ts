import "dotenv/config";

import { createHash } from "node:crypto";
import { Client } from "pg";

const seedTimestamp = new Date("2026-04-14T09:00:00.000Z");
const retiredCourseSlugs = ["java-foundations"] as const;
const retiredPathSlugs = ["java-beginner-path", "java-beginner", "c-beginner"] as const;

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
  return JSON.stringify(value);
}

async function clearPathData(client: Client, pathSlug: string) {
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
    [pathSlug],
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
    [pathSlug],
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
    [pathSlug],
  );

  await client.query(
    `
      DELETE FROM xp_logs
      WHERE source_id IN (
        SELECT pa.id
        FROM path_activities pa
        JOIN path_lessons pl ON pl.id = pa.path_lesson_id
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
      OR source_id IN (
        SELECT pl.id
        FROM path_lessons pl
        JOIN path_units pu ON pu.id = pl.unit_id
        JOIN learning_paths lp ON lp.id = pu.path_id
        WHERE lp.slug = $1
      )
    `,
    [pathSlug],
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
    [pathSlug],
  );

  await client.query(
    `
      DELETE FROM user_path_enrollments
      WHERE path_id IN (SELECT id FROM learning_paths WHERE slug = $1)
    `,
    [pathSlug],
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
    [pathSlug],
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
    [pathSlug],
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
    [pathSlug],
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
    [pathSlug],
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
    [pathSlug],
  );

  await client.query(
    `
      DELETE FROM certificates
      WHERE path_id IN (SELECT id FROM learning_paths WHERE slug = $1)
    `,
    [pathSlug],
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
    [pathSlug],
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
    [pathSlug],
  );

  await client.query(
    `
      DELETE FROM path_units
      WHERE path_id IN (SELECT id FROM learning_paths WHERE slug = $1)
    `,
    [pathSlug],
  );

  await client.query("DELETE FROM learning_paths WHERE slug = $1", [pathSlug]);
}

async function clearCourseData(client: Client, courseSlug: string) {
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
    [courseSlug],
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
    [courseSlug],
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
    [courseSlug],
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
    [courseSlug],
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
    [courseSlug],
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
    [courseSlug],
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
    [courseSlug],
  );

  await client.query(
    `
      DELETE FROM certificates
      WHERE course_id IN (SELECT id FROM courses WHERE slug = $1)
    `,
    [courseSlug],
  );

  await client.query(
    `
      DELETE FROM enrollments
      WHERE course_id IN (SELECT id FROM courses WHERE slug = $1)
    `,
    [courseSlug],
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
    [courseSlug],
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
    [courseSlug],
  );

  await client.query(
    `
      DELETE FROM chapters
      WHERE course_id IN (SELECT id FROM courses WHERE slug = $1)
    `,
    [courseSlug],
  );

  await client.query(
    `
      DELETE FROM course_authors
      WHERE course_id IN (SELECT id FROM courses WHERE slug = $1)
    `,
    [courseSlug],
  );

  await client.query("DELETE FROM courses WHERE slug = $1", [courseSlug]);
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

    for (const pathSlug of retiredPathSlugs) {
      await clearPathData(client, pathSlug);
    }

    for (const courseSlug of retiredCourseSlugs) {
      await clearCourseData(client, courseSlug);
    }

    await client.query("DELETE FROM source_cards WHERE track = 'java'");

    await client.query("COMMIT");

    console.log("Seed complete — all Java course data removed.");
    console.log(`Cleared paths: ${retiredPathSlugs.join(", ")}`);
    console.log(`Cleared courses: ${retiredCourseSlugs.join(", ")}`);
    console.log("Cleared source cards: track = java");
    console.log(`Dev student: ${academyDevStudent.email} (${academyDevStudent.id})`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
