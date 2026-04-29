import { QuizShell } from "@/components/academy/quiz-shell";
import {
  getAcademyFrontendNotice,
  getAcademyFrontendUserId,
} from "@/lib/academy/dev-user";

export default async function JavaPathQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;

  return (
    <QuizShell
      key={quizId}
      noticeText={getAcademyFrontendNotice()}
      quizId={quizId}
      userId={getAcademyFrontendUserId()}
    />
  );
}
