import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  RefreshCcw,
  Wallet,
} from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CategoryCards } from "@/components/payments/category-cards";
import { MethodTable } from "@/components/payments/method-table";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPaymentMethods } from "@/lib/content";
import { getServerLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locale";
import { signupUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Payment Methods",
  description:
    "Payment options include cards, bank transfer, OMT, BOB Finance, Whish Money and USDT, with clear processing times and no fee charged by us.",
};

const promisesByLocale: Record<Locale, { title: string; body: string }[]> = {
  en: [
  {
    title: "We absorb the processing fee",
    body: "On deposits and on withdrawals, across every rail including crypto network fees. The number you request is the number that leaves our account, and the only deduction you will ever see is one applied by your own bank or wallet provider.",
  },
  {
    title: "No deposit or withdrawal fee",
    body: "Not on cards, not on wire, not on crypto. There is no inactivity fee either — an account with a zero balance and no open positions is simply dormant, and reactivates on the next deposit.",
  },
  {
    title: "Approval within one hour",
    body: "Withdrawal requests are reviewed within one hour. Once approved, funds move within 24 hours, and in practice a stablecoin transfer usually settles the same afternoon.",
  },
  {
    title: "Priced in dollars, everywhere",
    body: "Balances, margin and withdrawals are all denominated in USD. If you deposit in another currency your provider applies its own conversion, so the amount debited may differ slightly from the quoted figure.",
  },
  ],
  ar: [
    { title: "نتحمل رسوم المعالجة", body: "نتحمل رسوم الإيداع والسحب عبر جميع الوسائل، بما فيها رسوم شبكات العملات الرقمية. المبلغ الذي تطلبه هو المبلغ الذي يغادر حسابنا؛ وقد يفرض مصرفك أو مزود محفظتك رسومًا خاصة به." },
    { title: "لا رسوم على الإيداع أو السحب", body: "لا نفرض رسومًا على البطاقات أو التحويلات أو العملات الرقمية، ولا رسومًا على عدم النشاط. الحساب ذو الرصيد الصفري ومن دون صفقات مفتوحة يبقى خاملاً ويُفعّل عند الإيداع التالي." },
    { title: "الموافقة خلال ساعة", body: "نراجع طلبات السحب خلال ساعة. بعد الموافقة، تتحرك الأموال خلال 24 ساعة، وغالبًا ما تصل تحويلات العملات المستقرة في اليوم نفسه." },
    { title: "الرصيد بالدولار في كل مكان", body: "تُحتسب الأرصدة والهامش والسحوبات بالدولار الأمريكي. عند الإيداع بعملة أخرى، يطبق مزودك سعر التحويل الخاص به وقد يختلف المبلغ المخصوم قليلًا عن السعر المعروض." },
  ],
  fr: [
    { title: "Nous prenons en charge les frais de traitement", body: "Nous prenons en charge les frais de dépôt et de retrait sur tous les moyens, y compris les frais réseau crypto. Le montant demandé est celui qui quitte notre compte ; votre banque ou portefeuille peut appliquer ses propres frais." },
    { title: "Aucun frais de dépôt ou de retrait", body: "Aucun frais sur les cartes, virements ou cryptomonnaies, ni frais d’inactivité. Un compte sans solde et sans position ouverte reste dormant et se réactive au prochain dépôt." },
    { title: "Approbation sous une heure", body: "Les demandes de retrait sont examinées sous une heure. Après approbation, les fonds sont transférés sous 24 heures ; les stablecoins arrivent souvent le jour même." },
    { title: "Des soldes en dollars partout", body: "Les soldes, marges et retraits sont libellés en USD. Pour un dépôt dans une autre devise, votre prestataire applique son propre taux de conversion ; le montant débité peut donc légèrement varier." },
  ],
};

const promiseIcons = [Wallet, RefreshCcw, BadgeCheck, Globe2] as const;

export default async function PaymentsPage() {
  const locale = await getServerLocale();
  const paymentMethods = getPaymentMethods(locale);
  const instantRails = paymentMethods.filter((method) => method.deposit === (locale === "ar" ? "فوري" : locale === "fr" ? "Instantané" : "Instant")).length;
  const promises = promisesByLocale[locale];
  const copy = locale === "ar"
    ? { promise: "التزامنا", promiseTitle: "أربعة التزامات تنطبق على جميع وسائل الدفع.", promiseLead: "هذه شروطنا المنشورة للمدفوعات، وهي ثابتة مهما كانت الوسيلة أو نوع الحساب.", methods: "وسائل الإيداع والسحب", methodsTitle: "جميع الوسائل المتاحة.", methodsLead: `${paymentMethods.length} وسائل ضمن أربع فئات، ${instantRails} منها فورية عند الإيداع. اختر الوسيلة الأنسب لك؛ لن تغيّر أي منها السعر الذي تدفعه.`, faq: "الأسئلة الشائعة حول المدفوعات", faqTitle: "الأسئلة التي تصل إلى فريق الدعم.", faqLead: "إذا لم تجد إجابتك هنا، فسيرد عليك الفريق عبر البوابة خلال دقائق.", allFaq: "كل الأسئلة الشائعة", ready: "عندما تكون مستعدًا", ctaTitle: "الأسواق مفتوحة. ابدأ عندما تكون مستعدًا.", ctaLead: "أودع مرة واحدة وابدأ التداول خلال ثوانٍ. تفعيل فوري عبر البطاقة أو المحفظة أو العملات الرقمية. يصل كل سحب كاملًا.", create: "إنشاء حساب", payoutFaq: "اقرأ أسئلة السحب الشائعة" }
    : locale === "fr"
      ? { promise: "Notre engagement", promiseTitle: "Quatre engagements pour tous les moyens de paiement.", promiseLead: "Ces conditions publiées encadrent nos paiements et restent identiques quel que soit le moyen choisi ou le type de compte.", methods: "Moyens de dépôt et de retrait", methodsTitle: "Tous les moyens acceptés.", methodsLead: `${paymentMethods.length} moyens répartis en quatre catégories, dont ${instantRails} dépôts instantanés. Choisissez celui qui vous convient : aucun ne modifie le prix payé.`, faq: "FAQ paiements", faqTitle: "Les questions reçues par l’assistance.", faqLead: "Si votre question n’apparaît pas ici, notre équipe répond sur le portail en quelques minutes.", allFaq: "Toutes les questions fréquentes", ready: "Quand vous le souhaitez", ctaTitle: "Les marchés sont ouverts. À vous de jouer.", ctaLead: "Déposez une fois et commencez à trader en quelques secondes. Activation instantanée par carte, portefeuille ou crypto. Chaque retrait est versé intégralement.", create: "Créer un compte", payoutFaq: "Lire la FAQ sur les retraits" }
      : { promise: "The promise", promiseTitle: "Four commitments that hold on every rail.", promiseLead: "These published terms govern our payments and do not vary by method or account type.", methods: "Deposit & payout rails", methodsTitle: "Every method we support.", methodsLead: `${paymentMethods.length} rails across four categories, ${instantRails} of them instant on the way in. Choose the method that works for you; none changes the price you pay.`, faq: "Payments FAQ", faqTitle: "The questions support actually receives.", faqLead: "If yours is not here, the desk answers inside the portal in minutes.", allFaq: "All frequently asked questions", ready: "Ready when you are", ctaTitle: "Markets are open. Ready when you are.", ctaLead: "Deposit once and start trading in seconds. Instant activation by card, wallet, or crypto. Every withdrawal arrives in full.", create: "Create account", payoutFaq: "Read the payout FAQ" };
  return (
    <>
      <PageHero locale={locale} />

      <Section id="promise" className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <SectionHeading
            eyebrow={copy.promise}
            title={copy.promiseTitle}
            lead={copy.promiseLead}
          />

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {promises.map((item, index) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7"
              >
                {(() => { const Icon = promiseIcons[index]; return <Icon className="text-brand-light size-5" aria-hidden="true" />; })()}
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section id="methods">
        <Container>
          <SectionHeading
            eyebrow={copy.methods}
            title={copy.methodsTitle}
            lead={copy.methodsLead}
          />

          <div className="mt-12">
            <CategoryCards locale={locale} />
          </div>

          <Reveal delay={0.08} className="mt-8">
            <MethodTable locale={locale} />
          </Reveal>
        </Container>
      </Section>

      <Section
        id="faq"
        className="border-line-soft bg-raised/40 border-t"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <SectionHeading
              eyebrow={copy.faq}
              title={copy.faqTitle}
              lead={copy.faqLead}
              action={
                <ButtonLink href="/faq" variant="soft">
                  {copy.allFaq}
                </ButtonLink>
              }
            />

            <Reveal
              delay={0.06}
              className="border-line-soft bg-panel rounded-3xl border px-6 sm:px-8"
            >
              <Accordion>
                <AccordionItem
                  question="Do I pay anything to withdraw?"
                  defaultOpen
                >
                  No. We absorb the processing cost on every withdrawal
                  method, including the network fee on a crypto transfer. The
                  amount you request is the amount that leaves us. Your own bank
                  or wallet provider may still charge you at their end, which is
                  outside our control.
                </AccordionItem>
                <AccordionItem question="Can I deposit with one method and withdraw to another?">
                  Up to the amount you deposited, funds return to the original
                  method — a card deposit returns to that card first. Anything
                  above that amount can go to any verified destination in your
                  own name, which is why most traders pay by card and withdraw
                  to a wallet or in stablecoins.
                </AccordionItem>
                <AccordionItem question="Why was my card declined?">
                  Almost always the issuer rather than us. Cross-border
                  merchants in the financial category are a common decline
                  trigger, particularly on debit cards. Authorising the payment
                  in your banking app usually clears it; failing that, an
                  e-wallet or a stablecoin transfer will go through immediately.
                </AccordionItem>
                <AccordionItem question="How long does the first withdrawal take?">
                  The verification is the long part, and it only happens once —
                  usually under an hour on a business day. Withdrawal requests
                  are then reviewed within one hour, and the transfer follows
                  within 24 hours.
                </AccordionItem>
                <AccordionItem question="Is there a minimum withdrawal amount?">
                  No. You can request any amount up to your free margin, and
                  there is no penalty for taking a small one. There
                  is no maximum either, and no requirement to leave a buffer in
                  the account.
                </AccordionItem>
                <AccordionItem question="What happens to my profit if I do not request a payout?">
                  It stays in the account and rolls into the next cycle, where
                  it continues to count toward the 10% needed for a scaling
                  milestone. Nothing expires and nothing is forfeited by leaving
                  it there.
                </AccordionItem>
              </Accordion>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="border-line-soft relative overflow-hidden border-t">
        <Aurora intensity="medium" />
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">
              <span className="chev" />
              {copy.ready}
            </span>
            <h2 className="text-h2 mt-5">
              {copy.ctaTitle}
            </h2>
            <p className="text-lead text-muted mt-5">
              {copy.ctaLead}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href={signupUrl} size="lg">
                {copy.create}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/faq" variant="soft" size="lg">
                {copy.payoutFaq}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function PageHero({ locale }: { locale: Locale }) {
  const copy = locale === "ar"
    ? { eyebrow: "وسائل الدفع", title: "إيداع سريع. وسحب كامل.", lead: "البطاقات والتحويلات البنكية وOMT وBOB Finance وWhish Money وUSDT. أودع خلال ثوانٍ واسحب المبلغ كاملًا من دون رسوم معالجة من جانبنا.", create: "إنشاء حساب", approval: "مدة الموافقة على السحب", fee: "الرسوم عليك", countries: "الدول المتاحة" }
    : locale === "fr"
      ? { eyebrow: "Moyens de paiement", title: "Dépôts rapides. Retraits intégraux.", lead: "Cartes, virement bancaire, OMT, BOB Finance, Whish Money et USDT. Déposez en quelques secondes et retirez l’intégralité, sans frais de traitement facturés par nos soins.", create: "Créer un compte", approval: "Délai d’approbation du retrait", fee: "Frais à votre charge", countries: "Pays desservis" }
      : { eyebrow: "Payment methods", title: "Money in fast. Money out whole.", lead: "Cards, bank transfer, OMT, BOB Finance, Whish Money and USDT. Deposit in seconds and withdraw in full, with no processing fee charged by us.", create: "Create account", approval: "Payout approval window", fee: "Fee charged to you", countries: "Countries served" };
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="strong" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <Reveal direction="none">
            <span className="eyebrow">
              <span className="chev" />
              {copy.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              {copy.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {copy.lead}
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {copy.create}
              <ArrowRight />
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <dl className="border-line-soft mt-14 grid gap-8 border-t pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { value: "1h", label: copy.approval },
              { value: "$0", label: copy.fee },
              { value: "142", label: copy.countries },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="text-ink font-display tabular block text-3xl font-semibold">
                    {stat.value}
                  </span>
                  <span className="text-faint mt-1.5 block font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
