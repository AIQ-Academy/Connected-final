import { z } from "zod";

import { emailField, fullNameField } from "@/lib/validation/registration";

export const contactTopics = [
  { value: "support", label: "Account support" },
  { value: "sales", label: "Funding & pricing" },
  { value: "partnerships", label: "Partnerships & affiliates" },
  { value: "careers", label: "Careers" },
  { value: "general", label: "Something else" },
] as const;

export const contactSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  topic: z
    .enum(["support", "sales", "partnerships", "careers", "general"], {
      message: "Choose what your message is about.",
    })
    .default("general"),
  message: z
    .string()
    .trim()
    .min(
      20,
      "Give us at least a sentence or two so we can route this properly.",
    )
    .max(4000, "Messages are limited to 4,000 characters."),
  /** Honeypot — real submissions leave this empty. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactTopic = ContactInput["topic"];
