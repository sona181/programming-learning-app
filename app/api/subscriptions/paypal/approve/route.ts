import { getCurrentSessionUser } from "@/lib/auth/session";
import {
  getFallbackSubscriptionPeriodEnd,
  getPayPalSubscription,
  parsePayPalDate,
} from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { isSubscriptionStatusAccessible } from "@/lib/subscriptions/access";

type ApproveRequestBody = {
  subscriptionId?: string;
};

function json(body: { message: string; success: boolean }, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();

  if (!user) {
    return json({ success: false, message: "You must sign in first." }, 401);
  }

  if (user.role !== "student") {
    return json(
      { success: false, message: "Only student accounts can subscribe." },
      403,
    );
  }

  let payload: ApproveRequestBody;

  try {
    payload = (await request.json()) as ApproveRequestBody;
  } catch {
    return json({ success: false, message: "Invalid request body." }, 400);
  }

  const subscriptionId = payload.subscriptionId?.trim();

  if (!subscriptionId) {
    return json(
      { success: false, message: "PayPal subscription ID is required." },
      400,
    );
  }

  try {
    const paypalSubscription = await getPayPalSubscription(subscriptionId);
    const subscriptionStatus = paypalSubscription.status?.toUpperCase() ?? null;

    if (!isSubscriptionStatusAccessible(subscriptionStatus)) {
      return json(
        {
          success: false,
          message: "The PayPal subscription is not approved yet.",
        },
        409,
      );
    }

    const expectedPlanId = process.env.PAYPAL_PLAN_ID;
    if (expectedPlanId && paypalSubscription.plan_id !== expectedPlanId) {
      return json(
        {
          success: false,
          message: "The PayPal subscription plan does not match this app.",
        },
        400,
      );
    }

    const existingSubscription = await prisma.userSubscription.findUnique({
      where: {
        providerSubscriptionId: subscriptionId,
      },
      select: {
        userId: true,
      },
    });

    if (existingSubscription && existingSubscription.userId !== user.id) {
      return json(
        {
          success: false,
          message: "This PayPal subscription is already linked to another user.",
        },
        409,
      );
    }

    const plan = await prisma.pricingPlan.findFirst({
      where: {
        isActive: true,
        hasLiveSessions: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });

    if (!plan) {
      return json(
        {
          success: false,
          message: "No active live-session pricing plan is configured.",
        },
        500,
      );
    }

    const now = new Date();
    const periodEnd =
      parsePayPalDate(paypalSubscription.billing_info?.next_billing_time) ??
      getFallbackSubscriptionPeriodEnd();

    await prisma.userSubscription.upsert({
      where: {
        providerSubscriptionId: subscriptionId,
      },
      create: {
        userId: user.id,
        planId: plan.id,
        status: subscriptionStatus ?? "APPROVED",
        billingCycle: "monthly",
        startedAt: now,
        expiresAt: periodEnd,
        paymentProvider: "paypal",
        providerCustomerId: paypalSubscription.subscriber?.payer_id ?? null,
        providerSubscriptionId: subscriptionId,
        subscriptionStatus,
        subscriptionCurrentPeriodEnd: periodEnd,
      },
      update: {
        status: subscriptionStatus ?? "APPROVED",
        expiresAt: periodEnd,
        paymentProvider: "paypal",
        providerCustomerId: paypalSubscription.subscriber?.payer_id ?? null,
        subscriptionStatus,
        subscriptionCurrentPeriodEnd: periodEnd,
        cancelledAt: null,
      },
    });

    return json(
      {
        success: true,
        message: "PayPal subscription stored successfully.",
      },
      200,
    );
  } catch (error) {
    console.error("PayPal approve route error:", error);
    return json(
      {
        success: false,
        message: "Could not verify the PayPal subscription.",
      },
      500,
    );
  }
}
