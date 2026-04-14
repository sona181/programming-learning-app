import {
  Users,
  CalendarDays,
  Star,
  Euro,
} from "lucide-react";

type StatsRowProps = {
  students: number;
  sessions: number;
  rating: number;
  totalEarnings: number;
  monthlyEarnings: number;
};

function Card({ icon, label, value, desc, color }: any) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "200px",
        background: "#fff",
        padding: "18px",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "130px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </div>

        {/*TITLE FIXED */}
        <span
          style={{
            fontSize: "13px",
            color: "#111827",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>

      <div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#111827" }}>
          {value}
        </div>

        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

export const StatsRow = ({
  students,
  sessions,
  rating,
  totalEarnings,
  monthlyEarnings,
}: StatsRowProps) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
      }}
    >
      {/*STUDENTS */}
      <Card
        icon={<Users size={18} />}
        label="Students"
        value={students}
        desc="Total enrolled students"
        color="#3B82F6"
      />

      {/*EARNINGS */}
      <Card
        icon={<Euro size={18} />}
        label="Earnings"
        value={`€${totalEarnings}`}
        desc="All-time revenue"
        color="#10B981"
      />

      {/*SESSIONS */}
      <Card
        icon={<CalendarDays size={18} />}
        label="Sessions"
        value={sessions}
        desc="Completed sessions"
        color="#F59E0B"
      />

      {/* RATING */}
      <Card
        icon={<Star size={18} />}
        label="Rating"
        value={rating.toFixed(1)}
        desc="Average student rating"
        color="#A855F7"
      />
    </div>
  );
};