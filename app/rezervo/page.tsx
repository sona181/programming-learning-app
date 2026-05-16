export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import BookingPageClient from "./BookingPageClient";

export default async function RezervePage() {
  const sessionUser = await getCurrentSessionUser();

  const [instructors, enrollments] = await Promise.all([
    prisma.instructorProfile.findMany({
      where: { isAvailable: true },
      include: { user: { include: { profile: true } } },
      orderBy: { rating: "desc" },
    }),
    sessionUser
      ? prisma.enrollment.findMany({
          where: { userId: sessionUser.id, status: { not: "cancelled" } },
          include: { course: { include: { author: { include: { instructorProfile: true } } } } },
        })
      : Promise.resolve([]),
  ]);

  const subscribedInstructorIds = new Set(
    enrollments
      .map((enrollment) => enrollment.course.author.instructorProfile?.id)
      .filter((id): id is string => Boolean(id)),
  );

  const instructorData = instructors.map((i) => ({
    id: i.id,
    userId: i.userId,
    name: i.user.profile?.displayName ?? i.user.email,
    specialties: i.specialties ?? "",
    hourlyRate: Number(i.hourlyRate ?? 0),
    rating: Number(i.rating ?? 0),
    isSubscribed: subscribedInstructorIds.has(i.id),
  }));

  return (
    <BookingPageClient
      initialInstructors={instructorData}
      currentUserId={sessionUser?.id ?? null}
    />
  );
}
