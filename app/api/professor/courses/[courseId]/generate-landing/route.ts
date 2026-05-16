import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

type Params = { params: Promise<{ courseId: string }> };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Zod schema — keys match exactly what the AI prompt requests.
// All fields are optional-with-default so a partial AI response still succeeds.
const LandingSchema = z.object({
  heroTitle: z.string().default(""),
  heroSubtitle: z.string().default(""),
  description: z.string().default(""),        // stored as marketingDesc in DB
  whatYouWillLearn: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  curriculumSummary: z.array(z.string()).default([]),
  faq: z.array(z.object({
    question: z.string().default(""),
    answer: z.string().default(""),
  })).default([]),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
  ctaText: z.string().default(""),
});

export type LandingAIOutput = z.infer<typeof LandingSchema>;

const SYSTEM_PROMPT =
  "You are a course marketing copywriter. You MUST respond with valid JSON only. " +
  "Do NOT include markdown fences, code blocks, or any text outside the JSON object. " +
  "Return exactly the keys specified in the user message — no extra keys, no renamed keys.";

function buildPrompt(data: {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level: string;
  language: string;
  targetAudienceInput?: string;
  prerequisitesInput?: string;
  learnInput?: string;
  estimatedDuration?: string;
  professorName?: string;
  professorBio?: string;
  professorCredentials?: string;
  isPremium: boolean;
  price?: number | null;
  chapterTitles: string[];
  lessonCount: number;
}) {
  const lang = data.language === "sq" ? "Albanian (Shqip)" : data.language === "it" ? "Italian" : "English";
  return `Generate a professional course landing page in ${lang} for the following course.

COURSE DETAILS:
- Title: ${data.title}
- Subtitle hint: ${data.subtitle || "(none — create a compelling one)"}
- Description: ${data.description || "(none provided)"}
- Category: ${data.category || "General"}
- Level: ${data.level}
- Chapters: ${data.chapterTitles.join(", ") || "(not yet defined)"}
- Total lessons: ${data.lessonCount}
- Estimated duration: ${data.estimatedDuration || "not specified"}
- Pricing: ${data.isPremium ? `Premium – €${data.price ?? "?"}` : "Free"}

PROFESSOR:
- Name: ${data.professorName || "(unknown)"}
- Bio: ${data.professorBio || "(none)"}
- Credentials: ${data.professorCredentials || "(none)"}

PROFESSOR CONTEXT:
- Target audience: ${data.targetAudienceInput || "(not specified)"}
- Prerequisites: ${data.prerequisitesInput || "(none)"}
- What students will learn: ${data.learnInput || "(not specified)"}

RULES:
1. Write in ${lang}. Values may be in Albanian/English/Italian — always match the course language.
2. Keep JSON keys in English exactly as shown below.
3. Keep bullet-point strings short (max 12 words).
4. heroTitle must be a compelling hook, distinct from the plain course title.
5. FAQ: include 4–6 questions relevant to this specific course.
6. seoTitle: under 60 characters. seoDescription: under 160 characters.
7. ctaText: 2–5 word action phrase.
8. Do NOT invent professor credentials not mentioned above.

Return ONLY the following JSON object (no markdown, no extra text):
{
  "heroTitle": "string",
  "heroSubtitle": "string — one sentence value proposition",
  "description": "string — 2–3 sentence marketing description",
  "whatYouWillLearn": ["string", "..."],
  "benefits": ["string", "..."],
  "targetAudience": ["string", "..."],
  "prerequisites": ["string", "..."],
  "curriculumSummary": ["string", "..."],
  "faq": [{ "question": "string", "answer": "string" }],
  "seoTitle": "string",
  "seoDescription": "string",
  "ctaText": "string"
}`;
}

export async function POST(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, authorId: session.id },
    include: {
      category: { select: { name: true } },
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { select: { id: true } } },
      },
      landingPage: true,
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Partial<{
    subtitle: string; targetAudienceInput: string; prerequisitesInput: string;
    learnInput: string; estimatedDuration: string;
    professorBio: string; professorCredentials: string;
  }> = {};
  try { body = await request.json(); } catch { /* use DB values */ }

  const lp = course.landingPage;
  const ctx = {
    subtitle: body.subtitle ?? lp?.subtitle ?? "",
    targetAudienceInput: body.targetAudienceInput ?? lp?.targetAudienceInput ?? "",
    prerequisitesInput: body.prerequisitesInput ?? lp?.prerequisitesInput ?? "",
    learnInput: body.learnInput ?? lp?.learnInput ?? "",
    estimatedDuration: body.estimatedDuration ?? lp?.estimatedDuration ?? "",
    professorBio: body.professorBio ?? lp?.professorBio ?? "",
    professorCredentials: body.professorCredentials ?? lp?.professorCredentials ?? "",
  };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { profile: true },
  });
  const professorName = user?.profile?.displayName ?? user?.email;

  const lessonCount = course.chapters.reduce((s, c) => s + c.lessons.length, 0);
  const prompt = buildPrompt({
    title: course.title,
    description: course.description ?? "",
    category: course.category?.name,
    level: course.level,
    language: course.language,
    isPremium: course.isPremium,
    price: course.price ? Number(course.price) : null,
    chapterTitles: course.chapters.map((c) => c.title),
    lessonCount,
    professorName,
    ...ctx,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[generate-landing] AI returned non-JSON:", raw);
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
  }

  const result = LandingSchema.safeParse(parsed);
  if (!result.success) {
    console.error("[generate-landing] Schema validation failed. Raw AI output:", raw);
    console.error("[generate-landing] Zod errors:", JSON.stringify(result.error.issues));
    return NextResponse.json(
      { error: "AI output did not match expected schema", details: result.error.issues },
      { status: 500 },
    );
  }

  const now = new Date();
  // description maps to marketingDesc in the DB
  const { description, ...rest } = result.data;
  await prisma.courseLandingPage.upsert({
    where: { courseId },
    create: {
      courseId, ...ctx,
      marketingDesc: description,
      ...rest,
      isAiGenerated: true,
      lastGeneratedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      ...ctx,
      marketingDesc: description,
      ...rest,
      isAiGenerated: true,
      lastGeneratedAt: now,
      updatedAt: now,
    },
  });

  // Return the validated AI output (uses `description`, not `marketingDesc`)
  return NextResponse.json(result.data);
}
