import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { Cta } from "@/lib/cms/schemas";
import { marketingImages } from "@/lib/images";
import { brokerRegistrationCta } from "@/lib/landing/broker";

export function RegistrationCtaSection({
  copy: copyOverride,
  backgroundSrc,
}: {
  copy?: Cta;
  backgroundSrc?: string;
}) {
  const copy = copyOverride ?? brokerRegistrationCta;
  const background = backgroundSrc ?? marketingImages.accountTiers.src;

  return (
    <Section
      size="spacious"
      className="trading-horizon isolate overflow-hidden text-white"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(3, 8, 23, 0.5)",
      }}
      data-bg-fixed
    >
      <Container className="text-center">
        <Reveal delay={0.18}>
          <h2 className="text-h1 mx-auto mt-7 max-w-3xl text-white/80">
            {copy.title}
          </h2>
        </Reveal>

        <Reveal delay={0.26}>
          <p className="text-lead mx-auto mt-7 max-w-xl text-white/75">
            {copy.lead}
          </p>
        </Reveal>

        <Reveal delay={0.34}>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              href={copy.primary.href}
              size="lg"
              block
              className="sm:w-auto"
            >
              {copy.primary.label}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href={copy.secondary.href}
              variant="outline"
              size="lg"
              block
              className="border-white/25 bg-white/8 text-white backdrop-blur-md hover:border-white/45 hover:bg-white/15 hover:text-white sm:w-auto"
            >
              {copy.secondary.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
