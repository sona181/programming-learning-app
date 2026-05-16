"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import type { Category, CourseState } from "./CourseWizard";

const LEVELS = [
  { value: "beginner", label: "Fillestar" },
  { value: "intermediate", label: "Mesatar" },
  { value: "advanced", label: "Avancuar" },
];
const LANGUAGES = [
  { value: "sq", label: "Shqip" },
  { value: "en", label: "English" },
  { value: "it", label: "Italiano" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
  background: "#fff", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" };
const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 20 };

export default function Step1BasicInfo({
  state, update, categories, onNext,
}: {
  state: CourseState;
  update: (patch: Partial<CourseState>) => void;
  categories: Category[];
  onNext: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !state.courseId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("assetType", "image");
      const res = await fetch(`/api/professor/courses/${state.courseId}/assets`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        update({ thumbnailUrl: data.fileUrl });
        // also persist to course
        await fetch(`/api/professor/courses/${state.courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thumbnailUrl: data.fileUrl }),
        });
      }
    } finally { setUploading(false); }
  }

  async function save() {
    setError("");
    if (!state.title.trim()) { setError("Titulli është i detyrueshëm."); return; }
    setSaving(true);
    try {
      if (state.courseId) {
        // update existing
        await fetch(`/api/professor/courses/${state.courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: state.title, description: state.description,
            categoryId: state.categoryId || null, level: state.level,
            language: state.language, isPremium: state.isPremium,
            price: state.isPremium ? state.price : null,
          }),
        });
      } else {
        // create new
        const res = await fetch("/api/professor/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: state.title, description: state.description,
            categoryId: state.categoryId || null, level: state.level,
            language: state.language, isPremium: state.isPremium,
            price: state.isPremium ? state.price : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Gabim."); return; }
        update({ courseId: data.id, slug: data.slug ?? "" });
      }
      onNext();
    } catch { setError("Gabim rrjeti."); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Informacioni Bazë</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>Jep detajet kryesore të kursit tënd.</p>
      </div>

      <div style={cardStyle}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Titulli i Kursit *</label>
          <input
            style={inputStyle} placeholder="p.sh. JavaScript për Fillestarë"
            value={state.title}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Përshkrimi</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            placeholder="Çfarë do të mësojnë studentët..."
            value={state.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Kategoria</label>
            <select style={inputStyle} value={state.categoryId} onChange={(e) => update({ categoryId: e.target.value })}>
              <option value="">— Zgjidh —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Niveli</label>
            <select style={inputStyle} value={state.level} onChange={(e) => update({ level: e.target.value })}>
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Gjuha</label>
            <select style={inputStyle} value={state.language} onChange={(e) => update({ language: e.target.value })}>
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        {/* Premium toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: state.isPremium ? 16 : 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => update({ isPremium: !state.isPremium })}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: state.isPremium ? "#7C3AED" : "#D1D5DB",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: state.isPremium ? 22 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Kurs Premium</span>
          </label>
        </div>

        {state.isPremium && (
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Çmimi (€)</label>
            <input
              style={{ ...inputStyle, width: 160 }} type="number" min={0} step={0.01}
              placeholder="29.99"
              value={state.price ?? ""}
              onChange={(e) => update({ price: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div style={cardStyle}>
        <label style={labelStyle}>Thumbnail (imazh kopertinë)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {state.thumbnailUrl ? (
            <img src={state.thumbnailUrl} alt="thumbnail" style={{ width: 120, height: 72, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }} />
          ) : (
            <div style={{ width: 120, height: 72, borderRadius: 8, background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #C4B5FD" }}>
              <Upload size={24} color="#7C3AED" />
            </div>
          )}
          <div>
            {!state.courseId ? (
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
                Ruaj informacionin bazë fillimisht për të ngarkuar imazhin.
              </p>
            ) : (
              <>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "#F3F0FF", color: "#7C3AED", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Duke ngarkuar..." : "Ngarko imazh"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbUpload} disabled={uploading} />
                </label>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>JPG, PNG, WebP · max 5 MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 16px" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={save} disabled={saving}
          style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
        >
          {saving ? <><Loader2 size={16} /> Duke ruajtur...</> : "Ruaj dhe Vazhdo →"}
        </button>
      </div>
    </div>
  );
}
