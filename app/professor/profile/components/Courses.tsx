type CourseItem = {
  id: string;
  title: string;
  status: string;
  chapters: unknown[];
  enrollments: unknown[];
};

function statusBadge(status: string) {
  if (status === "published") return { label: "Aktiv", bg: "#DCFCE7", color: "#166534" };
  return { label: "Draft", bg: "#F3F4F6", color: "#6B7280" };
}

export default function Courses({ courses }: { courses: CourseItem[] }) {
  return (
    <div style={{
      flex: 1, background: "#fff", padding: 20,
      borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    }}>
      <h3 style={{ marginBottom: 16, fontWeight: 700, color: "#111827" }}>Kurset e Mia</h3>

      {courses.length === 0 && (
        <p style={{ fontSize: 14, color: "#9CA3AF" }}>Nuk ka kurse ende.</p>
      )}

      {courses.map((course) => {
        const badge = statusBadge(course.status);
        const totalStudents = course.enrollments.length;
        const progress = Math.min((totalStudents / 30) * 100, 100);

        return (
          <div key={course.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <b style={{ color: "#111827", fontWeight: 700 }}>{course.title}</b>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: badge.bg, color: badge.color, fontWeight: 600 }}>
                {badge.label}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              {course.chapters.length} kapituj · {totalStudents} studentë
            </p>
            <div style={{ height: 6, background: "#E5E7EB", borderRadius: 6, marginTop: 8 }}>
              <div style={{
                width: `${progress}%`, height: "100%", borderRadius: 6,
                background: course.status === "published" ? "#7C3AED" : "#9CA3AF",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
