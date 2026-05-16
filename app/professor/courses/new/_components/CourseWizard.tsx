"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2Structure from "./Step2Structure";
import Step3Content from "./Step3Content";
import Step4Landing from "./Step4Landing";
import Step5Publish from "./Step5Publish";

export type Category = { id: string; name: string };

export type Exercise = {
  title: string; language: string; instructions: string;
  starterCode: string; solutionCode: string; expectedOutput: string; orderIndex: number;
};
export type ContentBlock = {
  contentType: "text" | "video" | "pdf"; body?: string; mediaUrl?: string; orderIndex: number;
};
export type Lesson = {
  id?: string; title: string; lessonType: string; isFreePreview: boolean;
  orderIndex: number; contents: ContentBlock[]; exercises: Exercise[];
};
export type Chapter = {
  id?: string; title: string; orderIndex: number; lessons: Lesson[];
};

type ExistingLesson = Omit<Lesson, "contents" | "exercises"> & {
  contents?: ContentBlock[] | null;
  lessonContents?: ContentBlock[] | null;
  exercises?: Exercise[] | null;
};

type ExistingChapter = Omit<Chapter, "lessons"> & {
  lessons?: ExistingLesson[] | null;
};

export type LandingContent = {
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  whatYouWillLearn: string[];
  benefits: string[];
  targetAudience: string[];
  prerequisites: string[];
  curriculumSummary: string[];
  faq: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
  ctaText: string;
};

export type CourseState = {
  courseId: string | null;
  slug: string;
  // Step 1 — basic info
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  level: string;
  language: string;
  isPremium: boolean;
  price: number | null;
  thumbnailUrl: string | null;
  // Step 1 — AI context extras
  targetAudienceInput: string;
  prerequisitesInput: string;
  learnInput: string;
  estimatedDuration: string;
  professorBio: string;
  professorCredentials: string;
  promotionalVideoUrl: string;
  // Step 2 — structure
  chapters: Chapter[];
  // Step 4 — landing
  landing: LandingContent | null;
  // Step 5
  status: string;
};

type ExistingCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  level: string;
  language: string;
  isPremium: boolean;
  price: number | null;
  thumbnailUrl: string | null;
  status: string;
  chapters: ExistingChapter[];
  landingPage?: Partial<LandingContent & {
    subtitle: string; targetAudienceInput: string; prerequisitesInput: string;
    learnInput: string; estimatedDuration: string; professorBio: string;
    professorCredentials: string; promotionalVideoUrl: string; marketingDesc: string;
  }> | null;
};

const STEPS = ["Informacioni", "Struktura", "Përmbajtja", "Faqja", "Publikimi"];

const sectionStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  background: "#F8FAFC",
  minHeight: "100vh",
};

function normalizeChapters(chapters: ExistingChapter[] | null | undefined): Chapter[] {
  return (chapters ?? []).map((chapter, chapterIndex) => ({
    id: chapter.id,
    title: chapter.title,
    orderIndex: chapter.orderIndex ?? chapterIndex,
    lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => ({
      id: lesson.id,
      title: lesson.title,
      lessonType: lesson.lessonType ?? "text",
      isFreePreview: lesson.isFreePreview ?? false,
      orderIndex: lesson.orderIndex ?? lessonIndex,
      contents: lesson.contents ?? lesson.lessonContents ?? [],
      exercises: lesson.exercises ?? [],
    })),
  }));
}

export default function CourseWizard({
  categories,
  existing,
}: {
  categories: Category[];
  existing: ExistingCourse | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const lp = existing?.landingPage;
  const [state, setState] = useState<CourseState>({
    courseId: existing?.id ?? null,
    slug: existing?.slug ?? "",
    title: existing?.title ?? "",
    subtitle: lp?.subtitle ?? "",
    description: existing?.description ?? "",
    categoryId: existing?.categoryId ?? "",
    level: existing?.level ?? "beginner",
    language: existing?.language ?? "sq",
    isPremium: existing?.isPremium ?? false,
    price: existing?.price ?? null,
    thumbnailUrl: existing?.thumbnailUrl ?? null,
    targetAudienceInput: lp?.targetAudienceInput ?? "",
    prerequisitesInput: lp?.prerequisitesInput ?? "",
    learnInput: lp?.learnInput ?? "",
    estimatedDuration: lp?.estimatedDuration ?? "",
    professorBio: lp?.professorBio ?? "",
    professorCredentials: lp?.professorCredentials ?? "",
    promotionalVideoUrl: lp?.promotionalVideoUrl ?? "",
    chapters: normalizeChapters(existing?.chapters),
    landing: lp ? {
      heroTitle: lp.heroTitle ?? "",
      heroSubtitle: lp.heroSubtitle ?? "",
      description: lp.marketingDesc ?? "",
      whatYouWillLearn: (lp.whatYouWillLearn as string[]) ?? [],
      benefits: (lp.benefits as string[]) ?? [],
      targetAudience: (lp.targetAudience as string[]) ?? [],
      prerequisites: (lp.prerequisites as string[]) ?? [],
      curriculumSummary: (lp.curriculumSummary as string[]) ?? [],
      faq: (lp.faq as { question: string; answer: string }[]) ?? [],
      seoTitle: lp.seoTitle ?? "",
      seoDescription: lp.seoDescription ?? "",
      ctaText: lp.ctaText ?? "",
    } : null,
    status: existing?.status ?? "draft",
  });

  function update(patch: Partial<CourseState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function goNext() { setStep((s) => Math.min(s + 1, 5)); }
  function goBack() { setStep((s) => Math.max(s - 1, 1)); }

  async function finish() {
    router.push("/professor/courses");
  }

  return (
    <div style={sectionStyle}>
      {/* Top bar */}
      <div style={{ background: "#1a1a3a", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/professor/courses")}
            style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 13, cursor: "pointer", padding: 0 }}
          >
            ← Kurset e mia
          </button>
          <span style={{ color: "#4B5563", fontSize: 13 }}>/</span>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
            {state.courseId ? "Edito Kursin" : "Kurs i Ri"}
          </span>
        </div>
        {state.courseId && (
          <span style={{ fontSize: 12, color: "#6B7280", background: "#F3F4F6", padding: "4px 10px", borderRadius: 99 }}>
            ID: {state.courseId.slice(0, 8)}…
          </span>
        )}
      </div>

      {/* Step progress */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 24px" }}>
        <div style={{ display: "flex", maxWidth: 860, gap: 0 }}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <button
                key={label}
                onClick={() => done && setStep(n)}
                style={{
                  flex: 1, padding: "14px 6px", fontSize: 12, fontWeight: 600,
                  border: "none", borderBottom: active ? "3px solid #7C3AED" : "3px solid transparent",
                  background: "none", cursor: done ? "pointer" : "default",
                  color: active ? "#7C3AED" : done ? "#374151" : "#9CA3AF",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "#7C3AED" : done ? "#059669" : "#E5E7EB",
                  color: active || done ? "#fff" : "#9CA3AF",
                  flexShrink: 0,
                }}>
                  {done ? "✓" : n}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        {step === 1 && <Step1BasicInfo state={state} update={update} categories={categories} onNext={goNext} />}
        {step === 2 && <Step2Structure state={state} update={update} onBack={goBack} onNext={goNext} />}
        {step === 3 && <Step3Content state={state} update={update} onBack={goBack} onNext={goNext} />}
        {step === 4 && <Step4Landing state={state} update={update} onBack={goBack} onNext={goNext} />}
        {step === 5 && <Step5Publish state={state} update={update} onBack={goBack} onFinish={finish} />}
      </div>
    </div>
  );
}
