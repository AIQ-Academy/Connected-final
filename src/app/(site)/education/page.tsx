import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Users,
} from "lucide-react";

import { CourseExplorer } from "@/components/education/course-explorer";
import { GlossaryExplorer } from "@/components/education/glossary-explorer";
import { LearningPath } from "@/components/education/learning-path";
import { FeaturePageImage } from "@/components/sections/feature-page-image";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import {
  courses,
  glossary,
  totalHours,
  totalModules,
} from "@/lib/education-content";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n/server";
import { routeCopy } from "@/lib/i18n/route-copy";

export const metadata: Metadata = {
  title: "Trading Academy",
  description:
    "Trading Academy courses across five tracks, a recommended learning path and a glossary written against the Connect Funded rulebook.",
};

const heroStats = [
  { value: String(courses.length), label: "Structured courses" },
  { value: String(totalModules), label: "Individual modules" },
  { value: `${totalHours}h`, label: "Of taught material" },
  { value: String(glossary.length), label: "Glossary definitions" },
] as const;

const included = [
  {
    icon: BookOpen,
    title: "Free with any account",
    body: "The entire curriculum unlocks the moment you register, before you buy an evaluation. Nothing here sits behind a second paywall.",
  },
  {
    icon: Layers,
    title: "Written against our rulebook",
    body: "Every risk example uses the real limits: a 5% daily drawdown, a 10% overall drawdown and a four trading day minimum. No generic prop-firm filler.",
  },
  {
    icon: Users,
    title: "Taught by the people who run the desk",
    body: "Course material and live sessions come from the trading operations and risk teams who administer the accounts, not from an outsourced content studio.",
  },
];

export default async function EducationPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  const stats = locale === "en" ? heroStats : heroStats.map((stat, index) => ({
    ...stat,
    label: t((["education.structured", "education.modules", "education.hours", "education.definitions"][index]) as Parameters<typeof routeCopy>[1]),
  }));
  const includedCopy = locale === "en" ? included : locale === "fr" ? [
    { ...included[0], title: t("education.freeTitle"), body: t("education.freeBody") },
    { ...included[1], title: t("education.rulesTitle"), body: t("education.rulesBody") },
    { ...included[2], title: t("education.deskTitle"), body: t("education.deskBody") },
  ] : [
    { ...included[0], title: t("education.freeTitle"), body: t("education.freeBody") },
    { ...included[1], title: t("education.rulesTitle"), body: t("education.rulesBody") },
    { ...included[2], title: t("education.deskTitle"), body: t("education.deskBody") },
  ];
  return (
    <>
      <PageHero locale={locale} stats={stats} included={includedCopy} />

      <Section id="curriculum">
        <Container>
          <SectionHeading
            eyebrow={t("education.curriculum")}
            title={t("education.tracksTitle")}
            lead={t("education.tracksLead")}
            action={
              <ButtonLink href="#path" variant="soft">
                {t("education.seeOrder")}
                <ArrowRight />
              </ButtonLink>
            }
          />
          <div className="mt-12">
            <CourseExplorer />
          </div>
        </Container>
      </Section>

      <Section id="path" className="bg-raised border-line-soft border-y">
        <Container>
          <SectionHeading
            eyebrow={t("education.path")}
            title={t("education.pathTitle")}
            lead={t("education.pathLead")}
          />
          <div className="mt-14">
            <LearningPath />
          </div>
        </Container>
      </Section>

      <Section
        id="glossary"
        className="bg-raised border-line-soft scroll-mt-28 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow={t("education.glossary")}
            title={t("education.glossaryTitle")}
            lead={t("education.glossaryLead").replace("{count}", String(glossary.length))}
          />
          <div className="mt-12">
            <GlossaryExplorer />
          </div>
        </Container>
      </Section>

    </>
  );
}

function PageHero({ locale, stats, included: includedItems }: { locale: "en" | "fr" | "ar"; stats: readonly { value: string; label: string }[]; included: readonly { icon: typeof BookOpen; title: string; body: string }[] }) {
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
      <FeaturePageImage
        src="/images/learn1.jpg"
        motionVariant="learn"
        alt={locale === "ar" ? "متداولة تراجع رسمًا بيانيًا على جهاز لوحي" : locale === "fr" ? "Une trader étudie un graphique sur une tablette" : "A trader studying a financial chart on a tablet"}
        objectPosition="center"
      />
      <Aurora intensity="medium" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <div className="max-w-4xl">
            <Reveal direction="none">
              <Eyebrow>{t("education.eyebrow")}</Eyebrow>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="text-h1 mt-6 max-w-3xl text-white">
                {t("education.title")}
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="text-lead mt-6 max-w-3xl text-white/80">
                {t("education.lead").replace("{courses}", String(courses.length))}
              </p>
            </Reveal>

            <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={signupUrl} size="lg">
                {t("education.register")}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="#glossary" variant="soft" size="lg">
                {t("education.jumpGlossary")}
              </ButtonLink>
            </Reveal>
            <dl className="mt-9 grid max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border border-white/20 bg-[#0b2345]/85 shadow-xl backdrop-blur-md sm:grid-cols-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "px-5 py-6",
                      index % 2 === 1 && "border-white/15 border-l",
                      index >= 2 && "border-white/15 border-t sm:border-t-0",
                    )}
                  >
                    <dt className="font-mono text-[0.625rem] tracking-[0.12em] text-white/65 uppercase">
                      {stat.label}
                    </dt>
                    <dd className="font-display tabular mt-2 text-3xl font-semibold text-white">
                      {stat.value}
                    </dd>
                  </div>
                ))}
            </dl>
        </div>

        <StaggerGroup className="mt-14 grid gap-5 rounded-2xl border border-white/15 bg-[#0b2345]/80 p-6 backdrop-blur-md sm:grid-cols-3 sm:p-8">
          {includedItems.map((item) => (
            <StaggerItem key={item.title}>
              <span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/10 text-sky-200">
                <item.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <h2 className="font-display mt-4 text-base font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {item.body}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
