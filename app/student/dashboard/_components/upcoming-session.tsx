"use client";

import { Video } from "lucide-react";
import { useRouter } from "next/navigation";

type UpcomingSessionProps = {
  session: {
    id: string;
    professorName: string;
    courseTitle: string;
    startsAt: string;
    durationMinutes: number;
    initials: string;
  } | null;
};

function formatSessionTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function UpcomingSession({ session }: Readonly<UpcomingSessionProps>) {
  const router = useRouter();

  return (
    <section>
      <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 12px" }}>
        Upcoming Session
      </h3>

      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "18px",
        }}
      >
        {session ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#a855f7",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                {session.initials}
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>{session.professorName}</div>
                <div style={{ color: "#64748b", fontSize: "13px" }}>{session.courseTitle}</div>
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "14px",
                borderRadius: "12px",
                textAlign: "center",
                marginTop: "16px",
                fontWeight: 800,
              }}
            >
              {formatSessionTime(session.startsAt)}
              <div style={{ fontSize: "12px", fontWeight: 500 }}>
                {session.durationMinutes} min session
              </div>
            </div>

            <button
              onClick={() => router.push(`/sessions/${session.id}/call`)}
              style={{
                marginTop: "12px",
                width: "100%",
                border: "none",
                background: "#2563eb",
                color: "white",
                padding: "12px",
                borderRadius: "10px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Video size={18} />
              Join Session
            </button>
          </>
        ) : (
          <div style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
            No upcoming sessions yet. Book a professor session when you are ready for live help.
          </div>
        )}
      </div>
    </section>
  );
}
