"use client";

import { useState } from "react";

import { AiOnboarding } from "@/components/register/ai-onboarding";
import {
  RegisterWizard,
  type WizardTier,
} from "@/components/register/register-wizard";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

export function RegisterExperience({
  tiers,
  initialTierCode,
  initialMode = "ai",
}: {
  tiers: WizardTier[];
  initialTierCode?: string;
  initialMode?: "ai" | "classic";
}) {
  const [mode, setMode] = useState<"ai" | "classic">(initialMode);
  const { locale } = useLocale();
  const labels = locale === "fr"
    ? { aria: "Mode d’inscription", ai: "Inscription avec IA", classic: "Formulaire classique" }
    : locale === "ar"
      ? { aria: "طريقة التسجيل", ai: "إعداد بالذكاء الاصطناعي", classic: "النموذج التقليدي" }
      : { aria: "Registration mode", ai: "AI onboarding", classic: "Classic form" };

  return (
    <div>
      <div
        role="tablist"
        aria-label={labels.aria}
        className="border-line bg-raised mb-8 inline-flex rounded-xl border p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "ai"}
          onClick={() => setMode("ai")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === "ai"
              ? "bg-brand text-white"
              : "text-muted hover:text-ink",
          )}
        >
          {labels.ai}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "classic"}
          onClick={() => setMode("classic")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === "classic"
              ? "bg-brand text-white"
              : "text-muted hover:text-ink",
          )}
        >
          {labels.classic}
        </button>
      </div>

      {mode === "ai" ? (
        <AiOnboarding tiers={tiers} initialTierCode={initialTierCode} />
      ) : (
        <RegisterWizard tiers={tiers} />
      )}
    </div>
  );
}
