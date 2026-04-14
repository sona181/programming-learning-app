import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Please enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string[]>>;

export type LoginResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  fieldErrors?: LoginFieldErrors;
};