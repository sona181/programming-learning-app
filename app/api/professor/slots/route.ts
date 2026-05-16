import { getCurrentSessionUser } from "@/lib/auth/session";
import { corsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function isInsideTeachingHours(startsAt: Date, endsAt: Date) {
  const startHour = startsAt.getHours() + startsAt.getMinutes() / 60;
  const endHour = endsAt.getHours() + endsAt.getMinutes() / 60;

  return startHour >= 9 && endHour <= 18 && endsAt > startsAt;
}

export async function POST(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  let body: { startsAt?: string; endsAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
  }

  const { startsAt, endsAt } = body;
  if (!startsAt || !endsAt) {
    return NextResponse.json({ error: "startsAt and endsAt are required" }, { status: 400, headers: corsHeaders() });
  }

  const slotStartsAt = new Date(startsAt);
  const slotEndsAt = new Date(endsAt);

  if (!isInsideTeachingHours(slotStartsAt, slotEndsAt)) {
    return NextResponse.json(
      { error: "Slots must be between 09:00 and 18:00." },
      { status: 400, headers: corsHeaders() },
    );
  }

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.id },
  });
  if (!instructor) {
    return NextResponse.json({ error: "Instructor profile not found" }, { status: 404, headers: corsHeaders() });
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      instructorId: instructor.id,
      startsAt: slotStartsAt,
      endsAt: slotEndsAt,
      isBooked: false,
      createdAt: new Date(),
    },
  });

  return NextResponse.json(
    { id: slot.id, startsAt: slot.startsAt.toISOString(), endsAt: slot.endsAt.toISOString() },
    { status: 201, headers: corsHeaders() },
  );
}

export async function DELETE(request: Request) {
  const session = await getCurrentSessionUser(request);
  if (session?.role !== "instructor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const slotId = url.searchParams.get("slotId");
  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400, headers: corsHeaders() });
  }

  const instructor = await prisma.instructorProfile.findUnique({ where: { userId: session.id } });
  if (!instructor) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders() });
  }

  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, instructorId: instructor.id, isBooked: false },
  });
  if (!slot) {
    return NextResponse.json({ error: "Slot not found or already booked" }, { status: 404, headers: corsHeaders() });
  }

  await prisma.availabilitySlot.delete({ where: { id: slotId } });
  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
