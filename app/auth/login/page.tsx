import type { Metadata } from "next";
import { LoginForm, LoginHero } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your UniLearn account.",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-white">
      <div className="grid min-h-dvh w-full overflow-hidden lg:grid-cols-[1fr_1.03fr]">

        {/* Left hero section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#274cc8] to-[#3b78f1] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute -right-16 -top-14 h-72 w-72 rounded-full bg-white/6 sm:h-80 sm:w-80" />
          <div className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-white/8 sm:h-52 sm:w-52" />

          <div className="relative flex h-full flex-col justify-between gap-10 lg:gap-14">
            {/* Logo */}
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
                  <path d="M3 7.5 10 4l7 3.5-7 3.5L3 7.5Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 9.2v3.1c0 .7 1.8 1.7 4 1.7s4-1 4-1.7V9.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight sm:text-xl lg:text-[1.35rem]">
                UniLearn
              </span>
            </div>

            {/* Hero */}
            <LoginHero />

            {/* Bottom spacer */}
            <div />
          </div>
        </section>

        {/* Right form section */}
        <section className="flex min-h-full items-center border-t border-slate-100 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-[520px]">
            <LoginForm />
          </div>
        </section>

      </div>
    </main>
  );
}