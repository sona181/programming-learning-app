import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 200);
}

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 0;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

// GET /api/professor/courses — list my courses
export async function GET(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { authorId: session.id },
    include: {
      category: { select: { name: true } },
      _count: { select: { chapters: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      status: c.status,
      level: c.level,
      language: c.language,
      isPremium: c.isPremium,
      price: c.price ? Number(c.price) : null,
      thumbnailUrl: c.thumbnailUrl,
      category: c.category?.name ?? null,
      chapterCount: c._count.chapters,
      enrollmentCount: c._count.enrollments,
      createdAt: c.createdAt.toISOString(),
    })),
  );
}

// POST /api/professor/courses — create draft course
export async function POST(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    categoryId?: string;
    level?: string;
    language?: string;
    isPremium?: boolean;
    price?: number;
    thumbnailUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = await uniqueSlug(slugify(body.title));
  const now = new Date();

  const course = await prisma.course.create({
    data: {
      title: body.title.trim(),
      slug,
      description: body.description ?? null,
      categoryId: body.categoryId ?? null,
      level: body.level ?? "beginner",
      language: body.language ?? "sq",
      isPremium: body.isPremium ?? false,
      price: body.price ?? null,
      thumbnailUrl: body.thumbnailUrl ?? null,
      status: "draft",
      authorId: session.id,
      createdAt: now,
      updatedAt: now,
    },
  });

  return NextResponse.json({ id: course.id, slug: course.slug }, { status: 201 });
}
