"use client";

import { Users, CalendarCheck, Star, Wallet } from "lucide-react";

export default function StatsRow({
  students,
  sessions,
  rating,
  totalEarnings
}: {
  students: number;
  sessions: number;
  rating: number;
  totalEarnings: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "25px",
        flexWrap: "wrap"
      }}
    >
      <Card icon={<Users size={18} />} label="Students" value={students} />

      <Card
        icon={<Wallet size={18} />}
        label="Total Earnings"
        value={"€" + totalEarnings}
      />

      <Card
        icon={<CalendarCheck size={18} />}
        label="Sessions"
        value={sessions}
      />

      <Card icon={<Star size={18} />} label="Rating" value={rating} />
    </div>
  );
}

function Card({ icon, label, value }: any) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "200px",
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ marginBottom: "10px" }}>{icon}</div>

      <h2 style={{ margin: 0 }}>{value}</h2>
      <p style={{ color: "gray", marginTop: "5px" }}>{label}</p>
    </div>
  );
}