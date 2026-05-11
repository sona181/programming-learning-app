"use client";

import { useState } from "react";

interface PersonalInfoProps {
    name: string;
    bio?: string;
    specialties?: string;
}

export default function PersonalInfo({
    name,
    bio,
    specialties,
}: PersonalInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: name || "",
        bio: bio || "",
        specialties: specialties || "",
    });
    const [saved, setSaved] = useState({
        name: name || "",
        bio: bio || "",
        specialties: specialties || "",
    });

    const handleSave = async () => {
        const res = await fetch("/api/professor/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: form.name,
                bio: form.bio,
                specialties: form.specialties,
            }),
        });
        if (res.ok) {
            setSaved({
                name: form.name,
                bio: form.bio,
                specialties: form.specialties,
            });
            setIsEditing(false);
        }
    };

    return (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, color: "#000", margin: 0 }}>Personal Information</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                        background: isEditing ? "#e5e7eb" : "#7C3AED",
                        color: isEditing ? "#000" : "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 16px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    {isEditing ? "Cancel" : "Edit Profile"}
                </button>
            </div>

            {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                        { label: "Full Name", key: "name" },
                        { label: "Bio", key: "bio" },
                        { label: "Specialties", key: "specialties" },
                    ].map(({ label, key }) => (
                        <div key={key}>
                            <label style={{ fontSize: 13, color: "#6b7280", marginBottom: 4, display: "block" }}>{label}</label>
                            {key === "bio" ? (
                                <textarea
                                    rows={3}
                                    value={form[key as keyof typeof form]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "8px 12px", fontSize: 14, color: "#000", resize: "vertical", boxSizing: "border-box" }}
                                />
                            ) : (
                                <input
                                    value={form[key as keyof typeof form]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "8px 12px", fontSize: 14, color: "#000", boxSizing: "border-box" }}
                                />
                            )}
                        </div>
                    ))}
                    <button
                        onClick={handleSave}
                        style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontWeight: 700, cursor: "pointer", marginTop: 4 }}
                    >
                        Save Changes
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Row label="Full Name" value={saved.name || "—"} />
                    <Row label="Bio" value={saved.bio || "—"} />
                    <div>
                        <span style={{ fontSize: 13, color: "#6b7280" }}>Specialties</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                            {saved.specialties ? (
                                <span style={{ background: "#EDE9FE", color: "#7C3AED", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                                    {saved.specialties}
                                </span>
                            ) : (
                                <span style={{ color: "#9ca3af", fontSize: 14 }}>—</span>
                            )}
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
            <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{value}</span>
        </div>
    );
}