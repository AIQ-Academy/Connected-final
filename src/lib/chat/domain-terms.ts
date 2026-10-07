import { knowledgeTokens } from "./knowledge-index.ts";
import type { ChatLanguage } from "./language.ts";

const conceptGroups: string[][] = [
  ["account", "accounts", "compte", "comptes", "حساب", "حسابات", "لحساب", "للحساب", "الحساب", "للحسابات"],
  ["funded", "funding", "evaluation", "challenge", "financé", "financée", "évaluation", "évaluations", "تمويل", "ممول", "تقييم", "تحدي"],
  ["leverage", "leveraged", "levier", "leviers", "الرافعة", "رافعة", "الرافعة المالية", "نسبة الرافعة"],
  ["spread", "spreads", "écart", "écarts", "spread de cotation", "السبريد", "فرق السعر", "فروق الأسعار"],
  ["commission", "commissions", "fee", "fees", "frais", "frais de trading", "عمولة", "عمولات", "رسوم"],
  ["swap", "swaps", "rollover", "overnight fee", "frais overnight", "التبييت", "سواب"],
  ["margin", "marge", "marges", "هامش", "الهامش", "متطلبات الهامش"],
  ["drawdown", "drawdowns", "loss limit", "daily loss", "perte maximale", "perte quotidienne", "baisse maximale", "التراجع", "الحد الأقصى للخسارة", "الخسارة اليومية"],
  ["withdrawal", "withdrawals", "payout", "payouts", "retrait", "retraits", "versement", "versements", "سحب", "السحب", "دفعة", "دفعات"],
  ["deposit", "deposits", "dépôt", "dépôts", "إيداع", "الإيداع"],
  ["price", "pricing", "cost", "costs", "tarif", "tarifs", "prix", "coût", "coûts", "سعر", "أسعار", "تكلفة", "تكاليف"],
  ["profit", "profits", "profit target", "profit split", "objectif", "objectif de profit", "partage des bénéfices", "bénéfices", "ربح", "الأرباح", "هدف الربح", "تقاسم الأرباح"],
  ["trading day", "trading days", "minimum days", "jours de trading", "jours minimum", "أيام التداول", "الحد الأدنى للأيام"],
  ["trading hours", "market hours", "horaires de trading", "heures de marché", "ساعات التداول", "أوقات السوق"],
  ["news trading", "economic news", "actualités économiques", "nouvelles économiques", "تداول الأخبار", "الأخبار الاقتصادية"],
  ["weekend", "weekends", "week-end", "week-ends", "fin de semaine", "عطلة نهاية الأسبوع", "نهاية الأسبوع"],
  ["scalping", "scalper", "scalping", "scalping", "سكالبينغ", "المضاربة السريعة"],
  ["hedging", "hedge", "couverture", "couvrir", "التحوط", "التحوّط"],
  ["copy trading", "copier les trades", "copie de trading", "نسخ التداول", "نسخ الصفقات"],
  ["instrument", "instruments", "market", "markets", "marché", "marchés", "instrument financier", "أداة", "أدوات", "سوق", "أسواق"],
  ["forex", "foreign exchange", "devises", "marché des changes", "فوركس", "عملات"],
  ["gold", "xauusd", "ذهب", "الذهب"],
  ["silver", "xagusd", "argent", "الفضة", "فضة"],
  ["oil", "crude", "pétrole", "énergie", "النفط", "الطاقة"],
  ["crypto", "cryptocurrency", "cryptocurrencies", "cryptomonnaie", "cryptomonnaies", "عملات رقمية", "العملات الرقمية"],
  ["platform", "platforms", "plateforme", "plateformes", "منصة", "منصات"],
  ["payment", "payments", "payment method", "payment methods", "paiement", "paiements", "moyen de paiement", "moyens de paiement", "دفع", "وسيلة دفع", "طرق الدفع"],
  ["verification", "identity verification", "vérification", "vérification d'identité", "التحقق", "التحقق من الهوية"],
  ["eligibility", "eligible", "conditions d'éligibilité", "éligible", "مؤهل", "الأهلية"],
  ["support", "assistance", "service client", "خدمة العملاء", "الدعم"],
];

const tokenGroups = conceptGroups.map((group) => new Set(group.flatMap(knowledgeTokens)));

/** Expands visitor wording into shared trading concepts without translating facts. */
export function expandDomainTerms(text: string, language: ChatLanguage) {
  const terms = new Set(knowledgeTokens(text));
  for (const group of tokenGroups) {
    const matched = [...group].some((term) => terms.has(term));
    if (matched) for (const term of group) terms.add(term);
  }
  // French “or” means gold; English “or” is a stop word and must not imply XAUUSD.
  if (language === "fr" && terms.has("or")) for (const term of tokenGroups[21]) terms.add(term);
  return [...terms];
}
