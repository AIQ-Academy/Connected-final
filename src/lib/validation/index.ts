export {
  contactSchema,
  contactTopics,
  type ContactInput,
  type ContactTopic,
} from "@/lib/validation/contact";
export {
  leadSchema,
  leadSources,
  leadStatuses,
  leadStatusUpdateSchema,
  type LeadInput,
  type LeadSource,
  type LeadStatus,
} from "@/lib/validation/lead";
export {
  newsletterSchema,
  type NewsletterInput,
} from "@/lib/validation/newsletter";
export {
  emailField,
  fullNameField,
  passwordField,
  phoneField,
  registrationFormSchema,
  registrationSchema,
  registrationStepSchemas,
  type RegistrationFormValues,
  type RegistrationInput,
} from "@/lib/validation/registration";

import { z } from "zod";

/**
 * Flattens a Zod error into `{ field: message }`, which is what both the
 * wizard and the JSON APIs hand back to the client.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
