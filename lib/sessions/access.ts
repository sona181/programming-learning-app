import "server-only";

import { prisma } from "@/lib/prisma";
import { hasActiveStudentSubscription } from "@/lib/subscriptions/access";

import type { AuthSessionUser } from "@/lib/auth/session";

export type SessionCallAccess = Awaited<ReturnType<typeof getSessionCallAccess>>;

export async function getSessionCallAccess(
  bookingId: string,
  user: AuthSessionUser,
) {
  const booking = await prisma.sessionBooking.findUnique({
    where: { id: bookingId },
    include: {
      instructorProfile: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      },
      liveSession: true,
      slot: true,
      student: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  if (booking.status !== "confirmed") {
    return null;
  }

  const isBookedStudent = booking.studentId === user.id;
  const isBookedInstructor = booking.instructorProfile.userId === user.id;

  if (!isBookedStudent && !isBookedInstructor) {
    return null;
  }

  if (isBookedStudent) {
    const hasSubscription = await hasActiveStudentSubscription(user.id);

    if (!hasSubscription) {
      return null;
    }
  }

  return {
    booking,
    participantRole: isBookedInstructor ? "instructor" : "student",
  } as const;
}
