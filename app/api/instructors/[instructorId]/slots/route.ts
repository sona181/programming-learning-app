import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ instructorId: string }> };

function isInsideTeachingHours(startsAt: Date, endsAt: Date) {
  const startHour = startsAt.getHours() + startsAt.getMinutes() / 60;
  const endHour = endsAt.getHours() + endsAt.getMinutes() / 60;

  return startHour >= 9 && endHour <= 18 && endsAt > startsAt;
}

export async function GET(request: Request, { params }: Params) {
  const { instructorId } = await params;
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      instructorId,
      isBooked: false,
      startsAt: {
        gte: from ? new Date(from) : new Date(),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json(
    slots.filter((s) => isInsideTeachingHours(s.startsAt, s.endsAt)).map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
    })),
  );
}
