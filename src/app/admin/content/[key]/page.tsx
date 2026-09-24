import { getCmsDocument } from "@/db/queries";
import { saveCmsDocument } from "@/app/admin/content/actions";
import { ContentEditor } from "@/app/admin/content/[key]/content-editor";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { getCmsDefaults } from "@/lib/cms/defaults";
import { mergeContent } from "@/lib/cms/get-content";
import { CMS_KEY_LABELS, CMS_KEY_ROUTES, isCmsKey } from "@/lib/cms/schemas";

export const dynamic = "force-dynamic";

export default async function AdminCmsKeyPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  if (!isCmsKey(key)) {
    return (
      <Section size="default">
        <Container>
          <p className="text-muted">Unknown CMS key.</p>
        </Container>
      </Section>
    );
  }

  const defaults = getCmsDefaults(key);
  const stored = await getCmsDocument(key);

  // Seed the form from the merged document rather than the raw row: an editor
  // should see every field the page renders, including the ones still coming
  // from the defaults, not an empty form for a partially saved document.
  const document = stored === null ? defaults : mergeContent(key, stored);

  return (
    <Section className="bg-bg" size="default">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-h2">{CMS_KEY_LABELS[key]} content</h1>
              <p className="text-muted mt-3 max-w-2xl leading-relaxed">
                Edit the copy for{" "}
                <code className="font-mono text-[0.8125rem]">
                  {CMS_KEY_ROUTES[key]}
                </code>
                . Everything is validated on save and the live page is
                revalidated immediately. Fields left untouched fall back to the
                copy shipped in the codebase, so a broken document can never
                take the page down.
              </p>
            </div>
            <div className="flex gap-2">
              <ButtonLink
                href={CMS_KEY_ROUTES[key]}
                variant="outline"
                target="_blank"
              >
                Open page
              </ButtonLink>
              <ButtonLink href="/admin/content" variant="ghost">
                Back
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          <ContentEditor
            cmsKey={key}
            document={document as Record<string, unknown>}
            defaults={defaults as Record<string, unknown>}
            save={saveCmsDocument}
          />
        </div>
      </Container>
    </Section>
  );
}
