import { Prisma } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth/hash";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  type RegisterResponse,
} from "@/lib/validations/register-schema";

function json(body: RegisterResponse, status: number) {
  return Response.json(body, { status });
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

  const validated = registerSchema.safeParse(payload);

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

  const { role, firstName, lastName, email, password } = validated.data;
  const mappedRole = role === "professor" ? "instructor" : "student";
  const displayName = `${firstName} ${lastName}`;
  const now = new Date();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return json(
      {
        success: false,
        message: "A user with that email already exists.",
        fieldErrors: {
          email: ["A user with this email already exists."],
        },
      },
      409,
    );
  }

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: mappedRole,
        isActive: true,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
        profile: {
          create: {
            displayName,
            createdAt: now,
            updatedAt: now,
          },
        },
        settings: {
          create: {
            emailNotifications: false,
            language: "en",
            darkMode: false,
            updatedAt: now,
          },
        },
        // There is no marketing-consent field in the current schema yet.
        instructorProfile:
          mappedRole === "instructor"
            ? {
                create: {
                  isVerified: false,
                  isAvailable: false,
                  createdAt: now,
                  updatedAt: now,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      201,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return json(
        {
          success: false,
          message: "A user with that email already exists.",
          fieldErrors: {
            email: ["A user with this email already exists."],
          },
        },
        409,
      );
    }

    console.error("Register route error:", error);

    return json(
      {
        success: false,
        message: "Something went wrong while creating the account.",
      },
      500,
    );
  }
}
