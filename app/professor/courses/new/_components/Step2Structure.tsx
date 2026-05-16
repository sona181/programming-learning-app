"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Loader2 } from "lucide-react";
import type { CourseState, Chapter, Lesson } from "./CourseWizard";

const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB",
  fontSize: 13, color: "#111827", background: "#fff", outline: "none",
};

const LESSON_TYPES = [
  { value: "text", label: "Text" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "exercise", label: "Exercice" },
  { value: "mixed", label: "Të përziera" },
];

export default function Step2Structure({
  state, update, onBack, onNext,
}: {
  state: CourseState;
  update: (patch: Partial<CourseState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleChapter(i: number) {
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function addChapter() {
    const chapters = [...state.chapters, { title: "Kapitulli i Ri", orderIndex: state.chapters.length, lessons: [] }];
    update({ chapters });
    setExpanded((prev) => ({ ...prev, [chapters.length - 1]: true }));
  }

  function updateChapterTitle(i: number, title: string) {
    const chapters = state.chapters.map((c, idx) => idx === i ? { ...c, title } : c);
    update({ chapters });
  }

  function removeChapter(i: number) {
    update({ chapters: state.chapters.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, orderIndex: idx })) });
  }

  function moveChapter(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= state.chapters.length) return;
    const chapters = [...state.chapters];
    [chapters[i], chapters[j]] = [chapters[j], chapters[i]];
    update({ chapters: chapters.map((c, idx) => ({ ...c, orderIndex: idx })) });
  }

  function addLesson(chIdx: number) {
    const chapters = state.chapters.map((c, idx) => {
      if (idx !== chIdx) return c;
      return { ...c, lessons: [...c.lessons, { title: "Mësim i Ri", lessonType: "text", isFreePreview: false, orderIndex: c.lessons.length, contents: [], exercises: [] }] };
    });
    update({ chapters });
  }

  function updateLesson(chIdx: number, lIdx: number, patch: Partial<Lesson>) {
    const chapters = state.chapters.map((c, ci) => {
      if (ci !== chIdx) return c;
      return { ...c, lessons: c.lessons.map((l, li) => li === lIdx ? { ...l, ...patch } : l) };
    });
    update({ chapters });
  }

  function removeLesson(chIdx: number, lIdx: number) {
    const chapters = state.chapters.map((c, ci) => {
      if (ci !== chIdx) return c;
      return { ...c, lessons: c.lessons.filter((_, li) => li !== lIdx).map((l, li) => ({ ...l, orderIndex: li })) };
    });
    update({ chapters });
  }

  function moveLesson(chIdx: number, lIdx: number, dir: -1 | 1) {
    const j = lIdx + dir;
    const chapter = state.chapters[chIdx];
    if (j < 0 || j >= chapter.lessons.length) return;
    const lessons = [...chapter.lessons];
    [lessons[lIdx], lessons[j]] = [lessons[j], lessons[lIdx]];
    const chapters = state.chapters.map((c, ci) => ci === chIdx ? { ...c, lessons: lessons.map((l, li) => ({ ...l, orderIndex: li })) } : c);
    update({ chapters });
  }

  async function save() {
    if (!state.courseId) { setError("Kursi nuk u krijua ende."); return; }
    if (state.chapters.length === 0) { setError("Shto të paktën një kapitull."); return; }
    setSaving(true); setError("");
    try {
      // Sync chapters and lessons to DB
      for (const ch of state.chapters) {
        let chapterId = ch.id;
        if (!chapterId) {
          const res = await fetch(`/api/professor/courses/${state.courseId}/chapters`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: ch.title }),
          });
          const data = await res.json();
          chapterId = data.id;
          ch.id = chapterId;
        } else {
          await fetch(`/api/professor/courses/${state.courseId}/chapters/${chapterId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: ch.title, orderIndex: ch.orderIndex }),
          });
        }
        for (const lesson of ch.lessons) {
          if (!lesson.id) {
            const res = await fetch(`/api/professor/courses/${state.courseId}/chapters/${chapterId}/lessons`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: lesson.title, lessonType: lesson.lessonType, isFreePreview: lesson.isFreePreview }),
            });
            const data = await res.json();
            lesson.id = data.id;
          } else {
            await fetch(`/api/professor/courses/${state.courseId}/chapters/${chapterId}/lessons/${lesson.id}`, {
              method: "PATCH", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: lesson.title, lessonType: lesson.lessonType, isFreePreview: lesson.isFreePreview, orderIndex: lesson.orderIndex }),
            });
          }
        }
      }
      onNext();
    } catch { setError("Gabim rrjeti. Provo sërish."); }
    finally { setSaving(false); }
  }

  const totalLessons = state.chapters.reduce((s, c) => s + c.lessons.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Struktura e Kursit</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>
          Shto kapitujt dhe mësimet. {state.chapters.length} kapituj · {totalLessons} mësime
        </p>
      </div>

      {state.chapters.map((ch, ci) => (
        <div key={ci} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 12, overflow: "hidden" }}>
          {/* Chapter header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", background: "#F9FAFB", borderBottom: expanded[ci] ? "1px solid #E5E7EB" : "none" }}>
            <GripVertical size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
            <button onClick={() => toggleChapter(ci)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#374151" }}>
              {expanded[ci] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <input
              style={{ ...inputStyle, flex: 1, fontWeight: 600 }}
              value={ch.title}
              onChange={(e) => updateChapterTitle(ci, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0 }}>{ch.lessons.length} mësime</span>
            <button onClick={() => moveChapter(ci, -1)} disabled={ci === 0} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px 4px", fontSize: 12 }}>↑</button>
            <button onClick={() => moveChapter(ci, 1)} disabled={ci === state.chapters.length - 1} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px 4px", fontSize: 12 }}>↓</button>
            <button onClick={() => removeChapter(ci)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4 }}>
              <Trash2 size={15} />
            </button>
          </div>

          {/* Lessons */}
          {expanded[ci] && (
            <div style={{ padding: "12px 16px" }}>
              {ch.lessons.map((lesson, li) => (
                <div key={li} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, marginBottom: 6, background: "#F8F7FF", border: "1px solid #EDE9FE" }}>
                  <GripVertical size={14} color="#C4B5FD" />
                  <input
                    style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                    value={lesson.title}
                    onChange={(e) => updateLesson(ci, li, { title: e.target.value })}
                  />
                  <select
                    style={{ ...inputStyle, fontSize: 12, padding: "6px 8px" }}
                    value={lesson.lessonType}
                    onChange={(e) => updateLesson(ci, li, { lessonType: e.target.value })}
                  >
                    {LESSON_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280", whiteSpace: "nowrap", cursor: "pointer" }}>
                    <input type="checkbox" checked={lesson.isFreePreview} onChange={(e) => updateLesson(ci, li, { isFreePreview: e.target.checked })} />
                    Pa pagesë
                  </label>
                  <button onClick={() => moveLesson(ci, li, -1)} disabled={li === 0} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 12 }}>↑</button>
                  <button onClick={() => moveLesson(ci, li, 1)} disabled={li === ch.lessons.length - 1} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 12 }}>↓</button>
                  <button onClick={() => removeLesson(ci, li)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addLesson(ci)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
              >
                <Plus size={14} /> Shto Mësim
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addChapter}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "2px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center", marginBottom: 24 }}
      >
        <Plus size={16} /> Shto Kapitull
      </button>

      {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          ← Kthehu
        </button>
        <button onClick={save} disabled={saving} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}>
          {saving ? <><Loader2 size={16} /> Duke ruajtur...</> : "Ruaj dhe Vazhdo →"}
        </button>
      </div>
    </div>
  );
}
