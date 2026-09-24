import { z } from "zod";

import { emailField, fullNameField } from "@/lib/validation/registration";

export const leadSources = [
  "registration",
  "contact_form",
  "ai_chatbot",
  "newsletter",
] as const;

export type LeadSource = (typeof leadSources)[number];

export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

/** Shared by the chatbot's `captureLead` tool and the CRM write path. */
export const leadSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  phone: z.string().trim().max(24).optional(),
  country: z.string().trim().max(80).optional(),
  source: z.enum(leadSources).default("ai_chatbot"),
  interestedTier: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadStatusUpdateSchema = z.object({
  leadId: z.uuid("That lead reference is not valid."),
  status: z.enum(leadStatuses),
});
