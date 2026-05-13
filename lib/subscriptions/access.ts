import "server-only";

import { prisma } from "@/lib/prisma";

import type { AuthSessionUser } from "@/lib/auth/session";

const ACCESSIBLE_SUBSCRIPTION_STATUSES = new Set(["ACTIVE", "APPROVED"]);

export function canRoleBypassStudentSubscription(user: AuthSessionUser) {
  return user.role === "instructor" || user.role === "professor";
}

export function isSubscriptionStatusAccessible(status: string | null | undefined) {
  return ACCESSIBLE_SUBSCRIPTION_STATUSES.has((status ?? "").toUpperCase());
}

export async function hasActiveStudentSubscription(userId: string) {
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      userId,
    },
    select: {
      expiresAt: true,
      status: true,
      subscriptionCurrentPeriodEnd: true,
      subscriptionStatus: true,
    },
  });

  const now = Date.now();

  return subscriptions.some((subscription) => {
    const status = subscription.subscriptionStatus ?? subscription.status;
    const periodEnd =
      subscription.subscriptionCurrentPeriodEnd ?? subscription.expiresAt;

    return (
      isSubscriptionStatusAccessible(status) &&
      (!periodEnd || periodEnd.getTime() > now)
    );
  });
}

export async function canAccessStudentSubscriptionFeature(
  user: AuthSessionUser,
) {
  if (canRoleBypassStudentSubscription(user)) {
    return true;
  }

  if (user.role !== "student") {
    return false;
  }

  return hasActiveStudentSubscription(user.id);
}
