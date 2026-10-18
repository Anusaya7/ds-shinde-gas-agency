# DS Gas Agency Website

Marketing website for **DS Gas Agency** (DS Shinde Gas) — a trusted local LPG delivery
partner, **established in 2026** by **Sagar Shinde**.

## Routes
- `/` — Home (hero, stats, about, products, services, how to order, safety, booking + enquiry form)
- `/products` — LPG cylinder catalog (5 kg – 425 kg) with best-for guidance
- `/contact` — Contact form, phones, map

## Notes
- Colors: `gpred #D32F2F`, `gpnavy #1A237E`, `gpgreen #2E7D32` (see `tailwind.config.ts`).
- SEO metadata and JSON-LD LocalBusiness schema are in `app/layout.tsx`.
- Enquiry form posts to `/api/enquiry`.
