import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  Handshake,
  Headphones,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
} from "lucide-react";

import { openRoles } from "@/components/about/careers";
import { ContactForm } from "@/components/contact/contact-form";
import { SocialLinks } from "@/components/layout/social-links";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Connect Funded support, sales, partnerships or the hiring desk. Response times, the channel each enquiry should take, and where the firm is based.",
};

const channels = [
  {
    icon: Headphones,
    title: "Account support",
    email: site.email,
    response: "Within one business hour",
    body: "Evaluation rules, drawdown questions, platform issues, verification and payouts on an existing account. Portal tickets reach the same queue and carry your account context with them, so they are answered fastest.",
    action: { label: "Open a portal ticket", href: "/portal" },
  },
  {
    icon: TrendingUp,
    title: "Funding & pricing",
    email: site.salesEmail,
    response: "Same business day",
    body: "Which of the five tiers suits your average risk per trade, how scaling works before you commit, and multi-account structures inside the $400,000 combined allocation cap.",
    action: { label: "Compare account tiers", href: "/accounts" },
  },
  {
    icon: Handshake,
    title: "Partnerships & affiliates",
    email: site.salesEmail,
    response: "Within two business days",
    body: "Introducing brokers, educators, communities and technology partners. Send the audience or integration you have in mind and the commercial terms you are looking for.",
    action: { label: "Read how the model works", href: "/about#why" },
  },
] as const;

