"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createSubscription: (
          data: unknown,
          actions: {
            subscription: {
              create: (payload: { plan_id: string }) => Promise<string>;
            };
          },
        ) => Promise<string>;
        onApprove: (data: { subscriptionID?: string }) => Promise<void>;
        onError: (error: unknown) => void;
      }) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

type SubscribeMessage = {
  tone: "error" | "success";
  text: string;
};

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID;
const initialMessage =
  !clientId || !planId
    ? {
        tone: "error" as const,
        text: "PayPal subscription settings are not configured.",
      }
    : null;

export default function SubscribePage() {
  const [message, setMessage] = useState<SubscribeMessage | null>(
    initialMessage,
  );
  const [isReady, setIsReady] = useState(false);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (!clientId || !planId) {
      return;
    }

    const sdkUrl = new URL("https://www.paypal.com/sdk/js");
    sdkUrl.searchParams.set("client-id", clientId);
    sdkUrl.searchParams.set("components", "buttons");
    sdkUrl.searchParams.set("vault", "true");
    sdkUrl.searchParams.set("intent", "subscription");

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${sdkUrl.toString()}"]`,
    );

    const renderButtons = async () => {
      if (hasRendered.current || !window.paypal) {
        return;
      }

      hasRendered.current = true;
      setIsReady(true);

      await window.paypal
        .Buttons({
          createSubscription(_data, actions) {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          async onApprove(data) {
            if (!data.subscriptionID) {
              setMessage({
                tone: "error",
                text: "PayPal did not return a subscription ID.",
              });
              return;
            }

            const response = await fetch("/api/subscriptions/paypal/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                subscriptionId: data.subscriptionID,
              }),
            });

            const result = (await response.json().catch(() => null)) as
              | { message?: string; success?: boolean }
              | null;

            if (!response.ok || !result?.success) {
              setMessage({
                tone: "error",
                text:
                  result?.message ??
                  "The subscription was approved by PayPal but could not be stored.",
              });
              return;
            }

            setMessage({
              tone: "success",
              text: "Your subscription is active. Booking and video calls are unlocked.",
            });
          },
          onError(error) {
            console.error("PayPal button error:", error);
            setMessage({
              tone: "error",
              text: "PayPal could not start the subscription flow.",
            });
          },
        })
        .render("#paypal-subscription-button");
    };

    if (existingScript) {
      void renderButtons();
      return;
    }

    const script = document.createElement("script");
    script.src = sdkUrl.toString();
    script.async = true;
    script.onload = () => {
      void renderButtons();
    };
    script.onerror = () => {
      setMessage({
        tone: "error",
        text: "PayPal could not be loaded.",
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <main className="min-h-dvh bg-slate-50 px-5 py-10 text-slate-950">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Student subscription
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Unlock booking and video sessions
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Subscribe with PayPal to access student booking and video-call
            features. PayPal securely hosts the subscription approval flow.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div
            id="paypal-subscription-button"
            className="min-h-[48px]"
            aria-busy={!isReady}
          />
          {!isReady && !message ? (
            <p className="text-sm text-slate-500">Loading PayPal...</p>
          ) : null}
        </div>

        {message ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}
      </section>
    </main>
  );
}
