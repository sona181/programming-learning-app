import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const session = await getCurrentSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Duhet të jeni të identifikuar." },
      { status: 401 },
    );
  }

  const { courseId } = await params;

  let orderId: string;
  try {
    const body = (await req.json()) as { orderId?: string };
    orderId = body.orderId?.trim() ?? "";
  } catch {
    return NextResponse.json(
      { success: false, message: "Kërkesë e pavlefshme." },
      { status: 400 },
    );
  }

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "orderId mungon." },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true, slug: true, price: true, isPremium: true, status: true,
      chapters: {
        orderBy: { orderIndex: "asc" },
        take: 1,
        select: { lessons: { orderBy: { orderIndex: "asc" }, take: 1, select: { id: true } } },
      },
    },
  });

  if (!course?.isPremium || course.status !== "published") {
    return NextResponse.json(
      { success: false, message: "Kursi nuk u gjet." },
      { status: 404 },
    );
  }

  try {
    const capture = await capturePayPalOrder(orderId);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, message: "Pagesa nuk u konfirmua nga PayPal." },
        { status: 400 },
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId } },
    });

    if (!existing) {
      const totalLessons = await prisma.lesson.count({
        where: { chapter: { courseId } },
      });

      await prisma.enrollment.create({
        data: {
          userId: session.id,
          courseId,
          status: "active",
          enrolledAt: new Date(),
          courseProgress: {
            create: {
              totalLessons,
              completedLessons: 0,
              progressPercent: 0,
              updatedAt: new Date(),
            },
          },
        },
      });
    }

    await prisma.payment.create({
      data: {
        userId: session.id,
        courseId,
        amount: Number(course.price ?? 0),
        currency: "EUR",
        status: "completed",
        provider: "paypal",
        providerReference: capture.id,
        paidAt: new Date(),
        createdAt: new Date(),
      },
    });

    const firstLessonId = course.chapters[0]?.lessons[0]?.id;
    const firstLessonUrl = firstLessonId
      ? `/course/${course.slug}/learn/${firstLessonId}`
      : `/course/${course.slug}/0/0/0`;

    return NextResponse.json({ success: true, firstLessonUrl });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json(
      { success: false, message: "Nuk mund të konfirmohet pagesa." },
      { status: 500 },
    );
  }
}
