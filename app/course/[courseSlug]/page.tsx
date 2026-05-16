export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCourse } from "@/lib/course";
import { notFound } from "next/navigation";
import Link from "next/link";
import PathOverviewShell from "@/components/academy/path-overview-shell";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { BookOpen, Clock, Users, Star, CheckCircle, ChevronDown, Play, Lock } from "lucide-react";
import CourseReviews, { type CourseReviewView } from "./_components/course-reviews";
import EnrollButton from "./_components/EnrollButton";
import MiniCourseCard from "./_components/MiniCourseCard";

type Props = {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ userId?: string; preview?: string }>;
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Fillestar", intermediate: "Mesatar", advanced: "Avancuar",
};

// ── Nav header ──────────────────────────────────────────────────────────────

function CoursePageNav({
  dashboardHref,
  userName,
}: Readonly<{ dashboardHref: string; userName: string | null }>) {
  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 40px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 28, height: 28, background: "#2563EB", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="12,4 23,9.5 12,15 1,9.5" fill="white" />
            <path d="M6 11.5v5.5c0 0 2 2.5 6 2.5s6-2.5 6-2.5V11.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#111827", marginRight: 16 }}>UniLearn</span>

        <Link
          href={dashboardHref}
          style={{
            fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none",
            padding: "5px 12px", borderRadius: 8, background: "#F3F4F6",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" />
          </svg>
          Dashboard
        </Link>

        <Link
          href="/courses"
          style={{
            fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none",
            padding: "5px 12px", borderRadius: 8,
          }}
        >
          Shfleto Kurset
        </Link>
      </div>

      {userName && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 13, color: "#374151", fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#7C3AED",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 700,
            }}
          >
            {userName.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase()}
          </div>
          {userName.split(" ")[0]}
        </div>
      )}
    </nav>
  );
}

const LANG_LABEL: Record<string, string> = {
  sq: "Shqip", en: "English", it: "Italiano",
};

