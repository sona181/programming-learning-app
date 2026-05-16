"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, unknown>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: unknown) => void;
        onCancel: () => void;
      }) => { render: (el: HTMLElement) => Promise<void> };
    };
  }
}

interface Props {
  readonly courseId: string;
  readonly courseSlug: string;
  readonly isPremium: boolean;
  readonly price: number;
  readonly ctaText: string;
  readonly isLoggedIn: boolean;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  isPremium,
  price,
  ctaText,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  async function handleFreeEnroll() {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = (await res.json()) as { success: boolean; message?: string; firstLessonUrl?: string };
      if (!res.ok || !data.success) {
        setMsg({ type: "error", text: data.message ?? "Ndodhi një gabim." });
      } else {
        router.push(data.firstLessonUrl ?? `/course/${courseSlug}/0/0/0`);
      }
    } catch {
      setMsg({ type: "error", text: "Lidhja dështoi. Provo përsëri." });
    } finally {
      setLoading(false);
    }
  }

  function openPaymentModal() {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    hasRendered.current = false;
    setSdkReady(false);
    setMsg(null);
    setShowModal(true);
  }

  useEffect(() => {
    if (!showModal || !isPremium) return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setMsg({ type: "error", text: "PayPal nuk është konfiguruar." });
      return;
    }

    const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture&components=buttons`;

    const renderButtons = async () => {
      if (hasRendered.current || !window.paypal || !containerRef.current) return;
      hasRendered.current = true;
      setSdkReady(true);
      containerRef.current.innerHTML = "";

      await window.paypal
        .Buttons({
          style: { layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 44 },
          async createOrder() {
            const res = await fetch(`/api/courses/${courseId}/checkout`, { method: "POST" });
            const data = (await res.json()) as { success: boolean; orderId?: string; message?: string };
            if (!data.success || !data.orderId) throw new Error(data.message ?? "Gabim");
            return data.orderId;
          },
          async onApprove({ orderID }) {
            const res = await fetch(`/api/courses/${courseId}/checkout/capture`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: orderID }),
            });
            const data = (await res.json()) as { success: boolean; firstLessonUrl?: string; message?: string };
            if (!data.success) {
              setMsg({ type: "error", text: data.message ?? "Pagesa dështoi." });
              return;
            }
            setShowModal(false);
            router.push(data.firstLessonUrl ?? `/course/${courseSlug}/0/0/0`);
          },
          onError(err) {
            console.error("PayPal error:", err);
            setMsg({ type: "error", text: "PayPal ndeshe një gabim. Provo përsëri." });
          },
          onCancel() {
            setShowModal(false);
          },
        })
        .render(containerRef.current);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${sdkUrl}"]`);
    if (existing) {
      void renderButtons();
      return;
    }

    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => void renderButtons();
    script.onerror = () => setMsg({ type: "error", text: "PayPal nuk mund të ngarkohet." });
    document.body.appendChild(script);
  }, [showModal, courseId, courseSlug, isPremium]);

  return (
    <>
      {/* Main CTA button */}
      <button
        onClick={isPremium ? openPaymentModal : handleFreeEnroll}
        disabled={loading}
        style={{
          display: "block",
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          background: loading ? "#9F7AEA" : "#7C3AED",
          color: "#fff",
          fontWeight: 800,
          fontSize: 15,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          textAlign: "center",
          marginBottom: 14,
          boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          transition: "background 0.15s",
        }}
      >
        {loading ? "Duke u regjistruar..." : ctaText}
      </button>

      {msg && !showModal && (
        <div
          style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13,
            background: msg.type === "error" ? "#FEE2E2" : "#D1FAE5",
            color: msg.type === "error" ? "#991B1B" : "#065F46",
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Payment modal */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff", borderRadius: 22,
              padding: "32px 28px", maxWidth: 420, width: "100%",
              boxShadow: "0 30px 90px rgba(0,0,0,0.25)",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Pagesë e sigurt · PayPal
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>
                Përfundo blerjen
              </h3>
            </div>

            {/* Price */}
            <div
              style={{
                background: "#F5F3FF", borderRadius: 12,
                padding: "14px 16px", marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, color: "#6B7280" }}>Çmimi i kursit</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#7C3AED" }}>
                €{price.toFixed(2)}
              </span>
            </div>

            {/* PayPal button container */}
            {!sdkReady && !msg && (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: "#9CA3AF" }}>
                Duke ngarkuar PayPal...
              </div>
            )}
            <div ref={containerRef} style={{ minHeight: sdkReady ? 44 : 0 }} />

            {/* Error / success message */}
            {msg && (
              <div
                style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  background: msg.type === "error" ? "#FEE2E2" : "#D1FAE5",
                  color: msg.type === "error" ? "#991B1B" : "#065F46",
                }}
              >
                {msg.text}
              </div>
            )}

            {/* Cancel button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 16, width: "100%", padding: "12px",
                borderRadius: 12, border: "1px solid #E5E7EB",
                background: "#fff", color: "#6B7280",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Anulo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
