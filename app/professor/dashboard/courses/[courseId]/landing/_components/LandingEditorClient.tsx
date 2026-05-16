"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RotateCcw, Eye, Save, Loader2, Plus, Trash2, ChevronDown, ChevronRight, ArrowLeft, CheckCircle } from "lucide-react";
import type { LandingContent } from "@/app/professor/courses/new/_components/CourseWizard";

type Context = {
  subtitle: string; targetAudienceInput: string; prerequisitesInput: string;
  learnInput: string; estimatedDuration: string;
  professorBio: string; professorCredentials: string; promotionalVideoUrl: string;
};

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
  background: "#fff", borderRadius: 16, padding: "20px 24px",
  border: "1px solid #E5E7EB", marginBottom: 16,
};

function StringListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={item}
            onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "0 6px" }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        <Plus size={12} /> Shto
      </button>
    </div>
  );
}

function FaqEditor({ items, onChange }: { items: { question: string; answer: string }[]; onChange: (v: typeof items) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <label style={labelStyle}>FAQ</label>
      {items.map((item, i) => (
        <div key={i} style={{ borderRadius: 10, border: "1px solid #E5E7EB", marginBottom: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: "#F9FAFB", gap: 8 }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6B7280" }}>
              {open === i ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
            <input style={{ ...inputStyle, flex: 1, fontWeight: 600, fontSize: 13, border: "none", background: "transparent", padding: "0 4px" }}
              placeholder="Pyetja…" value={item.question}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; onChange(n); }} />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={13} /></button>
          </div>
          {open === i && (
            <div style={{ padding: "10px 14px" }}>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Përgjigja…"
                value={item.answer}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; onChange(n); }} />
            </div>
          )}
        </div>
      ))}
      <button onClick={() => onChange([...items, { question: "", answer: "" }])}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        <Plus size={12} /> Shto Pyetje
      </button>
    </div>
  );
}

function emptyLanding(): LandingContent {
  return { heroTitle: "", heroSubtitle: "", description: "", whatYouWillLearn: [], benefits: [], targetAudience: [], prerequisites: [], curriculumSummary: [], faq: [], seoTitle: "", seoDescription: "", ctaText: "" };
}

