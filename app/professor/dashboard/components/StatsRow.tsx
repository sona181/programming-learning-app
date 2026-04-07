"use client";

import { Users, CalendarCheck, Star, Euro } from "lucide-react";

export default function StatsRow({
  students,
  sessions,
  rating,
  totalEarnings,
  monthlyEarnings,
}: {
  students: number;
  sessions: number;
  rating: number;
  totalEarnings: number;
  monthlyEarnings: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "25px",
        flexWrap: "wrap",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Card icon={<Users size={20} color="#7c3aed" />} label="Students" value={students} />

      <Card
        icon={<Euro size={20} color="#10b981" />}
        label="Monthly Total"
        value={`€${monthlyEarnings.toFixed(2)}`}
      />

      <Card
        icon={<CalendarCheck size={20} color="#f59e0b" />}
        label="Sessions"
        value={sessions}
      />

      <Card icon={<Star size={20} color="#facc15" />} label="Rating" value={rating} />
    </div>
  );
}

function Card({ icon, label, value }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "white",
        padding: "18px 22px",
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: "180px",
      }}
    >
      <div
        style={{
          background: "#ede9fe",
          padding: "10px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{label}</p>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{value}</h3>
      </div>
    </div>
  );
}