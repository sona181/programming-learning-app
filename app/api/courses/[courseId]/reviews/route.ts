import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/auth/session";

type Params = { params: Promise<{ courseId: string }> };

function serializeReview(review: {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { email: string; profile: { displayName: string } | null };
}) {
  const name = review.user.profile?.displayName ?? review.user.email.split("@")[0] ?? "Student";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    userName: name,
    userInitials: initials || "ST",
  };
}

export async function GET(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);

  const reviews = await prisma.courseReview.findMany({
    where: { courseId },
    include: {
      user: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : null;

  return NextResponse.json({
    reviews: reviews.map(serializeReview),
    averageRating,
    reviewCount,
    currentUserReview: session
      ? reviews.find((review) => review.userId === session.id)?.id ?? null
      : null,
  });
}

export async function POST(request: Request, { params }: Params) {
  const { courseId } = await params;
  const session = await getCurrentSessionUser(request);

  if (!session) {
    return NextResponse.json({ error: "Duhet te kycesh per te lene vleresim." }, { status: 401 });
  }

  if (session.role !== "student") {
    return NextResponse.json({ error: "Vetem studentet mund te lene vleresime." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Vleresimi duhet te jete nga 1 deri ne 5." }, { status: 400 });
  }

  if (comment.length > 1000) {
    return NextResponse.json({ error: "Komenti nuk mund te kete me shume se 1000 karaktere." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, slug: true, status: true },
  });

  if (!course || course.status !== "published") {
    return NextResponse.json({ error: "Kursi nuk u gjet." }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId,
      },
    },
    select: { id: true },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Regjistrohu ne kurs para se te lesh vleresim." }, { status: 403 });
  }

  const now = new Date();
  const review = await prisma.courseReview.upsert({
    where: {
      courseId_userId: {
        courseId,
        userId: session.id,
      },
    },
    create: {
      courseId,
      userId: session.id,
      rating,
      comment: comment || null,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      rating,
      comment: comment || null,
      updatedAt: now,
    },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  revalidatePath("/courses");
  revalidatePath(`/course/${course.slug}`);

  return NextResponse.json({ review: serializeReview(review) });
}
