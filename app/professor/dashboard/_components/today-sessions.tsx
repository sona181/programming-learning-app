"use client";

import { useRouter } from "next/navigation";

type Session = {
  id: string;
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  topic: string | null;
  slotTime: string;
  status: string;
};

type StatusStyle = { color: string; background: string; label: string };

function statusStyle(status: string): StatusStyle {
  const s = status.toLowerCase();
  if (s === "confirmed") return { color: "#059669", background: "#D1FAE5", label: "Konfirmuar" };
  if (s === "pending")   return { color: "#D97706", background: "#FEF3C7", label: "Në pritje" };
  return { color: "#DC2626", background: "#FEE2E2", label: status };
}

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "16px",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "1px solid #F3F4F6",
};

function EmptyState() {
  return (
    <div style={cardStyle}>
      <p style={{ fontSize: "14px", color: "#9CA3AF", padding: "8px 0" }}>
        Nuk ka sesione për sot.
      </p>
    </div>
  );
}

function SessionRow({ s }: Readonly<{ s: Session }>) {
  const router = useRouter();
  const { color, background, label } = statusStyle(s.status);
  const topicLabel = s.topic ? ` — ${s.topic}` : "";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: "12px",
        marginBottom: "8px",
        background: "#F9FAFB",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: s.avatarColor, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px", flexShrink: 0,
          }}
        >
          {s.studentInitials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>
            {s.studentName}
          </div>
          <div style={{ fontSize: "13px", color: "#6B7280" }}>
            {s.slotTime}{topicLabel}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            padding: "4px 12px", borderRadius: "999px",
            fontSize: "12px", fontWeight: 600, color, background,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        {s.status === "confirmed" && (
          <button
            onClick={() => router.push(`/sessions/${s.id}/call`)}
            style={{
              padding: "4px 12px", borderRadius: "999px", border: "none",
              background: "#7C3AED", color: "#fff", fontSize: "12px",
              fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Fillo →
          </button>
        )}
      </div>
    </div>
  );
}

export default function TodaySessions({ sessions }: Readonly<{ sessions: Session[] }>) {
  const heading = (
    <h3 style={{ marginBottom: "10px", fontWeight: 700, fontSize: "18px", color: "#111827" }}>
      Sesionet e Sotme
    </h3>
  );

  if (sessions.length === 0) {
    return <div>{heading}<EmptyState /></div>;
  }

  return (
    <div>
      {heading}
      <div style={cardStyle}>
        {sessions.map((s) => <SessionRow key={s.id} s={s} />)}
      </div>
    </div>
  );
}
