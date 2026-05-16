import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string }> };

// GET — return landing page with `description` key (maps from DB `marketingDesc`)
export async function GET(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const landing = await prisma.courseLandingPage.findUnique({ where: { courseId } });
  if (!landing) return NextResponse.json(null);

  const { marketingDesc, ...rest } = landing;
  return NextResponse.json({ ...rest, description: marketingDesc ?? "" });
}

// PATCH — accept `description` from frontend, persist as `marketingDesc` in DB
export async function PATCH(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { body = {}; }

  // Map `description` → `marketingDesc` for DB; remove the `description` key
  const { description, ...rest } = body as { description?: string } & Record<string, unknown>;
  const dbPayload: Record<string, unknown> = { ...rest };
  if (description === undefined) {
    // no marketingDesc override — keep whatever is already in rest
  } else {
    dbPayload.marketingDesc = description;
  }

  const now = new Date();
  const landing = await prisma.courseLandingPage.upsert({
    where: { courseId },
    create: { courseId, ...dbPayload, createdAt: now, updatedAt: now },
    update: { ...dbPayload, updatedAt: now },
  });

  const { marketingDesc, ...returnRest } = landing;
  return NextResponse.json({ ...returnRest, description: marketingDesc ?? "" });
}
