import Link from "next/link";

import "./landing.css";

export default function HomePage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-shell landing-nav-inner">
          <div className="land-logo">
            <div className="land-logo-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="land-logo-name">UniLearn</span>
          </div>

          <div className="land-nav-links">
            <span>Courses</span>
            <span>Professors</span>
            <span>Pricing</span>
            <span>About</span>
          </div>

          <div className="land-nav-btns">
            <Link href="/auth/login" className="btn-o btn-sm">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-p btn-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="landing-shell hero-inner">
          <div className="hero-badge">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            7-day free trial — no credit card needed
          </div>

          <h1>
            Learn anything from
            <br />
            <span>real university professors</span>
          </h1>

          <p>
            UniLearn connects Albanian university students with qualified
            professors for live video sessions, structured courses, and
            interactive learning across all subjects.
          </p>

          <div className="hero-btns">
            <Link href="/auth/register" className="btn-hero btn-hero-p">
              Start Free Trial →
            </Link>
            <button className="btn-hero btn-hero-o">Browse Courses</button>
          </div>

          <div className="hero-stats">
            <div className="hs">
              <div className="n">3,200+</div>
              <div className="l">Students</div>
            </div>
            <div className="hs">
              <div className="n">180+</div>
              <div className="l">Professors</div>
            </div>
            <div className="hs">
              <div className="n">420+</div>
              <div className="l">Courses</div>
            </div>
            <div className="hs">
              <div className="n">4.8★</div>
              <div className="l">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="landing-shell features-inner">
          <div className="features-title">Everything you need to succeed</div>
          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-icon" style={{ background: "#EFF6FF" }}>
                📹
              </div>
              <div className="feat-title">Live Video Sessions</div>
              <div className="feat-desc">
                Book 1-on-1 or group sessions directly with your professor.
                Reschedule or get refunded if plans change.
              </div>
            </div>

            <div className="feat-card">
              <div className="feat-icon" style={{ background: "#F0FDFA" }}>
                📚
              </div>
              <div className="feat-title">Structured Courses</div>
              <div className="feat-desc">
                Follow professor-designed courses with videos, readings, quizzes
                and assignments — all in one place.
              </div>
            </div>

            <div className="feat-card">
              <div className="feat-icon" style={{ background: "#FFF7ED" }}>
                🏆
              </div>
              <div className="feat-title">Track Your Progress</div>
              <div className="feat-desc">
                Earn XP, unlock badges, and watch your skills grow with
                Duolingo-style progress tracking.
              </div>
            </div>

            <div className="feat-card">
              <div className="feat-icon" style={{ background: "#F5F3FF" }}>
                💬
              </div>
              <div className="feat-title">Direct Messaging</div>
              <div className="feat-desc">
                Chat with professors before and after sessions. Ask questions,
                share files, stay connected.
              </div>
            </div>

            <div className="feat-card">
              <div className="feat-icon" style={{ background: "#ECFDF5" }}>
                🎓
              </div>
              <div className="feat-title">All Subjects</div>
              <div className="feat-desc">
                From Mathematics to Law, Computer Science to Literature — find
                professors in every field.
              </div>
            </div>

            <div className="feat-card">
              <div className="feat-icon" style={{ background: "#FFFBEB" }}>
                💳
              </div>
              <div className="feat-title">Flexible Payments</div>
              <div className="feat-desc">
                Subscribe monthly or buy individual sessions. Missed a paid
                session? We&apos;ll refund you automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
