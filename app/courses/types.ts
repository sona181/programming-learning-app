export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseLanguage = "sq" | "en" | "it";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: CourseLevel;
  language: CourseLanguage;
  isPremium: boolean;
  price: number | null;
  thumbnailUrl: string | null;
  category: string;
  instructor: string;
  coAuthorCount: number;
  lessonCount: number;
  enrollmentCount: number;
  isEnrolled: boolean;
  rating: number | null;
}

export interface Category {
  name: string;
  count: number;
}