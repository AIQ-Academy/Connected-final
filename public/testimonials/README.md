# Testimonial portraits

Drop generated headshots here, then point each entry in
`src/lib/images.ts` → `testimonialPortraits` at the local file.

| File | Trader |
|------|--------|
| `marwan-haddad.webp` | Marwan Haddad · UAE |
| `renee-fontaine.webp` | Renée Fontaine · France |
| `amara-osei.webp` | Amara Osei · Ghana |
| `lukas-novak.webp` | Lukas Novak · Czechia |
| `priya-raghunathan.webp` | Priya Raghunathan · Singapore |
| `diego-ferreira.webp` | Diego Ferreira · Brazil |

Recommended: square crop, at least 400×400, WebP or JPG.

After adding a file, change the matching `src` from the Unsplash URL to
`/testimonials/{slug}.webp`.