export default function LandingEditorClient({
  courseId, courseTitle, courseSlug, initialContext, initialLanding, isAiGenerated, lastGeneratedAt,
}: {
  courseId: string; courseTitle: string; courseSlug: string;
  initialContext: Context; initialLanding: LandingContent | null;
  isAiGenerated: boolean; lastGeneratedAt: string | null;
}) {
  const router = useRouter();
  const [ctx, setCtx] = useState<Context>(initialContext);
  const [landing, setLanding] = useState<LandingContent>(initialLanding ?? emptyLanding());
  const [hasLanding, setHasLanding] = useState(!!initialLanding);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateCtx(patch: Partial<Context>) { setCtx((c) => ({ ...c, ...patch })); }

  function set<K extends keyof LandingContent>(key: K, value: LandingContent[K]) {
    setLanding((l) => ({ ...l, [key]: value }));
  }

  async function generate() {
    setGenerating(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/professor/courses/${courseId}/generate-landing`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctx),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gabim nga AI."); return; }
      setLanding({
        heroTitle: data.heroTitle ?? "", heroSubtitle: data.heroSubtitle ?? "",
        description: data.description ?? "", whatYouWillLearn: data.whatYouWillLearn ?? [],
        benefits: data.benefits ?? [], targetAudience: data.targetAudience ?? [],
        prerequisites: data.prerequisites ?? [], curriculumSummary: data.curriculumSummary ?? [],
        faq: data.faq ?? [], seoTitle: data.seoTitle ?? "",
        seoDescription: data.seoDescription ?? "", ctaText: data.ctaText ?? "",
      });
      setHasLanding(true);
      setSuccess("Gjeneruar me sukses! Edito sipas dëshirës.");
    } catch { setError("Gabim rrjeti."); }
    finally { setGenerating(false); }
  }

  async function save() {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/professor/courses/${courseId}/landing`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ctx, ...landing }),
      });
      if (!res.ok) { setError("Gabim gjatë ruajtjes."); return; }
      setSuccess("Faqja u ruajt!");
    } catch { setError("Gabim rrjeti."); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={() => router.push("/professor/courses")}
            style={{ background: "none", border: "none", color: "#7C3AED", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={14} /> Kurset e mia
          </button>
          <span style={{ color: "#D1D5DB" }}>/</span>
          <span style={{ fontSize: 13, color: "#374151" }}>{courseTitle}</span>
          <span style={{ color: "#D1D5DB" }}>/</span>
          <span style={{ fontSize: 13, color: "#7C3AED", fontWeight: 600 }}>Faqja e Kursit</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Edito Faqen e Kursit</h2>
            {isAiGenerated && lastGeneratedAt && (
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: "3px 0 0" }}>
                AI e gjeneroi: {new Date(lastGeneratedAt).toLocaleDateString("sq-AL")}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.open(`/course/${courseSlug}?preview=1`, "_blank")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Eye size={14} /> Preview
            </button>
            <button onClick={save} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {saving ? <Loader2 size={14} /> : <Save size={14} />}
              {saving ? "Duke ruajtur…" : "Ruaj"}
            </button>
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: "#059669", fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle size={14} /> {success}</p>}

      {/* Context */}
      <div style={{ ...cardStyle, background: "#FEFCE8", border: "1px solid #FDE68A" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} /> Konteksti për AI
          </div>
          <button onClick={generate} disabled={generating}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: generating ? "#E5E7EB" : "#7C3AED", color: generating ? "#9CA3AF" : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {generating ? <Loader2 size={14} /> : hasLanding ? <RotateCcw size={14} /> : <Sparkles size={14} />}
            {generating ? "Duke gjeneruar…" : hasLanding ? "Rigjeneroj" : "Gjeneroj me AI"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle}>Nëntitulli</label>
            <input style={inputStyle} value={ctx.subtitle} onChange={(e) => updateCtx({ subtitle: e.target.value })} /></div>
          <div><label style={labelStyle}>Kohëzgjatja</label>
            <input style={inputStyle} value={ctx.estimatedDuration} onChange={(e) => updateCtx({ estimatedDuration: e.target.value })} /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Audienca e synuar</label>
            <input style={inputStyle} value={ctx.targetAudienceInput} onChange={(e) => updateCtx({ targetAudienceInput: e.target.value })} /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Çfarë do të mësojnë</label>
            <input style={inputStyle} value={ctx.learnInput} onChange={(e) => updateCtx({ learnInput: e.target.value })} /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Parakushtet</label>
            <input style={inputStyle} value={ctx.prerequisitesInput} onChange={(e) => updateCtx({ prerequisitesInput: e.target.value })} /></div>
          <div><label style={labelStyle}>Bio e profesorit</label>
            <textarea style={{ ...inputStyle, minHeight: 55, resize: "vertical" }} value={ctx.professorBio} onChange={(e) => updateCtx({ professorBio: e.target.value })} /></div>
          <div><label style={labelStyle}>Kredencialet</label>
            <input style={inputStyle} value={ctx.professorCredentials} onChange={(e) => updateCtx({ professorCredentials: e.target.value })} /></div>
        </div>
      </div>

      {/* Landing content editor */}
      {hasLanding && (
        <>
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>Hero Section</div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Titulli Hero</label>
              <input style={inputStyle} value={landing.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Nëntitulli Hero</label>
              <input style={inputStyle} value={landing.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Përshkrimi Marketing</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={landing.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={cardStyle}><StringListEditor label="Çfarë do të mësoni" items={landing.whatYouWillLearn} onChange={(v) => set("whatYouWillLearn", v)} /></div>
            <div style={cardStyle}><StringListEditor label="Përfitimet" items={landing.benefits} onChange={(v) => set("benefits", v)} /></div>
            <div style={cardStyle}><StringListEditor label="Audienca" items={landing.targetAudience} onChange={(v) => set("targetAudience", v)} /></div>
            <div style={cardStyle}><StringListEditor label="Parakushtet" items={landing.prerequisites} onChange={(v) => set("prerequisites", v)} /></div>
          </div>

          <div style={cardStyle}><StringListEditor label="Përmbledhja e Kurrikulës" items={landing.curriculumSummary} onChange={(v) => set("curriculumSummary", v)} /></div>
          <div style={cardStyle}><FaqEditor items={landing.faq} onChange={(v) => set("faq", v)} /></div>

          <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>CTA Text</label>
              <input style={inputStyle} value={landing.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>SEO Title ({landing.seoTitle.length}/60)</label>
              <input style={inputStyle} maxLength={70} value={landing.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>SEO Description ({landing.seoDescription.length}/160)</label>
              <input style={inputStyle} maxLength={170} value={landing.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Video Promocionale URL</label>
              <input style={inputStyle} value={ctx.promotionalVideoUrl} onChange={(e) => updateCtx({ promotionalVideoUrl: e.target.value })} placeholder="https://youtube.com/embed/..." />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button onClick={() => window.open(`/course/${courseSlug}?preview=1`, "_blank")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <Eye size={14} /> Shiko si Student
            </button>
            <button onClick={save} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {saving ? <Loader2 size={14} /> : <Save size={14} />}
              {saving ? "Duke ruajtur…" : "Ruaj Faqen"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
