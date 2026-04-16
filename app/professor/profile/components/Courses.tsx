export default function Courses({ courses }: any) {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          marginBottom: 16,
          fontWeight: 700,
          color: "#000",
        }}
      >
        My Courses
      </h3>

      {courses.map((course: any) => {
        const totalChapters = course.chapters.length;
        const totalStudents = course.enrollments.length;

        const progress = Math.min((totalStudents / 30) * 100, 100);
        const isActive = totalStudents > 20;

        return (
          <div
            key={course.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <b style={{ color: "#000", fontWeight: 700 }}>
                {course.title}
              </b>

              <span
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: isActive ? "#DCFCE7" : "#FEF3C7",
                  color: isActive ? "#166534" : "#92400E",
                }}
              >
                {isActive ? "Active" : "Draft"}
              </span>
            </div>

            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              {totalChapters} chapters • {totalStudents} students
            </p>
            <div
              style={{
                height: 6,
                background: "#E5E7EB",
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: isActive ? "#7C3AED" : "#F59E0B",
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}