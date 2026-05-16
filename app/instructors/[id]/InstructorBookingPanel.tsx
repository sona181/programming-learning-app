"use client";

import { CalendarDays, Clock, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarWeeks(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startDow).fill(null);

  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function durationMinutes(slot: Slot) {
  return Math.round((new Date(slot.endsAt).getTime() - new Date(slot.startsAt).getTime()) / 60000);
}

export default function InstructorBookingPanel({
  instructorProfileId,
  currentUserId,
}: {
  instructorProfileId: string;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    fetch(`/api/instructors/${instructorProfileId}/slots?from=${from}&to=${to}`)
      .then((response) => response.json())
      .then((data: Slot[]) => {
        setSlots(data);
        setSelectedSlotId("");
      })
      .catch(() => setSlots([]));
  }, [instructorProfileId, month, year]);

  const weeks = buildCalendarWeeks(year, month);
  const availableDayKeys = new Set(
    slots.map((slot) => {
      const date = new Date(slot.startsAt);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }),
  );
  const slotsForDay = slots.filter((slot) => sameDay(new Date(slot.startsAt), selectedDate));
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  function isPast(day: number) {
    return new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  function shiftMonth(direction: -1 | 1) {
    const next = new Date(year, month + direction, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  async function requestBooking() {
    if (!selectedSlotId) return;
    if (!currentUserId) {
      router.push("/auth/login");
      return;
    }

    setIsBooking(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlotId, topic }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not request this session.");
        return;
      }

      router.push(`/rezervo/konfirmim?bookingId=${data.bookingId}`);
    } catch {
      setError("Could not request this session.");
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: 18, padding: 20, border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
          <CalendarDays size={19} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#111827" }}>Book availability</h2>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Sessions are strictly 09:00-18:00.</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ color: "#111827" }}>{MONTHS[month]} {year}</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => shiftMonth(-1)} style={navButtonStyle}>‹</button>
          <button onClick={() => shiftMonth(1)} style={navButtonStyle}>›</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 6 }}>
        {DAYS.map((day) => (
          <div key={day} style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", fontWeight: 800 }}>{day}</div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 5 }}>
          {week.map((day, dayIndex) => {
            if (!day) return <div key={dayIndex} />;
            const date = new Date(year, month, day);
            const selected = sameDay(date, selectedDate);
            const past = isPast(day);
            const hasSlot = availableDayKeys.has(`${year}-${month}-${day}`);

            return (
              <button
                key={`${weekIndex}-${dayIndex}-${day}`}
                onClick={() => {
                  if (!past) {
                    setSelectedDate(date);
                    setSelectedSlotId("");
                  }
                }}
                disabled={past}
                style={{
                  border: "none",
                  borderRadius: 10,
                  height: 38,
                  cursor: past ? "not-allowed" : "pointer",
                  background: selected ? "#2563eb" : hasSlot ? "#eff6ff" : "#f8fafc",
                  color: past ? "#cbd5e1" : selected ? "white" : "#111827",
                  fontWeight: selected || hasSlot ? 900 : 700,
                  position: "relative",
                }}
              >
                {day}
                {hasSlot && !past && (
                  <span style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: selected ? "white" : "#10b981" }} />
                )}
              </button>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontWeight: 900, marginBottom: 10 }}>
          <Clock size={17} />
          Available times
        </div>

        {slotsForDay.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>No available slots on this date.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {slotsForDay.map((slot) => {
              const selected = slot.id === selectedSlotId;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  style={{
                    border: selected ? "1px solid #2563eb" : "1px solid #e5e7eb",
                    background: selected ? "#eff6ff" : "#f8fafc",
                    color: "#111827",
                    borderRadius: 12,
                    padding: "11px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  <span>{formatTime(slot.startsAt)}</span>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>{durationMinutes(slot)} min</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <label style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 800, marginTop: 16, marginBottom: 6 }}>
        Session topic
      </label>
      <input
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="What should you work on?"
        style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dbe3ef", borderRadius: 12, padding: "11px 12px", outline: "none", color: "#111827" }}
      />

      {selectedSlot && (
        <div style={{ marginTop: 12, color: "#64748b", fontSize: 13 }}>
          Requesting {formatTime(selectedSlot.startsAt)} for {durationMinutes(selectedSlot)} minutes.
        </div>
      )}

      {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}

      <button
        onClick={requestBooking}
        disabled={!selectedSlotId || isBooking}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 12,
          background: selectedSlotId ? "#2563eb" : "#cbd5e1",
          color: "white",
          padding: "12px",
          marginTop: 16,
          fontWeight: 900,
          cursor: selectedSlotId ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Video size={18} />
        {isBooking ? "Sending request..." : "Request session"}
      </button>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  border: "1px solid #dbe3ef",
  background: "white",
  color: "#111827",
  width: 30,
  height: 30,
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 900,
};
