"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Star } from "lucide-react";

export type CourseReviewView = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userInitials: string;
  isCurrentUser?: boolean;
};

type Props = {
  courseId: string;
  initialReviews: CourseReviewView[];
  initialAverageRating: number | null;
  initialReviewCount: number;
  canReview: boolean;
  isLoggedIn: boolean;
  isStudent: boolean;
  isEnrolled: boolean;
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={`${star} stars`}
            disabled={!onChange}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              color: active ? "#F59E0B" : "#D1D5DB",
              cursor: onChange ? "pointer" : "default",
              lineHeight: 0,
            }}
          >
            <Star size={18} fill={active ? "#F59E0B" : "transparent"} />
          </button>
        );
      })}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sq-AL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function CourseReviews({
  courseId,
  initialReviews,
  initialAverageRating,
  initialReviewCount,
  canReview,
  isLoggedIn,
  isStudent,
  isEnrolled,
}: Props) {
  const currentReview = initialReviews.find((review) => review.isCurrentUser);
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(currentReview?.rating ?? 5);
  const [comment, setComment] = useState(currentReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return initialAverageRating;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [initialAverageRating, reviews]);

  const reviewCount = reviews.length || initialReviewCount;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/courses/${courseId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Vleresimi nuk u ruajt.");
      setSubmitting(false);
      return;
    }

    const savedReview: CourseReviewView = {
      ...data.review,
      isCurrentUser: true,
    };

    setReviews((current) => {
      const withoutCurrent = current.filter((review) => !review.isCurrentUser);
      return [savedReview, ...withoutCurrent];
    });
    setMessage(currentReview ? "Vleresimi u perditesua." : "Faleminderit per vleresimin.");
    setSubmitting(false);
  }

  return (
    <section style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #E5E7EB", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
            Vleresime dhe komente
          </h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
            Komente nga studentet qe jane regjistruar ne kete kurs.
          </p>
        </div>

        <div style={{ minWidth: 118, textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1 }}>
            {averageRating ? averageRating.toFixed(1) : "-"}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
            <Stars value={Math.round(averageRating ?? 0)} />
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            {reviewCount} vleresime
          </div>
        </div>
      </div>

      {canReview ? (
        <form onSubmit={handleSubmit} style={{ border: "1px solid #EDE9FE", background: "#FAF5FF", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
              {currentReview ? "Perditeso vleresimin tend" : "Ler nje vleresim"}
            </div>
            <Stars value={rating} onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            placeholder="Shkruaj komentin tend per kursin..."
            style={{
              width: "100%",
              minHeight: 92,
              resize: "vertical",
              border: "1px solid #DDD6FE",
              borderRadius: 12,
              padding: 12,
              fontSize: 14,
              color: "#111827",
              outline: "none",
              background: "#fff",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
            <div style={{ fontSize: 12, color: error ? "#DC2626" : "#6B7280" }}>
              {error ?? message ?? `${comment.length}/1000 karaktere`}
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                border: "none",
                borderRadius: 10,
                background: submitting ? "#A78BFA" : "#7C3AED",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                padding: "10px 16px",
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? "Duke ruajtur..." : "Ruaj vleresimin"}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", borderRadius: 14, padding: 14, fontSize: 13, color: "#4B5563", marginBottom: 20 }}>
          {!isLoggedIn
            ? "Kycu si student per te lene vleresim."
            : !isStudent
              ? "Vleresimet mund te shkruhen vetem nga studentet."
              : !isEnrolled
                ? "Regjistrohu ne kete kurs per te lene vleresim."
                : "Nuk mund te lesh vleresim tani."}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <article key={review.id} style={{ borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                  {review.userInitials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{review.userName}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{formatDate(review.updatedAt)}</div>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Stars value={review.rating} />
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: "8px 0 0" }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div style={{ fontSize: 14, color: "#6B7280", borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
            Ende nuk ka vleresime per kete kurs.
          </div>
        )}
      </div>
    </section>
  );
}
