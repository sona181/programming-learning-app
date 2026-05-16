export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LandingEditorClient from "./_components/LandingEditorClient";

type Props = { params: Promise<{ courseId: string }> };

export default async function LandingEditorPage({ params }: Props) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser();
  if (session?.role !== "instructor") redirect("/auth/login");

  const course = await prisma.course.findFirst({
    where: { id: courseId, authorId: session.id },
    include: {
      category: true,
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { select: { id: true }, orderBy: { orderIndex: "asc" } } },
      },
      landingPage: true,
    },
  });
  if (!course) redirect("/professor/courses");

  const lp = course.landingPage;

  return (
    <LandingEditorClient
      courseId={course.id}
      courseTitle={course.title}
      courseSlug={course.slug}
      initialContext={{
        subtitle: lp?.subtitle ?? "",
        targetAudienceInput: lp?.targetAudienceInput ?? "",
        prerequisitesInput: lp?.prerequisitesInput ?? "",
        learnInput: lp?.learnInput ?? "",
        estimatedDuration: lp?.estimatedDuration ?? "",
        professorBio: lp?.professorBio ?? "",
        professorCredentials: lp?.professorCredentials ?? "",
        promotionalVideoUrl: lp?.promotionalVideoUrl ?? "",
      }}
      initialLanding={lp ? {
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
      } : null}
      isAiGenerated={lp?.isAiGenerated ?? false}
      lastGeneratedAt={lp?.lastGeneratedAt?.toISOString() ?? null}
    />
  );
}
