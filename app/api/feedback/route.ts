import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

interface FeedbackBody {
  code: string;
  errorType: "compile_error" | "wrong_output" | "runtime_error";
  errorDetail: string;
  exerciseDescription: string;
  expectedOutput?: string;
  actualOutput?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FeedbackBody = await req.json();
    const { code, errorType, errorDetail, exerciseDescription, expectedOutput, actualOutput } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    let prompt = "";

    if (errorType === "compile_error") {
      prompt = `A student is learning Java and got a compile error. Explain what went wrong in a friendly, encouraging way (2-3 sentences max). Do NOT give the solution. Help them understand the concept they're missing.

Exercise: ${exerciseDescription}

Their code:
\`\`\`java
${code}
\`\`\`

Compile error:
${errorDetail}`;
    } else if (errorType === "wrong_output") {
      prompt = `A student is learning Java. Their code ran but produced the wrong output. Explain what likely went wrong in a friendly, encouraging way (2-3 sentences max). Do NOT give the solution directly.

Exercise: ${exerciseDescription}

Their code:
\`\`\`java
${code}
\`\`\`

Expected output: ${expectedOutput}
Their output: ${actualOutput}`;
    } else {
      prompt = `A student is learning Java and got a runtime error. Explain what went wrong in a friendly, encouraging way (2-3 sentences max). Do NOT give the solution.

Exercise: ${exerciseDescription}

Their code:
\`\`\`java
${code}
\`\`\`

Error:
${errorDetail}`;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly Java tutor helping beginners learn to code. Keep explanations short (2-3 sentences), positive, and educational. Never give away the full solution. Encourage the student.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const feedback = response.choices[0]?.message?.content ?? "Keep trying — you're on the right track!";
    return NextResponse.json({ feedback });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
