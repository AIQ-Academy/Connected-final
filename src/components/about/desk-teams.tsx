import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Presented as functional desks rather than named individuals: the people who
 * hold these seats change, the accountabilities do not.
 */
type DeskTeam = {
  code: string;
  name: string;
  headcount: number;
  accountable: string;
  duties: string[];
};

const teams: DeskTeam[] = [
  {
    code: "OPS",
    name: "Trading Operations",
    headcount: 11,
    accountable:
      "Keeping the bridge, the pricing feed and the three platforms running through every session, including the ones that start at 22:00 UTC.",
    duties: [
      "Liquidity routing and execution quality monitoring",
      "Account provisioning, resets and scaling upgrades",
      "Platform incidents and the status notices you receive",
    ],
  },
  {
    code: "RSK",
    name: "Risk",
    headcount: 7,
    accountable:
      "Writing the rulebook, encoding it into server-side checks, and reviewing every case where an automated decision is disputed.",
    duties: [
      "Margin and stop-out logic, and its test coverage",
      "Prohibited-practice detection and case review",
      "Allocation sizing, scaling approvals and exposure limits",
    ],
  },
  {
    code: "TRS",
    name: "Payments & Treasury",
    headcount: 6,
    accountable:
      "Moving money in both directions on the published timetable, and absorbing the processing cost so the amount requested is the amount received.",
    duties: [
      "Withdrawal approval, settlement and reconciliation",
      "Card, bank, e-wallet and crypto rail maintenance",
      "KYC review, sanctions screening and source-of-funds checks",
    ],
  },
  {
    code: "SUP",
    name: "Trader Support",
    headcount: 14,
    accountable:
      "Answering the portal queue 24 hours a day, five days a week, in English, Arabic and French, without a script.",
    duties: [
      "Portal tickets, email and pre-sale questions",
      "Specification guidance and platform troubleshooting",
      "Onboarding walkthroughs and verification chasing",
    ],
  },
  {
    code: "ENG",
    name: "Engineering",
    headcount: 18,
    accountable:
      "The client portal, the public site, the risk engine and every integration between them, shipped behind tests rather than behind a maintenance window.",
    duties: [
      "Portal, admin console and public site",
      "Risk engine, market data pipeline and reporting",
      "Security, access control and audit logging",
    ],
  },
];

const totalHeadcount = teams.reduce((sum, team) => sum + team.headcount, 0);

