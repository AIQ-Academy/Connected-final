import { site, socials } from "@/lib/site";

/** Serialises structured data into the document without triggering CSP inline-eval rules. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is authored here, never derived from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${site.url}#organization`,
        name: site.name,
        url: site.url,
        description: site.description,
        email: site.email,
        telephone: site.phone,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}/brand/favicon.png`,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Dubai International Financial Centre",
          addressLocality: "Dubai",
          addressCountry: "AE",
        },
        sameAs: socials.map((social) => social.href),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: site.email,
            availableLanguage: ["English", "Arabic", "French"],
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: site.salesEmail,
            availableLanguage: ["English", "Arabic", "French"],
          },
        ],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site.url}#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": `${site.url}#organization` },
      }}
    />
  );
}
