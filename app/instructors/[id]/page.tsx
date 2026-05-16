export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InstructorBookingPanel from "./InstructorBookingPanel";

type Props = {
  params: Promise<{ id: string }>;
};

function initialsFor(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P"
  );
}

export default async function InstructorPublicPage({ params }: Props) {
  const { id } = await params;
  const sessionUser = await getCurrentSessionUser();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      instructorProfile: true,
      courses: {
        where: { status: "published" },
        include: { enrollments: true, chapters: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user?.instructorProfile) notFound();

  const instructor = user.instructorProfile;
  const displayName = user.profile?.displayName ?? "Professor";
  const totalStudents = user.courses.reduce((acc, course) => acc + course.enrollments.length, 0);
  const rating = Number(instructor.rating ?? 0);
  const specialties = instructor.specialties
    ? instructor.specialties.split(",").map((specialty) => specialty.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 30, fontFamily: "Inter, sans-serif" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          borderRadius: 24,
          padding: 30,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 20, alignItems: "center", minWidth: 0 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 30,
              flexShrink: 0,
            }}
          >
            {initialsFor(displayName)}
          </div>

          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>
              Prof. {displayName}
            </h1>
            {instructor.bio && (
              <p style={{ opacity: 0.92, margin: "8px 0 0", lineHeight: 1.6 }}>
                {instructor.bio}
              </p>
            )}
            {specialties.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {specialties.map((skill) => (
                  <span key={skill} style={{ background: "rgba(255,255,255,0.16)", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 900 }}>
            {rating > 0 ? rating.toFixed(1) : "New"}
          </div>
          <div style={{ marginTop: 4, opacity: 0.9 }}>{totalStudents} students</div>
          {instructor.hourlyRate && (
            <div style={{ marginTop: 4, opacity: 0.95, fontWeight: 800 }}>
              EUR {Number(instructor.hourlyRate)}/session
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              display: "inline-block",
              background: instructor.isAvailable ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.12)",
              color: instructor.isAvailable ? "#bbf7d0" : "rgba(255,255,255,0.7)",
              padding: "5px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {instructor.isAvailable ? "Available" : "Unavailable"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)", gap: 24 }} className="instructor-public-grid">
        <div style={{ minWidth: 0 }}>
          {instructor.bio && (
            <section style={panelStyle}>
              <h2 style={headingStyle}>About</h2>
              <p style={{ color: "#4b5563", lineHeight: 1.8, margin: 0 }}>{instructor.bio}</p>
            </section>
          )}

          <section style={panelStyle}>
            <h2 style={headingStyle}>Courses ({user.courses.length})</h2>
            {user.courses.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>No published courses yet.</p>
            ) : (
              user.courses.map((course) => (
                <div key={course.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <h3 style={{ fontWeight: 900, fontSize: 16, color: "#111827", margin: 0 }}>{course.title}</h3>
                    <span style={{ color: "#2563eb", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                      {course.enrollments.length} students
                    </span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 0" }}>
                    {course.chapters.length} chapters
                  </p>
                </div>
              ))
            )}
          </section>
        </div>

        <div style={{ minWidth: 0 }}>
          <InstructorBookingPanel
            currentUserId={sessionUser?.id ?? null}
            instructorProfileId={instructor.id}
          />

          <section style={{ ...panelStyle, marginTop: 24 }}>
            <h2 style={headingStyle}>Stats</h2>
            <StatRow label="Courses" value={user.courses.length} />
            <StatRow label="Students" value={totalStudents} />
            <StatRow label="Rating" value={rating > 0 ? rating.toFixed(1) : "New"} />
            {instructor.hourlyRate && <StatRow label="Rate" value={`EUR ${Number(instructor.hourlyRate)}/session`} />}
            {instructor.languages && <StatRow label="Languages" value={instructor.languages} />}
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .instructor-public-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: 10, marginBottom: 12, gap: 12 }}>
      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 900, color: "#111827", fontSize: 14, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 24,
  border: "1px solid #e5e7eb",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const headingStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  margin: "0 0 16px",
  color: "#111827",
};
