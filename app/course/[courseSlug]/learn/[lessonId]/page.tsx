export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import LessonSidebar from "./_components/LessonSidebar";
import LessonContent from "./_components/LessonContent";

type Props = {
  readonly params: Promise<{ courseSlug: string; lessonId: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonId } = await params;
  const session = await getCurrentSessionUser();

  if (!session) redirect(`/auth/login?next=/course/${courseSlug}/learn/${lessonId}`);

  const [course, lesson, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true, authorId: true, title: true, level: true,
        chapters: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true, title: true, orderIndex: true,
            lessons: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, durationSeconds: true, isFreePreview: true, orderIndex: true },
            },
          },
        },
      },
    }),
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: { select: { id: true, title: true, orderIndex: true, courseId: true } },
        lessonContents: { orderBy: { orderIndex: "asc" } },
        exercises: { orderBy: { orderIndex: "asc" } },
        assets: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.enrollment.findFirst({
      where: { userId: session.id },
      include: { courseProgress: true, lessonProgress: true },
    }),
  ]);

  if (!course || !lesson) notFound();
  if (lesson.chapter.courseId !== course.id) notFound();

  const isEnrolled = !!enrollment;
  const isCourseAuthor = session.id === course.authorId;
  const canAccess = isEnrolled || lesson.isFreePreview || isCourseAuthor;
  if (!canAccess) redirect(`/course/${courseSlug}`);

  // Flat lesson list for prev/next
  const allLessons = course.chapters.flatMap((ch) =>
    ch.lessons.map((l) => ({ ...l, chapterId: ch.id }))
  );
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Completion state
  const completedIds = new Set(
    enrollment?.lessonProgress.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId) ?? []
  );
  const isCurrentCompleted = completedIds.has(lessonId);

  const chaptersForSidebar = course.chapters.map((ch) => ({
    ...ch,
    lessons: ch.lessons.map((l) => ({ ...l, isCompleted: completedIds.has(l.id) })),
  }));

  const totalLessons = allLessons.length;
  const completedLessons = completedIds.size;
  const progressPercent = enrollment?.courseProgress
    ? Number(enrollment.courseProgress.progressPercent)
    : 0;

  const userName = session.email.split("@")[0];
  const dashboardHref =
    session.role === "instructor" || session.role === "professor"
      ? "/professor/dashboard"
      : "/student/dashboard";

  // Partition content
  const videoContent = lesson.lessonContents
    .filter((c) => c.contentType === "video" && c.mediaUrl)
    .map((c) => ({ id: c.id, mediaUrl: c.mediaUrl }));
  const textBlocks = lesson.lessonContents
    .filter((c) => c.contentType === "text" || c.contentType === "markdown")
    .map((c) => ({ id: c.id, body: c.body, contentType: c.contentType }));
  const codeBlocks = lesson.lessonContents
    .filter((c) => c.contentType === "code" && c.body)
    .map((c) => ({ id: c.id, body: c.body, contentType: c.contentType }));
  const pdfAssets = lesson.assets
    .filter((a) => a.assetType === "pdf" || a.mimeType?.includes("pdf"))
    .map((a) => ({ id: a.id, fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize }));
  const zipAssets = lesson.assets
    .filter((a) => a.assetType === "zip" || a.fileName.endsWith(".zip"))
    .map((a) => ({ id: a.id, fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize }));
  const pdfAndZipIds = new Set([...pdfAssets, ...zipAssets].map((a) => a.id));
  const otherAssets = lesson.assets
    .filter((a) => !pdfAndZipIds.has(a.id))
    .map((a) => ({ id: a.id, fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize }));
  const exercises = lesson.exercises.map((e) => ({
    id: e.id, title: e.title, instructions: e.instructions,
    language: e.language, starterCode: e.starterCode,
    solutionCode: e.solutionCode, expectedOutput: e.expectedOutput,
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080D1A" }}>
      <LessonSidebar
        courseSlug={courseSlug}
        courseTitle={course.title}
        chapters={chaptersForSidebar}
        currentLessonId={lessonId}
        totalLessons={totalLessons}
        completedLessons={completedLessons}
        progressPercent={progressPercent}
        userName={userName}
        dashboardHref={dashboardHref}
        isEnrolled={isEnrolled}
      />

      <div style={{ marginLeft: 300, flex: 1, display: "flex", flexDirection: "column" }}>
        <LessonContent
          courseSlug={courseSlug}
          lessonId={lessonId}
          courseTitle={course.title}
          lessonTitle={lesson.title}
          chapterTitle={lesson.chapter.title}
          level={course.level}
          durationSeconds={lesson.durationSeconds}
          videoContent={videoContent}
          textBlocks={textBlocks}
          codeBlocks={codeBlocks}
          pdfAssets={pdfAssets}
          zipAssets={zipAssets}
          otherAssets={otherAssets}
          exercises={exercises}
          prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
          nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
          isEnrolled={isEnrolled}
          isCurrentCompleted={isCurrentCompleted}
          progressPercent={progressPercent}
        />
      </div>
    </div>
  );
}
