import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MessageSquare, Scale } from "lucide-react";

import { LegalCrossLinks } from "@/components/legal/legal-cross-links";
import { LegalProse } from "@/components/legal/legal-prose";
import { LegalToc } from "@/components/legal/legal-toc";
import { TemplateNotice } from "@/components/legal/template-notice";
import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { getLegalDocument, legalSlugs } from "@/lib/legal-content";
import { site } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return legalSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDocument(slug);

  if (!doc) {
    return {
      title: "Legal",
      description:
        "Terms, privacy, risk disclosure, AML and KYC and refund documentation for the Connect Funded trader programme.",
    };
  }

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLegalDocument(slug);

  if (!doc) notFound();

  return (
    <>
      <section className="bg-noise relative overflow-hidden pt-14 pb-12 sm:pt-20 lg:pt-24 lg:pb-16">
        <Aurora intensity="subtle" />
        <GridBackdrop />
        <div
          aria-hidden="true"
          className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
        />

        <Container className="relative">
          <Reveal direction="none">
            <Eyebrow>Legal · {site.name}</Eyebrow>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6 max-w-3xl">{doc.title}</h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {doc.intro}
            </p>
          </Reveal>

          <Reveal
            delay={0.18}
            className="text-faint mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[0.6875rem] tracking-[0.12em] uppercase"
          >
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Last updated {doc.lastUpdated}
            </span>
            <span className="inline-flex items-center gap-2">
              <Scale className="size-3.5" aria-hidden="true" />
              {doc.sections.length} sections
            </span>
          </Reveal>
        </Container>
      </section>

      <Section className="pt-6 sm:pt-8 lg:pt-10">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:self-start">
              <LegalToc
                sections={doc.sections}
                lastUpdated={doc.lastUpdated}
              />
            </div>

            <div>
              <TemplateNotice />
              <div className="mt-12">
                <LegalProse sections={doc.sections} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <LegalCrossLinks current={doc.slug} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border px-6 py-14 sm:px-12 lg:py-16">
            <Aurora intensity="subtle" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="border-line-soft bg-raised text-brand-light grid size-12 place-items-center rounded-2xl border">
                  <MessageSquare className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-h2 mt-6">
                  Questions about this policy?
                </h2>
                <p className="text-lead text-muted mt-4">
                  If any part of the {doc.shortTitle.toLowerCase()}{" "}
                  documentation is unclear, or you believe a provision has been
                  applied incorrectly to your account, write to the desk and ask
                  before you act on it. Compliance and risk questions are
                  answered by the desk that owns the decision, not by a support
                  script.
                </p>
                <p className="text-faint mt-4 text-sm">
                  Written enquiries reach us at{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-brand-light font-mono hover:underline"
                  >
                    {site.email}
                  </a>
                  , or through a timestamped ticket in the client portal.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <ButtonLink href="/contact" size="lg">
                  Contact the desk
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/faq" variant="soft" size="lg">
                  Read the FAQ
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
