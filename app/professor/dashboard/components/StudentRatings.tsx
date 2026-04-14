"use client";

import React from "react";

type Session = {
  id?: string;
  student?: { name?: string; email?: string } | null;
  rating?: number | null;
};

export default function StudentRatings({ sessions }: { sessions: Session[] }) {
  return (
    <div style={{ marginTop: "20px", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <h3
        style={{
          marginBottom: "8px",
          fontSize: "20px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Student Ratings
      </h3>

      {/* Box */}
      <section
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {sessions.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No ratings yet</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {sessions.map((s, index) => {
              const student = s.student?.name ?? s.student?.email ?? "Student";
              const rating = s.rating ?? "—";

              return (
                <li
                  key={s.id ?? index} 
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#111827" }}>{student}</div>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{rating} ⭐</div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}