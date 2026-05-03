/**
 * Shows a breakdown of code_exercise activities by validationKind and mode.
 * Run: npx tsx --env-file=.env scripts/check-activities.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const adapter = new PrismaPg(url);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const rows = await prisma.pathActivity.findMany({
    where: { activityType: "code_exercise" },
    select: { id: true, reviewStatus: true, options: true, prompt: true },
  });

  // Grouped summary matching:
  // SELECT options->>'validationKind', options->>'mode', COUNT(*)
  // FROM path_activities WHERE activity_type = 'code_exercise'
  // GROUP BY 1, 2 ORDER BY 3 DESC
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" ? v : fallback;

  const counts: Record<string, number> = {};
  for (const r of rows) {
    const opts = r.options as Record<string, unknown> | null;
    const vk = str(opts?.validationKind, "null");
    const mode = str(opts?.mode, "null");
    const key = `vk=${vk.padEnd(22)} mode=${mode}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  console.log("\ncode_exercise breakdown (validationKind × mode):\n");
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [key, n] of sorted) {
    console.log(`  ${n.toString().padStart(3)}  ${key}`);
  }

  // Detail rows that would be rejected (loop exercises with bad vk)
  const stale = rows.filter((r) => {
    const opts = r.options as Record<string, unknown> | null;
    const vk = opts?.validationKind as string | undefined;
    const template = str(opts?.codeTemplate ?? opts?.starterCode, "");
    const hasLoop = /\b(for|while)\b/.test(template);
    const badVk = !vk || vk === "code_shape" || vk === "code_completion";
    return hasLoop && badVk;
  });

  console.log(`\nLoop exercises with bad/missing validationKind: ${stale.length}`);
  for (const r of stale) {
    const opts = r.options as Record<string, unknown> | null;
    console.log(
      `  ${r.id.slice(0, 8)}  ${r.reviewStatus.padEnd(15)} vk=${str(opts?.validationKind, "(none)").padEnd(20)} "${r.prompt.slice(0, 60)}"`,
    );
  }

  console.log(`\nTotal code_exercise rows: ${rows.length}`);
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());
