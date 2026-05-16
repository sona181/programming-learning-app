export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

const ALB_MONTHS = [
  "Janar","Shkurt","Mars","Prill","Maj","Qershor",
  "Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor",
];

type Props = { searchParams: Promise<{ bookingId?: string }> };

export default async function KonfirmimPage({ searchParams }: Props) {
  const { bookingId } = await searchParams;
  const session = await getCurrentSessionUser();
  if (!session) redirect("/auth/login");
  if (!bookingId) redirect("/rezervo");

  const booking = await prisma.sessionBooking.findUnique({
    where: { id: bookingId },
    include: {
      slot: true,
      instructorProfile: { include: { user: { include: { profile: true } } } },
    },
  });

  if (!booking || booking.studentId !== session.id) redirect("/rezervo");

  const d = booking.slot.startsAt;
  const dur = Math.round((booking.slot.endsAt.getTime() - booking.slot.startsAt.getTime()) / 60000);
  const dateLabel = `${d.getDate()} ${ALB_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const timeLabel = d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
  const instructorName =
    booking.instructorProfile.user.profile?.displayName ?? booking.instructorProfile.user.email;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", maxWidth: 480, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.10)", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>
          ⏳
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 22, color: "#111827", margin: "0 0 8px" }}>
          Rezervimi u dërgua!
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 28px" }}>
          Profesori do ta konfirmojë sesionin. Do të njoftohesh kur të pranohet.
        </p>

        <div style={{ background: "#F8F7FF", borderRadius: 16, padding: "20px 24px", border: "1px solid #EDE9FE", textAlign: "left", marginBottom: 28 }}>
          {[
            ["Profesori", `Prof. ${instructorName}`],
            ["Data", dateLabel],
            ["Ora", timeLabel],
            ["Kohëzgjatja", `${dur} min`],
            ...(booking.topic ? [["Tema", booking.topic]] : []),
            ["Statusi", "Në pritje të konfirmimit"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #EDE9FE" }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: label === "Statusi" ? "#D97706" : "#111827" }}>{value}</span>
            </div>
          ))}
        </div>

        <Link
          href="/rezervo"
          style={{ display: "block", padding: "12px", borderRadius: 12, background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}
        >
          Rezervo sesion tjetër
        </Link>
      </div>
    </div>
  );
}
