"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EditProfileFormProps = {
  initialValues: {
    name: string;
    country: string;
    bio: string;
    specialties: string;
    languages: string;
    hourlyRate: string;
    isAvailable: boolean;
  };
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#111827",
  background: "#fff",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#374151",
};

export default function EditProfileForm({ initialValues }: Readonly<EditProfileFormProps>) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/professor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          country: form.country.trim() || null,
          bio: form.bio.trim(),
          specialties: form.specialties.trim(),
          languages: form.languages.trim(),
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
          isAvailable: form.isAvailable,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Could not save profile. Please try again.");
        return;
      }

      router.push("/professor/profile");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        display: "grid",
        gap: "18px",
      }}
    >
      {error && (
        <div style={{ color: "#DC2626", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Display name</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Prof. name"
          />
        </div>

        <div>
          <label style={labelStyle}>Country</label>
          <input
            style={inputStyle}
            value={form.country}
            onChange={(event) => setField("country", event.target.value)}
            placeholder="Albania"
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Public bio</label>
        <textarea
          style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
          value={form.bio}
          onChange={(event) => setField("bio", event.target.value)}
          placeholder="Tell students about your teaching style and experience."
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Specialties</label>
          <input
            style={inputStyle}
            value={form.specialties}
            onChange={(event) => setField("specialties", event.target.value)}
            placeholder="Java, Web Development, Databases"
          />
        </div>

        <div>
          <label style={labelStyle}>Languages</label>
          <input
            style={inputStyle}
            value={form.languages}
            onChange={(event) => setField("languages", event.target.value)}
            placeholder="Shqip, English"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "end" }}>
        <div>
          <label style={labelStyle}>Hourly rate</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="0.01"
            value={form.hourlyRate}
            onChange={(event) => setField("hourlyRate", event.target.value)}
            placeholder="20"
          />
        </div>

        <button
          type="button"
          onClick={() => setField("isAvailable", !form.isAvailable)}
          style={{
            height: "42px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 800,
            background: form.isAvailable ? "#D1FAE5" : "#F3F4F6",
            color: form.isAvailable ? "#047857" : "#6B7280",
          }}
        >
          {form.isAvailable ? "Available for sessions" : "Not available"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "6px" }}>
        <button
          type="button"
          onClick={() => router.push("/professor/profile")}
          style={{
            border: "1px solid #E5E7EB",
            background: "#fff",
            color: "#374151",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          style={{
            border: "none",
            background: "#7C3AED",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
