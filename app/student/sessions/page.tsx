import { getCurrentSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentSessionsPage() {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser?.role !== "student") redirect("/auth/login");

  const bookings = await prisma.sessionBooking.findMany({
    where: { studentId: sessionUser.id },
    include: {
      slot: true,
      instructorProfile: {
        include: { user: { include: { profile: true } } },
      },
    },
    orderBy: { slot: { startsAt: "asc" } },
    take: 20,
  });

  return (
    <section>
      <h2 style={{ margin: "0 0 18px", fontSize: "26px", fontWeight: 900 }}>Sessions</h2>

      <div style={{ display: "grid", gap: "12px" }}>
        {bookings.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "22px",
              color: "#64748b",
            }}
          >
            You do not have any booked sessions yet. Browse courses or reserve a professor session to get live help.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "18px",
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontWeight: 900, color: "#111827" }}>
                  {booking.instructorProfile.user.profile?.displayName ?? "Professor"}
                </div>
                <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                  {booking.topic ?? "Live mentoring session"}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: "#1d4ed8" }}>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(booking.slot.startsAt)}
                </div>
                <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                  {booking.status}
                </div>
                {booking.status === "confirmed" && (
                  <Link
                    href={`/sessions/${booking.id}/call`}
                    style={{
                      display: "inline-block",
                      marginTop: 10,
                      borderRadius: 10,
                      background: "#2563eb",
                      color: "white",
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 900,
                      textDecoration: "none",
                    }}
                  >
                    Join call
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
