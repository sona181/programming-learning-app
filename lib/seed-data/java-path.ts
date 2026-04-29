import { javaCurriculumSeed } from "./java-curriculum.ts";

type ActivityOptions = {
  acceptedAnswers?: string[];
  choices?: string[];
  code?: string;
  explanation?: string;
  starter?: string;
  tokens?: string[];
};

type PathActivitySeed = {
  activityType:
    | "multiple_choice"
    | "true_false"
    | "fill_blank"
    | "predict_output"
    | "reorder_tokens"
    | "trace_code";
  correctAnswer: string;
  key: string;
  options?: ActivityOptions;
  orderIndex: number;
  prompt: string;
  xpReward: number;
};

type PathLessonSeed = {
  activities: PathActivitySeed[];
  key: string;
  orderIndex: number;
  title: string;
  xpReward: number;
};

type PathUnitSeed = {
  description: string;
  key: string;
  lessons: PathLessonSeed[];
  orderIndex: number;
  title: string;
};

export const javaPathSeed = {
  path: javaCurriculumSeed.path,
  units: javaCurriculumSeed.units.map<PathUnitSeed>((unit, unitIndex) => ({
    description: unit.description,
    key: unit.key,
    lessons: unit.lessons.map<PathLessonSeed>((lesson, lessonIndex) => ({
      activities: lesson.path.activities.map<PathActivitySeed>((activity, activityIndex) => ({
        activityType: activity.activityType,
        correctAnswer: activity.correctAnswer,
        key: `${lesson.key}-${activity.activityType}-${activityIndex + 1}`,
        options: activity.options,
        orderIndex: activityIndex + 1,
        prompt: activity.prompt,
        xpReward: activity.xpReward,
      })),
      key: lesson.key,
      orderIndex: lessonIndex + 1,
      title: lesson.title,
      xpReward: lesson.path.xpReward,
    })),
    orderIndex: unitIndex + 1,
    title: unit.title,
  })),
};
