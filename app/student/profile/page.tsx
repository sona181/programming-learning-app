export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Flame, Globe,
  MapPin, Clock, Award, CheckCircle, Pencil, Zap, Shield, Medal,
} from "lucide-react";

const LEVELS = [
  { level: 1, name: "Fillestar", min: 0 },
  { level: 2, name: "Nxënës", min: 300 },
  { level: 3, name: "Nxënës i Aftë", min: 700 },
  { level: 4, name: "Ekspert", min: 1400 },
  { level: 5, name: "Mjeshtër", min: 2500 },
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("sq-AL", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "S";
}

const BADGE_EMOJIS: Record<string, string> = {
  "Hapat e Parë": "🚀",
  "Nxënës i Shpejtë": "⚡",
  "Në Zjarr": "🔥",
  "Diamant": "💎",
  "Ekspert": "🎓",
};

export default async function StudentProfilePage() {
  const session = await getCurrentSessionUser();
  if (session?.role !== "student") redirect("/auth/login");

  const [
    user, xpAgg, xpHistory, streak, enrollments,
    certificates, badges, notifications, completedLessonsCount,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true, settings: true },
    }),
    prisma.xpLog.aggregate({ where: { userId: session.id }, _sum: { xpAmount: true } }),
    prisma.xpLog.findMany({
      where: { userId: session.id },
      orderBy: { earnedAt: "desc" },
      take: 6,
    }),
    prisma.userStreak.findUnique({ where: { userId: session.id } }),
    prisma.enrollment.findMany({
      where: { userId: session.id, status: { not: "cancelled" } },
      include: {
        course: { select: { title: true, slug: true, level: true } },
        courseProgress: true,
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId: session.id },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.userBadge.findMany({
      where: { userId: session.id },
      include: { badge: { select: { name: true, description: true } } },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.lessonProgress.count({
      where: { enrollment: { userId: session.id }, isCompleted: true },
    }),
  ]);

  const name = user?.profile?.displayName ?? user?.email?.split("@")[0] ?? "Student";
  const xp = xpAgg._sum.xpAmount ?? 0;
  const currentStreak = streak?.currentStreak ?? 0;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const lvl = getLevel(xp);
  const nextMin = LEVELS.find((l) => l.level === lvl.level + 1)?.min;
  const xpInLevel = xp - lvl.min;
  const xpToNext = nextMin ? nextMin - lvl.min : lvl.min;
  const lvlPct = nextMin ? Math.min(100, Math.round((xpInLevel / xpToNext) * 100)) : 100;

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%" }}>

      {/* ── Banner (greeting equivalent) ── */}
      <div style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #4f46e5 100%)",
        borderRadius: 16, padding: "28px 32px",
        marginBottom: 20, color: "#fff",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,255,255,0.2)",
          border: "3px solid rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 900, color: "#fff",
        }}>
          {getInitials(name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 2px", color: "#fff" }}>{name}</h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 14 }}>
            <span>{user?.email ?? session.email}</span>
            {user?.profile?.country && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={12} />{user.profile.country}
              </span>
            )}
            {user?.profile?.timezone && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Clock size={12} />{user.profile.timezone}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Niveli {lvl.level}: {lvl.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 420 }}>
            <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.2)", borderRadius: 999 }}>
              <div style={{ width: `${lvlPct}%`, height: "100%", background: "#fff", borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 700, flexShrink: 0 }}>
              {xp.toLocaleString()}{nextMin ? ` / ${nextMin.toLocaleString()} XP` : " XP"}
            </span>
          </div>
        </div>

        <Link href="/student/profile/edit" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 18px", borderRadius: 10,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff", fontSize: 13, fontWeight: 700,
          textDecoration: "none", flexShrink: 0,
        }}>
          <Pencil size={13} /> Ndrysho Profilin
        </Link>
      </div>

      {/* ── Stats Row (matches professor StatsRow exactly) ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Flame size={18} />} label="Radhazi Ditore" value={String(currentStreak)} sub="Ditë radhazi aktive" color="#F59E0B" />
        <StatCard icon={<Zap size={18} />} label="Pikë XP Totale" value={xp.toLocaleString()} sub="Të gjitha aktivitetet" color="#10B981" />
        <StatCard icon={<BookOpen size={18} />} label="Kurse të Regjistruara" value={String(enrollments.length)} sub={`${completedLessonsCount} mësime të kompletuara`} color="#3B82F6" />
        <StatCard icon={<Medal size={18} />} label="Medalje" value={String(badges.length)} sub="Arritje të fituara" color="#A855F7" />
      </div>

      {/* ── Row 1: Personal Info (full width) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ marginBottom: 10, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            Informacioni Personal
          </h3>
          <div style={{ background: "white", padding: 20, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            {user?.profile?.bio && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>Bio</label>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
                  {user.profile.bio}
                </p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <InfoField label="Shteti" value={user?.profile?.country ?? "—"} icon={<MapPin size={13} />} />
              <InfoField label="Zona Orare" value={user?.profile?.timezone ?? "—"} icon={<Clock size={13} />} />
              <InfoField label="Email" value={user?.email ?? session.email} icon={<Shield size={13} />} />
              <InfoField label="Gjuha" value={user?.settings?.language ?? "en"} icon={<Globe size={13} />} />
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>
                {user?.role ?? "student"}
              </span>
              {user?.isVerified && (
                <span style={{ background: "#F0FDF4", color: "#16A34A", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={11} /> I Verifikuar
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Row 2: Certificates/Courses (flex 2) + Medals (flex 1) ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <h3 style={{ marginBottom: 10, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            Certifikatat &amp; Kurset
          </h3>
          <div style={{ background: "white", padding: 16, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            {enrollments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {enrollments.map((e) => {
                  const pct = Math.round(Number(e.courseProgress?.progressPercent ?? 0));
                  const cert = certificates.find((c) => c.courseId === e.courseId);
                  const isDone = pct === 100 || !!cert;
                  return (
                    <Link key={e.id} href={`/course/${e.course.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 12,
                        background: isDone ? "#FFFBEB" : "#F8FAFC",
                        border: `1px solid ${isDone ? "#FDE68A" : "#E5E7EB"}`,
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#FEF3C7" : "#F1F5F9" }}>
                          {isDone ? <Award size={18} color="#F59E0B" /> : <BookOpen size={18} color="#9CA3AF" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isDone ? "#92400E" : "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.course.title}
                          </div>
                          <div style={{ fontSize: 12, color: isDone ? "#B45309" : "#9CA3AF", marginTop: 2 }}>
                            {isDone && cert ? `Lëshuar ${fmtDate(cert.issuedAt)}` : `Kurs i papërfunduar · ${pct}% progres`}
                          </div>
                        </div>
                        {cert && (
                          <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700, flexShrink: 0 }}>Shiko</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "#9CA3AF", margin: "8px 0" }}>Përfundo një kurs për të fituar certifikatë.</p>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: 10, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            Medaljet e Fituara
          </h3>
          <div style={{ background: "white", padding: 16, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            {badges.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {badges.map((b) => (
                  <div key={b.id} title={b.badge.description ?? ""} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 64 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F5F3FF", border: "1px solid #E9D5FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {BADGE_EMOJIS[b.badge.name] ?? "🏅"}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", textAlign: "center", lineHeight: 1.2 }}>
                      {b.badge.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "#9CA3AF", margin: "8px 0" }}>Nuk ka medalje ende. Vazhdo të mësosh!</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Notifications (flex 2) + XP History (flex 1) ── */}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <h3 style={{ marginBottom: 10, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            Njoftimet {unreadCount > 0 && (
              <span style={{ fontSize: 13, fontWeight: 700, background: "#EFF6FF", color: "#2563EB", borderRadius: 20, padding: "2px 10px", marginLeft: 8 }}>
                {unreadCount} të reja
              </span>
            )}
          </h3>
          <div style={{ background: "white", padding: 16, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            {notifications.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: "10px 12px", borderRadius: 10,
                    background: n.isRead ? "#F8FAFC" : "#EFF6FF",
                    borderLeft: `4px solid ${n.isRead ? "#E5E7EB" : "#2563EB"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.isRead ? "#D1D5DB" : "#2563EB", flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <div style={{ fontSize: 13, color: "#111827", lineHeight: 1.4, fontWeight: n.isRead ? 400 : 600 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{fmtDate(n.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "#9CA3AF", margin: "8px 0" }}>Asnjë njoftim ende.</p>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: 10, fontWeight: 700, fontSize: 18, color: "#111827" }}>
            Historia e XP
          </h3>
          <div style={{ background: "white", padding: 16, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            {xpHistory.length > 0 ? (
              xpHistory.map((log) => (
                <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{log.description ?? log.sourceType}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>+{log.xpAmount} XP</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 14, color: "#9CA3AF", margin: "8px 0" }}>Nuk ka histori XP ende.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ icon, label, value, sub, color }: Readonly<{
  icon: ReactNode; label: string; value: string; sub: string; color: string;
}>) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: "#fff", padding: 18, borderRadius: 16,
      border: "1px solid #E5E7EB",
      display: "flex", flexDirection: "column", gap: 12,
      height: 130, boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{label}</span>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>{sub}</p>
      </div>
    </div>
  );
}

function InfoField({ label, value, icon }: Readonly<{ label: string; value: string; icon?: ReactNode }>) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
      <div style={{ fontSize: 13, color: "#374151", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", background: "#F8FAFC", display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span style={{ color: "#9CA3AF", flexShrink: 0 }}>{icon}</span>}
        {value}
      </div>
    </div>
  );
}

