"use client";

import { useState } from "react";
import { BookOpen, CheckCircle, Loader2, Eye } from "lucide-react";
import type { CourseState } from "./CourseWizard";

const STATUS_OPTIONS = [
  {
    value: "draft",
    icon: <BookOpen size={20} />,
    label: "Draft",
    description: "Ruaj si draft — vetëm ti mund ta shohësh.",
    color: "#6B7280",
    bg: "#F3F4F6",
    border: "#D1D5DB",
  },
  {
    value: "published",
    icon: <CheckCircle size={20} />,
    label: "Publiko Menjëherë",
    description: "Kursi bëhet i dukshëm për të gjithë studentët.",
    color: "#059669",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
];

export default function Step4Publish({
  state, update, onBack, onFinish,
}: {
  state: CourseState;
  update: (patch: Partial<CourseState>) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const initialStatus = state.status === "published" ? "published" : "draft";
  const [selected, setSelected] = useState<string>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalLessons = state.chapters.reduce((s, c) => s + c.lessons.length, 0);
  const totalExercises = state.chapters.reduce((s, c) => s + c.lessons.reduce((ls, l) => ls + l.exercises.length, 0), 0);
  const totalContent = state.chapters.reduce((s, c) => s + c.lessons.reduce((ls, l) => ls + l.contents.length, 0), 0);

  async function publish() {
    if (!state.courseId) { setError("Kursi nuk u gjet."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/professor/courses/${state.courseId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gabim."); return; }
      update({ status: data.status, slug: data.slug ?? state.slug });
      setSuccess(selected === "published" ? "Kursi u publikua dhe tani shfaqet te Shfleto Kurset." : "Kursi u ruajt si draft.");
      setTimeout(() => onFinish(), 1200);
    } catch { setError("Gabim rrjeti. Provo sërish."); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Publikimi</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>Shiko përmbledhjen dhe zgjidh statusin e kursit.</p>
      </div>

      {/* Summary card */}
      <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", border: "1px solid #E5E7EB", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 80, height: 52, borderRadius: 10, background: state.thumbnailUrl ? `url(${state.thumbnailUrl}) center/cover` : "linear-gradient(135deg, #6f33e3, #9c72f0)", flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>{state.title || "Pa titull"}</h3>
            {state.description && <p style={{ fontSize: 13, color: "#6B7280", margin: 0, maxWidth: 480 }}>{state.description.slice(0, 120)}{state.description.length > 120 ? "…" : ""}</p>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Kapitujt", value: state.chapters.length },
            { label: "Mësimet", value: totalLessons },
            { label: "Blloqe Përmbajtjeje", value: totalContent },
            { label: "Ushtrime", value: totalExercises },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#F8F7FF", borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid #EDE9FE" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#7C3AED" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[
            ["Niveli", state.level],
            ["Gjuha", state.language.toUpperCase()],
            ["Çmimi", state.isPremium ? `€${state.price ?? 0}` : "Falas"],
          ].map(([k, v]) => (
            <div key={k} style={{ fontSize: 12, color: "#374151" }}>
              <span style={{ color: "#9CA3AF" }}>{k}: </span><strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Status selection */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Zgjidh Statusin</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 20px", borderRadius: 14, textAlign: "left",
                border: selected === opt.value ? `2px solid ${opt.border}` : "2px solid #E5E7EB",
                background: selected === opt.value ? opt.bg : "#fff",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <span style={{ color: opt.color }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selected === opt.value ? opt.color : "#111827" }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{opt.description}</div>
              </div>
              <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", border: selected === opt.value ? `6px solid ${opt.color}` : "2px solid #D1D5DB", background: "#fff" }} />
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ← Kthehu
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => window.open(`/courses`, "_blank")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            <Eye size={15} /> Shiko si Student
          </button>
          <button
            onClick={publish} disabled={saving || !state.courseId}
            style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
          >
            {saving ? <><Loader2 size={16} /> Duke ruajtur...</> : "Ruaj Kursin ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
