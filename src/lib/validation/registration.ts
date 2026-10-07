import { z } from "zod";

import { countries, experienceOptions } from "@/lib/countries";

const countryValues = countries as readonly string[];
const experienceValues = experienceOptions.map((o) => o.value) as [
  "none",
  "under_1y",
  "1_3y",
  "3_5y",
  "over_5y",
];

export const fullNameField = z
  .string()
  .trim()
  .min(2, "Enter your full legal name.")
  .max(120, "Names are limited to 120 characters.")
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}'’\-. ]*$/u,
    "Use letters, spaces, hyphens and apostrophes only.",
  );

export const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "That email address is too long.")
  .pipe(z.email("Enter a valid email address."))
  .transform((value) => value.toLowerCase());

export const phoneField = z
  .string()
  .trim()
  .min(7, "Enter a contact number we can reach you on.")
  .max(24, "That number is too long.")
  .regex(
    /^\+?[0-9][0-9\s().-]{5,}$/,
    "Use digits, and start with + for an international number.",
  );

/**
 * Deliberately readable rules — traders abandon signup over opaque password
 * requirements far more often than they get breached by a 10-character
 * passphrase that mixes a digit in.
 */
export const passwordField = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "Passwords are limited to 200 characters.")
  .regex(/[a-zA-Z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const countryField = z
  .string()
  .refine((value) => countryValues.includes(value), "Select your country.");

export const experienceField = z.enum(experienceValues, {
  message: "Tell us how long you have been trading.",
});

export const tierCodeField = z
  .string()
  .trim()
  .min(1, "Choose the account you want to trade.");

const identityShape = {
  fullName: fullNameField,
  email: emailField,
  phone: phoneField,
  password: passwordField,
};

const profileShape = {
  country: countryField,
  experience: experienceField,
};

const tierShape = {
  tierCode: tierCodeField,
};

const consentShape = {
  acceptTerms: z.literal(true, {
    message: "Accept the terms and risk disclosure to continue.",
  }),
  marketingOptIn: z.boolean().default(false),
};

/** The payload `POST /api/register` accepts. */
export const registrationSchema = z.object({
  ...identityShape,
  ...profileShape,
  ...tierShape,
  ...consentShape,
});

const passwordsMatch = (
  data: { password: string; confirmPassword: string },
  ctx: z.RefinementCtx,
) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Both passwords must match.",
    });
  }
};

/** The client-side shape, which additionally confirms the password. */
export const registrationFormSchema = registrationSchema
  .extend({ confirmPassword: z.string() })
  .superRefine(passwordsMatch);

/**
 * One schema per wizard step so a step can be validated in isolation and
 * block advancement without touching fields the trader has not reached yet.
 */
export const registrationStepSchemas = [
  z
    .object({ ...identityShape, confirmPassword: z.string() })
    .superRefine(passwordsMatch),
  z.object(profileShape),
  z.object(tierShape),
  z.object(consentShape),
] as const;

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type RegistrationFormValues = z.input<typeof registrationFormSchema>;
