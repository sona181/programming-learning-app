import type { Metadata } from "next";

import { RegisterForm, RegisterHero } from "@/components/auth/register-form";

const benefits = [
  "Begin with a 7-day free trial",
  "Practice with structure that feels clear",
  "Learn live when you want extra support",
] as const;

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account.",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#08122f_0%,#10265f_48%,#1846b5_100%)] lg:h-dvh">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.11),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.12),transparent_28%)]" />
      <div className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-white/7 blur-3xl sm:-right-24 sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]" />
      <div className="absolute -bottom-24 -left-14 h-40 w-40 rounded-full bg-sky-300/10 blur-3xl sm:h-56 sm:w-56 lg:h-72 lg:w-72" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/8 to-transparent" />

      <div className="relative grid min-h-dvh w-full lg:h-dvh lg:grid-cols-[minmax(0,0.88fr)_minmax(460px,640px)] xl:grid-cols-[minmax(0,0.92fr)_minmax(500px,680px)]">
        <section className="relative flex min-w-0 px-0 pb-8 pt-6 text-white sm:px-0 sm:pb-10 sm:pt-8 lg:h-dvh lg:pl-[10%] lg:pr-3 lg:py-7 xl:pl-[10%] xl:pr-4">
          <div className="flex h-full w-full max-w-[800px] flex-col gap-7 opacity-0 animate-[hero-content-reveal_2000ms_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:animate-none motion-reduce:opacity-100 sm:gap-10 lg:justify-between lg:gap-8" style={{ animationDelay: "240ms" }}>
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/12 bg-white/10 px-3 py-2 shadow-[0_12px_36px_rgba(3,8,26,0.16)] backdrop-blur-sm sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/14 sm:h-10 sm:w-10 sm:rounded-xl lg:h-11 lg:w-11">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4 text-white sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M3 7.5 10 4l7 3.5-7 3.5L3 7.5Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 9.2v3.1c0 .7 1.8 1.7 4 1.7s4-1 4-1.7V9.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight sm:text-xl lg:text-[1.35rem]">
                UniLearn
              </span>
            </div>

            <RegisterHero />

            <ul className="space-y-3 sm:space-y-4 lg:mb-10 xl:mb-14">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-base font-medium text-blue-50/95 sm:text-lg lg:text-[1.2rem]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/12 sm:h-10 sm:w-10 sm:rounded-xl lg:h-11 lg:w-11">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 10.5 8 14l8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="relative z-10 flex min-w-0 items-end px-4 pb-6 sm:px-8 sm:pb-10 lg:h-dvh lg:items-center lg:justify-center lg:px-6 lg:py-7 xl:px-8"
        >
          <div
            className="w-full max-w-[600px] rounded-[30px] border border-white/60 bg-white/98 text-slate-950 opacity-0 shadow-[0_28px_90px_rgba(2,8,23,0.34)] backdrop-blur-sm animate-[floating-card-mobile_1200ms_cubic-bezier(0.22,1,0.36,1)_forwards] motion-reduce:animate-none motion-reduce:opacity-100 lg:max-h-[calc(100dvh-3.5rem)] lg:max-w-[620px] lg:animate-[floating-card-reveal_2000ms_cubic-bezier(0.16,1,0.3,1)_forwards] xl:max-w-[640px]"
            style={{ animationDelay: "260ms" }}
          >
            <div className="rounded-[30px] px-4 py-6 sm:px-7 sm:py-10 lg:max-h-[calc(100dvh-3.5rem)] lg:overflow-y-auto lg:px-8 lg:py-7">
              <RegisterForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