function StickyCourseInfoCard({
  promotionalVideoUrl,
  thumbnailUrl,
  title,
  isPremium,
  price,
  isEnrolled,
  enrollHref,
  ctaText,
  totalLessons,
  chapterCount,
  benefits,
}: Readonly<{
  promotionalVideoUrl?: string | null;
  thumbnailUrl?: string | null;
  title: string;
  isPremium: boolean;
  price: unknown;
  isEnrolled: boolean;
  enrollHref: string;
  ctaText: string;
  totalLessons: number;
  chapterCount: number;
  benefits: string[];
}>) {
  const included = [
    `${totalLessons} mësime video/tekst`,
    `${chapterCount} kapituj`,
    "Qasje gjatë gjithë kohës",
    "Certifikatë pas përfundimit",
    ...(isPremium ? [] : ["Kurs falas"]),
    ...benefits.slice(0, 3),
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", color: "#111827", boxShadow: "0 20px 60px rgba(0,0,0,0.16)", border: "1px solid #E5E7EB" }}>
      {promotionalVideoUrl ? (
        <iframe
          src={promotionalVideoUrl}
          title={`${title} promotional video`}
          style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, border: "none", marginBottom: 20 }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, background: "linear-gradient(135deg, #6f33e3, #9c72f0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Play size={40} color="rgba(255,255,255,0.65)" />
        </div>
      )}

      <div style={{ fontSize: 28, fontWeight: 800, color: isPremium ? "#111827" : "#059669", marginBottom: 8 }}>
        {isPremium ? `€${Number(price ?? 0).toFixed(2)}` : "Falas"}
      </div>

      {isEnrolled ? (
        <div style={{ background: "#D1FAE5", borderRadius: 12, padding: "12px 20px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#059669", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <CheckCircle size={16} /> I regjistruar
        </div>
      ) : (
        <Link
          href={enrollHref}
          style={{ display: "block", padding: "14px", borderRadius: 14, background: "#7C3AED", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", textAlign: "center", marginBottom: 14, boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}
        >
          {ctaText}
        </Link>
      )}

      <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Çfarë përfshin
        </div>
        {included.map((item, i) => (
          <div key={`${item}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 8 }}>
            <CheckCircle size={14} color="#059669" /> {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { courseSlug } = await params;
  const { preview } = await searchParams;

  // Try DB-backed course first
  const session = await getCurrentSessionUser();

  const dbCourse = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      author: { include: { profile: true, instructorProfile: true } },
      category: true,
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, lessonType: true, isFreePreview: true, durationSeconds: true },
          },
        },
      },
      landingPage: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (dbCourse) {
    if (dbCourse.status !== "published" && !preview) notFound();

    const lp = dbCourse.landingPage;
    const [isEnrolledRecord, otherInstructorCourses, myEnrollments] = await Promise.all([
      session
        ? prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.id, courseId: dbCourse.id } } })
        : null,
      prisma.course.findMany({
        where: { authorId: dbCourse.authorId, status: "published", NOT: { id: dbCourse.id } },
        select: {
          id: true, slug: true, title: true, thumbnailUrl: true,
          isPremium: true, price: true, level: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      session
        ? prisma.enrollment.findMany({
            where: { userId: session.id, NOT: { courseId: dbCourse.id } },
            include: {
              course: {
                select: {
                  id: true, slug: true, title: true, thumbnailUrl: true,
                  isPremium: true, price: true, level: true,
                  _count: { select: { enrollments: true } },
                },
              },
            },
            orderBy: { enrolledAt: "desc" },
            take: 4,
          })
        : [],
    ]);

    const isEnrolled = !!isEnrolledRecord;
    const isCourseAuthor = session?.id === dbCourse.authorId;
    const firstLessonId = dbCourse.chapters[0]?.lessons[0]?.id ?? null;
    const continueLessonUrl = firstLessonId ? `/course/${courseSlug}/learn/${firstLessonId}` : null;

    const totalLessons = dbCourse.chapters.reduce((s, c) => s + c.lessons.length, 0);
    const instructorName = dbCourse.author.profile?.displayName ?? dbCourse.author.email;
    const instructorRating = dbCourse.author.instructorProfile?.rating
      ? Number(dbCourse.author.instructorProfile.rating)
      : null;
    // course_reviews table not yet migrated — empty until migration runs
    const serializedReviews: CourseReviewView[] = [];
    const reviewCount = 0;
    const displayRating = instructorRating;

    const dashboardHref =
      session?.role === "instructor" || session?.role === "professor"
        ? "/professor/dashboard"
        : "/student/dashboard";
    const sessionProfile = session
      ? await prisma.user.findUnique({
          where: { id: session.id },
          select: { profile: { select: { displayName: true } }, email: true },
        })
      : null;
    const navUserName = sessionProfile?.profile?.displayName ?? sessionProfile?.email ?? null;

    const heroTitle = lp?.heroTitle || dbCourse.title;
    const heroSubtitle = lp?.heroSubtitle || dbCourse.description || "";
    const ctaText = lp?.ctaText || (dbCourse.isPremium ? `Regjistrohu – €${dbCourse.price}` : "Regjistrohu Falas");

    const whatYouWillLearn: string[] = Array.isArray(lp?.whatYouWillLearn) ? lp.whatYouWillLearn as string[] : [];
    const benefits: string[] = Array.isArray(lp?.benefits) ? lp.benefits as string[] : [];
    const prerequisites: string[] = Array.isArray(lp?.prerequisites) ? lp.prerequisites as string[] : [];
    const targetAudience: string[] = Array.isArray(lp?.targetAudience) ? lp.targetAudience as string[] : [];
    const faq: { question: string; answer: string }[] = Array.isArray(lp?.faq) ? lp.faq as { question: string; answer: string }[] : [];

    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

        <CoursePageNav dashboardHref={dashboardHref} userName={navUserName} />

        {/* ── HERO ── */}
        <div style={{ background: "linear-gradient(135deg, #1a1a3a 0%, #2d1b6b 100%)", color: "#fff", padding: "56px 40px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }}>

            {/* Left */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {dbCourse.category && (
                  <span style={{ padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600 }}>
                    {dbCourse.category.name}
                  </span>
                )}
                <span style={{ padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.10)", fontSize: 12 }}>
                  {LEVEL_LABEL[dbCourse.level] ?? dbCourse.level}
                </span>
                <span style={{ padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.10)", fontSize: 12 }}>
                  {LANG_LABEL[dbCourse.language] ?? dbCourse.language}
                </span>
              </div>

              <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.25 }}>{heroTitle}</h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", margin: "0 0 24px", lineHeight: 1.6 }}>{heroSubtitle}</p>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
                {displayRating && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <strong>{displayRating.toFixed(1)}</strong>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                  <Users size={15} /> {dbCourse._count.enrollments} studentë
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                  <BookOpen size={15} /> {totalLessons} mësime
                </div>
                {lp?.estimatedDuration && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                    <Clock size={15} /> {lp.estimatedDuration}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                Instruktor: <Link href={`/instructors/${dbCourse.authorId}`} style={{ color: "#fff", fontWeight: 700, textDecoration: "none" }}>{instructorName}</Link>
                {dbCourse.author.instructorProfile?.specialties && (
                  <span style={{ color: "rgba(255,255,255,0.6)" }}> · {dbCourse.author.instructorProfile.specialties}</span>
                )}
              </div>
            </div>

            {/* Right — pricing card */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", color: "#111827", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
              {lp?.promotionalVideoUrl ? (
                <iframe
                  src={lp.promotionalVideoUrl}
                  style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, border: "none", marginBottom: 20 }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : dbCourse.thumbnailUrl ? (
                <img src={dbCourse.thumbnailUrl} alt={dbCourse.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, background: "linear-gradient(135deg, #6f33e3, #9c72f0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Play size={40} color="rgba(255,255,255,0.6)" />
                </div>
              )}

              <div style={{ fontSize: 28, fontWeight: 800, color: dbCourse.isPremium ? "#111827" : "#059669", marginBottom: 4 }}>
                {dbCourse.isPremium ? `€${Number(dbCourse.price).toFixed(2)}` : "Falas"}
              </div>

              {isEnrolled && continueLessonUrl ? (
                <Link
                  href={continueLessonUrl}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 14, background: "#059669", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", textAlign: "center", marginBottom: 14, boxShadow: "0 4px 14px rgba(5,150,105,0.35)" }}
                >
                  <CheckCircle size={18} /> Vazhdo Kursin →
                </Link>
              ) : isCourseAuthor && continueLessonUrl ? (
                <Link
                  href={continueLessonUrl}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 14, background: "#7C3AED", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", textAlign: "center", marginBottom: 14, boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}
                >
                  Testo Mësimet (si student) →
                </Link>
              ) : (
                <EnrollButton
                  courseId={dbCourse.id}
                  courseSlug={dbCourse.slug}
                  isPremium={dbCourse.isPremium}
                  price={dbCourse.price ? Number(dbCourse.price) : 0}
                  ctaText={ctaText}
                  isLoggedIn={!!session}
                />
              )}

              <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Çfarë përfshin</div>
                {[
                  `${totalLessons} mësime video/tekst`,
                  `${dbCourse.chapters.length} kapituj`,
                  "Qasje gjatë gjithë kohës",
                  "Certifikatë pas përfundimit",
                  ...(benefits.slice(0, 3)),
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 6 }}>
                    <CheckCircle size={14} color="#059669" /> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px" }}>
          <div>

            {whatYouWillLearn.length > 0 && (
              <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 18px" }}>Çfarë do të mësoni</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {whatYouWillLearn.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#374151" }}>
                      <CheckCircle size={16} color="#7C3AED" style={{ flexShrink: 0, marginTop: 2 }} /> {item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {targetAudience.length > 0 && (
              <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>Ky kurs është për</h2>
                {targetAudience.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", marginBottom: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED", flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </section>
            )}

            <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>Kurrikula</h2>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 18px" }}>
                {dbCourse.chapters.length} kapituj · {totalLessons} mësime
              </p>
              {dbCourse.chapters.map((ch) => (
                <details key={ch.id} style={{ marginBottom: 8, borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                  <summary style={{ padding: "14px 18px", fontWeight: 700, fontSize: 14, color: "#111827", cursor: "pointer", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "space-between", listStyle: "none" }}>
                    <span>{ch.title}</span>
                    <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>{ch.lessons.length} mësime</span>
                  </summary>
                  <div style={{ padding: "4px 0" }}>
                    {ch.lessons.map((l) => (
                      <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px", borderTop: "1px solid #F3F4F6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                          {l.isFreePreview
                            ? <Play size={14} color="#7C3AED" />
                            : <Lock size={13} color="#9CA3AF" />}
                          {l.title}
                          {l.isFreePreview && <span style={{ fontSize: 10, color: "#7C3AED", fontWeight: 700, background: "#F5F3FF", padding: "2px 6px", borderRadius: 99 }}>Preview</span>}
                        </div>
                        {l.durationSeconds && (
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                            {Math.ceil(l.durationSeconds / 60)} min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </section>

            {prerequisites.length > 0 && (
              <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>Parakushtet</h2>
                {prerequisites.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", marginBottom: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D97706", flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </section>
            )}

            {faq.length > 0 && (
              <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 18px" }}>Pyetjet e shpeshta</h2>
                {faq.map((item, i) => (
                  <details key={i} style={{ marginBottom: 8, borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                    <summary style={{ padding: "14px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", background: "#F9FAFB", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {item.question} <ChevronDown size={16} color="#9CA3AF" />
                    </summary>
                    <p style={{ padding: "14px 18px", margin: 0, fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{item.answer}</p>
                  </details>
                ))}
              </section>
            )}

            <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 18px" }}>Instrukori</h2>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
                  {instructorName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <Link href={`/instructors/${dbCourse.authorId}`} style={{ fontWeight: 700, fontSize: 16, color: "#111827", textDecoration: "none" }}>{instructorName}</Link>
                  {dbCourse.author.instructorProfile?.specialties && (
                    <div style={{ fontSize: 13, color: "#7C3AED", marginBottom: 6 }}>{dbCourse.author.instructorProfile.specialties}</div>
                  )}
                  {lp?.professorCredentials && (
                    <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>{lp.professorCredentials}</div>
                  )}
                  {lp?.professorBio
                    ? <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>{lp.professorBio}</p>
                    : dbCourse.author.profile?.bio && <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>{dbCourse.author.profile.bio}</p>
                  }
                </div>
              </div>
            </section>

            <CourseReviews
              courseId={dbCourse.id}
              initialReviews={serializedReviews}
              initialAverageRating={null}
              initialReviewCount={reviewCount}
              canReview={session?.role === "student" && isEnrolled}
              isLoggedIn={!!session}
              isStudent={session?.role === "student"}
              isEnrolled={isEnrolled}
            />
          </div>

          {/* Sticky sidebar */}
          <div style={{ display: "none" }}>
            <StickyCourseInfoCard
              promotionalVideoUrl={lp?.promotionalVideoUrl}
              thumbnailUrl={dbCourse.thumbnailUrl}
              title={dbCourse.title}
              isPremium={dbCourse.isPremium}
              price={dbCourse.price}
              isEnrolled={isEnrolled}
              enrollHref=""
              ctaText={ctaText}
              totalLessons={totalLessons}
              chapterCount={dbCourse.chapters.length}
              benefits={benefits}
            />
            {/*
            <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #E5E7EB", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: dbCourse!.isPremium ? "#111827" : "#059669", marginBottom: 14 }}>
                {dbCourse.isPremium ? `€${Number(dbCourse.price).toFixed(2)}` : "Falas"}
              </div>
              {isEnrolled ? (
                <div style={{ background: "#D1FAE5", borderRadius: 12, padding: "12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <CheckCircle size={16} /> I regjistruar
                </div>
              ) : (
                <Link
                  href={enrollHref}
                  style={{ display: "block", padding: "13px", borderRadius: 12, background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}
                >
                  {ctaText}
                </Link>
              )}
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                {[`${totalLessons} mësime`, `${dbCourse.chapters.length} kapituj`, "Qasje gjatë gjithë kohës", "Certifikatë"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                    <CheckCircle size={13} color="#059669" /> {f}
                  </div>
                ))}
              </div>
            </div>
            */}

          </div>
        </div>

        {/* ── More by instructor + My courses ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 48px" }}>

          {otherInstructorCourses.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>
                Kurse të tjera nga {instructorName}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {otherInstructorCourses.map((c) => (
                  <MiniCourseCard
                    key={c.id}
                    slug={c.slug}
                    title={c.title}
                    thumbnailUrl={c.thumbnailUrl}
                    isPremium={c.isPremium}
                    price={c.price ? Number(c.price) : null}
                    enrollmentCount={c._count.enrollments}
                    level={c.level}
                  />
                ))}
              </div>
            </section>
          )}

          {myEnrollments.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>
                Kurset e mia
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {myEnrollments.map((e) => (
                  <MiniCourseCard
                    key={e.course.id}
                    slug={e.course.slug}
                    title={e.course.title}
                    thumbnailUrl={e.course.thumbnailUrl}
                    isPremium={e.course.isPremium}
                    price={e.course.price ? Number(e.course.price) : null}
                    enrollmentCount={e.course._count.enrollments}
                    level={e.course.level}
                  />
                ))}
              </div>
            </section>
          )}

          <Link href="/courses" style={{ fontSize: 13, color: "#7C3AED", textDecoration: "none" }}>
            ← Kthehu tek kurset
          </Link>
        </div>
      </div>
    );
  }

  // Legacy: course from local data file
  const legacy = getCourse(courseSlug);
  if (!legacy) notFound();
  return <PathOverviewShell course={legacy} />;
}
