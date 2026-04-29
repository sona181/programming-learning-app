import "server-only";

import { APIError } from "openai";

import { openai } from "@/lib/ai/openai";
import {
  buildFeedbackPrompt,
  type FeedbackContext,
} from "@/lib/gemini/prompts/feedback";

export type ActivityFeedbackResult = {
  message: string;
  result: "correct" | "hint" | "incorrect";
};

function isFeedbackResult(value: unknown): value is ActivityFeedbackResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    (record.result === "correct" ||
      record.result === "hint" ||
      record.result === "incorrect") &&
    typeof record.message === "string" &&
    record.message.trim().length > 0
  );
}

function parseFeedbackJson(raw: string): ActivityFeedbackResult {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as unknown;

  if (!isFeedbackResult(parsed)) {
    throw new Error("Bad AI feedback response shape.");
  }

  return {
    message: parsed.message.trim(),
    result: parsed.result,
  };
}

export async function getAiActivityFeedback(
  context: FeedbackContext,
): Promise<ActivityFeedbackResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  try {
    const response = await openai.responses.create({
      input: buildFeedbackPrompt(context),
      model: process.env.OPENAI_FEEDBACK_MODEL ?? process.env.OPENAI_ACTIVITY_MODEL ?? "gpt-5.4-mini",
      temperature: 0.15,
    });

    return parseFeedbackJson(response.output_text);
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message);
    }

    throw error;
  }
}
