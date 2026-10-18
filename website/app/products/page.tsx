import type { Metadata } from "next";
import Link from "next/link";
import ApplyForm from "@/components/ApplyForm";

export const metadata: Metadata = {
  title: "Products – LPG Cylinder Sizes & Pricing",
  description:
    "DS Gas Agency LPG cylinders: 5 kg domestic mini, 13 kg & 19.2 kg domestic, 15 kg & 33 kg commercial, 50 kg and 425 kg industrial — with best-for guidance and booking.",
};

const cylinders = [
  {
    size: "5 KG",
    tag: "DOMESTIC",
    tone: "bg-gpred",
    name: "5 KG Domestic Mini",
    body: "Compact & lightweight portable cylinder ideal for bachelors, small households, students, and outdoor camping.",
    best: "Small homes, bachelors, camping",
  },
  {
    size: "13 KG",
    tag: "DOMESTIC",
    tone: "bg-gpnavy",
    name: "13 KG Domestic LPG",
    body: "Standard domestic cylinder perfect for regular household cooking with extended refill intervals.",
    best: "Medium families, daily cooking",
  },
  {
    size: "15 KG",
    tag: "COMMERCIAL",
    tone: "bg-gpgreen",
    name: "15 KG Commercial",
    body: "Mid-size commercial cylinder designed for restaurants, catering services, and small food businesses.",
    best: "Small restaurants, catering",
  },
  {
    size: "19.2 KG",
    tag: "DOMESTIC",
    tone: "bg-gpred",
    name: "19.2 KG Large Domestic",
    body: "High-capacity domestic cylinder for large families and extended usage with fewer refills needed.",
    best: "Large families, heavy usage",
  },
  {
    size: "33 KG",
    tag: "COMMERCIAL",
    tone: "bg-gpnavy",
    name: "33 KG Commercial LPG",
    body: "Standard commercial blue cylinder specifically engineered for restaurants, hotels, and heavy kitchen use.",
    best: "Restaurants, hotels, canteens",
  },
  {
    size: "50 KG",
    tag: "COMMERCIAL",
    tone: "bg-gpgreen",
    name: "50 KG Heavy Duty Industrial",
    body: "Heavy-duty industrial manifold cylinder for large-scale food processing, hotels, and manufacturing.",
    best: "Factories, large hotels, industrial",
  },
  {
    size: "425 KG",
    tag: "INDUSTRIAL",
    tone: "bg-gpred",
    name: "425 KG Industrial Vessel",
    body: "Bulk LPG storage vessel for industrial plants, large manufacturing, and centralized gas distribution.",
    best: "Industrial plants, bulk supply",
  },
];

export default function ProductsPage() {
  return (
    <>
      <section className="bg-gpnavy text-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300">Cylinder Catalog</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            Explore Our LPG Cylinder Sizes
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            Choose a cylinder capacity that matches your requirements — domestic, commercial or
            industrial. Prices and availability are confirmed with your booking.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cylinders.map((c) => (
            <div key={c.size} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white ${c.tone}`}>
                  {c.tag}
                </span>
                <span className="rounded-full bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">
                  In Stock
                </span>
              </div>
              <div className="mt-4 flex items-end gap-4">
                <div className={`flex h-28 w-16 items-end justify-center rounded-b-full rounded-t-lg ${c.tone} relative shrink-0`}>
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-gray-300" />
                  <span className="mb-3 text-sm font-bold text-white">{c.size}</span>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-gpnavy font-[family-name:var(--font-poppins)]">{c.size}</p>
                  <p className="text-sm font-semibold text-gray-700">{c.name}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 flex-1">{c.body}</p>
              <p className="mt-3 text-xs text-gray-500">
                <span className="font-semibold text-gpnavy">Best for:</span> {c.best}
              </p>
              <Link
                href="/#booking"
                className="mt-4 inline-block rounded-full bg-gpred px-5 py-2 text-center text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
              >
                Book This Cylinder
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-4xl px-4 mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">
            Questions about cylinder prices or delivery in your area? Call{" "}
            <a href="tel:+919511760208" className="font-bold text-gpred">+91 95117 60208</a> —
            available 8:00 AM to 8:00 PM, Monday to Saturday.
          </p>
        </div>
      </section>

      <section id="apply" className="bg-gray-50 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-gpnavy">Need Help Choosing? Enquire</h2>
          <div className="mt-8">
            <ApplyForm />
          </div>
        </div>
      </section>
    </>
  );
}
