import { z } from "zod";

import { emailField } from "@/lib/validation/registration";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
  /** Where to land after a successful sign-in. Same-origin paths only. */
  next: z
    .string()
    .regex(/^\/(?!\/)/, "Invalid redirect target.")
    .max(200)
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
