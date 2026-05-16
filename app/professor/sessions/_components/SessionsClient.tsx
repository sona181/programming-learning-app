"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  status: string;
  topic: string | null;
  studentName: string;
  studentInitials: string;
  avatarColor: string;
  startsAt: string;
  endsAt: string;
};

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
};

const ALB_MONTHS = [
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
];

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${ALB_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`;
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "confirmed") return { bg: "#D1FAE5", color: "#059669", label: "Konfirmuar" };
  if (s === "pending") return { bg: "#FEF3C7", color: "#D97706", label: "Në pritje" };
  if (s === "cancelled") return { bg: "#FEE2E2", color: "#DC2626", label: "Anuluar" };
  return { bg: "#F3F4F6", color: "#6B7280", label: status };
}

export default function SessionsClient({
  upcomingBookings,
  pastBookings,
  existingSlots,
}: {
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  existingSlots: Slot[];
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("45");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [slots, setSlots] = useState<Slot[]>(existingSlots);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function addSlot() {
    if (!date) { setSaveError("Zgjidhni datën."); return; }
    const [hour, minute] = startTime.split(":").map(Number);
    const startTotal = hour * 60 + minute;
    const endTotal = startTotal + Number(duration);

    if (startTotal < 9 * 60 || endTotal > 18 * 60) {
      setSaveError("Oraret duhet te jene brenda 09:00-18:00.");
      return;
    }

    setSaving(true); setSaveError(""); setSaveSuccess("");
    const startsAt = new Date(`${date}T${startTime}:00`).toISOString();
    const endsAt = new Date(new Date(startsAt).getTime() + Number(duration) * 60000).toISOString();
    try {
      const res = await fetch("/api/professor/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt, endsAt }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? "Gabim."); return; }
      setSlots((prev) => [...prev, data]);
      setSaveSuccess("Ora u shtua me sukses!");
      setDate(""); setStartTime("09:00"); setDuration("45");
    } catch { setSaveError("Gabim rrjeti."); }
    finally { setSaving(false); }
  }

  async function deleteSlot(slotId: string) {
    setDeletingId(slotId);
    try {
      await fetch(`/api/professor/slots?slotId=${slotId}`, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } finally { setDeletingId(null); }
  }

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100%", padding: 0 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>Menaxhimi i Sesioneve</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>Shto disponueshmëri dhe shiko rezervimet e studentëve</p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* LEFT: Add slot form + upcoming slots */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Add slot */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 16 }}>
              ➕ Shto Orë të Lira
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={labelStyle}>Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <label style={labelStyle}>Ora e fillimit</label>
                <input type="time" value={startTime} min="09:00" max="18:00" onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <label style={labelStyle}>Kohëzgjatja (min)</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle}>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={addSlot}
                  disabled={saving}
                  style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  {saving ? "Duke ruajtur..." : "Shto"}
                </button>
              </div>
            </div>
            {saveError && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 8 }}>{saveError}</p>}
            {saveSuccess && <p style={{ color: "#059669", fontSize: 12, marginTop: 8 }}>{saveSuccess}</p>}
          </div>

          {/* Upcoming available slots */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 12 }}>Orët e Disponueshme</h3>
            {slots.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>Nuk ke orë të disponueshme. Shto nga forma më lart.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slots
                  .filter((s) => new Date(s.startsAt) > new Date())
                  .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
                  .map((s) => {
                    const dur = Math.round((new Date(s.endsAt).getTime() - new Date(s.startsAt).getTime()) / 60000);
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                            {fmtDateTime(s.startsAt)}
                          </span>
                          <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>{dur} min</span>
                        </div>
                        <button
                          onClick={() => deleteSlot(s.id)}
                          disabled={deletingId === s.id}
                          style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        >
                          {deletingId === s.id ? "..." : "Fshi"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Upcoming booked sessions */}
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 12 }}>Sesionet e Ardhshme</h3>
            {upcomingBookings.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>Nuk ka sesione të rezervuara.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingBookings.map((b) => <BookingRow key={b.id} booking={b} onStart={() => router.push(`/sessions/${b.id}/call`)} />)}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Past sessions */}
        <div style={{ width: 320, minWidth: 0 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 12 }}>Histori Sesionesh</h3>
            {pastBookings.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>Nuk ka sesione të kaluara.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pastBookings.map((b) => <BookingRow key={b.id} booking={b} isPast />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking: b, onStart, isPast }: { booking: Booking; onStart?: () => void; isPast?: boolean }) {
  const { bg, color, label } = statusBadge(b.status);
  const canStart = !isPast && b.status === "confirmed";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: b.avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {b.studentInitials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{b.studentName}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{fmtDateTime(b.startsAt)}</div>
          {b.topic && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{b.topic}</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, color, background: bg, whiteSpace: "nowrap" }}>
          {label}
        </span>
        {canStart && (
          <button
            onClick={onStart}
            style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Fillo Sesionin →
          </button>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "#6B7280", marginBottom: 4, fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, background: "#F9FAFB", outline: "none", color: "#111827" };
