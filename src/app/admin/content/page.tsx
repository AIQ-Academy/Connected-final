import Link from "next/link";

import { updateSiteSettings } from "@/app/admin/content/actions";
import { getSiteSettings } from "@/db/queries";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { CMS_KEYS, CMS_KEY_LABELS, CMS_KEY_ROUTES } from "@/lib/cms/schemas";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const flags = await getSiteSettings();

  return (
    <Section className="bg-bg" size="default">
      <Container>
        <Reveal>
          <h1 className="text-h2">Content desk</h1>
          <p className="text-muted mt-3 max-w-2xl leading-relaxed">
            Control which product surfaces are enabled and edit the copy behind
            the homepage, funded evaluations and live trading pages.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <Reveal delay={0.06}>
            <div className="border-line-soft rounded-2xl border bg-panel p-5">
              <h2 className="font-display text-lg font-semibold">Product on/off</h2>
              <p className="text-faint mt-2 text-sm">
                When a product is disabled, its CTAs redirect to the matching
                “coming soon” page.
              </p>

              <form className="mt-6 grid gap-4" action={updateSiteSettings}>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>Funded trading</span>
                  <select
                    name="fundedEnabled"
                    defaultValue={flags.fundedEnabled ? "true" : "false"}
                    className="border-line-soft rounded-lg border bg-sunken/60 px-3 py-2 text-sm"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>

                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>Broker accounts</span>
                  <select
                    name="brokerEnabled"
                    defaultValue={flags.brokerEnabled ? "true" : "false"}
                    className="border-line-soft rounded-lg border bg-sunken/60 px-3 py-2 text-sm"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" size="lg" className="sm:w-auto">
                    Save toggles
                  </Button>
                  <ButtonLink
                    href="/admin"
                    size="lg"
                    variant="outline"
                    className="sm:w-auto"
                  >
                    Back to overview
                  </ButtonLink>
                </div>
              </form>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-line-soft rounded-2xl border bg-panel p-5">
              <h2 className="font-display text-lg font-semibold">CMS documents</h2>
              <p className="text-faint mt-2 text-sm">
                Structured editors with a live preview of the page each
                document drives.
              </p>

              <div className="mt-5 grid gap-3">
                {CMS_KEYS.map((key) => (
                  <Link
                    key={key}
                    className="text-ink hover:underline"
                    href={`/admin/content/${key}`}
                  >
                    Edit {CMS_KEY_LABELS[key].toLowerCase()} ({CMS_KEY_ROUTES[key]})
                  </Link>
                ))}
                <Link className="text-ink hover:underline" href="/admin/media">
                  Manage site imagery
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

