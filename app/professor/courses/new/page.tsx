export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseWizard from "./_components/CourseWizard";

type Props = { searchParams: Promise<{ courseId?: string }> };

export default async function NewCoursePage({ searchParams }: Props) {
  const session = await getCurrentSessionUser();
  if (session?.role !== "instructor") redirect("/auth/login");

  const { courseId } = await searchParams;

  const categories = await prisma.courseCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // If editing an existing course, load it
  let existing = null;
  if (courseId) {
    existing = await prisma.course.findFirst({
      where: { id: courseId, authorId: session.id },
      include: {
        chapters: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              include: {
                lessonContents: { orderBy: { orderIndex: "asc" } },
                exercises: { orderBy: { orderIndex: "asc" } },
              },
            },
          },
        },
        landingPage: true,
      },
    });
  }

  return (
    <CourseWizard
      categories={categories}
      existing={existing ? JSON.parse(JSON.stringify(existing)) : null}
    />
  );
}
