import "server-only";

type PayPalEnvironment = "sandbox" | "live";

export type PayPalSubscriptionDetails = {
  billing_info?: {
    next_billing_time?: string;
  };
  id: string;
  plan_id?: string;
  subscriber?: {
    payer_id?: string;
  };
  status?: string;
};

type VerifyWebhookSignatureResponse = {
  verification_status?: "SUCCESS" | "FAILURE";
};

function getPayPalEnvironment(): PayPalEnvironment {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

function getPayPalBaseUrl() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set.");
  }

  return { clientId, clientSecret };
}

async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { access_token?: string };

  if (!payload.access_token) {
    throw new Error("PayPal OAuth response did not include an access token.");
  }

  return payload.access_token;
}

export async function getPayPalSubscription(
  subscriptionId: string,
): Promise<PayPalSubscriptionDetails> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `PayPal subscription lookup failed with status ${response.status}.`,
    );
  }

  return (await response.json()) as PayPalSubscriptionDetails;
}

export async function verifyPayPalWebhookSignature({
  authAlgo,
  certUrl,
  event,
  transmissionId,
  transmissionSig,
  transmissionTime,
  webhookId,
}: {
  authAlgo: string;
  certUrl: string;
  event: unknown;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `PayPal webhook verification failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as VerifyWebhookSignatureResponse;
  return payload.verification_status === "SUCCESS";
}

export function parsePayPalDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getFallbackSubscriptionPeriodEnd() {
  const fallback = new Date();
  fallback.setMonth(fallback.getMonth() + 1);
  return fallback;
}

export async function createPayPalOrder(amount: number, currency = "EUR"): Promise<string> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) } }],
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal create order failed with status ${response.status}.`);
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function capturePayPalOrder(orderId: string): Promise<{ status: string; id: string }> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`PayPal capture order failed with status ${response.status}.`);
  }

  return response.json() as Promise<{ status: string; id: string }>;
}
