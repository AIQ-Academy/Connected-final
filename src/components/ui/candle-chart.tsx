import { cn, formatNumber, priceDecimals } from "@/lib/utils";

type Candle = {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
};

/**
 * Decorative OHLC panel for marketing surfaces. Built from a close series so
 * it sits on the same simulator history the terminal uses, without pulling in
 * a charting library.
 *
 * The plot stretches to its container (`preserveAspectRatio="none"`), so every
 * candle is drawn as a rect — bodies and wicks distort together and stay in
 * proportion. The few real strokes are hairlines, and all typography lives in
 * the HTML gutter beside the SVG rather than inside it.
 */
export function CandleChart({
  closes,
  className,
  candleCount = 30,
  chartId = "chart",
  showAxis = false,
  showVolume = false,
}: {
  closes: number[];
  className?: string;
  candleCount?: number;
  chartId?: string;
  showAxis?: boolean;
  showVolume?: boolean;
}) {
  const candles = toCandles(closes, candleCount, chartId);
  if (candles.length === 0) {
    return <div className={className} aria-hidden="true" />;
  }

  const width = 300;
  const height = 100;
  const padX = 3;
  const padTop = 5;
  const padBottom = 3;
  const volumeH = showVolume ? 16 : 0;
  const volumeGap = showVolume ? 7 : 0;
  const priceH = height - padTop - padBottom - volumeH - volumeGap;

  const high = Math.max(...candles.map((c) => c.high));
  const low = Math.min(...candles.map((c) => c.low));
  // A little headroom keeps wicks off the frame and leaves room for the tag.
  const pad = (high - low || Math.abs(high) * 0.002) * 0.1;
  const scaleMax = high + pad;
  const scaleMin = low - pad;
  const scaleSpan = scaleMax - scaleMin || 1;
  const maxVolume = Math.max(...candles.map((c) => c.volume), 1);

  const innerW = width - padX * 2;
  const slot = innerW / candles.length;
  const bodyW = Math.max(1.4, slot * 0.6);
  const wickW = Math.max(0.5, bodyW * 0.18);
  const volumeW = bodyW * 0.7;

  const yPrice = (value: number) =>
    padTop + priceH - ((value - scaleMin) / scaleSpan) * priceH;

  const last = candles[candles.length - 1]!;
  const lastUp = last.close >= last.open;
  const lastY = yPrice(last.close);
  const trend = lastUp ? "var(--cf-mint)" : "var(--cf-red)";
  const decimals = priceDecimals(last.close);

  const gridFractions = [0, 1 / 3, 2 / 3, 1];
  const ticks = gridFractions.map((fraction) => {
    const value = scaleMax - scaleSpan * fraction;
    return { fraction, value, y: yPrice(value) };
  });

  return (
    <div
      className={cn("flex items-stretch gap-1.5", className)}
      aria-hidden="true"
    >
      <div className="relative min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="block h-full w-full"
        >
          {ticks.map((tick) => (
            <line
              key={tick.fraction}
              x1={padX}
              x2={width - padX}
              y1={tick.y}
              y2={tick.y}
              className="stroke-line"
              strokeWidth="1"
              strokeDasharray="1 4"
              opacity={tick.fraction === 0 || tick.fraction === 1 ? 0.6 : 1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {candles.map((candle, index) => {
            const x = padX + slot * index + slot / 2;
            const up = candle.close >= candle.open;
            const top = yPrice(Math.max(candle.open, candle.close));
            const bottom = yPrice(Math.min(candle.open, candle.close));
            const isLast = index === candles.length - 1;
            const color = up ? "var(--cf-mint)" : "var(--cf-red)";

            return (
              <g key={index} opacity={isLast ? 1 : 0.85}>
                <rect
                  x={x - wickW / 2}
                  y={yPrice(candle.high)}
                  width={wickW}
                  height={Math.max(
                    0.4,
                    yPrice(candle.low) - yPrice(candle.high),
                  )}
                  fill={color}
                  opacity="0.7"
                />
                <rect
                  x={x - bodyW / 2}
                  y={top}
                  width={bodyW}
                  height={Math.max(0.55, bottom - top)}
                  fill={color}
                />
              </g>
            );
          })}

          <line
            x1={padX}
            x2={width - padX}
            y1={lastY}
            y2={lastY}
            stroke={trend}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.7"
            vectorEffect="non-scaling-stroke"
          />

          {showVolume && (
            <g>
              {candles.map((candle, index) => {
                const x = padX + slot * index + slot / 2;
                const up = candle.close >= candle.open;
                const barH = Math.max(
                  0.6,
                  (candle.volume / maxVolume) * volumeH,
                );

                return (
                  <rect
                    key={`volume-${index}`}
                    x={x - volumeW / 2}
                    y={height - padBottom - barH}
                    width={volumeW}
                    height={barH}
                    fill={up ? "var(--cf-mint)" : "var(--cf-red)"}
                    opacity={index === candles.length - 1 ? 0.5 : 0.28}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {showAxis && (
        <div className="relative w-12 shrink-0 sm:w-[3.25rem]">
          {ticks.map((tick) => {
            // Suppress a tick that would collide with the last-price tag.
            const collides = Math.abs(tick.y - lastY) / height < 0.09;
            if (collides) return null;

            return (
              <span
                key={tick.fraction}
                className="text-faint tabular absolute right-0 -translate-y-1/2 font-mono text-[0.5625rem] leading-none"
                style={{ top: `${(tick.y / height) * 100}%` }}
              >
                {formatNumber(tick.value, decimals)}
              </span>
            );
          })}

          <span
            className={cn(
              "tabular absolute right-0 -translate-y-1/2 rounded-[3px] px-1 py-[0.1875rem] font-mono text-[0.5625rem] leading-none font-medium text-white",
              lastUp ? "bg-mint" : "bg-loss",
            )}
            style={{ top: `${(lastY / height) * 100}%` }}
          >
            {formatNumber(last.close, decimals)}
          </span>
        </div>
      )}
    </div>
  );
}

/** Stable 32-bit hash so each chart gets its own reproducible wick pattern. */
function hash(value: string) {
  let out = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    out ^= value.charCodeAt(i);
    out = Math.imul(out, 16777619);
  }
  return (out >>> 0) / 4294967295;
}

function noise(seed: number) {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Expands a close series into candles.
 *
 * The simulator behind the series is a sum of sines, which on its own draws a
 * suspiciously smooth wave. A seeded noise field roughens the intermediate
 * closes and sizes the wicks and volume, with a squared distribution so most
 * bars are quiet and a few print a long tail. The final close is left exactly
 * as given, so the last body still agrees with the printed price.
 */
function toCandles(closes: number[], count: number, salt: string): Candle[] {
  if (closes.length < 2) return [];

  const start = Math.max(1, closes.length - count);
  const source = closes.slice(start - 1);
  const deltas = source
    .slice(1)
    .map((value, index) => Math.abs(value - source[index]!));
  const averageMove =
    deltas.reduce((total, delta) => total + delta, 0) / (deltas.length || 1) ||
    Math.abs(source[0]!) * 0.0004;

  const seed = hash(salt) * 1000;

  const series = source.map((value, index) =>
    index === source.length - 1
      ? value
      : value + averageMove * (noise(seed + index * 21.317) - 0.5) * 1.15,
  );

  return series.slice(1).map((close, index) => {
    const open = series[index]!;
    const body = Math.abs(close - open);
    const upperNoise = noise(seed + index * 12.9898);
    const lowerNoise = noise(seed + index * 78.233 + 4.1);
    const volumeNoise = noise(seed + index * 39.425 + 9.7);

    return {
      open,
      close,
      high:
        Math.max(open, close) +
        body * 0.18 +
        averageMove * upperNoise ** 2 * 1.6,
      low:
        Math.min(open, close) -
        body * 0.18 -
        averageMove * lowerNoise ** 2 * 1.6,
      volume: 0.25 + (body / averageMove) * 0.5 + volumeNoise ** 2 * 1.1,
    };
  });
}
