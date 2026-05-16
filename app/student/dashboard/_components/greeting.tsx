import { Flame } from "lucide-react";

type GreetingProps = {
  name: string;
  streak: number;
};

export default function Greeting({ name, streak }: Readonly<GreetingProps>) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "white",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <p style={{ margin: "0 0 6px", opacity: 0.8, fontWeight: 700 }}>Welcome back</p>
        <h2 style={{ margin: 0, fontSize: "30px", fontWeight: 900 }}>
          Keep going, {name}
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "14px",
          padding: "12px 16px",
          fontWeight: 800,
        }}
      >
        <Flame size={20} />
        {streak} day streak
      </div>
    </section>
  );
}
