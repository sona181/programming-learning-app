import "server-only";

import { APIError } from "openai";

import { openai } from "@/lib/ai/openai";
import { prisma } from "@/lib/prisma";
import { buildActivityPrompt, type ActivityType } from "@/lib/gemini/prompts/activities";
import { getLessonMeta } from "@/lib/path-lesson-meta";

type GeneratedActivity = {
  correctAnswer: string;
  explanation: string;
  options: string[] | null;
  question: string;
  type: ActivityType;
};

type PathActivityResult = {
  activityType: string;
  correctAnswer: string | null;
  id: string;
  options: unknown;
  orderIndex: number;
  prompt: string;
  xpReward: number;
};

const supportedTypes = new Set<ActivityType>([
  "multiple_choice",
  "true_false",
  "fill_blank",
  "predict_output",
]);

export class ActivityGenerationError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ActivityGenerationError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractJsonArray(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error("AI response did not contain a JSON array.");
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return items.length > 0 ? items : null;
}

function normalizeCorrectAnswer(type: ActivityType, value: unknown) {
  if (type === "true_false") {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim().toLowerCase();

    return normalized === "true" || normalized === "false" ? normalized : null;
  }

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseGeneratedActivities(rawText: string, allowedTypes: ActivityType[]) {
  const parsed = JSON.parse(extractJsonArray(rawText)) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("AI response JSON was not an array.");
  }

  const allowedTypeSet = new Set(allowedTypes);
  const activities: GeneratedActivity[] = [];

  for (const item of parsed) {
    if (!isRecord(item)) {
      continue;
    }

    const type = item.type;
    const question = item.question;
    const explanation = item.explanation;

    if (
      typeof type !== "string" ||
      !supportedTypes.has(type as ActivityType) ||
      !allowedTypeSet.has(type as ActivityType) ||
      typeof question !== "string" ||
      typeof explanation !== "string"
    ) {
      continue;
    }

    const activityType = type as ActivityType;
    const correctAnswer = normalizeCorrectAnswer(activityType, item.correctAnswer);

    if (!correctAnswer) {
      continue;
    }

    const options = asStringArray(item.options);

    if (activityType === "multiple_choice" && (!options || !options.includes(correctAnswer))) {
      continue;
    }

    activities.push({
      correctAnswer,
      explanation,
      options: activityType === "multiple_choice" ? options : null,
      question,
      type: activityType,
    });
  }

  return activities;
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite-preview-06-17";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.25,
        },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new ActivityGenerationError(
      `Gemini activity generation failed with status ${response.status}.`,
      502,
    );
  }

  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return body.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

async function callOpenAi(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const model = process.env.OPENAI_ACTIVITY_MODEL ?? "gpt-5.4-mini";
  try {
    const response = await openai.responses.create({
      input: [
        {
          content: "Return only valid JSON. Do not include markdown.",
          role: "system",
        },
        {
          content: prompt,
          role: "user",
        },
      ],
      model,
      temperature: 0.25,
    });

    const content = response.output_text || null;

    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content) as unknown;

    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed);
    }

    if (isRecord(parsed) && Array.isArray(parsed.activities)) {
      return JSON.stringify(parsed.activities);
    }

    return content;
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 429 && error.code === "insufficient_quota") {
        throw new ActivityGenerationError(
          "OpenAI could not generate activities because this API project has no available quota. Check billing or use a different key.",
          402,
        );
      }

      throw new ActivityGenerationError(
        error.message ??
          `OpenAI activity generation failed with status ${error.status}.`,
        502,
      );
    }

    throw error;
  }
}

async function generateWithAi(prompt: string) {
  const geminiResult = await callGemini(prompt);

  if (geminiResult) {
    return geminiResult;
  }

  const openAiResult = await callOpenAi(prompt);

  if (openAiResult) {
    return openAiResult;
  }

  throw new ActivityGenerationError(
    "Set GEMINI_API_KEY or OPENAI_API_KEY to generate lesson activities.",
    500,
  );
}

function toActivityOptions(activity: GeneratedActivity) {
  return {
    ...(activity.type === "true_false"
      ? { choices: ["true", "false"] }
      : activity.options
        ? { choices: activity.options }
        : {}),
    explanation: activity.explanation,
  };
}

async function findActivities(pathLessonId: string): Promise<PathActivityResult[]> {
  return prisma.pathActivity.findMany({
    orderBy: { orderIndex: "asc" },
    where: { pathLessonId },
    select: {
      activityType: true,
      correctAnswer: true,
      id: true,
      options: true,
      orderIndex: true,
      prompt: true,
      xpReward: true,
    },
  });
}

export async function getOrGeneratePathLessonActivities(pathLessonId: string) {
  const existingActivities = await findActivities(pathLessonId);

  if (existingActivities.length > 0) {
    return existingActivities;
  }

  const lesson = await prisma.pathLesson.findUnique({
    where: { id: pathLessonId },
    select: {
      id: true,
      title: true,
      xpReward: true,
      pathUnit: {
        select: {
          title: true,
          learningPath: {
            select: {
              language: true,
              level: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return [];
  }

  const meta = getLessonMeta({
    language: lesson.pathUnit.learningPath.language,
    lessonTitle: lesson.title,
    pathTitle: lesson.pathUnit.learningPath.title,
    unitTitle: lesson.pathUnit.title,
  });
  const prompt = buildActivityPrompt({
    ...meta,
    learnerLevel: meta.learnerLevel ?? lesson.pathUnit.learningPath.level,
    lessonTitle: lesson.title,
    unitTitle: lesson.pathUnit.title,
  });
  const generatedText = await generateWithAi(prompt);
  const generatedActivities = parseGeneratedActivities(
    generatedText,
    meta.preferredTypes,
  ).slice(0, meta.count ?? 4);

  if (generatedActivities.length === 0) {
    throw new Error("AI did not return any usable activities.");
  }

  const currentActivityCount = await prisma.pathActivity.count({
    where: { pathLessonId },
  });

  if (currentActivityCount > 0) {
    return findActivities(pathLessonId);
  }

  await prisma.pathActivity.createMany({
    data: generatedActivities.map((activity, index) => ({
      activityType: activity.type,
      correctAnswer: activity.correctAnswer,
      options: toActivityOptions(activity),
      orderIndex: index + 1,
      pathLessonId: lesson.id,
      prompt: activity.question,
      xpReward: Math.max(5, Math.round(lesson.xpReward / generatedActivities.length)),
    })),
    skipDuplicates: true,
  });

  return findActivities(pathLessonId);
}
