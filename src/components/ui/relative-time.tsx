"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/locale-provider";

function formatRelativeTime(date: Date, locale: "en" | "fr" | "ar") {
  const tag = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US";
  const relative = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 60) return relative.format(-Math.max(1, minutes), "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 7) return relative.format(-days, "day");

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return relative.format(-weeks, "week");

  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function RelativeTime({
  date,
  className,
}: {
  date: Date;
  className?: string;
}) {
  const { locale } = useLocale();
  const [label, setLabel] = useState(() => formatRelativeTime(date, locale));

  useEffect(() => {
    const timer = window.setInterval(
      () => setLabel(formatRelativeTime(date, locale)),
      60_000,
    );
    return () => window.clearInterval(timer);
  }, [date, locale]);

  return (
    <time
      dateTime={date.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {label}
    </time>
  );
}
