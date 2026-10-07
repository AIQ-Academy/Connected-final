import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import { PaymentBrandMark } from "@/components/payments/payment-brand-mark";
import { getPaymentCategoryLabels, getPaymentMethods } from "@/lib/content";
import type { Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function MethodTable({ locale = "en" }: { locale?: Locale }) {
  const paymentMethods = getPaymentMethods(locale);
  const paymentCategoryLabels = getPaymentCategoryLabels(locale);
  const labels = locale === "ar"
    ? ["الطريقة", "الفئة", "الاتجاه", "الحدود", "الإيداع", "السحب", "ملاحظات"]
    : locale === "fr"
      ? ["Méthode", "Catégorie", "Sens", "Limites", "Dépôt", "Retrait", "Notes"]
      : ["Method", "Category", "Direction", "Limits", "Deposit", "Payout", "Notes"];
  const caption = locale === "ar"
    ? "جميع وسائل الإيداع والسحب والحدود وأوقات المعالجة وملاحظات الاستخدام"
    : locale === "fr"
      ? "Tous les moyens de dépôt et de retrait, avec limites, délais et notes pratiques"
      : "Every deposit and payout rail, with limits, processing times and handling notes";
  return (
    <TableShell caption={caption}>
      <Table className="min-w-[900px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <Th className="ps-5">{labels[0]}</Th>
            <Th>{labels[1]}</Th>
            <Th>{labels[2]}</Th>
            <Th>{labels[3]}</Th>
            <Th>{labels[4]}</Th>
            <Th>{labels[5]}</Th>
            <Th className="pe-5">{labels[6]}</Th>
          </tr>
        </thead>
        <tbody>
          {paymentMethods.map((method) => {
            const payoutUnavailable = method.payout === "Not available";

            return (
              <Tr key={method.name}>
                <Td className="text-ink ps-5 text-[0.8125rem] font-medium">
                  <span className="inline-flex items-center gap-2">
                    <PaymentBrandMark name={method.name} className="h-7 min-w-9 px-1.5" />
                  {method.name}
                  </span>
                </Td>
                <Td className="text-muted text-[0.8125rem]">
                  {paymentCategoryLabels[method.category]}
                </Td>
                <Td className="text-muted text-[0.75rem]">
                  {method.direction}
                </Td>
                <Td className="text-brand-light font-mono text-[0.75rem]">
                  {method.limits}
                </Td>
                <Td className="text-mint font-mono text-[0.8125rem]">
                  {method.deposit}
                </Td>
                <Td
                  className={cn(
                    "font-mono text-[0.8125rem]",
                    payoutUnavailable ? "text-faint" : "text-muted",
                  )}
                >
                  {method.payout}
                </Td>
                <Td className="text-faint max-w-md pe-5 text-xs leading-relaxed">
                  {method.detail}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </TableShell>
  );
}
