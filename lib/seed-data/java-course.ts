import { javaCurriculumSeed } from "./java-curriculum.ts";

type LessonContentBlock = {
  body: string;
  contentType: "text" | "example" | "tip" | "summary";
  key: string;
};

type CourseLessonSeed = {
  contents: LessonContentBlock[];
  durationSeconds: number;
  isFreePreview: boolean;
  key: string;
  lessonType: "reading";
  orderIndex: number;
  title: string;
};

type CourseChapterSeed = {
  key: string;
  lessons: CourseLessonSeed[];
  orderIndex: number;
  title: string;
};

export const javaCourseSeed = {
  author: javaCurriculumSeed.author,
  chapters: javaCurriculumSeed.units.map<CourseChapterSeed>((unit, unitIndex) => ({
    key: unit.key,
    lessons: unit.lessons.map<CourseLessonSeed>((lesson, lessonIndex) => ({
      contents: [
        {
          body: lesson.content.text,
          contentType: "text",
          key: `${lesson.key}-text`,
        },
        {
          body: lesson.content.example,
          contentType: "example",
          key: `${lesson.key}-example`,
        },
        {
          body: lesson.content.tip,
          contentType: "tip",
          key: `${lesson.key}-tip`,
        },
        {
          body: lesson.content.summary,
          contentType: "summary",
          key: `${lesson.key}-summary`,
        },
      ],
      durationSeconds: lesson.durationSeconds,
      isFreePreview: lesson.isFreePreview,
      key: lesson.key,
      lessonType: "reading",
      orderIndex: lessonIndex + 1,
      title: lesson.title,
    })),
    orderIndex: unitIndex + 1,
    title: unit.title,
  })),
  course: javaCurriculumSeed.course,
};
