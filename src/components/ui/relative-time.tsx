"use client";

import { useEffect, useState } from "react";

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return new Intl.DateTimeFormat("en-GB", {
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
  const [label, setLabel] = useState(() => formatRelativeTime(date));

  useEffect(() => {
    const timer = window.setInterval(
      () => setLabel(formatRelativeTime(date)),
      60_000,
    );
    return () => window.clearInterval(timer);
  }, [date]);

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
