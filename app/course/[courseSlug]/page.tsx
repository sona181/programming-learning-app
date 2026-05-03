import { getCourse } from "@/lib/course";
import { notFound } from "next/navigation";
import PathOverviewShell from "@/components/academy/path-overview-shell";

interface Props {
  params: Promise<{ courseSlug: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  return <PathOverviewShell course={course} />;
}
