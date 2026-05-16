import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string; chapterId: string }> };

// POST — add lesson to chapter
export async function POST(request: Request, { params }: Params) {
  const { courseId, chapterId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { title?: string; lessonType?: string; isFreePreview?: boolean };
  try { body = await request.json(); } catch { body = {}; }
  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const last = await prisma.lesson.findFirst({
    where: { chapterId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const lesson = await prisma.lesson.create({
    data: {
      chapterId,
      title: body.title.trim(),
      lessonType: body.lessonType ?? "text",
      orderIndex: (last?.orderIndex ?? -1) + 1,
      isFreePreview: body.isFreePreview ?? false,
      createdAt: new Date(),
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
