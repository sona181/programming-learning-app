"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, Eye, Save, Loader2, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { CourseState, LandingContent } from "./CourseWizard";

// ─── tiny helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #D1D5DB", fontSize: 13, color: "#111827",
  background: "#fff", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block",
  marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5,
};
const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: "22px 24px",
  border: "1px solid #E5E7EB", marginBottom: 16,
};

function StringListEditor({
  label, items, onChange,
}: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "0 6px" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
      >
        <Plus size={12} /> Shto
      </button>
    </div>
  );
}

function FaqEditor({
  items, onChange,
}: { items: { question: string; answer: string }[]; onChange: (v: { question: string; answer: string }[]) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <label style={labelStyle}>FAQ</label>
      {items.map((item, i) => (
        <div key={i} style={{ borderRadius: 10, border: "1px solid #E5E7EB", marginBottom: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: "#F9FAFB", gap: 8 }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6B7280" }}>
              {open === i ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
            <input
              style={{ ...inputStyle, flex: 1, fontWeight: 600, fontSize: 13, border: "none", background: "transparent", padding: "0 4px" }}
              placeholder="Pyetja…"
              value={item.question}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; onChange(n); }}
            />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
              <Trash2 size={13} />
            </button>
          </div>
          {open === i && (
            <div style={{ padding: "10px 14px" }}>
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontSize: 13 }}
                placeholder="Përgjigja…"
                value={item.answer}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; onChange(n); }}
              />
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { question: "", answer: "" }])}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
      >
        <Plus size={12} /> Shto Pyetje
      </button>
    </div>
  );
}

// ─── Context input panel (feeds the AI) ─────────────────────────────────────

