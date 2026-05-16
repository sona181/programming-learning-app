import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import AdmZip from "adm-zip";

type Params = { params: Promise<{ courseId: string }> };

type ParsedExercise = {
  title: string;
  language: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
};

const CODE_EXTS: Record<string, string> = {
  js: "javascript", ts: "typescript", py: "python",
  java: "java", cpp: "cpp", c: "c", cs: "csharp",
  go: "go", rb: "ruby", php: "php", rs: "rust",
};

// Expected ZIP structure (flexible):
//   exercise-name/
//     starter.{ext}       ← starter code
//     solution.{ext}      ← solution code
//     expected_output.txt ← expected output
//     instructions.md     ← instructions (optional)
//   OR flat files named:
//     starter.js, solution.js, expected_output.txt
function parseZip(buffer: Buffer): ParsedExercise[] {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const exercises: ParsedExercise[] = [];

  // Group entries by top-level folder
  const folders = new Map<string, Map<string, string>>();

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const parts = entry.entryName.replace(/\\/g, "/").split("/");
    const folder = parts.length > 1 ? parts[0] : "__root__";
    const filename = parts[parts.length - 1].toLowerCase();
    if (!folders.has(folder)) folders.set(folder, new Map());
    try {
      folders.get(folder)!.set(filename, entry.getData().toString("utf-8"));
    } catch {
      // binary file — skip
    }
  }

  for (const [folder, files] of folders) {
    // Detect language from code files
    let language = "javascript";
    let starterCode = "";
    let solutionCode = "";

    for (const [name, content] of files) {
      const ext = name.split(".").pop() ?? "";
      if (name.startsWith("starter.") && CODE_EXTS[ext]) {
        language = CODE_EXTS[ext];
        starterCode = content;
      }
      if (name.startsWith("solution.") && CODE_EXTS[ext]) {
        solutionCode = content;
      }
    }

    if (!starterCode && !solutionCode) continue; // not an exercise folder

    const instructions =
      files.get("instructions.md") ??
      files.get("instructions.txt") ??
      files.get("readme.md") ??
      "";

    const expectedOutput =
      files.get("expected_output.txt") ??
      files.get("output.txt") ??
      "";

    const title =
      folder === "__root__"
        ? "Exercise"
        : folder.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    exercises.push({ title, language, instructions, starterCode, solutionCode, expectedOutput });
  }

  return exercises;
}

// POST — upload a ZIP and return parsed exercises for review
export async function POST(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 }); }

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "ZIP too large (max 100 MB)" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const exercises = parseZip(Buffer.from(bytes));

  if (exercises.length === 0) {
    return NextResponse.json({
      error: "No exercises found. ZIP should contain folders with starter.{ext} and solution.{ext} files.",
    }, { status: 400 });
  }

  return NextResponse.json({ exercises });
}
