import { Bitcoin, CreditCard, Landmark, Wallet } from "lucide-react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { PaymentBrandMark } from "@/components/payments/payment-brand-mark";
import {
  getPaymentCategoryLabels,
  getPaymentMethods,
  type PaymentMethod,
} from "@/lib/content";
import type { Locale } from "@/lib/i18n/locale";

const categoryOrder: PaymentMethod["category"][] = [
  "card",
  "wallet",
  "crypto",
  "bank",
];

const categoryIcons: Record<PaymentMethod["category"], typeof Wallet> = {
  card: CreditCard,
  bank: Landmark,
  wallet: Wallet,
  crypto: Bitcoin,
};

const categoryBlurbs: Record<PaymentMethod["category"], string> = {
  card: "The fastest way to start. Authorisation clears in seconds and the account is funded before you close the tab. Withdrawals back to a card are capped at the amount originally deposited on it, with any balance routed to a bank account or wallet — a standard anti-money-laundering control rather than a rule we invented.",
  wallet:
    "The practical default across EMEA, South Asia and Latin America. Instant in, same-day approval out, and no card number exposed to a cross-border merchant.",
  crypto:
    "Dollar-denominated stablecoins settle in minutes on TRC-20 and ERC-20 and pay out the same day. BTC and ETH are quoted at the mid-market rate at the moment of approval, and the network fee is ours.",
  bank: "For larger allocations, or where a card issuer routinely declines cross-border merchants. Send from an account in your own name — third-party transfers are returned.",
};

export function CategoryCards({ locale = "en" }: { locale?: Locale }) {
  const paymentMethods = getPaymentMethods(locale);
  const paymentCategoryLabels = getPaymentCategoryLabels(locale);
  const categoryBlurbsByLocale: Record<Locale, Record<PaymentMethod["category"], string>> = {
    en: categoryBlurbs,
    ar: {
      card: "أسرع طريقة للبدء. تتم الموافقة خلال ثوانٍ ويُموّل الحساب قبل إغلاق الصفحة. تقتصر عمليات السحب إلى البطاقة على مبلغ الإيداع الأصلي، ويُحوّل أي رصيد متبقٍ إلى حساب بنكي أو محفظة وفقًا لضوابط مكافحة غسل الأموال.",
      wallet: "خيار عملي شائع في أوروبا والشرق الأوسط وأفريقيا وجنوب آسيا وأمريكا اللاتينية. إيداع فوري وموافقة على السحب في اليوم نفسه، دون مشاركة رقم البطاقة مع تاجر دولي.",
      crypto: "تُسوّى العملات المستقرة المقومة بالدولار خلال دقائق عبر شبكتي TRC-20 وERC-20، وتُصرف في اليوم نفسه. يُحتسب سعر BTC وETH عند الموافقة، ونتحمل رسوم الشبكة.",
      bank: "مناسب للمبالغ الأكبر أو عند رفض جهة إصدار البطاقة للمعاملات الدولية. أرسل الأموال من حساب باسمك؛ تُعاد التحويلات من أطراف أخرى.",
    },
    fr: {
      card: "Le moyen le plus rapide de commencer. L’autorisation est obtenue en quelques secondes et le compte est crédité avant la fermeture de la page. Les retraits vers une carte sont plafonnés au montant initialement déposé ; le solde restant est envoyé vers un compte bancaire ou un portefeuille, conformément aux règles de lutte contre le blanchiment.",
      wallet: "Une option pratique dans la région EMEA, en Asie du Sud et en Amérique latine. Dépôt instantané, validation du retrait le jour même et aucun numéro de carte communiqué à un commerçant transfrontalier.",
      crypto: "Les stablecoins libellés en dollars sont réglés en quelques minutes sur TRC-20 et ERC-20, avec un versement le jour même. BTC et ETH sont cotés au cours moyen lors de l’approbation ; nous prenons en charge les frais réseau.",
      bank: "Adapté aux montants importants ou aux cas où l’émetteur refuse les paiements transfrontaliers. Le virement doit provenir d’un compte à votre nom ; les virements de tiers sont retournés.",
    },
  };
  const timing = locale === "ar" ? ["إيداع", "سحب"] : locale === "fr" ? ["Dépôt", "Retrait"] : ["In", "Out"];
  return (
    <StaggerGroup className="grid gap-5 md:grid-cols-2">
      {categoryOrder.map((category) => {
        const Icon = categoryIcons[category];
        const methods = paymentMethods.filter(
          (method) => method.category === category,
        );

        return (
          <StaggerItem
            key={category}
            className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="border-line-soft bg-sunken text-brand-light grid size-9 place-items-center rounded-lg border">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display text-base font-semibold">
                {paymentCategoryLabels[category]}
              </h3>
            </div>

            <p className="text-muted mt-4 flex-1 text-sm leading-relaxed">
              {categoryBlurbsByLocale[locale][category]}
            </p>

            <dl className="border-line-soft mt-6 space-y-3 border-t pt-5">
              {methods.map((method) => (
                <div
                  key={method.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                >
                  <dt className="text-ink flex items-center gap-2 text-[0.8125rem] font-medium">
                    <PaymentBrandMark name={method.name} className="h-7 min-w-9 px-1.5" />
                    {method.name}
                  </dt>
                  <dd className="text-faint font-mono text-[0.6875rem] tracking-[0.04em] uppercase">
                    {timing[0]} {method.deposit} · {timing[1]} {method.payout}
                  </dd>
                </div>
              ))}
            </dl>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
