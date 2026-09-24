import { AppMain } from "@/components/app/panel";

export default function PortalLoading() {
  return (
    <AppMain aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your portal</span>

      <div className="flex flex-col gap-3">
        <Bar className="h-3 w-28" />
        <Bar className="h-8 w-72 max-w-full" />
        <Bar className="h-3 w-56 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="border-line-soft bg-panel rounded-[var(--radius-lg)] border p-5"
          >
            <Bar className="h-2.5 w-24" />
            <Bar className="mt-4 h-7 w-32" />
            <Bar className="mt-3 h-2.5 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="border-line-soft bg-panel flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5"
          >
            <Bar className="h-4 w-44" />
            <Bar className="h-16 w-full" />
            <Bar className="h-2 w-full" />
            <Bar className="h-2 w-4/5" />
            <Bar className="h-2 w-2/3" />
          </div>
        ))}
      </div>
    </AppMain>
  );
}

function Bar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-sunken block animate-pulse rounded-full ${className ?? ""}`}
    />
  );
}
