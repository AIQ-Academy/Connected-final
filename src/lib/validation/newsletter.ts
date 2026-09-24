import { z } from "zod";

import { emailField } from "@/lib/validation/registration";

export const newsletterSchema = z.object({
  email: emailField,
  /** Honeypot — real submissions leave this empty. */
  company: z.string().max(0).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
