import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string }> };

// POST /api/professor/courses/[courseId]/chapters — add chapter
export async function POST(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { title?: string };
  try { body = await request.json(); } catch { body = {}; }
  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const last = await prisma.chapter.findFirst({
    where: { courseId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const chapter = await prisma.chapter.create({
    data: {
      courseId,
      title: body.title.trim(),
      orderIndex: (last?.orderIndex ?? -1) + 1,
      createdAt: new Date(),
    },
  });

  return NextResponse.json(chapter, { status: 201 });
}
