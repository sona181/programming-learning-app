import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getCurrentSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Duhet të jeni të identifikuar." },
      { status: 401 },
    );
  }

  let courseId: string;
  try {
    const body = (await req.json()) as { courseId?: string };
    courseId = body.courseId?.trim() ?? "";
  } catch {
    return NextResponse.json(
      { success: false, message: "Kërkesë e pavlefshme." },
      { status: 400 },
    );
  }

  if (!courseId) {
    return NextResponse.json(
      { success: false, message: "courseId mungon." },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true, slug: true, status: true, isPremium: true,
      chapters: {
        orderBy: { orderIndex: "asc" },
        take: 1,
        select: { lessons: { orderBy: { orderIndex: "asc" }, take: 1, select: { id: true } } },
      },
    },
  });

  if (!course || course.status !== "published") {
    return NextResponse.json(
      { success: false, message: "Kursi nuk u gjet." },
      { status: 404 },
    );
  }

  if (course.isPremium) {
    return NextResponse.json(
      { success: false, message: "Ky kurs kërkon pagesë." },
      { status: 400 },
    );
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.id, courseId } },
  });

  if (!existing) {
    const totalLessons = await prisma.lesson.count({
      where: { chapter: { courseId } },
    });

    await prisma.enrollment.create({
      data: {
        userId: session.id,
        courseId,
        status: "active",
        enrolledAt: new Date(),
        courseProgress: {
          create: {
            totalLessons,
            completedLessons: 0,
            progressPercent: 0,
            updatedAt: new Date(),
          },
        },
      },
    });
  }

  const firstLessonId = course.chapters[0]?.lessons[0]?.id;
  const firstLessonUrl = firstLessonId
    ? `/course/${course.slug}/learn/${firstLessonId}`
    : `/course/${course.slug}/0/0/0`;

  return NextResponse.json({ success: true, firstLessonUrl });
}
