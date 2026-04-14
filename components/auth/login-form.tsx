"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  loginSchema,
  type LoginInput,
  type LoginResponse,
} from "@/lib/validations/login-schema";

const defaultValues: LoginInput = {
  email: "",
  password: "",
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

export function LoginHero() {
  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
        Welcome back!
      </h1>
      <p className="max-w-lg text-base leading-8 text-blue-50/90 sm:text-lg">
        Continue your learning journey. Your courses, sessions and progress are
        all waiting for you.
      </p>
    </div>
  );
}

export function LoginForm() {
  const [serverMessage, setServerMessage] = useState<ServerMessage>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);
    clearErrors();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result =
        ((await response.json().catch(() => null)) as LoginResponse | null) ??
        {
          success: false,
          message: "Something went wrong while signing you in.",
        };

      const fields: Array<keyof LoginInput> = ["email", "password"];

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

      setServerMessage({
        type: "success",
        text: result.message,
      });
    } catch {
      setServerMessage({
        type: "error",
        text: "The login request failed. Please try again.",
      });
    }
  });

  return (
    <div className="relative isolate w-full min-w-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Don&apos;t have one?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="w-full">
        <fieldset disabled={isSubmitting} className="space-y-5 sm:space-y-6">
          <legend className="sr-only">Sign in</legend>

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
            {errors.email?.message ? (
              <p className={errorClassName}>{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={labelClassName}>
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              className={inputClassName}
              {...register("password")}
            />
            {errors.password?.message ? (
              <p className={errorClassName}>{errors.password.message}</p>
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
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#3568e6] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#2f5dd0] disabled:cursor-not-allowed disabled:bg-blue-300 sm:min-h-[56px] sm:px-6 sm:py-4"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}