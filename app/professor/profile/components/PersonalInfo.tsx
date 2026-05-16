"use client";

import { useState } from "react";

interface PersonalInfoProps {
  name: string;
  bio?: string;
  specialties?: string;
  languages?: string;
  hourlyRate?: number | null;
  isAvailable?: boolean;
}

export default function PersonalInfo({
  name, bio, specialties, languages, hourlyRate, isAvailable,
}: PersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: name || "",
    bio: bio || "",
    specialties: specialties || "",
    languages: languages || "",
    hourlyRate: hourlyRate != null ? String(hourlyRate) : "",
    isAvailable: isAvailable ?? false,
  });
  const [saved, setSaved] = useState({ ...form });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true); setError("");
    const res = await fetch("/api/professor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        bio: form.bio,
        specialties: form.specialties,
        languages: form.languages,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        isAvailable: form.isAvailable,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved({ ...form });
      setIsEditing(false);
    } else {
      setError("Ruajtja dështoi. Provo sërish.");
    }
  }

  const specialtyTags = saved.specialties
    ? saved.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const languageTags = saved.languages
    ? saved.languages.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, color: "#111827", margin: 0 }}>Informacioni Profesional</h3>
        <button
          onClick={() => { setIsEditing(!isEditing); setError(""); }}
          style={{
            background: isEditing ? "#E5E7EB" : "#7C3AED",
            color: isEditing ? "#374151" : "#fff",
            border: "none", borderRadius: 8, padding: "6px 16px",
            fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}
        >
          {isEditing ? "Anulo" : "Ndrysho Profilin"}
        </button>
      </div>

      {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10 }}>{error}</p>}

      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Emri", key: "name", type: "input" },
            { label: "Bio Publike", key: "bio", type: "textarea" },
            { label: "Specializimet (presje mes tyre)", key: "specialties", type: "input" },
            { label: "Gjuhët (presje mes tyre)", key: "languages", type: "input" },
            { label: "Tarifa Orare (€/sesion)", key: "hourlyRate", type: "input" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ fontSize: 13, color: "#6B7280", marginBottom: 4, display: "block" }}>{label}</label>
              {type === "textarea" ? (
                <textarea
                  rows={3}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                />
              ) : (
                <input
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }}
                />
              )}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 13, color: "#6B7280" }}>Statusi</label>
            <button
              onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
              style={{
                padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: form.isAvailable ? "#D1FAE5" : "#F3F4F6",
                color: form.isAvailable ? "#059669" : "#6B7280",
              }}
            >
              {form.isAvailable ? "● I disponueshëm" : "● Joaktiv"}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 700, cursor: "pointer", marginTop: 4, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Duke ruajtur…" : "Ruaj Ndryshimet"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row label="Emri i plotë" value={saved.name || "—"} />
          <Row label="Bio Publike" value={saved.bio || "—"} />

          <div>
            <span style={{ fontSize: 13, color: "#6B7280", display: "block", marginBottom: 6 }}>Specializimet</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {specialtyTags.length > 0
                ? specialtyTags.map((s) => (
                    <span key={s} style={{ background: "#EDE9FE", color: "#7C3AED", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{s}</span>
                  ))
                : <span style={{ color: "#9CA3AF", fontSize: 14 }}>—</span>}
            </div>
          </div>

          <div>
            <span style={{ fontSize: 13, color: "#6B7280", display: "block", marginBottom: 6 }}>Gjuhët e Mësimdhënies</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {languageTags.length > 0
                ? languageTags.map((l) => (
                    <span key={l} style={{ background: "#F0FDF4", color: "#166534", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{l}</span>
                  ))
                : <span style={{ color: "#9CA3AF", fontSize: 14 }}>—</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <span style={{ fontSize: 13, color: "#6B7280", display: "block", marginBottom: 2 }}>Tarifa Orare</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {saved.hourlyRate ? `€${saved.hourlyRate}/sesion` : "—"}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, color: "#6B7280", display: "block", marginBottom: 2 }}>Statusi</span>
              <span style={{
                display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: saved.isAvailable ? "#D1FAE5" : "#F3F4F6",
                color: saved.isAvailable ? "#059669" : "#6B7280",
              }}>
                {saved.isAvailable ? "● I disponueshëm" : "● Joaktiv"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
