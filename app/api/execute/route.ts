import { NextRequest, NextResponse } from "next/server";

const JUDGE0_URL = process.env.JUDGE0_API_URL ?? "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY ?? "";

interface SubmitBody {
  code: string;
  languageId: number;
}

async function submitCode(code: string, languageId: number): Promise<string> {
  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin: "",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 submit failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.token as string;
}

async function pollResult(token: string): Promise<unknown> {
  const maxAttempts = 10;
  const delayMs = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, delayMs));

    const res = await fetch(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) throw new Error(`Judge0 poll failed: ${res.status}`);

    const data = await res.json();
    // status id 1 = In Queue, 2 = Processing
    if (data.status?.id > 2) return data;
  }

  throw new Error("Code execution timed out");
}

export async function POST(req: NextRequest) {
  try {
    const { code, languageId }: SubmitBody = await req.json();

    if (!code || !languageId) {
      return NextResponse.json({ error: "Missing code or languageId" }, { status: 400 });
    }

    if (!JUDGE0_KEY) {
      return NextResponse.json({ error: "Judge0 API key not configured" }, { status: 500 });
    }

    const token = await submitCode(code, languageId);
    const result = await pollResult(token) as Record<string, unknown>;

    return NextResponse.json({
      status: (result.status as { description: string })?.description ?? "Unknown",
      statusId: (result.status as { id: number })?.id ?? 0,
      stdout: (result.stdout as string | null) ?? null,
      stderr: (result.stderr as string | null) ?? null,
      compileOutput: (result.compile_output as string | null) ?? null,
      time: (result.time as string | null) ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
