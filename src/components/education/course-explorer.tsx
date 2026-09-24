"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Clock, Layers } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { TabList, TabPanel, type TabItem } from "@/components/ui/tabs";
import {
  courseTracks,
  courses,
  levelLabels,
  type Course,
  type CourseLevel,
} from "@/lib/education-content";
import { marketingImages } from "@/lib/images";
import { cn } from "@/lib/utils";

type Filter = CourseLevel | "all";

const ID_PREFIX = "academy";

const levelTone: Record<CourseLevel, "mint" | "brand" | "amber"> = {
  beginner: "mint",
  intermediate: "brand",
  advanced: "amber",
};

export function CourseExplorer() {
  const [filter, setFilter] = useState<Filter>("all");

  const tabs = useMemo<TabItem[]>(
    () => [
      { value: "all", label: "All courses", count: courses.length },
      ...(["beginner", "intermediate", "advanced"] as const).map((level) => ({
        value: level,
        label: levelLabels[level],
        count: courses.filter((course) => course.level === level).length,
      })),
    ],
    [],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? courses
        : courses.filter((course) => course.level === filter),
    [filter],
  );

  return (
    <div>
      <TabList
        items={tabs}
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        label="Filter the curriculum by level"
        idPrefix={ID_PREFIX}
      />

      {tabs.map((tab) => (
        <TabPanel
          key={tab.value}
          value={tab.value}
          active={tab.value === filter}
          idPrefix={ID_PREFIX}
          className="mt-10"
        >
          <div className="flex flex-col gap-12">
            {courseTracks.map((track) => {
              const group = visible.filter((course) => course.track === track);
              if (!group.length) return null;

              return (
                <section key={track} aria-labelledby={`track-${slug(track)}`}>
                  <div className="border-line-soft mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
                    <h3
                      id={`track-${slug(track)}`}
                      className="text-ink font-display text-lg font-semibold"
                    >
                      {track}
                    </h3>
                    <span className="text-faint font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                      {group.length} course{group.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    {group.map((course) => (
                      <CourseCard key={course.slug} course={course} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </TabPanel>
      ))}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const panelId = `course-${course.slug}-modules`;

  return (
    <article
      className={cn(
        "border-line-soft bg-panel flex flex-col overflow-hidden rounded-2xl border transition-colors duration-300",
        open ? "border-brand/45" : "hover:border-line",
      )}
    >
      <div className="relative h-28 overflow-hidden border-b border-line-soft">
        <Image
          src={marketingImages.education.src}
          alt={marketingImages.education.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="from-bg/50 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <Badge tone={levelTone[course.level]}>{levelLabels[course.level]}</Badge>
        <span className="text-faint tabular flex items-center gap-3 font-mono text-[0.6875rem]">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5" aria-hidden="true" />
            {course.moduleCount}
            <span className="sr-only"> modules</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {course.hours}h
          </span>
        </span>
      </div>

      <h4 className="text-ink font-display mt-4 text-lg leading-snug font-semibold">
        {course.title}
      </h4>
      <p className="text-muted mt-2.5 text-sm leading-relaxed">
        {course.summary}
      </p>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="text-brand-light mt-5 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-semibold"
      >
        {open ? "Hide" : "View"} the {course.moduleCount} modules
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="modules"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0.01 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden"
          >
            <ol className="border-line-soft mt-5 space-y-2.5 border-t pt-5">
              {course.modules.map((module, index) => (
                <li key={module} className="flex gap-3 text-sm">
                  <span className="text-faint tabular mt-px shrink-0 font-mono text-[0.6875rem]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-muted leading-relaxed">{module}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </article>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
