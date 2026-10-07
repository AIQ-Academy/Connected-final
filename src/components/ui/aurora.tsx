import { cn } from "@/lib/utils";

/**
 * Layered gradient wash used behind heroes and feature sections. Purely
 * decorative and pointer-transparent, so it never interferes with content.
 */
export function Aurora({
  className,
  intensity = "medium",
}: {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}) {
  const opacity = {
    subtle: "opacity-40 dark:opacity-45",
    medium: "opacity-60 dark:opacity-70",
    strong: "opacity-80 dark:opacity-95",
  }[intensity];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        opacity,
        className,
      )}
    >
      <div className="animate-aurora absolute -top-1/3 left-1/4 h-[70vw] max-h-[760px] w-[70vw] max-w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--cf-brand-glow)/0.55),transparent_65%)] blur-3xl" />
      <div
        className="animate-aurora absolute top-1/4 right-0 h-[52vw] max-h-[600px] w-[52vw] max-w-[600px] translate-x-1/3 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--cf-brand-glow)/0.4),transparent_65%)] blur-3xl"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="animate-aurora absolute -bottom-1/4 left-1/3 h-[46vw] max-h-[520px] w-[46vw] max-w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--cf-accent-glow)/0.22),transparent_65%)] blur-3xl"
        style={{ animationDelay: "-15s" }}
      />
    </div>
  );
}

/** Hairline grid that fades out toward the bottom of a section. */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-grid mask-fade-b pointer-events-none absolute inset-0",
        className,
      )}
    />
  );
}
