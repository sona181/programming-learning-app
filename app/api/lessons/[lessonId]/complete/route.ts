import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await getCurrentSessionUser();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { chapter: { select: { courseId: true } } },
  });
  if (!lesson) return NextResponse.json({ success: false }, { status: 404 });

  const courseId = lesson.chapter.courseId;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.id, courseId } },
  });
  if (!enrollment) return NextResponse.json({ success: false }, { status: 403 });

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    create: { enrollmentId: enrollment.id, lessonId, isCompleted: true, completedAt: new Date() },
    update: { isCompleted: true, completedAt: new Date() },
  });

  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { chapter: { courseId } } }),
    prisma.lessonProgress.count({ where: { enrollmentId: enrollment.id, isCompleted: true } }),
  ]);

  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  await prisma.courseProgress.upsert({
    where: { enrollmentId: enrollment.id },
    create: { enrollmentId: enrollment.id, totalLessons, completedLessons, progressPercent, lastAccessedAt: new Date(), updatedAt: new Date() },
    update: { completedLessons, progressPercent, lastAccessedAt: new Date(), updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, progressPercent });
}
