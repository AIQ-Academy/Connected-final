import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { signupUrl } from "@/lib/site";

import "./marketing.css";

const destinations = [
  { href: "/trading", label: "Trading overview" },
  { href: "/payments", label: "Payments" },
  { href: "/markets", label: "Market terminal" },
  { href: signupUrl, label: "Create account" },
  { href: "/faq", label: "Funding FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <main className="bg-noise relative grid min-h-dvh place-items-center overflow-hidden py-20">
      <Aurora intensity="medium" />
      <GridBackdrop />

      <Container className="relative text-center">
        <Link href="/" aria-label="Connect Funded home" className="inline-block">
          <Logo />
        </Link>

        <p className="eyebrow mt-10 justify-center">
          <span className="chev" />
          Error 404
        </p>

        <h1 className="text-h1 mx-auto mt-4 max-w-2xl">
          That page closed out of the market.
        </h1>

        <p className="text-lead text-muted mx-auto mt-5 max-w-xl">
          The address you followed does not exist, or it moved when the site was
          rebuilt. Everything below is still exactly where you expect it.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            Back to the home page
          </ButtonLink>
          <ButtonLink href="/markets" variant="soft" size="lg">
            Open the market terminal
          </ButtonLink>
        </div>

        <nav
          aria-label="Popular destinations"
          className="border-line-soft mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-2 border-t pt-8"
        >
          {destinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-line text-muted hover:text-ink hover:border-brand-light/60 rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </main>
  );
}
