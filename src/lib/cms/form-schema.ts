import type { CmsKey } from "@/lib/cms/schemas";

/**
 * Editing descriptors for the admin content forms.
 *
 * These mirror the Zod document schemas one-for-one and exist because a form
 * needs things a validator does not have an opinion about: field order,
 * labels, which strings deserve a textarea, and how to add a row to a list.
 * Zod stays the authority on what is *valid* — this only decides what the
 * editor looks like. Adding a field to a schema means adding it here too, or
 * it stays reachable only through the Advanced JSON tab.
 */

export type FormField =
  /** Single-line string. */
  | { kind: "text"; path: string; label: string; help?: string }
  /** Multi-line string. */
  | { kind: "textarea"; path: string; label: string; help?: string }
  /** `string[]`, edited as one entry per line. */
  | { kind: "lines"; path: string; label: string; help?: string }
  /** `{ href, label }`. */
  | { kind: "link"; path: string; label: string; help?: string }
  /** Array of flat objects. */
  | {
      kind: "list";
      path: string;
      label: string;
      help?: string;
      addLabel: string;
      itemFields: { key: string; label: string; kind: "text" | "textarea" }[];
    };

export type FormSection = {
  id: string;
  label: string;
  description?: string;
  fields: FormField[];
};

const metaSection = (id: string, description: string): FormSection => ({
  id,
  label: "Page metadata",
  description,
  fields: [
    { kind: "text", path: "meta.title", label: "Browser / SEO title" },
    {
      kind: "textarea",
      path: "meta.description",
      label: "Meta description",
      help: "Shown in search results and link previews. Aim for 150–160 characters.",
    },
  ],
});

const statList = (path: string, label: string): FormField => ({
  kind: "list",
  path,
  label,
  addLabel: "Add stat",
  itemFields: [
    { key: "value", label: "Value", kind: "text" },
    { key: "label", label: "Caption", kind: "text" },
  ],
});

const pointList = (path: string): FormField => ({
  kind: "list",
  path,
  label: "Feature points",
  addLabel: "Add point",
  itemFields: [
    { key: "label", label: "Headline", kind: "text" },
    { key: "detail", label: "Detail", kind: "textarea" },
  ],
});

const headingFields = (path: string): FormField[] => [
  { kind: "text", path: `${path}.eyebrow`, label: "Eyebrow" },
  { kind: "text", path: `${path}.title`, label: "Title" },
  { kind: "textarea", path: `${path}.lead`, label: "Lead paragraph" },
  { kind: "text", path: `${path}.actionHref`, label: "Action link" },
  {
    kind: "text",
    path: `${path}.actionLabel`,
    label: "Action label",
    help: "Use {count} to insert the number of live tiers.",
  },
];

const homeProductFields = (path: string): FormField[] => [
  { kind: "text", path: `${path}.eyebrow`, label: "Eyebrow" },
  { kind: "text", path: `${path}.kicker`, label: "Kicker" },
  { kind: "text", path: `${path}.title`, label: "Title" },
  { kind: "textarea", path: `${path}.lead`, label: "Lead paragraph" },
  pointList(`${path}.points`),
  statList(`${path}.stats`, "Stat strip"),
  { kind: "link", path: `${path}.primary`, label: "Primary button" },
  { kind: "link", path: `${path}.secondary`, label: "Secondary button" },
  { kind: "link", path: `${path}.tertiary`, label: "Tertiary button" },
];

