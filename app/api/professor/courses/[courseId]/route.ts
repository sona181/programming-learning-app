import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string }> };

async function ownerCheck(request: Request, courseId: string) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") return null;
  const course = await prisma.course.findFirst({
    where: { id: courseId, authorId: session.id },
  });
  return course ? session : null;
}

// GET /api/professor/courses/[courseId] — full course with structure
export async function GET(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, authorId: session.id },
    include: {
      category: true,
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            include: {
              lessonContents: { orderBy: { orderIndex: "asc" } },
              exercises: { orderBy: { orderIndex: "asc" } },
              assets: true,
            },
          },
        },
      },
      assets: true,
    },
  });

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}

// PATCH /api/professor/courses/[courseId] — update course info
export async function PATCH(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await ownerCheck(request, courseId);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { body = {}; }

  const allowed = ["title", "description", "categoryId", "level", "language", "isPremium", "price", "thumbnailUrl", "status"];
  const data: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const course = await prisma.course.update({ where: { id: courseId }, data });
  return NextResponse.json({ id: course.id, status: course.status });
}

// DELETE /api/professor/courses/[courseId] — delete draft course
export async function DELETE(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await ownerCheck(request, courseId);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { status: true } });
  if (course?.status === "published") {
    return NextResponse.json({ error: "Cannot delete a published course" }, { status: 400 });
  }

  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ success: true });
}
