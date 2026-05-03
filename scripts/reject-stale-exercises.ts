/**
 * Rejects code_exercise activities that have a for/while loop in codeTemplate
 * but use a validationKind that cannot verify loop output (code_shape, null, or
 * code_completion). These need to be regenerated with compile_and_run + testCases.
 *
 * Run: npx tsx --env-file=.env scripts/reject-stale-exercises.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const str = (v: unknown, fallback: string) =>
  typeof v === "string" ? v : fallback;

function needsRejection(opts: Record<string, unknown> | null): {
  reason: string;
  reject: boolean;
} {
  const vk = str(opts?.validationKind, "");
  const template = str(opts?.codeTemplate ?? opts?.starterCode, "");
  const hasLoop = /\b(for|while)\b/.test(template);
  const badVk = vk === "" || vk === "code_shape" || vk === "code_completion";

  if (hasLoop && badVk) {
    return {
      reason: `loop in codeTemplate with validationKind="${vk || "null"}" — needs compile_and_run + testCases`,
      reject: true,
    };
  }

  return { reason: "", reject: false };
}

async function main() {
  const activities = await prisma.pathActivity.findMany({
    where: {
      activityType: "code_exercise",
      reviewStatus: { in: ["approved", "pending_review"] },
    },
    select: {
      id: true,
      options: true,
      pathLessonId: true,
      prompt: true,
      reviewStatus: true,
    },
  });

  const toReject = activities
    .map((r) => ({
      ...r,
      ...needsRejection(r.options as Record<string, unknown> | null),
    }))
    .filter((r) => r.reject);

  if (toReject.length === 0) {
    console.log("Nothing to reject — all loop exercises already have correct validation.");
    return;
  }

  const lessonIds = [...new Set(toReject.map((r) => r.pathLessonId))];

  console.log(`\nWill reject ${toReject.length} exercise(s):\n`);
  for (const r of toReject) {
    console.log(`  ${r.id.slice(0, 8)}  ${r.reason}`);
    console.log(`           "${r.prompt.slice(0, 70)}"`);
  }

  console.log(`\nAffected lesson IDs (${lessonIds.length}):`);
  for (const id of lessonIds) console.log(`  ${id}`);

  await prisma.pathActivity.updateMany({
    where: { id: { in: toReject.map((r) => r.id) } },
    data: { reviewStatus: "rejected" },
  });

  console.log(
    `\nRejected ${toReject.length} activit${toReject.length === 1 ? "y" : "ies"}.`,
  );
  console.log("Visit each affected lesson to trigger regeneration with compile_and_run.");
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());
