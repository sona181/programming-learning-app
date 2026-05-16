import { BookOpen, Flame, Medal, Trophy } from "lucide-react";
import type { ReactNode } from "react";

type StatsRowProps = {
  courses: number;
  xp: number;
  lessons: number;
  badges: number;
};

type CardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  desc: string;
  color: string;
};

function Card({ icon, label, value, desc, color }: Readonly<CardProps>) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "20px",
        minHeight: "120px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: `${color}15`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: "26px", fontWeight: 900, color: "#111827" }}>{value}</div>
      <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}>{desc}</div>
    </div>
  );
}

export function StatsRow({ courses, xp, lessons, badges }: Readonly<StatsRowProps>) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: "16px",
        marginTop: "20px",
      }}
    >
      <Card
        icon={<BookOpen size={20} />}
        label="Active Courses"
        value={courses}
        desc={courses > 0 ? "Ready to continue" : "Browse courses to start"}
        color="#2563eb"
      />
      <Card
        icon={<Trophy size={20} />}
        label="XP Points"
        value={xp.toLocaleString("en-US")}
        desc="Earn more by learning"
        color="#10b981"
      />
      <Card
        icon={<Flame size={20} />}
        label="Lessons Completed"
        value={lessons}
        desc="Progress saved"
        color="#f59e0b"
      />
      <Card
        icon={<Medal size={20} />}
        label="Badges"
        value={badges}
        desc={badges > 0 ? "Unlocked achievements" : "Unlock your first badge"}
        color="#8b5cf6"
      />
    </section>
  );
}
