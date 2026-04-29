import { NextResponse } from "next/server";

import { openai } from "@/lib/ai/openai";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        message: "AI test route is disabled in production.",
        success: false,
      },
      { status: 404 },
    );
  }

  try {
    const response = await openai.responses.create({
      input: "Generate one beginner Python multiple choice question about variables.",
      model: process.env.OPENAI_ACTIVITY_MODEL ?? "gpt-5.4-mini",
    });

    return NextResponse.json({
      success: true,
      text: response.output_text,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OpenAI test request failed.";

    return NextResponse.json(
      {
        message,
        success: false,
      },
      { status: 500 },
    );
  }
}
