import type { ActivityType } from "@/lib/gemini/prompts/activities";

export type FeedbackContext = {
  activityType: ActivityType | "open_ended";
  correctAnswer: string;
  language: string;
  learnerAnswer: string;
  question: string;
};

export function buildFeedbackPrompt(ctx: FeedbackContext): string {
  return `
You are a programming tutor checking a learner's answer.

QUESTION
${ctx.question}

CORRECT ANSWER
${ctx.correctAnswer}

LEARNER ANSWER
${ctx.learnerAnswer}

ACTIVITY TYPE
${ctx.activityType}

LANGUAGE
${ctx.language}

RULES
- For multiple_choice: correct only if learner answer exactly matches correct answer. No partial credit.
- For true_false: correct only if both are "true" or both are "false" (case-insensitive).
- For fill_blank: correct if the answer matches closely enough. Ignore minor spacing and casing differences.
- For predict_output: compare the expected output to the learner output line by line.
  - If it matches exactly: correct.
  - If it is close but has minor differences, mark as "hint" and explain what is slightly wrong.
  - If it is clearly wrong: incorrect.
- For open_ended: never mark as incorrect. Always explain the correct idea briefly.

RESPOND with ONLY a JSON object, no markdown, no explanation outside the object:
{
  "result": "correct" | "hint" | "incorrect",
  "message": string
}

message rules:
- If correct: one short encouraging sentence, max 10 words.
- If hint: one sentence explaining what is slightly off.
- If incorrect: one sentence saying it is incorrect and what the correct answer is.
- Never reveal the full correct answer for a predict_output hint.
- Keep all messages under 20 words.
`.trim();
}
