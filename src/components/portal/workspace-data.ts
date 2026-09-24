import "server-only";

import { cache } from "react";

import { getTraderWorkspace } from "@/db/portal-queries";

/**
 * The layout and the page both need the workspace on every navigation. React's
 * request-scoped cache collapses that into a single set of round trips.
 */
export const loadWorkspace = cache(getTraderWorkspace);
