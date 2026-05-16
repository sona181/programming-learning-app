import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string; chapterId: string; lessonId: string }> };

async function ownerCheck(request: Request, courseId: string) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") return null;
  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  return course ? session : null;
}

// PATCH — update lesson (title, type, content blocks, exercises)
export async function PATCH(request: Request, { params }: Params) {
  const { courseId, lessonId } = await params;
  if (!await ownerCheck(request, courseId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    lessonType?: string;
    isFreePreview?: boolean;
    orderIndex?: number;
    // Replace all content blocks
    contents?: Array<{ contentType: string; body?: string; mediaUrl?: string; orderIndex: number }>;
    // Replace all exercises
    exercises?: Array<{
      title: string;
      instructions?: string;
      language: string;
      starterCode?: string;
      solutionCode?: string;
      expectedOutput?: string;
      orderIndex: number;
    }>;
  };
  try { body = await request.json(); } catch { body = {}; }

  await prisma.$transaction(async (tx) => {
    const lessonData: Record<string, unknown> = {};
    if (body.title !== undefined) lessonData.title = body.title;
    if (body.lessonType !== undefined) lessonData.lessonType = body.lessonType;
    if (body.isFreePreview !== undefined) lessonData.isFreePreview = body.isFreePreview;
    if (body.orderIndex !== undefined) lessonData.orderIndex = body.orderIndex;
    if (Object.keys(lessonData).length) {
      await tx.lesson.update({ where: { id: lessonId }, data: lessonData });
    }

    if (body.contents) {
      await tx.lessonContent.deleteMany({ where: { lessonId } });
      if (body.contents.length) {
        await tx.lessonContent.createMany({
          data: body.contents.map((c) => ({
            lessonId,
            contentType: c.contentType,
            body: c.body ?? null,
            mediaUrl: c.mediaUrl ?? null,
            orderIndex: c.orderIndex,
            createdAt: new Date(),
          })),
        });
      }
    }

    if (body.exercises) {
      await tx.courseExercise.deleteMany({ where: { lessonId } });
      if (body.exercises.length) {
        await tx.courseExercise.createMany({
          data: body.exercises.map((e) => ({
            lessonId,
            title: e.title,
            instructions: e.instructions ?? null,
            language: e.language,
            starterCode: e.starterCode ?? null,
            solutionCode: e.solutionCode ?? null,
            expectedOutput: e.expectedOutput ?? null,
            orderIndex: e.orderIndex,
            createdAt: new Date(),
          })),
        });
      }
    }
  });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      lessonContents: { orderBy: { orderIndex: "asc" } },
      exercises: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(lesson);
}

// DELETE — remove lesson
export async function DELETE(request: Request, { params }: Params) {
  const { courseId, lessonId } = await params;
  if (!await ownerCheck(request, courseId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.lesson.delete({ where: { id: lessonId } });
  return NextResponse.json({ success: true });
}
