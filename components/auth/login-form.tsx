"use client";

import { useState } from "react";
import Link from "next/link";

export function LoginHero() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
          Welcome back!
        </h1>
        <p className="mt-3 text-base text-blue-100/80 sm:text-lg">
          Continue your learning journey. Your courses, sessions and progress are all waiting for you.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
        <p className="mb-3 text-sm font-medium text-blue-100/80">Student of the week</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 text-sm font-bold text-white">
            BK
          </div>
          <div>
            <p className="font-semibold text-white">Besa Krasniqi</p>
            <p className="text-sm text-blue-100/70">
              2,840 XP this week · 14-day streak 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Sign in to UniLearn
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register free
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="andi.hoxha@uni.edu.al"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In button */}
        <button
          type="button"
          className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Sign In →
        </button>

        {/* Divider */}
        <p className="text-center text-sm text-slate-400">or sign in as a professor</p>

        {/* Sign In as Professor button */}
        <button
          type="button"
          className="w-full rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          Sign In as Professor →
        </button>

        {/* Trial banner */}
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-green-800">7-day free trial active</p>
          <p className="mt-0.5 text-sm text-green-600">5 days remaining on your trial</p>
        </div>
      </div>
    </div>
  );
}