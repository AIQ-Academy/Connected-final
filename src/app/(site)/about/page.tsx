import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Handshake,
  Percent,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Careers, openRoles } from "@/components/about/careers";
import { DeskTeams } from "@/components/about/desk-teams";
import { DifferentiatorGrid } from "@/components/about/differentiator-grid";
import { Roadmap } from "@/components/about/roadmap";
import { SocialWallSection } from "@/components/sections/social-wall";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { companyStats } from "@/lib/content";
import { createMediaResolver, type ResolvedImage } from "@/lib/cms/media";
import { homeAbout } from "@/lib/landing/home";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Who Connect Funded is, how the funding model actually makes money, the desks that run it, and the capability roadmap behind a multi-asset funded trading programme operated from the DIFC.",
};

const principles = [
  {
    icon: Scale,
    title: "Publish the rule before enforcing it",
    body: "Every limit that can close an account is written down and priced into the page you bought from. If a rule is not published, it does not exist, and we do not get to invent it after a profitable month.",
  },
  {
    icon: ShieldCheck,
    title: "Enforce automatically, never by hand",
    body: "Drawdown checks run at the platform against live equity. Nobody at the firm decides whether your breach counts, because nobody at the firm is in that loop.",
  },
  {
    icon: Percent,
    title: "Pay on the published cadence",
    body: "Bi-weekly, or weekly on Professional, released within 24 to 48 hours of approval. We absorb the processing fee on every rail, so the number you request is the number that lands.",
  },
  {
    icon: Handshake,
    title: "Say no clearly and early",
    body: "Where an answer is no — a rejected payout, a prohibited strategy, a failed verification — you get the reason and the route to appeal it, not a template about our terms.",
  },
  {
    icon: Sparkles,
    title: "Scale the relationship, not the churn",
    body: "The business only works if funded traders stay funded. Scaling, education and support all exist because a trader in their second year is worth more than four who reset once.",
  },
];

const revenueLines = [
  {
    label: "Evaluation fees",
    value: "$99 – $899",
    body: "Charged once, per attempt, at the tier you choose. Most evaluations do not reach funded status, and those fees are what pay for the liquidity, the platforms, the risk engine and the desks that run them.",
  },
  {
    label: "Our share of funded performance",
    value: "10% – 20%",
    body: "The remainder after your split: 20% on the 80% tiers, 15% on the 85% tiers and 10% on Professional. It is the only line that grows when you do, which is deliberate.",
  },
];

const notCharged = [
  "No withdrawal or processing fees on any rail",
  "No monthly platform, data or terminal fee",
  "No commission added on top of the raw spread",
  "No charge for the Trading Academy or desk sessions",
  "Your evaluation fee returned with the first payout",
];

