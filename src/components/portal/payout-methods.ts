/**
 * Shared between the payout form and the `requestPayout` server action. It
 * cannot live in either: a `"use server"` module may only export async
 * functions, and constants exported from a `"use client"` module are not
 * readable on the server.
 */

export const MIN_PAYOUT = 50;

export const payoutMethods = [
  "Bank transfer",
  "USDT (TRC-20)",
  "Skrill",
  "Wise",
] as const;

export type PayoutMethod = (typeof payoutMethods)[number];

export const payoutMethodNotes: Record<PayoutMethod, string> = {
  "Bank transfer": "Settles one to three business days after release.",
  "USDT (TRC-20)": "Usually lands the same day it is released.",
  Skrill: "Usually lands within a few hours of release.",
  Wise: "Settles one to two business days after release.",
};
