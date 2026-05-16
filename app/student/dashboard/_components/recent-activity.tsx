import { Award, CheckCircle2, Target } from "lucide-react";
import type { ReactNode } from "react";

type Activity = {
  title: string;
  time: string;
  icon: ReactNode;
};

export default function RecentActivity({ activities }: Readonly<{ activities: Activity[] }>) {
  const visibleActivities =
    activities.length > 0
      ? activities
      : [
          { title: "No recent activity yet", time: "Start a lesson to see progress here", icon: <Target size={20} /> },
        ];

  return (
    <section>
      <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 12px" }}>
        Recent Activity
      </h3>

      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "16px",
        }}
      >
        {visibleActivities.map((activity, index) => (
          <div
            key={`${activity.title}-${index}`}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px 0",
              borderBottom: index !== visibleActivities.length - 1 ? "1px solid #e5e7eb" : "none",
            }}
          >
            <div style={{ color: "#2563eb", flexShrink: 0 }}>{activity.icon}</div>

            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                {activity.title}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const activityIcons = {
  badge: <Award size={20} />,
  lesson: <CheckCircle2 size={20} />,
  score: <Target size={20} />,
};
