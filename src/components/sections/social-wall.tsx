"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ReactElement } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import {
  DiscordIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/layout/social-links";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { socials } from "@/lib/site";
import { useLocale } from "@/components/i18n/locale-provider";

type SocialLabel = (typeof socials)[number]["label"];

type NetworkMeta = {
  icon: (props: { className?: string }) => ReactElement;
  image: string;
  followers: string;
  /** Palette-based hover treatment, independent of platform logo colors. */
  tile: string;
  mark: string;
  brand: string;
};

const NETWORKS: Record<SocialLabel, NetworkMeta> = {
  X: {
    icon: XIcon,
    image: "/images/social/x.jpeg",
    followers: "48.2K",
    tile: "hover:border-brand-light/50",
    mark: "group-hover:bg-brand-dim/60 group-hover:text-brand-light group-hover:border-brand/40",
    brand: "#f5f5f5",
  },
  Instagram: {
    icon: InstagramIcon,
    image: "/images/social/instagram.jpeg",
    followers: "61.4K",
    tile: "hover:border-brand-light/50",
    mark: "group-hover:bg-brand-dim/60 group-hover:text-brand-light group-hover:border-brand/40",
    brand: "#e6688c",
  },
  YouTube: {
    icon: YouTubeIcon,
    image: "/images/social/youtube.jpeg",
    followers: "27.9K",
    tile: "hover:border-brand-light/50",
    mark: "group-hover:bg-brand-dim/60 group-hover:text-brand-light group-hover:border-brand/40",
    brand: "#ff4d4d",
  },
  Telegram: {
    icon: TelegramIcon,
    image: "/images/social/telegram.jpeg",
    followers: "34.6K",
    tile: "hover:border-brand-light/50",
    mark: "group-hover:bg-brand-dim/60 group-hover:text-brand-light group-hover:border-brand/40",
    brand: "#48a9ed",
  },
  Discord: {
    icon: DiscordIcon,
    image: "/images/social/discord.jpeg",
    followers: "19.3K",
    tile: "hover:border-brand-light/50",
    mark: "group-hover:bg-brand-dim/60 group-hover:text-brand-light group-hover:border-brand/40",
    brand: "#8b9dff",
  },
  LinkedIn: {
    icon: LinkedInIcon,
    image: "/images/social/linkedin.jpeg",
    followers: "12.1K",
    tile: "hover:border-brand-light/50",
    mark: "group-hover:bg-brand-dim/60 group-hover:text-brand-light group-hover:border-brand/40",
    brand: "#5aa9ed",
  },
};

