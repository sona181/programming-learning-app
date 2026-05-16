export const dynamic = "force-dynamic";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, Eye, Edit3, CheckCircle, AlertCircle, Layout } from "lucide-react";

function statusBadge(status: string) {
  if (status === "published") return { label: "Publikuar", color: "#059669", bg: "#D1FAE5" };
  return { label: "Draft", color: "#6B7280", bg: "#F3F4F6" };
}

function StatusIcon({ status }: { status: string }) {
  if (status === "published") return <CheckCircle size={14} />;
  return <AlertCircle size={14} />;
}

export default async function ProfessorCoursesPage() {
  const session = await getCurrentSessionUser();
  if (session?.role !== "instructor") redirect("/auth/login");

  const courses = await prisma.course.findMany({
    where: { authorId: session.id },
    include: {
      category: { select: { name: true } },
      _count: { select: { chapters: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a1a3a", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/professor/dashboard" style={{ color: "#a78bfa", fontSize: 13, textDecoration: "none" }}>
            ← Dashboard
          </Link>
          <span style={{ color: "#4B5563", fontSize: 13 }}>/</span>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>My Courses</span>
        </div>
        <Link
          href="/professor/courses/new"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #6f33e3, #743ee4)",
            color: "#fff", padding: "10px 20px", borderRadius: 12,
            fontWeight: 700, fontSize: 14, textDecoration: "none",
            boxShadow: "0 4px 12px rgba(111,51,227,0.35)",
          }}
        >
          <Plus size={16} /> New Course
        </Link>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>My Courses</h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>
            {courses.length} {courses.length === 1 ? "kurs" : "kurse"} totale
          </p>
        </div>

        {courses.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: "64px 32px", textAlign: "center", border: "1px solid #E5E7EB" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F3F0FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <BookOpen size={32} color="#7C3AED" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
              Nuk ke ende asnjë kurs
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>
              Krijo kursin tënd të parë dhe fillo të mësuarit.
            </p>
            <Link
              href="/professor/courses/new"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#7C3AED", color: "#fff",
                padding: "12px 24px", borderRadius: 12,
                fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}
            >
              <Plus size={16} /> Krijo Kursin e Parë
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {courses.map((course) => {
              const badge = statusBadge(course.status);
              return (
                <div
                  key={course.id}
                  style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  {/* Thumbnail */}
                  <div style={{ height: 140, background: course.thumbnailUrl ? `url(${course.thumbnailUrl}) center/cover` : "linear-gradient(135deg, #6f33e3, #9c72f0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {!course.thumbnailUrl && <BookOpen size={40} color="rgba(255,255,255,0.6)" />}
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    {/* Status badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg }}>
                        <StatusIcon status={course.status} /> {badge.label}
                      </span>
                      {course.category && (
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{course.category.name}</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 4px", lineHeight: 1.4 }}>
                      {course.title}
                    </h3>

                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6B7280", margin: "8px 0 16px" }}>
                      <span>{course._count.chapters} kapituj</span>
                      <span>{course._count.enrollments} studentë</span>
                      <span style={{ textTransform: "capitalize" }}>{course.level}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          href={`/professor/courses/new?courseId=${course.id}`}
                          style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center", padding: "8px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none" }}
                        >
                          <Edit3 size={14} /> Edito
                        </Link>
                        <Link
                          href={`/course/${course.slug}?preview=1`}
                          style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center", padding: "8px", borderRadius: 10, border: "1px solid #7C3AED", fontSize: 13, fontWeight: 600, color: "#7C3AED", textDecoration: "none" }}
                        >
                          <Eye size={14} /> Shiko
                        </Link>
                      </div>
                      <Link
                        href={`/professor/dashboard/courses/${course.id}/landing`}
                        style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", padding: "8px", borderRadius: 10, border: "1px solid #6f33e3", fontSize: 13, fontWeight: 600, color: "#6f33e3", textDecoration: "none", background: "#F5F0FF" }}
                      >
                        <Layout size={14} /> Edito Faqen e Kursit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
