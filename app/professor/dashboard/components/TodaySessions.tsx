"use client";

import React from "react";

export default function TodaySessions({ sessions }: any) {
  return (
    <div style={{ marginTop: "20px", fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <h3 style={{ marginBottom: "10px", fontWeight: 600, fontSize: "20px", color: "#111827" }}>
        Today Sessions
      </h3>
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {sessions.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#111827" }}>No sessions today</p>
        ) : (
          sessions.map((s: any) => {
            const student = s.student;
            const initials = `${student?.email?.[0] || "S"}${student?.email?.split("@")[0][1] || "S"}`.toUpperCase();

            const statusColor =
              s.status === "CONFIRMED"
                ? "#10b981"
                : s.status === "PENDING"
                ? "#f59e0b"
                : "#ef4444";

            const bgColor =
              s.status === "CONFIRMED"
                ? "#d1fae5"
                : s.status === "PENDING"
                ? "#fef3c7"
                : "#fee2e2";

            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#f9fafb",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#7c3aed",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>
                      {student?.email || "Student"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#111827" }}>
                      Theme: {s.theme || "N/A"} | Time: {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: statusColor,
                    background: bgColor,
                  }}
                >
                  {s.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}