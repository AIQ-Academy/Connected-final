"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useLocale } from "@/components/i18n/locale-provider";
import { getPrimaryNav } from "@/lib/site";
import { localizedPath } from "@/lib/i18n/locale";

type Crumb = { label: string; href: string };
type HeadingLocation = { id: string; label: string; element: HTMLElement };
type SectionLocation = HeadingLocation & { subsections: HeadingLocation[] };

function routePath(pathname: string) {
  return (pathname.replace(/^\/(?:ar|fr)(?=\/|$)/, "") || "/").replace(/\/$/, "") || "/";
}

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
}

export function SiteBreadcrumb() {
  const pathname = usePathname() ?? "/";
  const { locale, direction, t } = useLocale();
  const [sections, setSections] = useState<SectionLocation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [activeSubsection, setActiveSubsection] = useState<HeadingLocation | null>(null);
  const currentPath = routePath(pathname);

  const routeCrumbs = useMemo(() => {
    const nav = getPrimaryNav(locale);
    const candidates: { group: string; groupHref: string; label: string; href: string }[] = [];
    for (const group of nav) {
      if (group.href) candidates.push({ group: group.label, groupHref: group.href, label: group.label, href: group.href });
      for (const column of group.columns ?? []) {
        for (const link of column.links) {
          if (!link.external && link.href.startsWith("/")) {
            const path = link.href.split("#")[0];
            candidates.push({ group: group.label, groupHref: group.href ?? path, label: link.label, href: path });
          }
        }
      }
    }
    const match = candidates.filter((item) => routePath(item.href) === currentPath)
      .sort((a, b) => b.href.length - a.href.length)[0];
    const items: Crumb[] = [{ label: t("footer.home"), href: localizedPath("/", locale) }];
    if (match && currentPath !== "/") {
      if (match.group !== match.label) items.push({ label: match.group, href: localizedPath(match.groupHref, locale) });
      items.push({ label: match.label, href: localizedPath(match.href, locale) });
      return items;
    }
    if (currentPath !== "/") {
      const fallback = currentPath.split("/").filter(Boolean);
      let accumulated = "";
      for (const part of fallback) {
        accumulated += `/${part}`;
        items.push({ label: decodeURIComponent(part).replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), href: localizedPath(accumulated, locale) });
      }
    }
    return items;
  }, [currentPath, locale, t]);

  useEffect(() => {
    if (currentPath === "/") {
      // Resetting measured section data is a deliberate DOM-to-React sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSections([]);
      setActiveId("");
      return;
    }
    const main = document.querySelector<HTMLElement>("#main-content");
    if (!main) return;
    const elements = Array.from(main.querySelectorAll<HTMLElement>("section")).filter((element) =>
      !element.parentElement?.closest("section"));
    const next: SectionLocation[] = [];
    const used = new Set<string>();
    elements.forEach((element, index) => {
      const heading = element.querySelector<HTMLElement>("h1, h2, h3");
      const label = heading?.innerText.trim();
      if (!label) return;
      if (!element.id) {
        const base = slugify(label);
        let id = base;
        let suffix = 2;
        while (document.getElementById(id) || used.has(id)) id = `${base}-${suffix++}`;
        element.id = id;
        element.dataset.breadcrumbGeneratedId = "true";
      }
      used.add(element.id);
      element.style.scrollMarginTop ||= "9rem";
      const subsections: HeadingLocation[] = [];
      for (const subheading of Array.from(element.querySelectorAll<HTMLElement>("h3"))) {
        const sublabel = subheading.innerText.trim();
        if (!sublabel) continue;
        if (!subheading.id) {
          const base = slugify(sublabel);
          let id = base;
          let suffix = 2;
          while (document.getElementById(id) || used.has(id)) id = `${base}-${suffix++}`;
          subheading.id = id;
          subheading.dataset.breadcrumbGeneratedId = "true";
        }
        used.add(subheading.id);
        subheading.style.scrollMarginTop ||= "9rem";
        subsections.push({ id: subheading.id, label: sublabel, element: subheading });
      }
      next.push({ id: element.id, label: index === 0 ? (locale === "ar" ? "نظرة عامة" : locale === "fr" ? "Aperçu" : "Overview") : label, element, subsections });
    });
    // The headings are discovered from the rendered page DOM.
    setSections(next);
    const updateActive = () => {
      const marker = 170;
      let current = next[0];
      for (const item of next) {
        if (item.element.getBoundingClientRect().top <= marker) current = item;
        else break;
      }
      if (current) {
        setActiveId(current.id);
        let subsection: HeadingLocation | null = null;
        for (const item of current.subsections) {
          if (item.element.getBoundingClientRect().top <= marker) subsection = item;
          else break;
        }
        setActiveSubsection(subsection);
      }
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, [currentPath, locale]);

  if (currentPath === "/") return null;
  const activeSection = sections.find((section) => section.id === activeId);

  return (
    <nav aria-label="Breadcrumb" dir={direction} className="sticky top-[122px] z-30 border-b border-line-soft bg-bg/90 backdrop-blur-md">
      <ol className="mx-auto flex min-h-10 max-w-[var(--container-page)] flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {routeCrumbs.map((crumb, index) => (
          <li key={`${crumb.href}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-ink-faint">/</span>}
            <Link href={crumb.href} aria-current={index === routeCrumbs.length - 1 && !activeSection ? "page" : undefined}
              className={`truncate transition-colors hover:text-accent ${index === routeCrumbs.length - 1 && !activeSection ? "font-semibold text-ink" : "text-ink-muted"}`}>
              {crumb.label}
            </Link>
          </li>
        ))}
        {activeSection && (
          <li className="flex min-w-0 items-center gap-2" aria-current="location">
            <span aria-hidden="true" className="text-ink-faint">/</span>
            <a href={`#${activeSection.id}`} className="truncate font-semibold text-accent hover:underline">{activeSection.label}</a>
          </li>
        )}
        {activeSubsection && (
          <li className="flex min-w-0 items-center gap-2" aria-current="location">
            <span aria-hidden="true" className="text-ink-faint">/</span>
            <a href={`#${activeSubsection.id}`} className="truncate font-medium text-ink-muted hover:text-accent hover:underline">{activeSubsection.label}</a>
          </li>
        )}
      </ol>
    </nav>
  );
}
