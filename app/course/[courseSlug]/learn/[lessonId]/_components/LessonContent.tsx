"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Download, Archive, BookOpen, CheckCircle, Play } from "lucide-react";
import MarkCompleteBtn from "./MarkCompleteBtn";
import ExercisePanel from "./ExercisePanel";

interface VideoItem { id: string; mediaUrl: string | null; }
interface TextBlock { id: string; body: string | null; contentType: string; }
interface AssetItem { id: string; fileName: string; fileUrl: string; fileSize: number | null; }
interface ExerciseItem {
  id: string; title: string; instructions: string | null;
  language: string; starterCode: string | null;
  solutionCode: string | null; expectedOutput: string | null;
}

interface Props {
  readonly courseSlug: string;
  readonly lessonId: string;
  readonly courseTitle: string;
  readonly lessonTitle: string;
  readonly chapterTitle: string;
  readonly level: string;
  readonly durationSeconds: number | null;
  readonly videoContent: VideoItem[];
  readonly textBlocks: TextBlock[];
  readonly codeBlocks: TextBlock[];
  readonly pdfAssets: AssetItem[];
  readonly zipAssets: AssetItem[];
  readonly otherAssets: AssetItem[];
  readonly exercises: ExerciseItem[];
  readonly prevLesson: { id: string; title: string } | null;
  readonly nextLesson: { id: string; title: string } | null;
  readonly isEnrolled: boolean;
  readonly isCurrentCompleted: boolean;
  readonly progressPercent: number;
}

type Tab = "overview" | "resources" | "exercises";