export default async function AboutPage() {
  const image = await createMediaResolver();

  return (
    <>
      <PageHero image={image("section.about")} />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div>
              <Reveal>
                <Eyebrow className="mb-4">The founding thesis</Eyebrow>
                <h2 className="text-h2 max-w-xl">
                  Capital, not talent, is the binding constraint.
                </h2>
              </Reveal>

              <Reveal delay={0.08} className="text-muted mt-6 space-y-5">
                <p className="text-lead">
                  Connect Funded was assembled in 2019 by people who had spent
                  their careers on institutional desks and kept meeting the same
                  trader: technically sound, properly disciplined, and running
                  four thousand dollars.
                </p>
                <p>
                  That trader does not have an edge problem. They have a
                  position-sizing problem imposed by the size of their account,
                  and no amount of skill fixes it. Give the same person
                  $100,000 with a published rulebook and a real payout schedule
                  and the arithmetic changes completely.
                </p>
                <p>
                  So the firm was built around one question: what does a funded
                  programme look like if you assume the trader is competent and
                  the operator is the variable? The answer turned out to be
                  unglamorous. Publish every rule. Enforce it in software.
                  Settle payouts on a calendar rather than on request. Refuse to
                  bury a consistency clause in the terms that quietly makes the
                  advertised split unreachable.
                </p>
                <p>
                  We are not a broker and we do not hold client deposits for
                  trading. Traders pay once for an evaluation, trade firm
                  capital under the rules published on this site, and take the
                  larger share of what they make. That is the whole model, and
                  the next section sets out the money behind it.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.12} direction="left" className="lg:pt-16">
              <figure className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border p-8">
                <Aurora intensity="subtle" />
                <blockquote className="relative">
                  <p className="text-ink font-display text-xl leading-snug font-medium sm:text-2xl">
                    &ldquo;A funded account is a contract, not a favour. The
                    only thing that makes it credible is that every term is
                    published before the trader pays, and that none of them move
                    afterwards.&rdquo;
                  </p>
                </blockquote>
                <figcaption className="border-line-soft text-muted relative mt-6 border-t pt-5 text-sm">
                  The operating principle the risk desk works to
                </figcaption>
              </figure>

              <div className="border-line-soft bg-raised mt-5 rounded-2xl border p-6">
                <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  Registered base
                </p>
                <p className="text-ink mt-2 flex items-start gap-2.5 text-sm leading-relaxed">
                  <Building2
                    className="text-brand-light mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {site.address}
                </p>
                <p className="text-muted mt-3 text-[0.8125rem] leading-relaxed">
                  Trader-facing operations run from Dubai across the Asian,
                  European and US sessions, with remote desks throughout Europe,
                  the Middle East and Africa.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="mission" className="scroll-mt-28">
        <Container>
          <SectionHeading
            eyebrow="Mission & vision"
            title="What we are here to do, and where we are going."
            lead="Two statements that sit behind the rulebook, the desks and the payment rails — not slogans on a wall."
          />

          <Reveal
            delay={0.08}
            className="border-line-soft bg-line-soft mt-12 grid gap-px overflow-hidden rounded-[2rem] border lg:grid-cols-2"
          >
            {[homeAbout.mission, homeAbout.vision].map((statement) => (
              <article
                key={statement.eyebrow}
                className="bg-panel px-5 py-6 sm:px-7 sm:py-8"
              >
                <p className="text-faint font-mono text-[0.75rem] tracking-[0.16em] uppercase">
                  {statement.eyebrow}
                </p>
                <p className="text-muted mt-3 text-[0.9375rem] leading-relaxed sm:text-base">
                  {statement.body}
                </p>
              </article>
            ))}
          </Reveal>
        </Container>
      </Section>

      <section className="bg-raised border-line-soft border-y">
        <Container>
          <StaggerGroup className="grid gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
            {companyStats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <p className="text-ink font-display tabular text-4xl font-semibold sm:text-5xl">
                  {stat.value}
                </p>
                <p className="text-faint mt-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                  {stat.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="How we make money"
            title="Two revenue lines, both of them on this page."
            lead="Prop firms have a reputation for vagueness here, so this is stated plainly: we are paid by evaluation fees and by a minority share of funded performance. There is nothing else."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="grid gap-5 sm:grid-cols-2">
              {revenueLines.map((line) => (
                <Reveal
                  key={line.label}
                  className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6"
                >
                  <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    {line.label}
                  </p>
                  <p className="text-gradient font-display tabular mt-3 text-3xl font-semibold">
                    {line.value}
                  </p>
                  <p className="text-muted mt-4 text-sm leading-relaxed">
                    {line.body}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal
              delay={0.08}
              className="border-line-soft bg-raised rounded-2xl border p-6"
            >
              <h3 className="text-ink font-display text-base font-semibold">
                What we never charge for
              </h3>
              <ul className="mt-4 space-y-3">
                {notCharged.map((item) => (
                  <li
                    key={item}
                    className="text-muted flex gap-2.5 text-sm leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-mint mt-2 size-1.5 shrink-0 rounded-full"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <p className="text-faint border-line-soft mt-8 max-w-3xl border-t pt-6 text-sm leading-relaxed">
              The consequence is worth being explicit about: once you are
              funded, the firm earns only when you earn. Before that point, we
              are paid whether the evaluation passes or not — which is exactly
              why the evaluation fee comes back with your first payout, and why
              a trader who breaches inside 14 days is offered a discounted
              reset instead of a second full price.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <SectionHeading
            eyebrow="Operating principles"
            title="Five rules we hold ourselves to."
            lead="These are not values on a wall. Each one describes a decision the firm has already made and has to keep making."
          />

          <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <StaggerItem
                key={principle.title}
                className="border-line-soft bg-panel rounded-2xl border p-6"
              >
                <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                  <principle.icon className="size-[18px]" aria-hidden="true" />
                </span>
                <h3 className="text-ink font-display mt-5 text-base leading-snug font-semibold">
                  {principle.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {principle.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section id="why" className="scroll-mt-28">
        <Container>
          <SectionHeading
            eyebrow="Why Connect Funded"
            title="The argument, in nine parts."
            lead="Every funded programme claims transparency. These are the specific, checkable ways ours differs — each one verifiable against the account tiers and the rulebook before you pay anything."
            action={
              <ButtonLink href="/how-it-works" variant="soft">
                See the process end to end
                <ArrowRight />
              </ButtonLink>
            }
          />
          <div className="mt-12">
            <DifferentiatorGrid image={image("section.why-us")} />
          </div>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <SectionHeading
            eyebrow="The desks"
            title="Who is actually accountable for what."
            lead="There are no photographs on this page and no invented biographies. What matters when something goes wrong is which desk owns the decision, so that is what we publish."
          />
          <div className="mt-12">
            <DeskTeams />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Build-out"
            title="What the platform can do, and what is next."
            lead="A capability roadmap rather than a press timeline: shipped, in build, and queued behind it."
          />
          <div className="mt-12 max-w-4xl">
            <Roadmap />
          </div>
        </Container>
      </Section>

      <Section id="careers" className="bg-raised border-line-soft scroll-mt-28 border-y">
        <Container>
          <SectionHeading
            eyebrow="Careers"
            title="Six seats open across five desks."
            lead="We hire people who want to be accountable for a specific part of a trader's experience. Market-hours roles are real market hours, and remote roles are genuinely remote."
            action={
              <Badge tone="mint" size="md">
                {openRoles.length} open roles
              </Badge>
            }
          />
          <div className="mt-12">
            <Careers applyHref="/contact#careers" />
          </div>
        </Container>
      </Section>

      <SocialWallSection />

      <Section>
        <Container>
          <Reveal className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 lg:py-20">
            <Aurora intensity="subtle" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-h2">
                The rules are published. The capital is real.
              </h2>
              <p className="text-lead text-muted mt-4">
                Pick a tier from $10,000 to $200,000, pass two phases under a 5%
                daily and 10% overall drawdown, and keep 80% to 90% of what you
                make.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href={site.signupUrl} size="lg">
                  Create account
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/contact" variant="soft" size="lg">
                  Talk to the desk first
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function PageHero({ image }: { image: ResolvedImage }) {
  return (
    <section className="bg-noise relative overflow-hidden pt-12 pb-16 sm:pt-14 lg:pt-16 lg:pb-18">
      <GridBackdrop />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src={image.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.08] dark:opacity-[0.14]"
        />
        <div className="from-bg via-bg/90 absolute inset-0 bg-gradient-to-r to-transparent" />
      </div>
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <Reveal direction="none">
          <Eyebrow>About {site.name}</Eyebrow>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="text-h1 mt-6 max-w-4xl">
            A funding partner for traders who take their{" "}
            <span className="text-gradient">edge</span> seriously.
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="text-lead text-muted mt-6 max-w-2xl">
            Connect Funded gives disciplined traders access to firm capital
            across forex, precious metals, commodities, indices, share CFDs and
            crypto — under a rulebook that is published in full, enforced by
            software, and unchanged from the $10,000 tier to the $200,000 one.
          </p>
        </Reveal>

        <Reveal delay={0.18} className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="#why" size="lg">
            Why traders choose us
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="#careers" variant="soft" size="lg">
            See open roles
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost" size="lg">
            Contact the desk
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
