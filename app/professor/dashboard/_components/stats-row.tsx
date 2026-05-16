import { Users, CalendarDays, Star, Euro } from "lucide-react";

type StatsRowProps = {
  students: number;
  monthlyEarnings: number;
  sessionCount: number;
  todaySessionCount: number;
  rating: number;
};

function Card({
  icon,
  label,
  value,
  sub,
  color,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}>) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: "#fff",
        padding: "18px",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "130px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: `${color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color,
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>{label}</span>
      </div>
      <div>
        <div style={{ fontSize: "26px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
          {value}
        </div>
        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "4px 0 0" }}>{sub}</p>
      </div>
    </div>
  );
}

export function StatsRow({ students, monthlyEarnings, sessionCount, todaySessionCount, rating }: Readonly<StatsRowProps>) {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <Card
        icon={<Users size={18} />}
        label="Studentë Aktivë"
        value={String(students)}
        sub="Të regjistruar në kurset e tua"
        color="#3B82F6"
      />
      <Card
        icon={<Euro size={18} />}
        label="Fitime Mujore"
        value={`€${monthlyEarnings.toFixed(0)}`}
        sub="Të ardhura këtë muaj"
        color="#10B981"
      />
      <Card
        icon={<CalendarDays size={18} />}
        label="Sesione Këtë Muaj"
        value={String(sessionCount)}
        sub={`${todaySessionCount} sot`}
        color="#F59E0B"
      />
      <Card
        icon={<Star size={18} />}
        label="Vlerësimi Mesatar"
        value={rating > 0 ? rating.toFixed(1) : "—"}
        sub="Bazuar në vlerësimet e studentëve"
        color="#A855F7"
      />
    </div>
  );
}
