import { NextResponse } from "next/server";

import { cmsSearchEntries } from "@/lib/cms/discovery";

/**
 * CMS-driven entries for the header command palette.
 *
 * The palette ships with a static index compiled into the bundle; this adds
 * the pages whose copy an editor controls. It is deliberately a separate,
 * lazily fetched request — search must keep working from the static index if
 * this call fails.
 */
export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json({ entries: await cmsSearchEntries() });
  } catch (error) {
    console.error("[api/search/cms] failed", error);
    return NextResponse.json({ entries: [] });
  }
}
