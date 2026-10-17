# website — DS Shinde Gas Agency marketing site

Next.js (App Router) + Tailwind CSS website for DS Shinde Gas Agency, an authorized
Gaspoint LPG dealership.

## Run

```bash
cd website
npm install
npm run dev      # http://localhost:3001
npm run build    # production build
```

## Routes
- `/` — Home (hero, stats, about, products, who we serve, dealership opportunity, ROI calculator, support, godown/PESO, process, documents, USP, pricing, apply form)
- `/products` — Product catalog + deposit rates
- `/dealership` — Dealership opportunity + ROI calculator + process + documents + apply form
- `/contact` — Contact form, phones, map placeholder
- `not-found.tsx` — custom 404

## Notes
- All business/ROI figures are illustrative unless stated otherwise; numbers come from the
  provided dealership deck.
- SEO metadata and JSON-LD LocalBusiness schema are in `app/layout.tsx`.
