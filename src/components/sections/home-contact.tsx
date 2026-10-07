'use client';

import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import type { HomeContactContent } from "@/lib/cms/schemas";
import { homeContact as contactDefaults } from "@/lib/landing/home";
import { site } from "@/lib/site";
import { useLocale } from "@/components/i18n/locale-provider";

export function HomeContactSection({
  content,
}: {
  content?: HomeContactContent;
} = {}) {
  const { locale, t } = useLocale();
  const source = { ...contactDefaults, ...content };
  const homeContact = locale === "en" ? source : {
    ...source,
    eyebrow: t("home.contact.eyebrow"), title: t("home.contact.title"),
    lead: t("home.contact.lead"),
    primary: { ...source.primary, label: t("home.contact.primary") },
    stats: source.stats.map((stat, index) => ({
      ...stat,
      term: t(index === 0 ? "home.contact.stat1" : index === 1 ? "home.contact.stat2" : "home.contact.stat3"),
      detail: t(index === 0 ? "home.contact.stat1.detail" : index === 1 ? "home.contact.stat2.detail" : "home.contact.stat3.detail"),
    })),
  };

  return (
    <Section
      id={homeContact.id}
      size="spacious"
      className="scroll-mt-28 bg-raised border-line-soft border-y"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <Reveal>
            <p className="eyebrow">{homeContact.eyebrow}</p>
            <h2 className="text-h1 mt-5 max-w-lg">{homeContact.title}</h2>
            <p className="text-lead text-muted mt-5 max-w-lg">
              {homeContact.lead}
            </p>

            <dl className="border-line-soft mt-8 grid gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3">
              {homeContact.stats.map((item) => (
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

            <ul className="text-muted mt-10 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="text-brand-light mt-0.5 size-4 shrink-0" />
                {site.address}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="text-brand-light size-4 shrink-0" />
                <a
                  href={`mailto:${site.email}`}
                  className="hover:text-ink transition-colors"
                >
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="text-brand-light size-4 shrink-0" />
                <a
                  href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                  className="hover:text-ink transition-colors"
                >
                  {site.phone}
                </a>
              </li>
            </ul>

            <ButtonLink href={homeContact.primary.href} variant="soft" className="mt-8">
              {homeContact.primary.label}
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.08} className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-8">
            <h3 className="text-h3">{t("home.contact.formTitle")}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              {t("home.contact.formLead")}
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
