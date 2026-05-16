"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

type NotificationPayload = {
  bookingId?: string;
  studentName?: string;
  slotTime?: string;
  durationMin?: number;
  topic?: string | null;
  title?: string;
  startsAt?: string;
  minutesUntil?: number;
};

type AppNotification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  parsed?: NotificationPayload;
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Tani";
  if (diff < 3600) return `${Math.floor(diff / 60)} min më parë`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} orë më parë`;
  return `${Math.floor(diff / 86400)} ditë më parë`;
}

function getInitials(name: string) {
  const p = (name ?? "").trim().split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "??";
}

const AVATAR_COLORS = ["#14b8a6", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#10b981"];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name ?? "") h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function parseNotification(n: AppNotification): AppNotification {
  try {
    return { ...n, parsed: JSON.parse(n.message) };
  } catch {
    return n;
  }
}

export default function Header({ professorName }: Readonly<{ professorName: string }>) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data: AppNotification[]) => setNotifications(data.map(parseNotification)))
      .catch(() => { /* silently ignore */ });
  }, []);

  // Poll every 20 seconds
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 20_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleAction(notificationId: string, action: "confirm" | "decline") {
    setActioning(notificationId);
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchNotifications();
    } finally {
      setActioning(null);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const initials = (() => {
    const p = (professorName ?? "").trim().split(" ").filter(Boolean);
    return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase() || "P";
  })();

  return (
    <div style={{ marginTop: 30, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* TITLE */}
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", marginLeft: 40 }}>
          Professor Dashboard
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginRight: 45 }}>
          {/* ADD COURSE */}
          <button
            onClick={() => router.push("/professor/courses/new")}
            style={{
              background: "linear-gradient(135deg, #6f33e3, #743ee4)", color: "white",
              padding: "10px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer",
              border: "none", boxShadow: "0 4px 12px rgba(111,51,227,0.25)",
            }}
          >
            + Add Course
          </button>

          {/* NOTIFICATION BELL */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen((o) => !o)}
              style={{
                width: 40, height: 40, borderRadius: "50%", background: "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", border: "none", position: "relative",
                animation: unreadCount > 0 ? "bellShake 0.5s ease infinite alternate" : "none",
              }}
            >
              <Bell size={20} color="#111827" style={{ transition: "transform 0.3s" }} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#ef4444", color: "#fff", fontSize: 10,
                  fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #fff",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div style={{
                position: "absolute", right: 0, top: 48, width: 380,
                background: "#fff", borderRadius: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
                border: "1px solid #E5E7EB", zIndex: 1000, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
                    Njoftimet
                  </span>
                  {notifications.some((n) => !n.isRead) && (
                    <button onClick={markAllRead} style={{ fontSize: 12, color: "#7C3AED", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      Shëno të gjitha si lexuar
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div style={{ maxHeight: 460, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                      <p style={{ fontSize: 14, color: "#9CA3AF" }}>Nuk ke njoftime të reja.</p>
                    </div>
                  ) : (
                    notifications.map((n) => <NotificationCard key={n.id} n={n} onAction={handleAction} actioning={actioning} />)
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div style={{ padding: "10px 20px", borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
                    <button
                      onClick={() => { setOpen(false); router.push("/professor/sessions"); }}
                      style={{ fontSize: 13, color: "#7C3AED", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                    >
                      Shiko të gjitha sesionet →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AVATAR */}
          <button
            onClick={() => router.push("/professor/profile")}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600, fontSize: 14, cursor: "pointer", border: "none",
            }}
          >
            {initials}
          </button>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: "#e5e7eb", marginTop: 12 }} />

      {/* Bell shake keyframe */}
      <style>{`
        @keyframes bellShake {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(8deg); }
          50%  { transform: rotate(-8deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

function NotificationCard({
  n,
  onAction,
  actioning,
}: Readonly<{
  n: AppNotification;
  onAction: (id: string, action: "confirm" | "decline") => void;
  actioning: string | null;
}>) {
  const isBookingRequest = n.type === "booking_request" && n.parsed?.bookingId;
  const isReminder = n.type.startsWith("session_reminder") && n.parsed?.bookingId;
  const p = n.parsed;
  const studentName = p?.studentName ?? "Student";
  const isActioning = actioning === n.id;

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #F9FAFB",
        background: n.isRead ? "#fff" : "rgba(124,58,237,0.04)",
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: avatarColor(studentName),
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {getInitials(studentName)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{studentName}</span>
            <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0, marginLeft: 8 }}>
              {timeAgo(n.createdAt)}
            </span>
          </div>

          {isBookingRequest ? (
            <>
              {/* Booking request card */}
              <div style={{
                background: "#F8F7FF", borderRadius: 12, padding: "10px 14px",
                border: "1px solid #EDE9FE", marginBottom: 10,
              }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <InfoChip icon="📅" label={p?.slotTime ?? "—"} />
                  <InfoChip icon="⏱" label={`${p?.durationMin ?? 45} min`} />
                </div>
                {p?.topic && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Tema
                    </span>
                    <p style={{ fontSize: 13, color: "#374151", margin: "2px 0 0", fontStyle: "italic" }}>
                      &quot;{p.topic}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {!n.isRead && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    disabled={isActioning}
                    onClick={() => onAction(n.id, "confirm")}
                    style={{
                      flex: 1, padding: "7px", borderRadius: 8, border: "none",
                      background: "#059669", color: "#fff", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", opacity: isActioning ? 0.6 : 1,
                    }}
                  >
                    {isActioning ? "..." : "✓ Konfirmo"}
                  </button>
                  <button
                    disabled={isActioning}
                    onClick={() => onAction(n.id, "decline")}
                    style={{
                      flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #FCA5A5",
                      background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", opacity: isActioning ? 0.6 : 1,
                    }}
                  >
                    {isActioning ? "..." : "✕ Refuzo"}
                  </button>
                </div>
              )}
              {n.isRead && (
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>U përgjigje tashmë.</span>
              )}
            </>
          ) : isReminder ? (
            <>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                {p?.title ?? "Your session"} starts in {p?.minutesUntil ?? 15} minutes at {p?.startsAt ?? ""}.
              </p>
              <button
                onClick={() => window.location.assign(`/sessions/${p?.bookingId}/call`)}
                style={{ marginTop: 8, padding: "7px 12px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Join call
              </button>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>{n.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label }: Readonly<{ icon: string; label: string }>) {
  return (
    <span style={{ fontSize: 12, color: "#5B21B6", display: "flex", alignItems: "center", gap: 4 }}>
      {icon} {label}
    </span>
  );
}
