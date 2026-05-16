"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

interface Props {
  readonly lessonId: string;
  readonly courseSlug: string;
  readonly nextLessonId: string | null;
  readonly isAlreadyCompleted: boolean;
}

export default function MarkCompleteBtn({ lessonId, courseSlug, nextLessonId, isAlreadyCompleted }: Props) {
  const router = useRouter();
  const [done, setDone] = useState(isAlreadyCompleted);
  const [loading, setLoading] = useState(false);

  async function markComplete() {
    if (done || loading) return;
    setLoading(true);
    try {
      await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
      setDone(true);
      router.refresh();
      if (nextLessonId) router.push(`/course/${courseSlug}/learn/${nextLessonId}`);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "12px 18px", borderRadius: 14,
        background: "rgba(16,185,129,0.1)",
        border: "1px solid rgba(16,185,129,0.25)",
        color: "#10B981", fontSize: 13, fontWeight: 700,
      }}>
        <CheckCircle size={15} /> Kompletuar
      </div>
    );
  }

  return (
    <button
      onClick={() => void markComplete()}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "12px 18px", borderRadius: 14,
        background: loading ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.08)",
        border: loading ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(16,185,129,0.2)",
        color: loading ? "rgba(255,255,255,0.3)" : "#10B981",
        fontSize: 13, fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {loading ? <Loader2 size={14} /> : <CheckCircle size={14} />}
      {loading ? "Duke shënuar..." : "Shëno si Kompletuar"}
    </button>
  );
}
