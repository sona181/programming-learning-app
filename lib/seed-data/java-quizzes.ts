import { javaCurriculumSeed } from "./java-curriculum.ts";

type QuizAnswerOptionSeed = {
  body: string;
  isCorrect: boolean;
  key: string;
  orderIndex: number;
};

type QuizQuestionSeed = {
  body: string;
  key: string;
  options: QuizAnswerOptionSeed[];
  orderIndex: number;
  points: number;
  questionType: "multiple_choice" | "true_false";
};

type QuizSeed = {
  key: string;
  passScore: number;
  pathUnitKey: string;
  questions: QuizQuestionSeed[];
  timeLimitSeconds: number | null;
  title: string;
};

export const javaQuizSeed = javaCurriculumSeed.units.map<QuizSeed>(
  (unit) => ({
    key: `${unit.key}-quiz`,
    passScore: unit.checkpoint.passScore,
    pathUnitKey: unit.key,
    questions: unit.checkpoint.questions.map<QuizQuestionSeed>(
      (question, questionIndex) => ({
        body: question.body,
        key: `${unit.key}-question-${questionIndex + 1}`,
        options: question.options.map<QuizAnswerOptionSeed>((option, optionIndex) => ({
          body: option.body,
          isCorrect: option.isCorrect,
          key: `${unit.key}-question-${questionIndex + 1}-option-${optionIndex + 1}`,
          orderIndex: optionIndex + 1,
        })),
        orderIndex: questionIndex + 1,
        points: question.points,
        questionType: question.questionType,
      }),
    ),
    timeLimitSeconds: unit.checkpoint.timeLimitSeconds,
    title: unit.checkpoint.title,
  }),
);
