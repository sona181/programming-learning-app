import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "unilearn_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthSessionUser = {
  email: string;
  id: string;
  role: string;
};

type SessionPayload = AuthSessionUser & {
  exp: number;
};

function getSessionSecret() {
  const secret =
    process.env.AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET or SESSION_SECRET must be set in production.");
  }

  return "development-only-session-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function createSessionToken(user: AuthSessionUser) {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function getSessionCookieHeader(user: AuthSessionUser) {
  const token = createSessionToken(user);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    secure,
  ]
    .filter(Boolean)
    .join("; ");
}

export function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !verifySignature(encodedPayload, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

    if (!payload.id || !payload.email || !payload.role || payload.exp < Date.now() / 1000) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    } satisfies AuthSessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentSessionUser() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
