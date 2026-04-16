"use client";

interface SlotItem {
  time: string;
  isBooked: boolean;
}

interface Slot {
  day: string;
  items: SlotItem[];
}

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Availability({ slots }: { slots: Slot[] }) {
  const map = new Map(slots.map((s) => [s.day, s.items]));

  const filteredWeek = WEEK_DAYS.filter(
    (day) => (map.get(day)?.length ?? 0) > 0
  );

  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* TITLE */}
      <h3 style={{ color: "#000", fontWeight: 700, marginBottom: "16px" }}>
        Weekly Availability
      </h3>

      {filteredWeek.map((day, i) => {
        const items = map.get(day) || [];

        return (
          <div key={day}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ color: "#000", fontWeight: 400 }}>
                {day}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {items.map((item, idx) =>
                  item.isBooked ? (
                    <div
                      key={idx}
                      style={{
                        color: "#535252",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      Not available
                    </div>
                  ) : (
                    <div
                      key={idx}
                      style={{
                        background: "#E0F2FE",
                        color: "#1D4ED8",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.time}
                    </div>
                  )
                )}
              </div>
            </div>
            {i !== filteredWeek.length - 1 && (
              <div
                style={{
                  height: "1px",
                  background: "#e5e7eb",
                  marginBottom: "10px",
                }}
              />
            )}
          </div>
        );
      })}
      <button
        style={{
          marginTop: "12px",
          width: "100%",
          padding: "6px",
          borderRadius: "8px",
          border: "none",
          background: "#7C3AED",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Change Schedule
      </button>
    </div>
  );
}