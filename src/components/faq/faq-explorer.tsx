"use client";

import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

import type { Faq } from "@/db/schema";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

const ALL = "all";

export function FaqExplorer({ faqs }: { faqs: Faq[] }) {
  const { t, formatNumber, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const searchId = useId();
  const translatedFaqCopy = useMemo<Record<string, Record<"ar" | "fr", readonly [string, string]>>>(() => ({
    "What is the minimum deposit?": {
      ar: ["ما الحد الأدنى للإيداع؟", "الحد الأدنى 100 دولار لحساب Standard و1,000 دولار لحساب Pro و50,000 دولار لحساب VIP. يمكنك فتح الحساب واستكشاف المنصات برصيد تجريبي قبل إيداع أي مبلغ."],
      fr: ["Quel est le dépôt minimum ?", "Le minimum est de 100 $ pour Standard, 1 000 $ pour Pro et 50 000 $ pour VIP. Vous pouvez ouvrir le compte et découvrir les plateformes avec un solde démo avant tout dépôt."],
    },
    "What verification do I need to complete?": {
      ar: ["ما إجراءات التحقق المطلوبة؟", "تحتاج إلى هوية حكومية تحمل صورتك وإثبات عنوان صادر خلال الأشهر الثلاثة الماضية. تُرفع المستندات مرة واحدة عبر بوابة العميل، وتُراجع عادةً خلال ساعات العمل."],
      fr: ["Quelles vérifications dois-je effectuer ?", "Vous devez fournir une pièce d’identité officielle avec photo et un justificatif de domicile datant de moins de trois mois. Les documents se déposent une seule fois sur le portail client et sont généralement examinés en quelques heures ouvrées."],
    },
    "How does leverage and margin work?": {
      ar: ["كيف تعمل الرافعة المالية والهامش؟", "تُحدد الرافعة لكل أداة: حتى 1:100 للفوركس، و1:50 للمعادن والمؤشرات، و1:200 للطاقة، و1:100 للأسهم، و1:5 للعملات الرقمية. يُحتسب الهامش وفق الحد، ورافعة 1:100 تعني هامشًا أوليًا بنسبة 1%. حد الإيقاف هو خسارة 5% من الحساب."],
      fr: ["Comment fonctionnent l’effet de levier et la marge ?", "Le levier dépend de l’instrument : jusqu’à 1:100 sur le forex, 1:50 sur les métaux et indices, 1:200 sur l’énergie, 1:100 sur les actions et 1:5 sur les cryptos. La marge découle de cette limite ; un levier de 1:100 correspond à une marge initiale de 1 %. Le seuil de stop-out est une perte de 5 % du compte."],
    },
    "What happens if my account goes negative?": {
      ar: ["ماذا يحدث إذا أصبح رصيد الحساب سالبًا؟", "تتمتع حسابات الأفراد بحماية من الرصيد السلبي. إذا أدى تحرك سعري خلال عطلة نهاية الأسبوع أو خبر إلى انخفاض الرصيد عن الصفر، نعيده إلى الصفر على نفقتنا."],
      fr: ["Que se passe-t-il si mon compte devient négatif ?", "Les comptes de détail bénéficient d’une protection contre le solde négatif. Si un gap pendant le week-end ou une annonce fait passer le compte sous zéro, nous rétablissons le solde à zéro à nos frais."],
    },
    "Can I run more than one account?": {
      ar: ["هل يمكنني امتلاك أكثر من حساب؟", "نعم. يمكنك امتلاك حسابات متعددة بأنواع مختلفة ضمن تسجيل دخول واحد، ولكل حساب رصيده واتصاله بالمنصة. ويمكنك نقل الأموال بينها من بوابة العميل."],
      fr: ["Puis-je détenir plusieurs comptes ?", "Oui. Vous pouvez détenir plusieurs comptes de types différents sous une même connexion. Chacun possède son propre solde et sa connexion à la plateforme ; vous pouvez transférer des fonds entre eux depuis le portail client."],
    },
    "How can I deposit?": {
      ar: ["كيف يمكنني الإيداع؟", "تتوفر البطاقات والتحويل البنكي المحلي وOMT وBOB Finance وWhish Money وعملة USDT. تُضاف إيداعات البطاقة والمحفظة والعملات الرقمية فورًا؛ وتستغرق التحويلات البنكية عادةً من يوم إلى ثلاثة أيام عمل."],
      fr: ["Comment effectuer un dépôt ?", "Les cartes, virements bancaires locaux, OMT, BOB Finance, Whish Money et USDT sont disponibles. Les dépôts par carte, portefeuille et crypto sont crédités instantanément ; les virements bancaires prennent généralement un à trois jours ouvrés."],
    },
    "How quickly are withdrawals processed?": {
      ar: ["ما سرعة معالجة السحوبات؟", "يمكنك طلب السحب عند توفر الأسواق. نراجع الطلبات خلال يوم عمل، ثم نعيد الأموال إلى وسيلة التمويل الأصلية. تصل العملات الرقمية عادةً في اليوم نفسه، وتستغرق التحويلات البنكية من يوم إلى ثلاثة أيام عمل."],
      fr: ["Quel est le délai de traitement des retraits ?", "Vous pouvez demander un retrait lorsque les marchés sont ouverts. Les demandes sont examinées sous un jour ouvré, puis les fonds sont renvoyés vers le moyen utilisé pour le dépôt. Les cryptos arrivent généralement le jour même et les virements prennent un à trois jours ouvrés."],
    },
    "Do you charge any fees on deposits or withdrawals?": {
      ar: ["هل تفرضون رسومًا على الإيداع أو السحب؟", "لا. نتحمل رسوم المعالجة على جميع الوسائل في الاتجاهين، لذا تستلم المبلغ الذي تطلبه. قد يفرض مصرفك أو مزود محفظتك رسومًا خاصة به. ولا توجد رسوم خمول."],
      fr: ["Facturez-vous des frais de dépôt ou de retrait ?", "Non. Nous prenons en charge les frais de traitement pour tous les moyens et dans les deux sens : vous recevez le montant demandé. Votre banque ou portefeuille peut appliquer ses propres frais. Aucun frais d’inactivité n’est facturé."],
    },
  }), []);
  const categoryLabels = useMemo<Record<string, Record<"ar" | "fr", string>>>(() => ({
    Trading: { ar: "التداول", fr: "Trading" },
    Account: { ar: "الحساب", fr: "Compte" },
    Payments: { ar: "المدفوعات", fr: "Paiements" },
  }), []);
  const localizedFaqs = useMemo(() => faqs.map((faq) => {
    if (locale === "en") return faq;
    const homeKeys: Record<string, [Parameters<typeof t>[0], Parameters<typeof t>[0]]> = {
      "Which markets can I trade?": ["home.faq.q1", "home.faq.a1"],
      "What spreads and commission do you charge?": ["home.faq.q2", "home.faq.a2"],
      "Are expert advisors and algorithmic strategies allowed?": ["home.faq.q3", "home.faq.a3"],
      "Can I hold trades over the weekend or through news?": ["home.faq.q4", "home.faq.a4"],
      "Which platforms can I trade on?": ["home.faq.q5", "home.faq.a5"],
    };
    const keys = homeKeys[faq.question];
    const copy = translatedFaqCopy[faq.question]?.[locale];
    return {
      ...faq,
      category: categoryLabels[faq.category]?.[locale] ?? faq.category,
      question: keys ? t(keys[0]) : copy?.[0] ?? faq.question,
      answer: keys ? t(keys[1]) : copy?.[1] ?? faq.answer,
    };
  }), [categoryLabels, faqs, locale, t, translatedFaqCopy]);

  // Category order follows the seeded sort order rather than the alphabet, so
  // Trading stays first and Payments last.
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const faq of localizedFaqs) {
      if (!seen.includes(faq.category)) seen.push(faq.category);
    }
    return seen;
  }, [localizedFaqs]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const faq of localizedFaqs) {
      map.set(faq.category, (map.get(faq.category) ?? 0) + 1);
    }
    return map;
  }, [localizedFaqs]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
      return localizedFaqs.filter((faq) => {
      if (category !== ALL && faq.category !== category) return false;
      if (!needle) return true;
      return (
        faq.question.toLowerCase().includes(needle) ||
        faq.answer.toLowerCase().includes(needle)
      );
    });
  }, [localizedFaqs, query, category]);

  const grouped = useMemo(
    () =>
      categories
        .map((name) => ({
          name,
          items: results.filter((faq) => faq.category === name),
        }))
        .filter((group) => group.items.length > 0),
    [categories, results],
  );

  const filtered = Boolean(query.trim()) || category !== ALL;
  const singleResult = results.length === 1;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <label
          htmlFor={searchId}
          className="text-muted mb-2 block text-[0.8125rem] font-medium"
        >
          {t("faq.searchCount").replace("{count}", formatNumber(faqs.length))}
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-faint pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("faq.searchHint")}
            autoComplete="off"
            className="border-line bg-raised text-ink placeholder:text-faint focus:border-brand-light h-11 w-full rounded-full border pe-3 ps-10 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]"
          />
        </div>

        <nav aria-label={t("faq.filterLabel")} className="mt-6">
          <ul className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
            <li>
              <CategoryButton
                active={category === ALL}
                count={faqs.length}
                onClick={() => setCategory(ALL)}
              >
                {t("faq.allTopics")}
              </CategoryButton>
            </li>
            {categories.map((name) => (
              <li key={name}>
                <CategoryButton
                  active={category === name}
                  count={counts.get(name) ?? 0}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </CategoryButton>
              </li>
            ))}
          </ul>
        </nav>

        <p
          role="status"
          className="text-faint border-line-soft mt-5 border-t pt-4 font-mono text-[0.6875rem] tracking-[0.1em] uppercase"
        >
          {formatNumber(results.length)} {t("faq.answers")}
          {filtered ? ` ${t("faq.matching")}` : ` ${t("faq.inTotal")}`}
        </p>

        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(ALL);
            }}
            className="text-brand-light mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold"
          >
            <X className="size-3.5" aria-hidden="true" />
            {t("faq.clearFilters")}
          </button>
        )}

        <div className="border-line-soft bg-panel mt-8 hidden rounded-2xl border p-5 lg:block">
          <p className="text-ink text-sm font-semibold">{t("faq.stillStuck")}</p>
          <p className="text-muted mt-1.5 text-[0.8125rem] leading-relaxed">
            {t("faq.portalSupport")}
          </p>
          <Link
            href="/contact"
            className="text-brand-light mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
          >
            {locale === "ar" ? "تواصل مع فريق الدعم" : locale === "fr" ? "Contacter l’équipe" : "Contact the desk"}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div>
        {grouped.length === 0 ? (
          <div className="border-line-soft rounded-2xl border border-dashed px-6 py-16 text-center">
            <p className="text-ink font-display text-lg font-semibold">
              {locale === "ar" ? "لا توجد إجابة تطابق هذا البحث." : locale === "fr" ? "Aucune réponse ne correspond à cette recherche." : "No answer matches that search."}
            </p>
            <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
              {locale === "ar" ? "جرّب كلمة واحدة مثل السبريد أو التبييت أو الرافعة المالية، أو أرسل سؤالك إلى فريق الدعم وسنجيبك مباشرةً." : locale === "fr" ? "Essayez un mot comme spread, swap ou levier, ou envoyez votre question à l’équipe qui vous répondra directement." : "Try a single word such as spread, swap or leverage — or send the question to the desk and we will answer it directly."}
            </p>
            <Link
              href="/contact"
              className="text-brand-light mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              {locale === "ar" ? "اسأل فريق الدعم" : locale === "fr" ? "Interroger l’équipe" : "Ask the desk"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {grouped.map((group) => (
              <section
                key={group.name}
                id={`faq-${group.name.toLowerCase()}`}
                aria-labelledby={`faq-heading-${group.name.toLowerCase()}`}
                className="scroll-mt-28"
              >
                <div className="border-line-soft mb-2 flex items-baseline justify-between gap-4 border-b pb-3">
                  <h2
                    id={`faq-heading-${group.name.toLowerCase()}`}
                    className="text-ink font-display text-xl font-semibold"
                  >
                    {group.name}
                  </h2>
                  <span className="text-faint tabular font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                    {formatNumber(group.items.length)} {locale === "ar" ? "إجابة" : locale === "fr" ? (group.items.length === 1 ? "réponse" : "réponses") : (group.items.length === 1 ? "answer" : "answers")}
                  </span>
                </div>

                <Accordion>
                  {group.items.map((faq) => (
                    // Remounting on the solo/many switch is what lets a single
                    // search hit open itself without fighting local state.
                    <AccordionItem
                      key={`${faq.id}-${singleResult ? "solo" : "many"}`}
                      question={faq.question}
                      defaultOpen={singleResult}
                    >
                      {faq.answer}
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-start text-[0.8125rem] font-medium transition-colors",
        active
          ? "border-brand/45 bg-brand/12 text-brand-light"
          : "border-transparent text-muted hover:text-ink hover:bg-sunken",
      )}
    >
      {children}
      <span className="tabular font-mono text-[0.6875rem] opacity-70">
        {count}
      </span>
    </button>
  );
}
