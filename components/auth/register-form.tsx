"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  registerSchema,
  type RegisterInput,
  type RegisterResponse,
} from "@/lib/validations/register-schema";

const defaultValues: RegisterInput = {
  role: "student",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  acceptTerms: false,
  marketingOptIn: false,
};

type ServerMessage =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

const inputClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:min-h-[52px]";

const labelClassName = "text-sm font-medium text-slate-800";

const errorClassName = "mt-2 text-sm text-red-600";

const heroPhrases = [
  "Start small. Build something real.",
  "Every great developer began with one working line.",
  "Learn step by step. Build with confidence.",
  "Progress in programming starts with practice.",
  "Code can open doors when you keep showing up.",
] as const;

const confettiPieces = [
  { left: 8, top: 12, width: 10, height: 18, x: -26, y: 140, rotate: -140, delay: 0, color: "#1d4ed8", shape: "soft" },
  { left: 15, top: 4, width: 8, height: 8, x: -12, y: 116, rotate: 90, delay: 45, color: "#f59e0b", shape: "round" },
  { left: 22, top: 10, width: 9, height: 16, x: -18, y: 152, rotate: -110, delay: 90, color: "#38bdf8", shape: "soft" },
  { left: 29, top: 0, width: 12, height: 18, x: -2, y: 132, rotate: 120, delay: 130, color: "#10b981", shape: "soft" },
  { left: 37, top: 8, width: 8, height: 8, x: 8, y: 124, rotate: 80, delay: 170, color: "#eab308", shape: "round" },
  { left: 44, top: 2, width: 10, height: 18, x: 4, y: 156, rotate: 160, delay: 210, color: "#60a5fa", shape: "soft" },
  { left: 51, top: 10, width: 10, height: 10, x: 0, y: 132, rotate: -90, delay: 250, color: "#f97316", shape: "round" },
  { left: 58, top: 3, width: 9, height: 16, x: 18, y: 150, rotate: 135, delay: 290, color: "#2563eb", shape: "soft" },
  { left: 65, top: 11, width: 8, height: 8, x: 20, y: 126, rotate: 90, delay: 330, color: "#14b8a6", shape: "round" },
  { left: 72, top: 0, width: 12, height: 18, x: 24, y: 146, rotate: 180, delay: 370, color: "#93c5fd", shape: "soft" },
  { left: 79, top: 12, width: 8, height: 8, x: 16, y: 118, rotate: -80, delay: 420, color: "#facc15", shape: "round" },
  { left: 86, top: 5, width: 10, height: 16, x: 30, y: 138, rotate: 150, delay: 470, color: "#0ea5e9", shape: "soft" },
  { left: 92, top: 10, width: 9, height: 18, x: 38, y: 148, rotate: 120, delay: 520, color: "#22c55e", shape: "soft" },
] as const;

function StudentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11.6v4c0 .9 2.2 2.4 5 2.4s5-1.5 5-2.4v-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfessorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M5 6.5h10.5a2.5 2.5 0 0 1 0 5H8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6.5v11h11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 10.5v7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 17.5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RegisterHero() {
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [isPhraseVisible, setIsPhraseVisible] = useState(true);

  useEffect(() => {
    let timeoutId: number | undefined;

    const intervalId = window.setInterval(() => {
      setIsPhraseVisible(false);

      timeoutId = window.setTimeout(() => {
        setActivePhraseIndex((currentIndex) => (currentIndex + 1) % heroPhrases.length);
        setIsPhraseVisible(true);
      }, 260);
    }, 4200);

    return () => {
      window.clearInterval(intervalId);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="max-w-xl space-y-4 sm:space-y-5 lg:space-y-4">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-100/72 sm:text-[0.95rem] lg:text-base">
        Learn, practice, teach
      </p>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.15rem] xl:text-[3.7rem]">
        A steadier way to grow with code.
      </h1>
      <div className="min-h-[5.5rem] sm:min-h-[6.25rem] lg:min-h-[5.8rem]">
        <p
          className={`max-w-lg text-lg leading-8 text-blue-50/92 transition-all duration-500 ease-out motion-reduce:transition-none sm:text-xl sm:leading-9 lg:text-[1.3rem] lg:leading-8 ${
            isPhraseVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {heroPhrases[activePhraseIndex]}
        </p>
      </div>
      <p className="max-w-lg text-base leading-7 text-blue-100/78 sm:text-lg sm:leading-8 lg:text-lg lg:leading-7">
        UniLearn gives beginners a clear place to practice and gives
        professors a calm space to guide that progress.
      </p>
    </div>
  );
}

export function RegisterForm() {
  const [serverMessage, setServerMessage] = useState<ServerMessage>(null);
  const [confettiBurst, setConfettiBurst] = useState(0);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const selectedRole = useWatch({
    control,
    name: "role",
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);
    clearErrors();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result =
        ((await response.json().catch(() => null)) as RegisterResponse | null) ??
        {
          success: false,
          message: "Something went wrong while creating your account.",
        };

      const fields: Array<keyof RegisterInput> = [
        "role",
        "firstName",
        "lastName",
        "email",
        "password",
        "acceptTerms",
        "marketingOptIn",
      ];

      for (const field of fields) {
        const message = result.fieldErrors?.[field]?.[0];

        if (message) {
          setError(field, {
            type: "server",
            message,
          });
        }
      }

      if (!response.ok || !result.success) {
        setServerMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      reset(defaultValues);

      setServerMessage({
        type: "success",
        text: result.message,
      });
      setConfettiBurst((currentBurst) => currentBurst + 1);
    } catch {
      setServerMessage({
        type: "error",
        text: "The register request failed. Please try again.",
      });
    }
  });

  const getConfettiStyle = (piece: (typeof confettiPieces)[number]): CSSProperties => ({
    left: `${piece.left}%`,
    top: `${piece.top}%`,
    width: `${piece.width}px`,
    height: `${piece.height}px`,
    backgroundColor: piece.color,
    animation: `confetti-fall 1600ms cubic-bezier(0.16, 1, 0.3, 1) ${piece.delay}ms forwards`,
    ["--confetti-x" as string]: `${piece.x}px`,
    ["--confetti-y" as string]: `${piece.y}px`,
    ["--confetti-rotate" as string]: `${piece.rotate}deg`,
  });

  return (
    <div className="relative isolate w-full min-w-0">
      {confettiBurst > 0 ? (
        <div
          key={confettiBurst}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-48 overflow-hidden"
        >
          {confettiPieces.map((piece, index) => (
            <span
              key={index}
              className={`absolute block ${
                piece.shape === "round" ? "rounded-full" : "rounded-[4px]"
              }`}
              style={getConfettiStyle(piece)}
            />
          ))}
        </div>
      ) : null}

      <div className="mb-6 sm:mb-8 lg:mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-[2rem]">
          Create your UniLearn account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Already with us?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="w-full">
        <fieldset disabled={isSubmitting} className="space-y-5 sm:space-y-6 lg:space-y-4">
          <legend className="sr-only">Create account</legend>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              How will you use UniLearn?
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <label
                className={`cursor-pointer rounded-2xl border p-4 text-center transition sm:rounded-3xl sm:p-5 lg:p-4 ${
                  selectedRole === "student"
                    ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input type="radio" value="student" className="sr-only" {...register("role")} />
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm sm:h-12 sm:w-12">
                  <StudentIcon />
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-950 sm:mt-4 sm:text-xl">
                  Student
                </p>
                <p className="mt-1 text-sm text-slate-500">I&apos;m here to learn</p>
              </label>

              <label
                className={`cursor-pointer rounded-2xl border p-4 text-center transition sm:rounded-3xl sm:p-5 lg:p-4 ${
                  selectedRole === "professor"
                    ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input type="radio" value="professor" className="sr-only" {...register("role")} />
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm sm:h-12 sm:w-12">
                  <ProfessorIcon />
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-950 sm:mt-4 sm:text-xl">
                  Professor
                </p>
                <p className="mt-1 text-sm text-slate-500">I&apos;m here to teach</p>
              </label>
            </div>
            {errors.role?.message ? <p className={errorClassName}>{errors.role.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 lg:py-2.5">
            You can try UniLearn free for 7 days. No card needed to start.
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div>
              <label htmlFor="firstName" className={labelClassName}>
                First name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                aria-invalid={errors.firstName ? "true" : "false"}
                className={inputClassName}
                {...register("firstName")}
              />
              {errors.firstName?.message ? (
                <p className={errorClassName}>{errors.firstName.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="lastName" className={labelClassName}>
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                aria-invalid={errors.lastName ? "true" : "false"}
                className={inputClassName}
                {...register("lastName")}
              />
              {errors.lastName?.message ? (
                <p className={errorClassName}>{errors.lastName.message}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClassName}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              className={inputClassName}
              {...register("email")}
            />
            {errors.email?.message ? <p className={errorClassName}>{errors.email.message}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className={labelClassName}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.password ? "true" : "false"}
              className={inputClassName}
              {...register("password")}
            />
            {errors.password?.message ? (
              <p className={errorClassName}>{errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <p className={labelClassName}>Terms &amp; Conditions</p>
            <div className="mt-2 max-h-24 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:max-h-28 sm:leading-7 lg:max-h-20">
              <p>
                By creating an account, you agree to our Terms of Service and
                Privacy Policy. Students can explore courses, guided practice,
                and live sessions through the platform.
              </p>
              <p className="mt-3">
                Professors are expected to maintain professional conduct and
                accurate availability. All users are responsible for keeping
                their work respectful, original, and aligned with platform
                guidelines.
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="flex items-start gap-2.5 text-sm leading-6 text-slate-700 sm:gap-3">
              <input
                type="checkbox"
                aria-invalid={errors.acceptTerms ? "true" : "false"}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
                {...register("acceptTerms")}
              />
              <span>
                I have read and agree to the{" "}
                <span className="font-medium text-blue-600">Terms of Service</span> and{" "}
                <span className="font-medium text-blue-600">Privacy Policy</span>
              </span>
            </label>
            {errors.acceptTerms?.message ? (
              <p className={errorClassName}>{errors.acceptTerms.message}</p>
            ) : null}

            <label className="flex items-start gap-2.5 text-sm leading-6 text-slate-700 sm:gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
                {...register("marketingOptIn")}
              />
              <span>
                I agree to receive emails about courses, promotions and platform
                updates (optional)
              </span>
            </label>
            {errors.marketingOptIn?.message ? (
              <p className={errorClassName}>{errors.marketingOptIn.message}</p>
            ) : null}
          </div>

          {serverMessage ? (
            <div
              aria-live="polite"
              className={`rounded-2xl border px-4 py-3 text-sm ${
                serverMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {serverMessage.text}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#3368e6_0%,#2959ca_100%)] px-5 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_rgba(41,89,202,0.22)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none sm:min-h-[56px] sm:px-6 sm:py-4"
          >
            {isSubmitting ? "Creating account..." : "Create my account"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
