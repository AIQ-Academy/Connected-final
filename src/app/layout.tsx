import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";

import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { site } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { directionFor, localizedPath } from "@/lib/i18n/locale";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const routePath = requestHeaders.get("x-connect-path") || "/";
  const locale = await getServerLocale();
  const dictionary = getDictionary(locale);
  const tagline = locale === "en" ? site.tagline : dictionary["seo.homeTitle"];
  const description = locale === "en" ? site.description : dictionary["seo.homeDescription"];
  const title = `${site.name} — ${tagline}`;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.name}` },
    description,
    applicationName: site.name,
    keywords: [
      "online trading", "forex broker", "multi-asset trading", "CFD trading",
      "trading platforms", "market analysis", "gold trading", "indices CFD",
    ],
    authors: [{ name: site.name }],
    openGraph: { type: "website", siteName: site.name, title, description, locale: locale === "ar" ? "ar" : locale === "fr" ? "fr_FR" : "en_US", url: site.url },
    twitter: { card: "summary_large_image", title, description },
    icons: { icon: "/brand/favicon.png", apple: "/brand/favicon.png" },
    robots: { index: true, follow: true },
    alternates: { canonical: localizedPath(routePath, locale), languages: languageAlternates(routePath) },
  };
}

export const viewport: Viewport = {
  themeColor: "#2340A2",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();
  const direction = directionFor(locale);

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Script id="connect-funded-theme-init" strategy="beforeInteractive">
          {`try { var savedTheme = localStorage.getItem("theme"); document.documentElement.classList.toggle("dark", savedTheme === "dark"); document.documentElement.style.colorScheme = savedTheme === "dark" ? "dark" : "light"; } catch (_) {}`}
        </Script>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
