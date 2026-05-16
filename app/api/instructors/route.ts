import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const instructors = await prisma.instructorProfile.findMany({
    where: { isAvailable: true },
    include: { user: { include: { profile: true } } },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json(
    instructors.map((i) => ({
      id: i.id,
      userId: i.userId,
      name: i.user.profile?.displayName ?? i.user.email,
      specialties: i.specialties ?? "",
      hourlyRate: Number(i.hourlyRate ?? 0),
      rating: Number(i.rating ?? 0),
    })),
  );
}
