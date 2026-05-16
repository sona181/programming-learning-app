"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type HeaderProps = {
  studentName: string;
};

type AppNotification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "S";
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function notificationText(notification: AppNotification) {
  if (!notification.message.startsWith("{")) return notification.message;

  try {
    const parsed = JSON.parse(notification.message) as {
      title?: string;
      startsAt?: string;
      minutesUntil?: number;
    };
    if (parsed.title && parsed.minutesUntil) {
      return `${parsed.title} starts in ${parsed.minutesUntil} minutes at ${parsed.startsAt}.`;
    }
  } catch {
    return notification.message;
  }

  return notification.message;
}

export default function Header({ studentName }: Readonly<HeaderProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data: AppNotification[]) => setNotifications(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 20_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  }

  if (pathname === "/student/profile") return null;

  return (
    <header
      className="student-dashboard-header"
      style={{
        minHeight: "86px",
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "0 34px",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", margin: 0 }}>
        Student Dashboard
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          className="student-dashboard-search"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f1f5f9",
            padding: "10px 14px",
            borderRadius: "999px",
            color: "#64748b",
            fontSize: "14px",
            minWidth: "190px",
          }}
        >
          <Search size={16} />
          <span>Search courses...</span>
        </div>

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            aria-label="Open notifications"
            onClick={() => {
              setOpen((value) => !value);
              if (!open && unreadCount > 0) markAllRead();
            }}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "none",
              background: "#f1f5f9",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "#111827",
              position: "relative",
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: 1, right: 1, minWidth: 18, height: 18, borderRadius: 999, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 900, display: "grid", placeItems: "center", border: "2px solid white" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div style={{ position: "absolute", right: 0, top: 50, width: 360, background: "white", border: "1px solid #e5e7eb", borderRadius: 18, boxShadow: "0 18px 44px rgba(15,23,42,0.16)", zIndex: 20, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "#111827" }}>Notifications</strong>
                {notifications.length > 0 && (
                  <button onClick={markAllRead} style={{ border: "none", background: "transparent", color: "#2563eb", cursor: "pointer", fontWeight: 800, fontSize: 12 }}>
                    Mark read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 390, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 22, color: "#64748b", fontSize: 14 }}>No notifications yet.</div>
                ) : (
                  notifications.map((notification) => {
                    const text = notificationText(notification);
                    const canJoin = notification.type.startsWith("session_reminder") && notification.message.includes("/sessions/");
                    let bookingId = "";
                    if (canJoin) {
                      try {
                        bookingId = (JSON.parse(notification.message) as { bookingId?: string }).bookingId ?? "";
                      } catch {}
                    }

                    return (
                      <div key={notification.id} style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", background: notification.isRead ? "white" : "#eff6ff" }}>
                        <div style={{ color: "#111827", fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>{text}</div>
                        <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>{timeAgo(notification.createdAt)}</div>
                        {bookingId && (
                          <button onClick={() => router.push(`/sessions/${bookingId}/call`)} style={{ marginTop: 8, border: "none", borderRadius: 9, background: "#2563eb", color: "white", padding: "7px 10px", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>
                            Join call
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          aria-label="Open student profile"
          onClick={() => router.push("/student/profile")}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {getInitials(studentName)}
        </button>
      </div>
    </header>
  );
}