function ContextPanel({ state, update }: { state: CourseState; update: (p: Partial<CourseState>) => void }) {
  return (
    <div style={{ ...cardStyle, background: "#FEFCE8", border: "1px solid #FDE68A" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <Sparkles size={15} /> Konteksti për AI — plotëso para se të gjenerosh
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Nëntitulli (subtitle)</label>
          <input style={inputStyle} placeholder="p.sh. Mëso JavaScript nga zero" value={state.subtitle} onChange={(e) => update({ subtitle: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Kohëzgjatja e vlerësuar</label>
          <input style={inputStyle} placeholder="p.sh. 12 orë" value={state.estimatedDuration} onChange={(e) => update({ estimatedDuration: e.target.value })} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Audienca e synuar</label>
          <input style={inputStyle} placeholder="p.sh. Fillestarë pa eksperiencë programimi" value={state.targetAudienceInput} onChange={(e) => update({ targetAudienceInput: e.target.value })} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Çfarë do të mësojnë (çelësa, me presje)</label>
          <input style={inputStyle} placeholder="p.sh. Variables, funksione, klasa, REST API" value={state.learnInput} onChange={(e) => update({ learnInput: e.target.value })} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Parakushtet</label>
          <input style={inputStyle} placeholder="p.sh. Njohuri bazë kompjuteri" value={state.prerequisitesInput} onChange={(e) => update({ prerequisitesInput: e.target.value })} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Bio e profesorit (opsionale)</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Rreth profesorit…" value={state.professorBio} onChange={(e) => update({ professorBio: e.target.value })} />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Kredencialet e profesorit</label>
          <input style={inputStyle} placeholder="p.sh. 10 vjet eksperiencë, MSc Informatikë" value={state.professorCredentials} onChange={(e) => update({ professorCredentials: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ─── Landing editor ──────────────────────────────────────────────────────────

function LandingEditor({ landing, onChange }: { landing: LandingContent; onChange: (l: LandingContent) => void }) {
  function set<K extends keyof LandingContent>(key: K, value: LandingContent[K]) {
    onChange({ ...landing, [key]: value });
  }

  return (
    <div>
      {/* Hero */}
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>Hero Section</div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Titulli Hero</label>
          <input style={inputStyle} value={landing.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Nëntitulli Hero</label>
          <input style={inputStyle} value={landing.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Përshkrimi Marketing</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={landing.description} onChange={(e) => set("description", e.target.value)} />
        </div>
      </div>

      {/* What you'll learn + Benefits */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <StringListEditor label="Çfarë do të mësoni" items={landing.whatYouWillLearn} onChange={(v) => set("whatYouWillLearn", v)} />
        </div>
        <div style={cardStyle}>
          <StringListEditor label="Përfitimet" items={landing.benefits} onChange={(v) => set("benefits", v)} />
        </div>
        <div style={cardStyle}>
          <StringListEditor label="Audienca e synuar" items={landing.targetAudience} onChange={(v) => set("targetAudience", v)} />
        </div>
        <div style={cardStyle}>
          <StringListEditor label="Parakushtet" items={landing.prerequisites} onChange={(v) => set("prerequisites", v)} />
        </div>
      </div>

      {/* Curriculum summary */}
      <div style={cardStyle}>
        <StringListEditor label="Përmbledhja e Kurrikulës" items={landing.curriculumSummary} onChange={(v) => set("curriculumSummary", v)} />
      </div>

      {/* FAQ */}
      <div style={cardStyle}>
        <FaqEditor items={landing.faq} onChange={(v) => set("faq", v)} />
      </div>

      {/* CTA + SEO */}
      <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={labelStyle}>Teksti CTA (Call-to-Action)</label>
          <input style={inputStyle} value={landing.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>SEO Title (max 60 karaktere)</label>
          <input style={inputStyle} maxLength={70} value={landing.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          <span style={{ fontSize: 11, color: landing.seoTitle.length > 60 ? "#DC2626" : "#9CA3AF" }}>{landing.seoTitle.length}/60</span>
        </div>
        <div>
          <label style={labelStyle}>SEO Përshkrimi (max 160 karaktere)</label>
          <input style={inputStyle} maxLength={170} value={landing.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
          <span style={{ fontSize: 11, color: landing.seoDescription.length > 160 ? "#DC2626" : "#9CA3AF" }}>{landing.seoDescription.length}/160</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Step 4 ─────────────────────────────────────────────────────────────

export default function Step4Landing({
  state, update, onBack, onNext,
}: {
  state: CourseState;
  update: (patch: Partial<CourseState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function generate() {
    if (!state.courseId) { setError("Kursi duhet të krijohet fillimisht (hapi 1)."); return; }
    setGenerating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/professor/courses/${state.courseId}/generate-landing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtitle: state.subtitle,
          targetAudienceInput: state.targetAudienceInput,
          prerequisitesInput: state.prerequisitesInput,
          learnInput: state.learnInput,
          estimatedDuration: state.estimatedDuration,
          professorBio: state.professorBio,
          professorCredentials: state.professorCredentials,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gabim nga AI."); return; }

      update({
        landing: {
          heroTitle: data.heroTitle ?? "",
          heroSubtitle: data.heroSubtitle ?? "",
          description: data.description ?? "",
          whatYouWillLearn: data.whatYouWillLearn ?? [],
          benefits: data.benefits ?? [],
          targetAudience: data.targetAudience ?? [],
          prerequisites: data.prerequisites ?? [],
          curriculumSummary: data.curriculumSummary ?? [],
          faq: data.faq ?? [],
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
          ctaText: data.ctaText ?? "",
        },
      });
      setSuccess("Faqja u gjenerua me sukses! Edito sipas dëshirës.");
    } catch { setError("Gabim rrjeti. Kontrollo lidhjen dhe provo sërish."); }
    finally { setGenerating(false); }
  }

  async function save() {
    if (!state.courseId || !state.landing) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await fetch(`/api/professor/courses/${state.courseId}/landing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtitle: state.subtitle,
          targetAudienceInput: state.targetAudienceInput,
          prerequisitesInput: state.prerequisitesInput,
          learnInput: state.learnInput,
          estimatedDuration: state.estimatedDuration,
          professorBio: state.professorBio,
          professorCredentials: state.professorCredentials,
          promotionalVideoUrl: state.promotionalVideoUrl,
          ...state.landing,
        }),
      });
      setSuccess("Faqja u ruajt!");
    } catch { setError("Gabim rrjeti."); }
    finally { setSaving(false); }
  }

  async function saveAndNext() {
    await save();
    onNext();
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Faqja e Kursit</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>
          Gjeneroni faqen e kursit me AI dhe editoni çdo pjesë.
        </p>
      </div>

      {/* Context inputs */}
      <ContextPanel state={state} update={update} />

      {/* AI action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          onClick={generate} disabled={generating || !state.courseId}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            opacity: generating || !state.courseId ? 0.6 : 1,
            boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
          }}
        >
          {generating ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
          {generating ? "Duke gjeneruar…" : state.landing ? "Rigjeneroj me AI" : "Gjeneroj me AI"}
        </button>

        {state.landing && (
          <>
            <button
              onClick={() => window.open(`/course/${state.slug || state.courseId}?preview=1`, "_blank")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              <Eye size={14} /> Shiko si Student
            </button>
            <button
              onClick={save} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, border: "1px solid #7C3AED", background: "#F5F3FF", color: "#7C3AED", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              {saving ? <Loader2 size={14} /> : <Save size={14} />}
              {saving ? "Duke ruajtur…" : "Ruaj Draft"}
            </button>
          </>
        )}
      </div>

      {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#059669", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>✓ {success}</p>}

      {/* Editor */}
      {state.landing ? (
        <LandingEditor
          landing={state.landing}
          onChange={(l) => update({ landing: l })}
        />
      ) : (
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 32px", textAlign: "center", border: "2px dashed #C4B5FD" }}>
          <Sparkles size={36} color="#C4B5FD" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>
            Faqja nuk është gjeneruar ende
          </p>
          <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
            Plotëso kontekstin sipër dhe kliko "Gjeneroj me AI" për të krijuar draftin.
          </p>
        </div>
      )}

      {/* Promotional video */}
      {state.landing && (
        <div style={{ ...cardStyle, marginTop: 16 }}>
          <label style={labelStyle}>Video Promocionale (URL opsionale)</label>
          <input
            style={inputStyle}
            placeholder="https://youtube.com/embed/..."
            value={state.promotionalVideoUrl}
            onChange={(e) => update({ promotionalVideoUrl: e.target.value })}
          />
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>
            YouTube embed URL ose çdo iframe-compatible URL
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ← Kthehu
        </button>
        <button
          onClick={saveAndNext} disabled={saving}
          style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
        >
          {saving ? <><Loader2 size={16} /> Duke ruajtur…</> : "Ruaj dhe Vazhdo →"}
        </button>
      </div>
    </div>
  );
}
