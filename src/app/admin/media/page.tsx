import { hasDatabase } from "@/db";
import { getMediaSlots } from "@/db/queries";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { imageSlots } from "@/lib/cms/image-slots";
import { resetMediaSlot, updateMediaAlt } from "@/app/admin/media/actions";
import { MediaGrid, type SlotState } from "@/app/admin/media/media-grid";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const uploaded = await getMediaSlots();

  // Only registered slots are shown. A row for a slot that no longer exists in
  // the registry is dead data, and surfacing it would invite someone to
  // re-upload an image nothing renders.
  const assets: SlotState[] = imageSlots.flatMap((slot) => {
    const asset = uploaded.get(slot.key);
    return asset
      ? [
          {
            slot: asset.slot,
            blobUrl: asset.blobUrl,
            alt: asset.alt,
            width: asset.width,
            height: asset.height,
            blurDataUrl: asset.blurDataUrl,
          },
        ]
      : [];
  });

  return (
    <Section className="bg-bg" size="default">
      <Container>
        <Reveal>
          <h1 className="text-h2">Media library</h1>
          <p className="text-muted mt-3 max-w-2xl leading-relaxed">
            Every replaceable image on the marketing site. Each slot is locked
            to the aspect ratio the layout expects — crop to it here and the
            upload is resized, converted to WebP and given a blur placeholder
            automatically. Slots with no upload fall back to the shipped
            photography.
          </p>
          {!hasDatabase() && (
            <p className="text-amber mt-4 text-sm">
              No database connection — uploads are disabled and every slot is
              showing its default image.
            </p>
          )}
        </Reveal>

        <div className="mt-10">
          <MediaGrid
            assets={assets}
            updateAlt={updateMediaAlt}
            resetSlot={resetMediaSlot}
          />
        </div>
      </Container>
    </Section>
  );
}
