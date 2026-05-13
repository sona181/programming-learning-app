import {
  getFallbackSubscriptionPeriodEnd,
  getPayPalSubscription,
  parsePayPalDate,
  verifyPayPalWebhookSignature,
} from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: {
    billing_info?: {
      next_billing_time?: string;
    };
    id?: string;
    status?: string;
  };
};

function getHeader(headers: Headers, name: string) {
  return headers.get(name) ?? headers.get(name.toLowerCase());
}

function mapSubscriptionStatus(event: PayPalWebhookEvent) {
  const eventType = event.event_type ?? "";
  const resourceStatus = event.resource?.status?.toUpperCase();

  if (resourceStatus) {
    return resourceStatus;
  }

  if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") return "ACTIVE";
  if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") return "CANCELLED";
  if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") return "SUSPENDED";
  if (eventType === "BILLING.SUBSCRIPTION.EXPIRED") return "EXPIRED";
  if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") return "SUSPENDED";
  if (eventType === "BILLING.SUBSCRIPTION.CREATED") return "APPROVAL_PENDING";
  if (eventType === "BILLING.SUBSCRIPTION.UPDATED") return "APPROVED";

  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let event: PayPalWebhookEvent;

  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return Response.json({ message: "Invalid webhook payload." }, { status: 400 });
  }

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    return Response.json(
      { message: "PAYPAL_WEBHOOK_ID is not configured." },
      { status: 500 },
    );
  }

  const authAlgo = getHeader(request.headers, "paypal-auth-algo");
  const certUrl = getHeader(request.headers, "paypal-cert-url");
  const transmissionId = getHeader(request.headers, "paypal-transmission-id");
  const transmissionSig = getHeader(request.headers, "paypal-transmission-sig");
  const transmissionTime = getHeader(request.headers, "paypal-transmission-time");

  if (
    !authAlgo ||
    !certUrl ||
    !transmissionId ||
    !transmissionSig ||
    !transmissionTime
  ) {
    return Response.json(
      { message: "Missing PayPal webhook verification headers." },
      { status: 400 },
    );
  }

  try {
    const verified = await verifyPayPalWebhookSignature({
      authAlgo,
      certUrl,
      event,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookId,
    });

    if (!verified) {
      return Response.json(
        { message: "PayPal webhook signature verification failed." },
        { status: 400 },
      );
    }

    const subscriptionId = event.resource?.id;
    if (!subscriptionId) {
      return Response.json({ message: "Webhook ignored." }, { status: 200 });
    }

    const status = mapSubscriptionStatus(event);
    if (!status) {
      return Response.json({ message: "Webhook ignored." }, { status: 200 });
    }

    const subscription =
      status === "ACTIVE" || status === "APPROVED"
        ? await getPayPalSubscription(subscriptionId)
        : null;
    const periodEnd =
      parsePayPalDate(
        subscription?.billing_info?.next_billing_time ??
          event.resource?.billing_info?.next_billing_time,
      ) ?? getFallbackSubscriptionPeriodEnd();
    const cancelledAt =
      status === "CANCELLED" || status === "EXPIRED" ? new Date() : null;

    await prisma.userSubscription.updateMany({
      where: {
        providerSubscriptionId: subscriptionId,
        paymentProvider: "paypal",
      },
      data: {
        status,
        expiresAt: periodEnd,
        subscriptionStatus: status,
        subscriptionCurrentPeriodEnd: periodEnd,
        cancelledAt,
      },
    });

    return Response.json({ message: "Webhook processed." }, { status: 200 });
  } catch (error) {
    console.error("PayPal webhook route error:", error);
    return Response.json(
      { message: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