export function DeskTeams({ locale = "en" }: { locale?: Locale }) {
  const translated = locale === "en" ? teams : locale === "fr" ? [
    { ...teams[0], name: "Opérations de trading", accountable: "Maintenir la passerelle, le flux de prix et les trois plateformes en service pendant toutes les séances, y compris celles qui commencent à 22 h UTC.", duties: ["Acheminement de la liquidité et contrôle de la qualité d’exécution", "Ouverture, réinitialisation et mise à niveau des comptes", "Incidents de plateforme et avis de disponibilité"] },
    { ...teams[1], name: "Gestion du risque", accountable: "Rédiger le règlement, intégrer ses règles aux contrôles serveur et examiner toute contestation d’une décision automatisée.", duties: ["Règles de marge et de clôture automatique, ainsi que leurs tests", "Détection et examen des pratiques interdites", "Allocation, approbation des augmentations et limites d’exposition"] },
    { ...teams[2], name: "Paiements et trésorerie", accountable: "Traiter les dépôts et retraits dans les délais publiés et prendre en charge les frais afin que le montant demandé soit celui reçu.", duties: ["Approbation, règlement et rapprochement des retraits", "Gestion des moyens de paiement par carte, banque, portefeuille et crypto", "Contrôle KYC, sanctions et origine des fonds"] },
    { ...teams[3], name: "Assistance aux traders", accountable: "Répondre à la file du portail 24 h/24, cinq jours par semaine, en anglais, arabe et français, sans réponses pré-écrites.", duties: ["Tickets du portail, e-mails et questions avant inscription", "Conseils sur les spécifications et dépannage des plateformes", "Accompagnement à l’inscription et suivi des vérifications"] },
    { ...teams[4], name: "Ingénierie", accountable: "Développer le portail client, le site public, le moteur de risque et leurs intégrations, avec des tests avant chaque mise en production.", duties: ["Portail client, console d’administration et site public", "Moteur de risque, données de marché et rapports", "Sécurité, contrôle d’accès et journalisation des audits"] },
  ] : [
    { ...teams[0], name: "عمليات التداول", accountable: "ضمان عمل البنية التحتية لتوجيه الأوامر وتغذية الأسعار والمنصات الثلاث خلال جميع الجلسات، بما فيها الجلسات التي تبدأ عند 22:00 UTC.", duties: ["توجيه السيولة ومراقبة جودة التنفيذ", "تجهيز الحسابات وإعادة ضبطها وترقيتها", "أعطال المنصات وإشعارات الحالة"] },
    { ...teams[1], name: "إدارة المخاطر", accountable: "وضع القواعد وتحويلها إلى فحوصات على الخادم ومراجعة الحالات التي يُعترض فيها على قرار آلي.", duties: ["قواعد الهامش والإغلاق التلقائي واختبارها", "كشف الممارسات المحظورة ومراجعة الحالات", "تحديد التخصيص والموافقة على الترقية وحدود التعرض"] },
    { ...teams[2], name: "المدفوعات والخزينة", accountable: "معالجة الأموال في الاتجاهين وفق المواعيد المنشورة وتحمل تكاليف المعالجة ليطابق المبلغ المستلم المبلغ المطلوب.", duties: ["اعتماد السحوبات وتسويتها ومطابقتها", "إدارة وسائل الدفع بالبطاقة والتحويل والمحفظة والعملات الرقمية", "مراجعة KYC وفحص العقوبات ومصدر الأموال"] },
    { ...teams[3], name: "دعم المتداولين", accountable: "الرد على طلبات بوابة العميل على مدار الساعة خمسة أيام أسبوعيًا بالإنجليزية والعربية والفرنسية، من دون نصوص جاهزة.", duties: ["تذاكر البوابة والبريد واستفسارات ما قبل التسجيل", "إرشادات المواصفات وحل مشكلات المنصات", "شرح خطوات التسجيل ومتابعة التحقق"] },
    { ...teams[4], name: "الهندسة", accountable: "تطوير بوابة العميل والموقع العام ومحرك المخاطر وعمليات التكامل بينها، مع الاختبار قبل كل إصدار.", duties: ["بوابة العميل ولوحة الإدارة والموقع العام", "محرك المخاطر وخط بيانات السوق والتقارير", "الأمان وضبط الوصول وسجلات التدقيق"] },
  ];
  return (
    <div>
      <StaggerGroup className="grid gap-5 lg:grid-cols-2">
        {translated.map((team) => (
          <StaggerItem
            key={team.code}
            className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6"
          >
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="border-brand/30 bg-brand/12 text-brand-light grid size-12 shrink-0 place-items-center rounded-xl border font-mono text-[0.6875rem] font-semibold tracking-[0.12em]"
              >
                {team.code}
              </span>
              <div className="min-w-0">
                <h3 className="text-ink font-display text-lg leading-snug font-semibold">
                  {team.name}
                </h3>
                <p className="text-faint tabular mt-0.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
                  {team.headcount} {locale === "ar" ? "موظفًا" : locale === "fr" ? "personnes" : "people"}
                </p>
              </div>
            </div>

            <p className="text-muted mt-4 text-sm leading-relaxed">
              {team.accountable}
            </p>

            <ul className="border-line-soft mt-5 space-y-2 border-t pt-4">
              {team.duties.map((duty) => (
                <li
                  key={duty}
                  className="text-muted flex gap-2.5 text-[0.8125rem] leading-relaxed"
                >
                  <span
                    aria-hidden="true"
                    className="bg-brand mt-2 size-1 shrink-0 rounded-full"
                  />
                  {duty}
                </li>
              ))}
            </ul>
          </StaggerItem>
        ))}

        <StaggerItem className="border-brand/30 bg-brand/8 flex flex-col justify-center rounded-2xl border border-dashed p-6">
          <p className="text-ink font-display tabular text-4xl font-semibold">
            {totalHeadcount}
          </p>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            {locale === "ar" ? "موظفًا ضمن خمسة فرق، يعملون من دبي وعن بُعد في أوروبا والشرق الأوسط وأفريقيا. ننشر مسؤوليات كل فريق لأن الدور أهم من اسم شاغله." : locale === "fr" ? "personnes réparties entre cinq équipes, à Dubaï et à distance en Europe, au Moyen-Orient et en Afrique. Nous publions leurs responsabilités : le rôle compte davantage que le nom de la personne qui l’occupe." : "people across five desks, working from Dubai and remotely across Europe, the Middle East and Africa. We publish accountabilities rather than headshots because the seat matters more than the name in it."}
          </p>
        </StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.1}>
        <p className="text-faint mt-8 text-sm">
          {locale === "ar" ? "يمكنك التواصل مع جميع الفرق عبر تذاكر البوابة. ويراجع فريق المخاطر قراراته بنفسه لا فريق الدعم، لتتلقى دائمًا إجابة من الجهة التي اتخذت القرار." : locale === "fr" ? "Chaque équipe est joignable depuis les tickets du portail. Les décisions relatives au risque sont examinées par l’équipe risque, jamais par l’assistance : vous obtenez ainsi une réponse de l’équipe qui a pris la décision." : "Every desk is reachable through the portal ticket queue. Risk decisions are reviewed by the risk desk itself, never by support, so you always get an answer from the team that made the call."}
        </p>
      </Reveal>
    </div>
  );
}
