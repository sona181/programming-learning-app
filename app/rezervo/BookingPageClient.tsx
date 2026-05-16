"use client";

import { Search, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Instructor = {
  id: string;
  userId: string;
  name: string;
  specialties: string;
  hourlyRate: number;
  rating: number;
  isSubscribed: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "P";
}

const AVATAR_COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"];

function avatarColor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function BookingPageClient({
  initialInstructors,
  currentUserId,
}: {
  initialInstructors: Instructor[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = [...initialInstructors].sort((a, b) => {
      if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1;
      return b.rating - a.rating;
    });

    if (!normalized) return sorted;

    return sorted.filter((instructor) =>
      `${instructor.name} ${instructor.specialties}`.toLowerCase().includes(normalized),
    );
  }, [initialInstructors, query]);

  const subscribedCount = initialInstructors.filter((instructor) => instructor.isSubscribed).length;

  return (
    <section style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111827" }}>
            Book a live session
          </h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
            Choose one of your subscribed teachers, or search for another available instructor.
          </p>
        </div>

        <div style={{ minWidth: 280, flex: "0 1 360px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 13, color: "#64748b" }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teachers..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #dbe3ef",
              borderRadius: 12,
              background: "white",
              color: "#111827",
              outline: "none",
              padding: "12px 14px 12px 42px",
              fontSize: 14,
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          />
        </div>
      </div>

      {!currentUserId && (
        <div style={{ border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", borderRadius: 14, padding: 14, marginBottom: 18, fontSize: 14 }}>
          Log in as a student to request a session after choosing an available time.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }} className="booking-teacher-grid">
        <SummaryCard label="Subscribed teachers" value={subscribedCount} />
        <SummaryCard label="Available instructors" value={initialInstructors.length} />
        <SummaryCard label="Safe booking hours" value="09:00-18:00" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginTop: 18 }} className="booking-teacher-grid">
        {filtered.map((instructor) => (
          <button
            key={instructor.id}
            onClick={() => router.push(`/instructors/${instructor.userId}`)}
            style={{
              textAlign: "left",
              background: "white",
              border: instructor.isSubscribed ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 18,
              cursor: "pointer",
              boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: avatarColor(instructor.name), color: "white", display: "grid", placeItems: "center", fontWeight: 900 }}>
                {getInitials(instructor.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#111827", fontWeight: 900, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Prof. {instructor.name}
                </div>
                <div style={{ color: "#64748b", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {instructor.specialties || "Live programming support"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, color: "#64748b", fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                {instructor.rating > 0 ? instructor.rating.toFixed(1) : "New"}
              </span>
              <span style={{ fontWeight: 800, color: "#2563eb" }}>
                EUR {instructor.hourlyRate.toFixed(0)}/session
              </span>
              {instructor.isSubscribed && (
                <span style={{ borderRadius: 999, background: "#dbeafe", color: "#1d4ed8", padding: "4px 9px", fontWeight: 800, fontSize: 12 }}>
                  Subscribed
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, color: "#64748b", marginTop: 18 }}>
          No teachers matched your search.
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .booking-teacher-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
        <Users size={18} />
      </div>
      <div>
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>{label}</div>
        <div style={{ color: "#111827", fontSize: 20, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  );
}
