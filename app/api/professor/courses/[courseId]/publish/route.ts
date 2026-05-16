import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ courseId: string }> };

// PATCH — change course status: draft | published
export async function PATCH(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, authorId: session.id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { status?: string };
  try { body = await request.json(); } catch { body = {}; }

  const allowed = ["draft", "published"];
  const status = body.status;
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: "status must be one of: draft, published" }, { status: 400 });
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      status,
      publishedAt: status === "published" ? (course.publishedAt ?? new Date()) : course.publishedAt,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/courses");
  revalidatePath("/my-courses");
  revalidatePath("/professor/courses");
  revalidatePath(`/course/${updated.slug}`);

  return NextResponse.json({ id: updated.id, slug: updated.slug, status: updated.status });
}