const contactFaqs = [
  {
    question: "Which channel actually gets the fastest answer?",
    answer:
      "A ticket raised inside the client portal. It arrives with your account number, tier, evaluation phase and current drawdown headroom already attached, which removes the first two messages of almost every support conversation. Email reaches the same queue without that context.",
  },
  {
    question: "Is there phone support?",
    answer:
      "The published number reaches the Dubai office during UAE business hours and is the right route for partnership and press enquiries. Account matters are handled in writing so that there is a record of the answer you were given, which protects you as much as us.",
  },
  {
    question: "What should I include for an account issue?",
    answer:
      "Your account number, the platform you were trading on, the instrument, and the time of the event in UTC. If it concerns an order, the ticket number from MetaTrader 5 or cTrader lets operations pull the exact execution record rather than reconstruct it.",
  },
  {
    question: "Do you reply at weekends?",
    answer:
      "Support runs 24 hours a day, five days a week, from the Sydney open on Monday to the New York close on Friday. Messages sent over the weekend are queued and answered from the Monday open. Nothing time-critical to a funded account can occur while the markets are closed.",
  },
  {
    question: "How do I apply for a role?",
    answer:
      "Use this form with the careers topic selected and it routes to the hiring desk rather than to support. Name the role in the first line, and include anything you have built or operated that is relevant. Every application is read by a person.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero />

      <Section className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <Reveal className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-8">
              <h2 className="text-h3">Send a message</h2>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                Pick the topic that matches your enquiry and it goes straight to
                that desk. Everything here is read by a person.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </Reveal>

            <div className="flex flex-col gap-5">
              {channels.map((channel, index) => (
                <Reveal
                  key={channel.title}
                  delay={index * 0.06}
                  direction="left"
                  className="border-line-soft bg-panel rounded-2xl border p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                      <channel.icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <Badge tone="mint" className="gap-1.5">
                      <Clock className="size-3" aria-hidden="true" />
                      {channel.response}
                    </Badge>
                  </div>

                  <h3 className="text-ink font-display mt-4 text-lg font-semibold">
                    {channel.title}
                  </h3>
                  <p className="text-muted mt-2.5 text-sm leading-relaxed">
                    {channel.body}
                  </p>

                  <div className="border-line-soft mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <a
                      href={`mailto:${channel.email}`}
                      className="text-ink hover:text-brand-light inline-flex items-center gap-2 font-mono text-[0.8125rem] transition-colors"
                    >
                      <Mail className="size-3.5" aria-hidden="true" />
                      {channel.email}
                    </a>
                    <Link
                      href={channel.action.href}
                      className="text-brand-light inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
                    >
                      {channel.action.label}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <Reveal>
              <Eyebrow className="mb-4">Where we are</Eyebrow>
              <h2 className="text-h2 max-w-lg">
                One office, and desks across three sessions.
              </h2>
              <p className="text-muted mt-5 max-w-lg leading-relaxed">
                Connect Funded is based in the Dubai International Financial
                Centre. Trader support and trading operations are staffed
                continuously through the Asian, European and US sessions, with
                remote desks across Europe, the Middle East and Africa.
              </p>

              <dl className="mt-8 space-y-5">
                <div className="flex gap-3.5">
                  <MapPin
                    className="text-brand-light mt-0.5 size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      Registered address
                    </dt>
                    <dd className="text-ink mt-1 text-sm">{site.address}</dd>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <Phone
                    className="text-brand-light mt-0.5 size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      Office line
                    </dt>
                    <dd className="text-ink mt-1 text-sm">
                      <a
                        href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                        className="hover:text-brand-light font-mono transition-colors"
                      >
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <Clock
                    className="text-brand-light mt-0.5 size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      Support hours
                    </dt>
                    <dd className="text-ink mt-1 text-sm leading-relaxed">
                      24 hours a day, five days a week — from the Sydney open on
                      Monday to the New York close on Friday. Weekend messages
                      are answered from the Monday open. The office line keeps
                      UAE business hours.
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="border-line-soft mt-8 border-t pt-6">
                <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  Also here
                </p>
                <SocialLinks />
              </div>
            </Reveal>

            <Reveal delay={0.1} direction="left">
              <div className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border">
                <div
                  aria-hidden="true"
                  className="bg-grid relative h-56 w-full overflow-hidden sm:h-72"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(var(--cf-brand-glow)/0.35),transparent_65%)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="relative grid place-items-center">
                      <span className="border-brand/40 animate-pulse-ring absolute size-24 rounded-full border" />
                      <span className="bg-brand grid size-11 place-items-center rounded-full text-white">
                        <MapPin className="size-5" />
                      </span>
                    </span>
                  </div>
                  <div className="from-panel absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />
                </div>

                <div className="border-line-soft border-t p-6">
                  <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    Languages
                  </p>
                  <p className="text-ink mt-2 text-sm leading-relaxed">
                    Support answers in English, Arabic and French (
                    {site.locales.join(" · ")}) across every channel, including
                    the portal ticket queue.
                  </p>
                  <p className="text-muted border-line-soft mt-4 border-t pt-4 text-[0.8125rem] leading-relaxed">
                    Connect Funded operates a funded trader programme. It is not
                    a broker-dealer and does not accept client deposits for
                    trading.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="careers" className="scroll-mt-28">
        <Container>
          <SectionHeading
            eyebrow="Careers"
            title="Applying for a role."
            lead="Open positions and the full hiring process live on the about page. The application route is this form — choose the careers topic and it reaches the hiring desk directly."
            action={
              <Badge tone="mint" size="md">
                {openRoles.length} open roles
              </Badge>
            }
          />

          <StaggerGroup className="mt-12 grid gap-5 lg:grid-cols-3">
            <StaggerItem className="border-line-soft bg-panel rounded-2xl border p-6">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <Briefcase className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display mt-5 text-base font-semibold">
                1. Read the role
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                Every opening lists the desk that owns it, the location and the
                arrangement. Roles tied to market hours say so explicitly.
              </p>
              <Link
                href="/about#careers"
                className="text-brand-light mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
              >
                See the {openRoles.length} open roles
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </StaggerItem>

            <StaggerItem className="border-line-soft bg-panel rounded-2xl border p-6">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <Mail className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display mt-5 text-base font-semibold">
                2. Write to the hiring desk
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                Use the form above with the careers topic selected. Name the
                role in the first line and tell us what you have built or run
                that is relevant. A CV is welcome but not required.
              </p>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent("Careers enquiry")}`}
                className="text-brand-light mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
              >
                Or email the desk
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </StaggerItem>

            <StaggerItem className="border-line-soft bg-panel rounded-2xl border p-6">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <Clock className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display mt-5 text-base font-semibold">
                3. Expect an answer
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                Applications are acknowledged within three business days, and
                every candidate who speaks to us gets a decision with a reason
                attached — including the ones we do not take forward.
              </p>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <Reveal>
              <Eyebrow className="mb-4">Before you write</Eyebrow>
              <h2 className="text-h2">A few quick answers.</h2>
              <p className="text-muted mt-5 leading-relaxed">
                Most enquiries are resolved faster by picking the right channel
                than by writing a longer message. The full rulebook questions
                are answered on the FAQ.
              </p>
              <ButtonLink href="/faq" variant="soft" className="mt-6">
                Read the full FAQ
                <ArrowRight />
              </ButtonLink>
            </Reveal>

            <Reveal delay={0.1} className="border-line-soft bg-panel rounded-2xl border px-6">
              <Accordion>
                {contactFaqs.map((faq) => (
                  <AccordionItem key={faq.question} question={faq.question}>
                    {faq.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 lg:py-20">
            <Aurora intensity="subtle" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-h2">
                Or skip the conversation and start trading.
              </h2>
              <p className="text-lead text-muted mt-4">
                Evaluations activate instantly on card and crypto. If the tier
                turns out to be wrong for you, support will move you before you
                place a trade.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href={site.signupUrl} size="lg">
                  Create account
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/accounts" variant="soft" size="lg">
                  Compare the five tiers
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function PageHero() {
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <Reveal direction="none">
          <Eyebrow>Contact</Eyebrow>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="text-h1 mt-6 max-w-3xl">
            Talk to the <span className="text-gradient">desk</span>.
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="text-lead text-muted mt-6 max-w-xl">
            Support, funding advice, partnerships and hiring all route
            separately. Pick the topic that matches and you reach the people who
            own that decision, not a general inbox.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <dl className="border-line-soft mt-10 grid max-w-2xl gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3">
            {[
              { term: "Support coverage", detail: "24 hours, 5 days a week" },
              { term: "First reply target", detail: "One business hour" },
              { term: "Languages", detail: "English, Arabic, French" },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {item.term}
                </dt>
                <dd className="text-ink mt-1.5 text-[0.9375rem] font-medium">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
