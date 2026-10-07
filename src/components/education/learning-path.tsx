"use client";

import { Target } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { courses, learningPath } from "@/lib/education-content";
import { useLocale } from "@/components/i18n/locale-provider";
import { localizedCourse, localizedPath } from "@/lib/education-locales";

/**
 * The curriculum in the order the desk recommends taking it. The rail is
 * decorative; the underlying list stays a plain ordered list for screen
 * readers and for a stylesheet-free render.
 */
export function LearningPath() {
  const { locale, t } = useLocale();
  const titleBySlug = new Map(courses.map((course) => [course.slug, localizedCourse(course, locale).title]));
  return (
    <ol className="relative flex flex-col gap-10">
      <span
        aria-hidden="true"
        className="rail-dotted absolute top-3 bottom-3 start-[19px] w-px sm:start-[23px]"
      />

      {learningPath.map((stage, index) => {
        const copy = localizedPath(stage, index, locale);
        return (
        <Reveal
          as="li"
          key={stage.step}
          delay={index * 0.05}
          className="relative grid gap-5 ps-14 sm:ps-[68px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10"
        >
          <span
            aria-hidden="true"
            className="border-line bg-panel text-brand-light font-display absolute top-0 start-0 grid size-10 place-items-center rounded-full border text-[0.8125rem] font-semibold sm:size-12 sm:text-sm"
          >
            {stage.step}
          </span>

          <div>
            <h3 className="text-ink font-display text-h3">{copy.title}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {stage.courses.map((slug) => (
                <li
                  key={slug}
                  className="border-line-soft bg-sunken/70 text-muted rounded-full border px-3 py-1.5 text-[0.75rem]"
                >
                  {titleBySlug.get(slug) ?? slug}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-line-soft bg-panel rounded-2xl border p-5">
            <p className="text-muted text-sm leading-relaxed">{copy.why}</p>
            <p className="border-line-soft text-ink mt-4 flex gap-2.5 border-t pt-4 text-sm leading-relaxed">
              <Target
                aria-hidden="true"
                className="text-mint mt-0.5 size-4 shrink-0"
              />
              <span>
                <span className="text-faint font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                  {t("education.outcome")}
                </span>
                <span className="mt-1 block">{copy.outcome}</span>
              </span>
            </p>
          </div>
        </Reveal>
        );
      })}
    </ol>
  );
}