function isYoutube(url: string) { return url.includes("youtube.com") || url.includes("youtu.be"); }
function isVimeo(url: string) { return url.includes("vimeo.com"); }
function toEmbedUrl(url: string): string {
  const ytMatch = /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(url);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  const vmMatch = /vimeo\.com\/(\d+)/.exec(url);
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
  return url;
}
function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
function fmtDuration(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

export default function LessonContent(props: Props) {
  const resourceCount = props.pdfAssets.length + props.zipAssets.length + props.otherAssets.length;
  const initialTab: Tab =
    props.textBlocks.length === 0 && props.codeBlocks.length === 0 && props.exercises.length > 0
      ? "exercises"
      : props.textBlocks.length === 0 && props.codeBlocks.length === 0 && resourceCount > 0
        ? "resources"
        : "overview";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const pct = Math.round(props.progressPercent);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Përmbajtja" },
    ...(resourceCount > 0 ? [{ key: "resources" as Tab, label: "Materiale", badge: resourceCount }] : []),
    ...(props.exercises.length > 0 ? [{ key: "exercises" as Tab, label: "Ushtrime", badge: props.exercises.length }] : []),
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* ── Sticky top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(10, 14, 26, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        height: 54, display: "flex", alignItems: "center",
        padding: "0 32px", gap: 16,
      }}>
        <Link href={`/course/${props.courseSlug}`} style={{
          display: "flex", alignItems: "center", gap: 5,
          color: "rgba(255,255,255,0.4)", textDecoration: "none",
          fontSize: 13, fontWeight: 500, flexShrink: 0, letterSpacing: 0.1,
        }}>
          ← Kursi
        </Link>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
        <span style={{
          fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {props.courseTitle}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.03em" }}>
            {pct}% i kompletuar
          </span>
          <div style={{ width: 110, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: "linear-gradient(90deg, #818CF8, #A78BFA)",
              borderRadius: 2, transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>

      {/* ── Video Hero ── */}
      <div style={{
        background: "linear-gradient(180deg, #060912 0%, #0D1117 100%)",
        padding: "28px 40px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          {props.videoContent.length > 0 ? (
            props.videoContent.map((v) => (
              <div key={v.id} style={{
                position: "relative", borderRadius: 18, overflow: "hidden",
                aspectRatio: "16/9",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 40px 80px rgba(0,0,0,0.7)",
              }}>
                {isYoutube(v.mediaUrl ?? "") || isVimeo(v.mediaUrl ?? "") ? (
                  <iframe
                    src={toEmbedUrl(v.mediaUrl ?? "")}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={props.lessonTitle}
                  />
                ) : (
                  <video
                    src={v.mediaUrl ?? ""}
                    controls
                    style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  >
                    <track kind="captions" />
                  </video>
                )}
              </div>
            ))
          ) : (
            <div style={{
              aspectRatio: "16/9", borderRadius: 18,
              background: "linear-gradient(135deg, #1a1040 0%, #0D1117 60%, #0a1628 100%)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 14, border: "1px solid rgba(129,140,248,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%",
                background: "rgba(129,140,248,0.1)",
                border: "1px solid rgba(129,140,248,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BookOpen size={28} color="rgba(129,140,248,0.6)" />
              </div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 14, margin: 0, fontWeight: 500 }}>
                Ky mësim nuk ka video
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, background: "#F0F4FF" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 40px" }}>

          {/* Lesson header card */}
          <div style={{
            background: "#fff", borderRadius: "0 0 20px 20px",
            padding: "24px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            marginBottom: 0,
          }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{props.chapterTitle}</span>
              <span style={{ color: "#CBD5E1" }}>›</span>
              <span style={{ fontSize: 12, color: "#6366F1", fontWeight: 600 }}>{props.lessonTitle}</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: "0 0 14px", lineHeight: 1.2 }}>
                  {props.lessonTitle}
                </h1>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "#EEF2FF", color: "#4338CA", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                    {props.chapterTitle}
                  </span>
                  <span style={{ background: "#F1F5F9", color: "#475569", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                    {props.level}
                  </span>
                  {props.durationSeconds ? (
                    <span style={{ background: "#FFFBEB", color: "#92400E", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                      ⏱ {fmtDuration(props.durationSeconds)}
                    </span>
                  ) : null}
                  {props.isCurrentCompleted && (
                    <span style={{ background: "#ECFDF5", color: "#059669", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={11} /> Kompletuar
                    </span>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                {props.exercises.length > 0 && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#6366F1" }}>{props.exercises.length}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>Ushtrime</div>
                  </div>
                )}
                {resourceCount > 0 && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#7C3AED" }}>{resourceCount}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>Materiale</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 2, marginTop: 20, borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "8px 18px", border: "none", borderRadius: 10,
                    background: activeTab === tab.key
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                      : "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? "#fff" : "#64748B",
                    display: "flex", alignItems: "center", gap: 7,
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span style={{
                      background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "#E2E8F0",
                      color: activeTab === tab.key ? "#fff" : "#64748B",
                      borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700,
                      lineHeight: "16px",
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab panel */}
          <div style={{ padding: "24px 0" }}>

            {/* ── Overview ── */}
            {activeTab === "overview" && (
              <div>
                {props.textBlocks.length === 0 && props.codeBlocks.length === 0 ? (
                  <div style={{
                    padding: "52px 32px", textAlign: "center",
                    background: "#fff", borderRadius: 20, border: "1px dashed #E2E8F0",
                  }}>
                    <Play size={36} color="#C7D2FE" style={{ marginBottom: 12 }} />
                    <p style={{ color: "#94A3B8", fontSize: 14, margin: 0, fontWeight: 500 }}>
                      Shiko videon për të mësuar. Nuk ka tekst shtesë për këtë mësim.
                    </p>
                  </div>
                ) : (
                  <>
                    {props.textBlocks.map((block) => (
                      <div key={block.id} style={{
                        fontSize: 15, color: "#334155", lineHeight: 1.9,
                        marginBottom: 16, whiteSpace: "pre-wrap",
                        background: "#fff", borderRadius: 16, padding: "24px 28px",
                        border: "1px solid #F1F5F9",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}>
                        {block.body}
                      </div>
                    ))}
                    {props.codeBlocks.map((block) => (
                      <div key={block.id} style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}>
                        <div style={{ background: "#1E293B", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", gap: 5 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                          </div>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginLeft: 6 }}>code</span>
                        </div>
                        <pre style={{
                          background: "#0D1117", margin: 0,
                          padding: "22px 26px", fontSize: 13, color: "#E2E8F0",
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          overflowX: "auto", lineHeight: 1.75,
                        }}>
                          {block.body}
                        </pre>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── Resources ── */}
            {activeTab === "resources" && (
              <div>
                {props.pdfAssets.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Materiale PDF
                    </h3>
                    {props.pdfAssets.map((asset) => (
                      <a key={asset.id} href={asset.fileUrl} target="_blank" rel="noreferrer" style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", background: "#fff",
                        border: "1px solid #F1F5F9", borderRadius: 14, marginBottom: 8,
                        textDecoration: "none", color: "#0F172A",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={20} color="#DC2626" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{asset.fileName}</p>
                          {asset.fileSize !== null && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{fmtBytes(asset.fileSize)}</p>}
                        </div>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Download size={15} color="#6366F1" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {props.zipAssets.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Skedarë ZIP
                    </h3>
                    {props.zipAssets.map((asset) => (
                      <a key={asset.id} href={asset.fileUrl} download={asset.fileName} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", background: "#fff",
                        border: "1px solid #F1F5F9", borderRadius: 14, marginBottom: 8,
                        textDecoration: "none", color: "#0F172A",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Archive size={20} color="#7C3AED" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{asset.fileName}</p>
                          {asset.fileSize !== null && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{fmtBytes(asset.fileSize)}</p>}
                        </div>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Download size={15} color="#6366F1" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {props.otherAssets.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Skedarë Tjerë
                    </h3>
                    {props.otherAssets.map((asset) => (
                      <a key={asset.id} href={asset.fileUrl} target="_blank" rel="noreferrer" style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", background: "#fff",
                        border: "1px solid #F1F5F9", borderRadius: 14, marginBottom: 8,
                        textDecoration: "none", color: "#0F172A",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={20} color="#64748B" />
                        </div>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{asset.fileName}</span>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Download size={15} color="#6366F1" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Exercises ── */}
            {activeTab === "exercises" && <ExercisePanel exercises={props.exercises} />}

          </div>

          {/* ── Navigation ── */}
          <div style={{
            display: "flex", alignItems: "stretch", justifyContent: "space-between",
            gap: 12, paddingBottom: 40,
          }}>
            {props.prevLesson ? (
              <Link href={`/course/${props.courseSlug}/learn/${props.prevLesson.id}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 20px", borderRadius: 16,
                border: "1px solid #E2E8F0", background: "#fff",
                textDecoration: "none", flex: 1, maxWidth: 280,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 18, color: "#94A3B8" }}>←</div>
                <div>
                  <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Mëparshëm</div>
                  <div style={{ color: "#0F172A", fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{props.prevLesson.title}</div>
                </div>
              </Link>
            ) : <div />}

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {props.isEnrolled && (
                <MarkCompleteBtn
                  lessonId={props.lessonId}
                  courseSlug={props.courseSlug}
                  nextLessonId={props.nextLesson?.id ?? null}
                  isAlreadyCompleted={props.isCurrentCompleted}
                />
              )}

              {props.nextLesson ? (
                <Link href={`/course/${props.courseSlug}/learn/${props.nextLesson.id}`} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 20px", borderRadius: 16,
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  textDecoration: "none", maxWidth: 280,
                  boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Tjetër</div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{props.nextLesson.title}</div>
                  </div>
                  <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}>→</div>
                </Link>
              ) : props.isEnrolled ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 24px", borderRadius: 16,
                  background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  boxShadow: "0 6px 20px rgba(5,150,105,0.35)",
                }}>
                  <CheckCircle size={18} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.07em" }}>Urime!</div>
                    <div>Kurs i Përfunduar 🎉</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
