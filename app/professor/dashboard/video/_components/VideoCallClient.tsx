"use client";

import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

type Session = {
  id: string;
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  topic: string | null;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  startsAt: string;
};

function canJoin(startsAt: string) {
  const diff = new Date(startsAt).getTime() - Date.now();
  return diff <= 15 * 60 * 1000;
}

function SessionCard({ s }: Readonly<{ s: Session }>) {
  const router = useRouter();
  const joinable = canJoin(s.startsAt);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        border: joinable ? "2px solid #7C3AED" : "1px solid #E5E7EB",
        boxShadow: joinable ? "0 4px 20px rgba(124,58,237,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Left: avatar + info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: s.avatarColor, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 16, flexShrink: 0,
          }}
        >
          {s.studentInitials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
            {s.studentName}
          </div>
          {s.topic && (
            <div style={{ fontSize: 13, color: "#7C3AED", fontWeight: 500, marginBottom: 2 }}>
              {s.topic}
            </div>
          )}
          <div style={{ fontSize: 13, color: "#6B7280" }}>
            {s.dateLabel} · {s.timeLabel} · {s.durationMin} min
          </div>
        </div>
      </div>

      {/* Right: join button */}
      <button
        onClick={() => router.push(`/sessions/${s.id}/call`)}
        disabled={!joinable}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 12, border: "none",
          background: joinable ? "#7C3AED" : "#E5E7EB",
          color: joinable ? "#fff" : "#9CA3AF",
          fontWeight: 700, fontSize: 14,
          cursor: joinable ? "pointer" : "not-allowed",
          whiteSpace: "nowrap",
          transition: "background 0.2s",
        }}
      >
        <Video size={16} />
        {joinable ? "Fillo Sesionin" : "Nuk ka filluar"}
      </button>
    </div>
  );
}

export default function VideoCallClient({ sessions }: Readonly<{ sessions: Session[] }>) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>
          Video Call
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>
          Sesionet e konfirmuara — bashkohu 15 minuta para fillimit
        </p>
      </div>

      {sessions.length === 0 ? (
        <div
          style={{
            background: "#fff", borderRadius: 16, padding: "48px 32px",
            textAlign: "center", border: "1px solid #E5E7EB",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>
            Nuk ka sesione të planifikuara
          </p>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Kur studentët rezervojnë sesione dhe ti i konfirmon, do të shfaqen këtu.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sessions.map((s) => (
            <SessionCard key={s.id} s={s} />
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 20 }}>
        Butoni aktivizohet 15 minuta para fillimit të sesionit.
      </p>
    </div>
  );
}