export function SocialWallSection() {
  const { locale } = useLocale();
  const copy = locale === "fr"
    ? {
        eyebrow: "Suivre le desk",
        title: "Six canaux, un seul desk de trading",
        lead: "Niveaux avant l’ouverture de la séance, alertes à la publication des nouvelles et notes du desk à la clôture. Choisissez le canal qui vous convient.",
        followers: "abonnés",
        disclaimer: "Les nombres d’abonnés sont indicatifs et actualisés chaque mois. Les publications de ces canaux ne constituent pas des conseils financiers. Aucun membre de Connect Funded ne vous demandera vos identifiants ni un paiement en dehors de l’espace client.",
        reasons: {
          X: "Commentaires en direct pendant le chevauchement des séances de Londres et de New York.",
          Instagram: "Statistiques d’exécution et explications des transactions, publiées après leur clôture.",
          YouTube: "Démonstrations complètes des plateformes, réalisées sur des comptes de trading réels.",
          Telegram: "Niveaux à l’ouverture des séances et alertes sur les événements à fort impact.",
          Discord: "Revues hebdomadaires des transactions avec le desk et d’autres traders actifs.",
          LinkedIn: "Nos paramètres de risque, ainsi que les actualités de l’entreprise et du recrutement.",
        },
      }
    : locale === "ar"
      ? {
          eyebrow: "تابع فريق التداول",
          title: "ست قنوات، وفريق تداول واحد",
          lead: "مستويات قبل افتتاح الجلسة، وتنبيهات عند صدور الأحداث، وملاحظات الفريق بعد الإغلاق. اختر القناة الأنسب لك.",
          followers: "متابعًا",
          disclaimer: "أعداد المتابعين تقديرية وتُحدّث شهريًا. لا تُعد المنشورات على هذه القنوات نصيحة مالية. ولن يطلب منك أي عضو في Connect Funded بيانات الدخول إلى حسابك أو دفع أي مبلغ خارج بوابة العميل.",
          reasons: {
            X: "تعليقات مستمرة خلال تداخل جلستي لندن ونيويورك.",
            Instagram: "إحصاءات التنفيذ والصفقات التي تقف وراءها، تُنشر بعد إغلاقها.",
            YouTube: "شروحات كاملة للمنصات مسجلة على حسابات تداول حقيقية.",
            Telegram: "مستويات افتتاح الجلسات وتنبيهات الأحداث ذات التأثير المرتفع.",
            Discord: "مراجعات أسبوعية للصفقات مع فريق التداول ومتداولين نشطين.",
            LinkedIn: "كيفية تحديد معايير المخاطر، إلى جانب أخبار الشركة والوظائف.",
          },
        }
      : {
          eyebrow: "Follow the desk",
          title: "Six channels, one trading desk",
          lead: "Levels before the session opens, event alerts as they land and desk notes once the session closes. Pick the channel that fits how you work.",
          followers: "followers",
          disclaimer: "Follower counts are indicative and refreshed monthly. Nothing posted on these channels is financial advice, and no Connect Funded team member will ever ask you for account credentials or a payment outside the client portal.",
          reasons: {
            X: "Running commentary through the London and New York overlap.",
            Instagram: "Execution stats and the trades behind them, posted the day they close.",
            YouTube: "Full platform walkthroughs filmed on live trading accounts.",
            Telegram: "Session-open levels and high-impact event alerts.",
            Discord: "Weekly trade reviews with the desk and other active traders.",
            LinkedIn: "How we set risk parameters, plus firm and hiring news.",
          },
        };
  return (
    <Section className="relative overflow-hidden">
      <Container className="relative">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          lead={copy.lead}
        />

        <StaggerGroup
          role="list"
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {socials.map((social) => {
            const meta = NETWORKS[social.label];
            const Icon = meta.icon;

            return (
              <StaggerItem role="listitem" key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={locale === "ar"
                    ? `تابع Connect Funded على ${social.label} — ${social.handle}، يفتح في علامة تبويب جديدة`
                    : locale === "fr"
                      ? `Suivre Connect Funded sur ${social.label} — ${social.handle}, ouverture dans un nouvel onglet`
                      : `Follow Connect Funded on ${social.label} — ${social.handle}, opens in a new tab`}
                  className={`border-line-soft bg-panel group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl ${meta.tile}`}
                  style={{ background: `linear-gradient(145deg, color-mix(in srgb, ${meta.brand} 18%, var(--cf-bg-panel)), var(--cf-bg-panel))`, borderColor: `color-mix(in srgb, ${meta.brand} 38%, transparent)` }}
                >
                  <div aria-hidden="true" className="pointer-events-none absolute -end-5 -bottom-7 opacity-[0.12] transition-all duration-300 group-hover:scale-110 group-hover:opacity-20" style={{ color: meta.brand }}>
                    <Icon className="size-32" />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-20 place-items-center overflow-hidden rounded-2xl border border-white/70 bg-white p-2 shadow-[0_8px_24px_rgb(15_23_42/0.12)] transition-all duration-300 group-hover:scale-105 ${meta.mark}`}
                      aria-hidden="true"
                      style={{ color: meta.brand, borderColor: `color-mix(in srgb, ${meta.brand} 45%, transparent)` }}
                    >
                      <Image src={meta.image} alt="" width={100} height={100} sizes="72px" className="h-full w-full object-contain" />
                    </span>
                    <ExternalLink
                      className="text-faint group-hover:text-ink size-4 transition-colors"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-5 flex items-baseline justify-between gap-3">
                    <span className="text-ink font-display text-base font-semibold">
                      {social.label}
                    </span>
                    <span className="text-faint tabular font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
                      {meta.followers} {copy.followers}
                    </span>
                  </div>

                  <span className="text-faint mt-1 block font-mono text-xs">
                    {social.handle}
                  </span>

                  <p className="text-muted border-line-soft mt-4 border-t pt-4 text-[0.8125rem] leading-relaxed">
                    {copy.reasons[social.label]}
                  </p>
                </a>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <p className="text-faint mt-6 text-xs leading-relaxed">
          {copy.disclaimer}
        </p>
      </Container>
    </Section>
  );
}
