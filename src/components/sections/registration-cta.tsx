import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { Cta } from "@/lib/cms/schemas";
import { brokerRegistrationCta } from "@/lib/landing/broker";
import { signupUrl } from "@/lib/site";

export function RegistrationCtaSection({
  variant = "funded",
  copy: copyOverride,
}: {
  variant?: "funded" | "broker";
  copy?: Cta;
  /** Kept so existing callers do not break; the navy photo fill is gone. */
  backgroundSrc?: string;
}) {
  const funded = {
    title: "The capital is ready. The only variable is you.",
    lead: "Choose a tier between $10,000 and $200,000, clear the evaluation and keep 80% to 90% of everything you make.",
    primary: { href: signupUrl, label: "Create account" },
    secondary: { href: "/how-it-works", label: "Read the rulebook first" },
  };

  const copy =
    copyOverride ?? (variant === "broker" ? brokerRegistrationCta : funded);

  return (
    <Section size="spacious" className="bg-noise overflow-hidden">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <Container className="relative">
        <Reveal>
          <div className="border-line-soft bg-panel/80 rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:p-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_auto]">
              <div>
                <h2 className="text-h1 max-w-3xl">{copy.title}</h2>
                <p className="text-lead text-muted mt-5 max-w-xl">{copy.lead}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink href={copy.primary.href} size="lg">
                  {copy.primary.label}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href={copy.secondary.href} variant="soft" size="lg">
                  {copy.secondary.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
