/**
 * One-time cleanup: marks all legacy code_completion mode activities as rejected.
 * The generator will delete them and create fresh fill_blank/predict_output
 * activities the next time each affected lesson is visited.
 *
 * Run with:  npx tsx scripts/cleanup-code-completion.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const allActivities = await prisma.pathActivity.findMany({
    where: {
      reviewStatus: { in: ["approved", "pending_review"] },
    },
    select: { id: true, options: true, pathLessonId: true },
  });

  const legacyIds = allActivities
    .filter((a) => (a.options as Record<string, unknown> | null)?.mode === "code_completion")
    .map((a) => a.id);

  if (legacyIds.length === 0) {
    console.log("No code_completion activities found. Nothing to do.");
    return;
  }

  await prisma.pathActivity.updateMany({
    where: { id: { in: legacyIds } },
    data: { reviewStatus: "rejected" },
  });

  console.log(
    `Marked ${legacyIds.length} code_completion activities as rejected.`,
  );
  console.log(
    "Visit each affected lesson to trigger fresh activity generation.",
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
