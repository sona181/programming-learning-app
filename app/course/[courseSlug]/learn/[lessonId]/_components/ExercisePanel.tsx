"use client";

import { useState } from "react";
import { Play, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const LANG_IDS: Record<string, number> = {
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  "c++": 54,
  javascript: 63,
  typescript: 74,
  csharp: 51,
  go: 60,
  ruby: 72,
};

interface Exercise {
  id: string;
  title: string;
  instructions: string | null;
  language: string;
  starterCode: string | null;
  solutionCode: string | null;
  expectedOutput: string | null;
}

interface RunResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: string;
  statusId: number;
}

function SingleExercise({ ex }: { ex: Exercise }) {
  const [code, setCode] = useState(ex.starterCode ?? "");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  async function run() {
    const langId = LANG_IDS[ex.language.toLowerCase()] ?? 71;
    setRunning(true);
    setResult(null);
    setCorrect(null);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, languageId: langId }),
      });
      const data = (await res.json()) as RunResult & { error?: string };
      if (data.error) { setResult({ stdout: null, stderr: data.error, compileOutput: null, status: "Error", statusId: 0 }); return; }
      setResult(data);

      const hasError = (data.compileOutput?.trim() ?? "") || (data.stderr?.trim() ?? "");
      if (!hasError && ex.expectedOutput) {
        const actual = data.stdout?.trim() ?? "";
        setCorrect(actual === ex.expectedOutput.trim());
      }
    } catch (e) {
      setResult({ stdout: null, stderr: e instanceof Error ? e.message : "Unknown error", compileOutput: null, status: "Error", statusId: 0 });
    } finally {
      setRunning(false);
    }
  }

  const hasError = result && ((result.compileOutput?.trim() ?? "") || (result.stderr?.trim() ?? ""));

  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      {/* Header */}
      <div style={{ background: "#F8F7FF", padding: "12px 16px", borderBottom: "1px solid #EDE9FE", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em" }}>Exercise · {ex.language}</span>
          <h4 style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#111827" }}>{ex.title}</h4>
        </div>
        {correct === true && <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#059669", fontWeight: 700, fontSize: 13 }}><CheckCircle size={16} /> Saktë!</div>}
        {correct === false && <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#DC2626", fontWeight: 700, fontSize: 13 }}><XCircle size={16} /> Jo saktë</div>}
      </div>

      {/* Instructions */}
      {ex.instructions && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", background: "#fff", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
          {ex.instructions}
        </div>
      )}

      {/* Code editor (textarea) */}
      <div style={{ background: "#0F1117" }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: "100%",
            minHeight: 200,
            background: "transparent",
            color: "#E2E8F0",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 1.6,
            border: "none",
            outline: "none",
            padding: "16px",
            resize: "vertical",
            boxSizing: "border-box",
          }}
          spellCheck={false}
        />
      </div>

      {/* Toolbar */}
      <div style={{ background: "#1A1F2E", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => void run()}
          disabled={running}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: running ? "#1D4ED8" : "#2563EB",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: running ? "not-allowed" : "pointer",
          }}
        >
          <Play size={13} />
          {running ? "Duke ekzekutuar..." : "Ekzekuto"}
        </button>

        {ex.expectedOutput && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
            Output i pritur: <code style={{ color: "rgba(255,255,255,0.5)" }}>{ex.expectedOutput}</code>
          </span>
        )}

        {ex.solutionCode && (
          <button
            onClick={() => setShowSolution((s) => !s)}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer" }}
          >
            {showSolution ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showSolution ? "Fshih zgjidhjen" : "Shfaq zgjidhjen"}
          </button>
        )}
      </div>

      {/* Solution */}
      {showSolution && ex.solutionCode && (
        <pre style={{ margin: 0, background: "#111827", padding: 16, fontSize: 12, color: "#86EFAC", fontFamily: "monospace", overflowX: "auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {ex.solutionCode}
        </pre>
      )}

      {/* Output */}
      {result && (
        <div style={{ borderTop: "1px solid #E5E7EB", background: hasError ? "#FEF2F2" : "#F0FDF4", padding: "12px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: hasError ? "#DC2626" : "#059669", margin: "0 0 6px", textTransform: "uppercase" }}>
            Output {result.status}
          </p>
          {result.compileOutput && <pre style={{ margin: 0, fontSize: 12, color: "#DC2626", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{result.compileOutput}</pre>}
          {result.stderr && <pre style={{ margin: 0, fontSize: 12, color: "#DC2626", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{result.stderr}</pre>}
          {result.stdout && <pre style={{ margin: 0, fontSize: 12, color: "#047857", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{result.stdout}</pre>}
        </div>
      )}
    </div>
  );
}

export default function ExercisePanel({ exercises }: { exercises: Exercise[] }) {
  if (exercises.length === 0) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 16px", paddingBottom: 10, borderBottom: "2px solid #7C3AED" }}>
        Ushtrime ({exercises.length})
      </h3>
      {exercises.map((ex) => <SingleExercise key={ex.id} ex={ex} />)}
    </div>
  );
}
