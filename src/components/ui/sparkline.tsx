import { cn } from "@/lib/utils";

/**
 * Dependency-free sparkline. Renders a smoothed polyline plus an optional
 * area fill, normalised to the series range so flat data still reads well.
 */
export function Sparkline({
  data,
  width = 72,
  height = 26,
  positive,
  strokeWidth = 1.6,
  fill = true,
  className,
  gradientId,
}: {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
  fill?: boolean;
  className?: string;
  gradientId?: string;
}) {
  if (data.length < 2) {
    return <svg width={width} height={height} className={className} aria-hidden="true" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = strokeWidth;
  const usable = height - pad * 2;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = pad + usable - ((value - min) / span) * usable;
    return [x, y] as const;
  });

  const up = positive ?? data[data.length - 1] >= data[0];
  const stroke = up ? "var(--cf-mint)" : "var(--cf-red)";
  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const id = gradientId ?? `spark-${up ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${line} ${width},${height}`}
            fill={`url(#${id})`}
          />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
