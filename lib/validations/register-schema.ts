import { z } from "zod";

export const registerSchema = z.object({
  role: z.enum(["student", "professor"], {
    message: "Please choose a role.",
  }),
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be 50 characters or fewer."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be 50 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters."),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "You must accept the terms.",
  }),
  marketingOptIn: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterFieldErrors = Partial<Record<keyof RegisterInput, string[]>>;

export type RegisterResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  fieldErrors?: RegisterFieldErrors;
};
