import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

export function TradingEdgeHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children?: ReactNode }) {
  return <section className="relative isolate flex min-h-[440px] items-center overflow-hidden bg-deep py-20 sm:min-h-[500px] sm:py-24">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: "linear-gradient(to right, var(--cf-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--cf-grid-line) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "linear-gradient(90deg, black, transparent 88%)" }} />
    <svg aria-hidden="true" viewBox="0 0 720 360" preserveAspectRatio="xMidYMid meet" className="edge-chart-draw pointer-events-none absolute -end-20 top-1/2 w-[min(68vw,900px)] -translate-y-1/2 text-brand-light opacity-30 sm:opacity-45">
      <path d="M0 274H720M0 204H720M0 134H720M0 64H720" stroke="currentColor" strokeOpacity=".14" />
      <path d="M20 255 95 226 150 240 218 186 278 202 334 164 405 182 472 119 529 141 594 88 694 58" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 300 95 277 150 286 218 248 278 257 334 227 405 240 472 198 529 209 594 174 694 147" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".38" />
      {[{x:52,y:239,h:28},{x:120,y:224,h:45},{x:186,y:196,h:27},{x:250,y:190,h:54},{x:320,y:165,h:36},{x:385,y:159,h:62},{x:454,y:130,h:32},{x:514,y:126,h:50},{x:582,y:94,h:43},{x:650,y:75,h:56}].map((c) => <g key={c.x} stroke="currentColor" strokeWidth="1.5"><path d={`M${c.x} ${c.y-10}v${c.h+20}`} /><rect x={c.x-7} y={c.y} width="14" height={c.h} rx="2" fill="currentColor" fillOpacity=".18" /></g>)}
    </svg>
    <Container className="relative">
      <div className="max-w-3xl">
        <p className="eyebrow text-white/75"><span className="chev" />{eyebrow}</p>
        <h1 className="text-h1 mt-6 max-w-3xl text-white">{title}</h1>
        <p className="text-lead mt-6 max-w-2xl text-white/75">{lead}</p>
        {children}
      </div>
    </Container>
  </section>;
}
