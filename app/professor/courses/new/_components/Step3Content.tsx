"use client";

import { useState } from "react";
import { Upload, Plus, Trash2, ChevronDown, ChevronRight, Loader2, FileText, Video, File, Code, Archive } from "lucide-react";
import type { CourseState, Lesson, ContentBlock, Exercise } from "./CourseWizard";

const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, color: "#111827", background: "#fff", outline: "none", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 0.5 };

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "video") return <Video size={14} />;
  if (type === "pdf") return <File size={14} />;
  return <FileText size={14} />;
}

function ExerciseEditor({
  ex, idx, onChange, onRemove,
}: { ex: Exercise; idx: number; onChange: (e: Exercise) => void; onRemove: () => void }) {
  return (
    <div style={{ background: "#F8F7FF", borderRadius: 12, padding: "16px", border: "1px solid #EDE9FE", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>Exercise {idx + 1}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={14} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Titulli</label>
          <input style={inputStyle} value={ex.title} onChange={(e) => onChange({ ...ex, title: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Gjuha</label>
          <select style={inputStyle} value={ex.language} onChange={(e) => onChange({ ...ex, language: e.target.value })}>
            {["javascript","typescript","python","java","cpp","c","csharp","go","ruby"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Instruksionet</label>
        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={ex.instructions} onChange={(e) => onChange({ ...ex, instructions: e.target.value })} placeholder="Përshkruaj ushtrimin..." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Kodi Fillestar</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={ex.starterCode} onChange={(e) => onChange({ ...ex, starterCode: e.target.value })} placeholder="// starter code..." />
        </div>
        <div>
          <label style={labelStyle}>Zgjidhja</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={ex.solutionCode} onChange={(e) => onChange({ ...ex, solutionCode: e.target.value })} placeholder="// solution..." />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Output i Pritur</label>
        <input style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }} value={ex.expectedOutput} onChange={(e) => onChange({ ...ex, expectedOutput: e.target.value })} placeholder="Hello, World!" />
      </div>
    </div>
  );
}

function LessonEditor({
  lesson, courseId, onUpdate,
}: { lesson: Lesson; courseId: string; onUpdate: (l: Lesson) => void }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [zipAssets, setZipAssets] = useState<{ id: string; fileName: string; fileUrl: string }[]>([]);
  const [zipAssetLoading, setZipAssetLoading] = useState(false);
  const contents = lesson.contents ?? [];
  const exercises = lesson.exercises ?? [];

  function addTextBlock() {
    const nextContents = [...contents, { contentType: "text" as const, body: "", orderIndex: contents.length }];
    onUpdate({ ...lesson, contents: nextContents, exercises });
  }

  function updateBlock(i: number, patch: Partial<ContentBlock>) {
    const nextContents = contents.map((b, bi) => bi === i ? { ...b, ...patch } : b);
    onUpdate({ ...lesson, contents: nextContents, exercises });
  }

  function removeBlock(i: number) {
    onUpdate({ ...lesson, contents: contents.filter((_, bi) => bi !== i).map((b, bi) => ({ ...b, orderIndex: bi })), exercises });
  }

  async function uploadMedia(file: File, type: "video" | "pdf", blockIdx: number) {
    setUploading(`${type}-${blockIdx}`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("assetType", type);
      if (lesson.id) fd.append("lessonId", lesson.id);
      const res = await fetch(`/api/professor/courses/${courseId}/assets`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        updateBlock(blockIdx, { mediaUrl: data.fileUrl });
      }
    } finally { setUploading(null); }
  }

  async function handleZipUpload(file: File) {
    setZipLoading(true); setZipError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/professor/courses/${courseId}/import-zip`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setZipError(data.error ?? "Gabim."); return; }
      const newExercises: Exercise[] = data.exercises.map((e: Omit<Exercise, "orderIndex">, i: number) => ({
        ...e, orderIndex: exercises.length + i,
      }));
      onUpdate({ ...lesson, contents, exercises: [...exercises, ...newExercises] });
    } finally { setZipLoading(false); }
  }

  async function uploadZipAsset(file: File) {
    setZipAssetLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("assetType", "zip");
      if (lesson.id) fd.append("lessonId", lesson.id);
      const res = await fetch(`/api/professor/courses/${courseId}/assets`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setZipAssets((prev) => [...prev, { id: data.id, fileName: data.fileName, fileUrl: data.fileUrl }]);
      }
    } finally { setZipAssetLoading(false); }
  }

  function addExercise() {
    onUpdate({ ...lesson, contents, exercises: [...exercises, { title: "Exercise", language: "javascript", instructions: "", starterCode: "", solutionCode: "", expectedOutput: "", orderIndex: exercises.length }] });
  }

  function updateExercise(i: number, e: Exercise) {
    onUpdate({ ...lesson, contents, exercises: exercises.map((ex, ei) => ei === i ? e : ex) });
  }

  function removeExercise(i: number) {
    onUpdate({ ...lesson, contents, exercises: exercises.filter((_, ei) => ei !== i).map((e, ei) => ({ ...e, orderIndex: ei })) });
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F9FAFB", border: "none", cursor: "pointer", textAlign: "left", borderBottom: open ? "1px solid #E5E7EB" : "none" }}
      >
        {open ? <ChevronDown size={16} color="#6B7280" /> : <ChevronRight size={16} color="#6B7280" />}
        <ContentTypeIcon type={lesson.lessonType} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", flex: 1 }}>{lesson.title}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{contents.length} blloqe · {exercises.length} ushtrime</span>
      </button>

      {open && (
        <div style={{ padding: "16px" }}>
          {/* Content blocks */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Blloqet e Përmbajtjes</div>
            {contents.map((block, bi) => (
              <div key={bi} style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px", border: "1px solid #E5E7EB", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["text", "video", "pdf"] as const).map((t) => (
                      <button key={t} onClick={() => updateBlock(bi, { contentType: t })} style={{ padding: "4px 10px", borderRadius: 6, border: block.contentType === t ? "none" : "1px solid #E5E7EB", background: block.contentType === t ? "#7C3AED" : "#fff", color: block.contentType === t ? "#fff" : "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <ContentTypeIcon type={t} /> {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => removeBlock(bi)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>

                {block.contentType === "text" && (
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                    placeholder="Shkruaj përmbajtjen..."
                    value={block.body ?? ""}
                    onChange={(e) => updateBlock(bi, { body: e.target.value })}
                  />
                )}
                {block.contentType === "video" && (
                  <div>
                    {block.mediaUrl ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <video src={block.mediaUrl} controls style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8 }} />
                        <button onClick={() => updateBlock(bi, { mediaUrl: undefined })} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                      </div>
                    ) : (
                      <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 8, border: "2px dashed #C4B5FD", cursor: "pointer", color: "#7C3AED", fontSize: 13, fontWeight: 600 }}>
                        {uploading === `video-${bi}` ? <Loader2 size={16} /> : <Upload size={16} />}
                        {uploading === `video-${bi}` ? "Duke ngarkuar..." : "Ngarko Video (mp4, webm · max 500MB)"}
                        <input type="file" accept="video/mp4,video/webm" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(f, "video", bi); }} />
                      </label>
                    )}
                  </div>
                )}
                {block.contentType === "pdf" && (
                  <div>
                    {block.mediaUrl ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <a href={block.mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#7C3AED", display: "flex", alignItems: "center", gap: 6 }}><File size={14} /> Shiko PDF</a>
                        <button onClick={() => updateBlock(bi, { mediaUrl: undefined })} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                      </div>
                    ) : (
                      <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 8, border: "2px dashed #C4B5FD", cursor: "pointer", color: "#7C3AED", fontSize: 13, fontWeight: 600 }}>
                        {uploading === `pdf-${bi}` ? <Loader2 size={16} /> : <Upload size={16} />}
                        {uploading === `pdf-${bi}` ? "Duke ngarkuar..." : "Ngarko PDF (max 20MB)"}
                        <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMedia(f, "pdf", bi); }} />
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={addTextBlock} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={12} /> Tekst
              </button>
              <button onClick={() => { const c = [...contents, { contentType: "video" as const, orderIndex: contents.length }]; onUpdate({ ...lesson, contents: c, exercises }); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={12} /> Video
              </button>
              <button onClick={() => { const c = [...contents, { contentType: "pdf" as const, orderIndex: contents.length }]; onUpdate({ ...lesson, contents: c, exercises }); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={12} /> PDF
              </button>
            </div>
          </div>

          {/* Downloadable ZIP assets */}
          <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16, marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Skedarë ZIP Shkarkueshëm</div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #7C3AED", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: zipAssetLoading ? "not-allowed" : "pointer", opacity: zipAssetLoading ? 0.6 : 1 }}>
                {zipAssetLoading ? <Loader2 size={12} /> : <Archive size={12} />}
                {zipAssetLoading ? "Duke ngarkuar..." : "Ngarko ZIP"}
                <input type="file" accept=".zip,application/zip" style={{ display: "none" }} disabled={zipAssetLoading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadZipAsset(f); }} />
              </label>
            </div>
            {zipAssets.length === 0 && (
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>Nuk ka skedarë ZIP. Ngarko një skedar ZIP si material shkarkueshëm për studentët.</p>
            )}
            {zipAssets.map((za) => (
              <div key={za.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F5F3FF", border: "1px solid #EDE9FE", borderRadius: 10, marginBottom: 8 }}>
                <Archive size={16} color="#7C3AED" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#374151" }}>{za.fileName}</span>
                <button onClick={() => setZipAssets((prev) => prev.filter((z) => z.id !== za.id))} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Exercises */}
          <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Ushtrimet e Kodimit</div>
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #7C3AED", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {zipLoading ? <Loader2 size={12} /> : <Upload size={12} />}
                  {zipLoading ? "Duke analizuar..." : "Importo ZIP"}
                  <input type="file" accept=".zip" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleZipUpload(f); }} disabled={zipLoading} />
                </label>
                <button onClick={addExercise} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px dashed #C4B5FD", background: "none", color: "#7C3AED", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={12} /> Manual
                </button>
              </div>
            </div>
            {zipError && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 8 }}>{zipError}</p>}
            {exercises.map((ex, ei) => (
              <ExerciseEditor key={ei} ex={ex} idx={ei} onChange={(e) => updateExercise(ei, e)} onRemove={() => removeExercise(ei)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step3Content({
  state, update, onBack, onNext,
}: {
  state: CourseState;
  update: (patch: Partial<CourseState>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateLesson(chIdx: number, lIdx: number, lesson: Lesson) {
    const chapters = state.chapters.map((c, ci) =>
      ci === chIdx ? { ...c, lessons: c.lessons.map((l, li) => li === lIdx ? lesson : l) } : c
    );
    update({ chapters });
  }

  async function save() {
    if (!state.courseId) return;
    setSaving(true); setError("");
    try {
      for (const ch of state.chapters) {
        for (const lesson of ch.lessons) {
          if (!lesson.id) continue;
          await fetch(`/api/professor/courses/${state.courseId}/chapters/${ch.id}/lessons/${lesson.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: lesson.contents ?? [], exercises: lesson.exercises ?? [] }),
          });
        }
      }
      onNext();
    } catch { setError("Gabim rrjeti. Provo sërish."); }
    finally { setSaving(false); }
  }

  const allLessons = state.chapters.flatMap((ch, ci) => ch.lessons.map((l, li) => ({ ch, ci, l, li })));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Përmbajtja & Ushtrimet</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "4px 0 0" }}>Shto tekst, video, PDF dhe ushtrime për çdo mësim.</p>
      </div>

      {allLessons.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "40px", textAlign: "center", border: "1px solid #E5E7EB" }}>
          <Code size={32} color="#C4B5FD" style={{ marginBottom: 12 }} />
          <p style={{ color: "#6B7280", fontSize: 14 }}>Nuk ka mësime ende. Kthehu tek Hapi 2 për të shtuar.</p>
        </div>
      ) : (
        state.chapters.map((ch, ci) => (
          <div key={ci} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#5B21B6", marginBottom: 8, padding: "0 4px" }}>
              {ch.title}
            </div>
            {ch.lessons.map((l, li) => (
              <LessonEditor
                key={li}
                lesson={l}
                courseId={state.courseId!}
                onUpdate={(updated) => updateLesson(ci, li, updated)}
              />
            ))}
          </div>
        ))
      )}

      {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
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
