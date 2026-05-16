import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
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

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, price: true, isPremium: true, status: true },
  });

  if (!course || !course.isPremium || course.status !== "published") {
    return NextResponse.json(
      { success: false, message: "Kursi nuk u gjet." },
      { status: 404 },
    );
  }

  const price = Number(course.price ?? 0);
  if (price <= 0) {
    return NextResponse.json(
      { success: false, message: "Çmimi i kursit është i pavlefshëm." },
      { status: 400 },
    );
  }

  try {
    const orderId = await createPayPalOrder(price);
    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("PayPal create order error:", err);
    return NextResponse.json(
      { success: false, message: "Nuk mund të krijohet porosia PayPal." },
      { status: 500 },
    );
  }
}
