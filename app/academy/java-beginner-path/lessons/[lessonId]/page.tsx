import { PathLessonShell } from "@/components/academy/path-lesson-shell";
import {
  getAcademyFrontendNotice,
  getAcademyFrontendUserId,
} from "@/lib/academy/dev-user";

export default async function JavaPathLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  return (
    <PathLessonShell
      key={lessonId}
      lessonId={lessonId}
      noticeText={getAcademyFrontendNotice()}
      userId={getAcademyFrontendUserId()}
    />
  );
}
