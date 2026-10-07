import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded social card. Drawn with plain divs because next/og supports only a
 * subset of CSS and no external stylesheets.
 */
export default async function OpengraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/brand/logo-on-dark.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(1100px 620px at 18% -10%, #2340A2 0%, transparent 62%), radial-gradient(900px 520px at 105% 115%, #3cb371 0%, transparent 60%), #0d1526",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(238,240,248,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(238,240,248,0.045) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logoSrc} alt="" height={52} style={{ height: 52 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 20,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#93cbb2",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                background: "#2340A2",
                clipPath: "polygon(0 0, 100% 0, 45% 100%, 0 100%)",
              }}
            />
            <span>Multi-asset funded trading</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              maxWidth: 940,
            }}
          >
            Trade institutional capital.
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "#cbd5e1",
              maxWidth: 860,
            }}
          >
            Pass a transparent evaluation, trade up to $200,000 of firm capital,
            and keep as much as 90% of the profit.
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, alignItems: "flex-end" }}>
          {[
            { value: "$200K", label: "Max account size" },
            { value: "90%", label: "Profit split" },
            { value: "24–48h", label: "Payout release" },
            { value: "$2M", label: "Scaling ceiling" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>
                {stat.value}
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#cbd5e1" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
