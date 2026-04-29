export const activityTypes = [
  "multiple_choice",
  "true_false",
  "fill_blank",
  "predict_output",
] as const;

export type ActivityType = (typeof activityTypes)[number];

export type LearnerLevel = "beginner" | "intermediate" | "advanced";

export type LessonContext = {
  language: string;
  unitTitle: string;
  lessonTitle: string;
  learnerLevel: LearnerLevel;
  goals: string[];
  allowedConcepts: string[];
  forbiddenConcepts: string[];
  preferredTypes: ActivityType[];
  count?: number;
};

function formatList(items: string[]) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

export function buildActivityPrompt(ctx: LessonContext): string {
  const count = ctx.count ?? 4;
  const preferredTypes = ctx.preferredTypes.length > 0 ? ctx.preferredTypes : [...activityTypes];
  const quotedTypes = preferredTypes.map((type) => `"${type}"`).join(", ");

  return `
You are a programming tutor generating exercises for a structured lesson.

LESSON CONTEXT
Language: ${ctx.language}
Unit: ${ctx.unitTitle}
Lesson: ${ctx.lessonTitle}
Learner level: ${ctx.learnerLevel}

LESSON GOALS
${formatList(ctx.goals)}

ALLOWED CONCEPTS (use only these)
${formatList(ctx.allowedConcepts)}

FORBIDDEN CONCEPTS (never use these)
${formatList(ctx.forbiddenConcepts)}

INSTRUCTIONS
- Generate exactly ${count} exercises.
- Use only these exercise types: ${preferredTypes.join(", ")}.
- All exercises must be ${ctx.learnerLevel} level.
- Every exercise must relate directly to the lesson goals above.
- Do not introduce any concept not listed in ALLOWED CONCEPTS.
- Never use any concept listed in FORBIDDEN CONCEPTS.
- Code snippets must be short, max 5 lines.
- For predict_output, show a short code snippet and ask what it prints.
- For fill_blank, use one clear blank marker like _____.
- For true_false, set options to ["true", "false"] and correctAnswer to "true" or "false".
- For multiple_choice, provide 3 or 4 options and make correctAnswer exactly match one option.

OUTPUT FORMAT
Return ONLY a valid JSON array. No markdown, no explanation, no extra text.
Each item must have exactly these fields:
- "type": one of [${quotedTypes}]
- "question": string
- "options": string[] for multiple_choice and true_false, null for all others
- "correctAnswer": string
- "explanation": string, one sentence explaining why the answer is correct
`.trim();
}
