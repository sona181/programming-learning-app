import { Prisma } from "@/app/generated/prisma/client";
import { createSessionToken, getSessionCookieHeader } from "@/lib/auth/session";
import { corsHeaders } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  type LoginResponse,
} from "@/lib/validations/login-schema";
import { compare } from "bcryptjs";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function json(body: LoginResponse, status: number) {
  return Response.json(body, { status, headers: corsHeaders() });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json(
      {
        success: false,
        message: "Invalid request body.",
      },
      400,
    );
  }

  const validated = loginSchema.safeParse(payload);

  if (!validated.success) {
    return json(
      {
        success: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: validated.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { email, password } = validated.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return json(
        {
          success: false,
          message: "Invalid email or password.",
          fieldErrors: {
            email: ["Invalid email or password."],
            password: ["Invalid email or password."],
          },
        },
        401,
      );
    }

    if (!user.isActive) {
      return json(
        {
          success: false,
          message: "This account is disabled.",
        },
        403,
      );
    }

    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return json(
        {
          success: false,
          message: "Invalid email or password.",
          fieldErrors: {
            email: ["Invalid email or password."],
            password: ["Invalid email or password."],
          },
        },
        401,
      );
    }

    return authenticatedJson({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return json(
        {
          success: false,
          message: "Invalid email or password.",
          fieldErrors: {
            email: ["Invalid email or password."],
            password: ["Invalid email or password."],
          },
        },
        401,
      );
    }

    console.error("Login route error:", error);

    return json(
      {
        success: false,
        message: "Something went wrong while signing you in.",
      },
      500,
    );
  }
}

function authenticatedJson(user: { email: string; id: string; role: string }) {
  const token = createSessionToken(user);
  return Response.json(
    {
      success: true,
      message: "Signed in successfully.",
      user,
      token,
    } satisfies LoginResponse,
    {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Set-Cookie": getSessionCookieHeader(user),
      },
    },
  );
}