const homeSections: FormSection[] = [
  metaSection("meta", "Applies to the homepage as a whole."),
  {
    id: "hero",
    label: "Hero",
    description: "The opening statement above the fold.",
    fields: [
      { kind: "text", path: "hero.eyebrow", label: "Eyebrow" },
      {
        kind: "lines",
        path: "hero.title",
        label: "Headline",
        help: "One line per row — the headline breaks exactly where you break it.",
      },
      { kind: "textarea", path: "hero.lead", label: "Lead paragraph" },
      statList("hero.stats", "Stat strip"),
      { kind: "link", path: "hero.primary", label: "Primary button" },
      { kind: "link", path: "hero.secondary", label: "Secondary button" },
      { kind: "link", path: "hero.tertiary", label: "Tertiary button" },
    ],
  },
  {
    id: "trading",
    label: "Live trading band",
    description: "The /#trading section.",
    fields: homeProductFields("trading"),
  },
  {
    id: "funded",
    label: "Funded evaluations band",
    description: "The /#funded section.",
    fields: homeProductFields("funded"),
  },
  {
    id: "about",
    label: "About band",
    description: "The /#about section.",
    fields: [
      { kind: "text", path: "about.eyebrow", label: "Eyebrow" },
      { kind: "text", path: "about.title", label: "Title" },
      { kind: "textarea", path: "about.lead", label: "Lead paragraph" },
      { kind: "textarea", path: "about.quote", label: "Pull quote" },
      { kind: "text", path: "about.mission.eyebrow", label: "Mission eyebrow" },
      { kind: "textarea", path: "about.mission.body", label: "Mission" },
      { kind: "text", path: "about.vision.eyebrow", label: "Vision eyebrow" },
      { kind: "textarea", path: "about.vision.body", label: "Vision" },
      {
        kind: "text",
        path: "about.disclaimer.title",
        label: "Disclaimer heading",
      },
      {
        kind: "textarea",
        path: "about.disclaimer.risk",
        label: "Disclaimer — risk",
      },
      {
        kind: "textarea",
        path: "about.disclaimer.advice",
        label: "Disclaimer — advice",
      },
      {
        kind: "textarea",
        path: "about.disclaimer.availability",
        label: "Disclaimer — availability",
      },
      statList("about.stats", "Company stats"),
      { kind: "link", path: "about.primary", label: "Primary button" },
      { kind: "link", path: "about.secondary", label: "Secondary button" },
    ],
  },
  {
    id: "contact",
    label: "Contact band",
    description: "The /#contact section.",
    fields: [
      { kind: "text", path: "contact.eyebrow", label: "Eyebrow" },
      { kind: "text", path: "contact.title", label: "Title" },
      { kind: "textarea", path: "contact.lead", label: "Lead paragraph" },
      {
        kind: "list",
        path: "contact.stats",
        label: "Desk facts",
        addLabel: "Add fact",
        itemFields: [
          { key: "term", label: "Term", kind: "text" },
          { key: "detail", label: "Detail", kind: "text" },
        ],
      },
      { kind: "link", path: "contact.primary", label: "Primary button" },
    ],
  },
];

function productSections(key: "funded" | "trading"): FormSection[] {
  const accountTypesLabel =
    key === "funded" ? "Account tiers section" : "Account types section";

  return [
    metaSection("meta", `Applies to the /${key} page.`),
    {
      id: "accountTypes",
      label: accountTypesLabel,
      fields: headingFields("accountTypes"),
    },
    {
      id: "howItWorks",
      label: "How it works section",
      fields: headingFields("howItWorks"),
    },
    {
      id: "why",
      label: "Why Connect Funded section",
      fields: headingFields("why"),
    },
    {
      id: "testimonials",
      label: "Testimonials section",
      fields: [
        { kind: "text", path: "testimonials.eyebrow", label: "Eyebrow" },
        { kind: "text", path: "testimonials.title", label: "Title" },
        {
          kind: "textarea",
          path: "testimonials.lead",
          label: "Lead paragraph",
        },
      ],
    },
    {
      id: "cta",
      label: "Closing call to action",
      fields: [
        { kind: "text", path: "cta.title", label: "Title" },
        { kind: "textarea", path: "cta.lead", label: "Lead paragraph" },
        { kind: "link", path: "cta.primary", label: "Primary button" },
        { kind: "link", path: "cta.secondary", label: "Secondary button" },
      ],
    },
  ];
}

export const cmsFormSections: Record<CmsKey, FormSection[]> = {
  home: homeSections,
  funded: productSections("funded"),
  trading: productSections("trading"),
};
