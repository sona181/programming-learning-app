import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string; chapterId: string }> };

async function ownerCheck(request: Request, courseId: string) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") return null;
  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  return course ? session : null;
}

// PATCH — rename chapter or reorder
export async function PATCH(request: Request, { params }: Params) {
  const { courseId, chapterId } = await params;
  if (!await ownerCheck(request, courseId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; orderIndex?: number };
  try { body = await request.json(); } catch { body = {}; }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.orderIndex !== undefined) data.orderIndex = body.orderIndex;

  const chapter = await prisma.chapter.update({ where: { id: chapterId }, data });
  return NextResponse.json(chapter);
}

// DELETE — remove chapter and all its lessons
export async function DELETE(request: Request, { params }: Params) {
  const { courseId, chapterId } = await params;
  if (!await ownerCheck(request, courseId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.chapter.delete({ where: { id: chapterId } });
  return NextResponse.json({ success: true });
}
