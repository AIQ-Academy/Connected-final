import type { MetadataRoute } from "next";

import { getCmsDocumentTimestamps } from "@/db/queries";
import { CMS_KEY_ROUTES } from "@/lib/cms/schemas";
import { site } from "@/lib/site";
import { localizedPath } from "@/lib/i18n/locale";

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const entries: Entry[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/trade", changeFrequency: "daily", priority: 0.95 },
  { path: "/trade/forex", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trade/metals", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trade/indices", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trade/commodities", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trade/crypto", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trade/stocks", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trading", changeFrequency: "daily", priority: 0.95 },
  { path: "/trading/accounts", changeFrequency: "weekly", priority: 0.9 },
  { path: "/trading/how-it-works", changeFrequency: "monthly", priority: 0.85 },
  { path: "/trading/conditions", changeFrequency: "weekly", priority: 0.85 },
  { path: "/products", changeFrequency: "weekly", priority: 0.8 },
  { path: "/markets", changeFrequency: "hourly", priority: 0.8 },
  { path: "/tools", changeFrequency: "monthly", priority: 0.75 },
  { path: "/tools/calculator", changeFrequency: "monthly", priority: 0.75 },
  {
    path: "/tools/economic-calendar",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  { path: "/platforms", changeFrequency: "monthly", priority: 0.7 },
  { path: "/payments", changeFrequency: "monthly", priority: 0.7 },
  { path: "/education", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/risk-disclosure", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/aml-kyc", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/refunds", changeFrequency: "yearly", priority: 0.3 },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pages driven by a CMS document report when that document last changed, so
  // crawlers see a real edit date instead of "whenever the sitemap was built".
  const timestamps = await getCmsDocumentTimestamps();
  const cmsLastModified = new Map(
    Object.entries(CMS_KEY_ROUTES).flatMap(([key, path]) => {
      const updatedAt = timestamps.get(key);
      return updatedAt ? [[path, updatedAt] as const] : [];
    }),
  );

  return entries.flatMap((entry) => {
    const languages = {
      en: new URL(localizedPath(entry.path, "en"), site.url).toString(),
      fr: new URL(localizedPath(entry.path, "fr"), site.url).toString(),
      ar: new URL(localizedPath(entry.path, "ar"), site.url).toString(),
    };
    return (["en", "fr", "ar"] as const).map((locale) => ({
      url: new URL(localizedPath(entry.path, locale), site.url).toString(),
      lastModified: cmsLastModified.get(entry.path) ?? now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages },
    }));
  });
}
