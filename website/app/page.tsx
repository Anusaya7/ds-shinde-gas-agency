import Link from "next/link";
import Image from "next/image";
import TrustStats from "@/components/TrustStats";
import RoiCalculator from "@/components/RoiCalculator";
import ApplyForm from "@/components/ApplyForm";
import DocumentsAccordion from "@/components/DocumentsAccordion";
import { godownRows, processSteps } from "@/lib/data";

const products = [
  { size: "5 kg", use: "Domestic / Commercial", tone: "bg-gpred" },
  { size: "11 kg", use: "Domestic / Commercial", tone: "bg-gpnavy" },
  { size: "12 kg", use: "Domestic / Commercial", tone: "bg-gpgreen" },
  { size: "15 kg", use: "Domestic / Commercial", tone: "bg-gpred" },
  { size: "17 kg", use: "Domestic / Commercial", tone: "bg-gpnavy" },
  { size: "19.2 kg", use: "Domestic / Commercial", tone: "bg-gpgreen" },
  { size: "21 kg", use: "Domestic / Commercial", tone: "bg-gpred" },
  { size: "23 kg", use: "Domestic / Commercial", tone: "bg-gpnavy" },
  { size: "33 kg", use: "Domestic / Commercial", tone: "bg-gpgreen" },
  { size: "50 kg", use: "Domestic / Commercial", tone: "bg-gpred" },
];

const deposits = [
  ["15 kg", "₹1,600"],
  ["17 kg", "₹1,900"],
  ["21 kg / 19.2 kg", "₹2,100"],
  ["33 kg (VOT)", "₹3,850"],
  ["33 kg (LOT)", "₹4,850"],
];

const industries = [
  "Textile", "Automobile", "Glass & Ceramics", "Building & Cement", "Metal",
  "Food Processing", "Paper & Printing", "Mining", "Railway Construction",
  "Agriculture", "Leather", "Recycling",
];

const commercial = [
  "Hotels", "Restaurants", "Hospitals", "Tea Kiosks", "Mess",
  "Hostels", "School/College/Office Canteens",
];

const supportItems = [
  "Training on LPG & retail distribution + training manual",
  "Explosive Rules & Gas Cylinder Rules",
  "Safety maintenance",
  "Vehicle branding design",
  "Product detailer / pamphlets / brochure",
  "Marketing support for cylinder installation",
  "Media campaigns",
  "Trained staff for installation in allocated area",
];

const docsRequired = [
  "PESO application",
  "Attested 7/12 & 8D extract",
  "Ownership deed / notarized lease deed",
  "Land owner NOC",
  "Layout plan (100 m radius)",
  "LOI from bottling company",
  "Gram Panchayat NOC",
  "Scrutiny fee DD",
];

function SectionTitle({ kicker, title, light = false }: { kicker?: string; title: string; light?: boolean }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {kicker && (
        <p className="text-xs font-bold uppercase tracking-widest text-gpred">{kicker}</p>
      )}
      <h2 className={`mt-2 text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-poppins)] ${light ? "text-white" : "text-gpnavy"}`}>
        {title}
      </h2>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-gpnavy via-[#141a5e] to-gpred text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="inline-block rounded-full bg-gpgreen px-4 py-1.5 text-xs sm:text-sm font-semibold">
              Green Revolution Begins Here at Gaspoint
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-poppins)] leading-tight">
              GASPOINT — <span className="text-green-300">Essential Energy</span>, Endless Opportunity
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/85">
              India&apos;s Leading Private LPG Company. A brand of Gaspoint Petroleum India Limited,
              part of Confidence Group.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="#apply"
                className="rounded-full bg-white text-gpred px-6 py-3 font-semibold shadow-lg hover:bg-red-50 transition-colors"
              >
                Become a Gaspoint Dealer
              </Link>
              <Link
                href="/products"
                className="rounded-full border-2 border-white/70 px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/hero-cylinders.svg"
                alt="Red and green Gaspoint 21 kg and 19.2 kg LPG cylinders with a Gaspoint delivery truck"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST STATS ================= */}
      <TrustStats />

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="About Us" title="A 30-Year Legacy in India's Energy Sector" />
            <p className="mt-6 text-gray-700 leading-relaxed">
              Established in <strong>1993</strong> (Confidence Group in <strong>1997</strong>) under
              CMD <strong>Nitin Khara</strong>, the group carries a 30-year legacy in India&apos;s
              LPG &amp; CNG sector. Listed on <strong>BSE &amp; NSE</strong>, Gaspoint is
              synonymous with high-quality LPG meeting <strong>BIS standards</strong>.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Our verticals: Cylinder Manufacturing (in-house &amp; PSU), LPG Bottling, Auto LPG,
              CNG Cylinder Manufacturing &amp; Stations, Packed LPG Cylinders, and High Pressure
              Cylinder Manufacturing.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center">
            {[
              ["1993", "Established"],
              ["30 yrs", "Legacy"],
              ["BSE & NSE", "Listed"],
              ["BIS", "Standard LPG"],
            ].map(([big, small]) => (
              <div key={small} className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-gpred font-[family-name:var(--font-poppins)]">{big}</p>
                <p className="mt-1 text-sm text-gray-600">{small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section id="products" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Products" title="LPG Cylinders for Every Need" />
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <div
                key={p.size}
                className="rounded-2xl bg-white border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`mx-auto flex h-24 w-14 items-end justify-center rounded-b-full rounded-t-lg ${p.tone} relative`}>
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <span className="mb-3 text-xs font-bold text-white">{p.size}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-gpnavy">{p.size} Cylinder</p>
                <p className="text-xs text-gray-500">{p.use}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-gpnavy text-white p-6 sm:p-8">
            <h3 className="text-lg font-bold">Industrial Range</h3>
            <p className="mt-2 text-sm text-white/85">
              425 kg cylinder + customized LPG bank installations for industrial consumers.
            </p>
            <h3 className="mt-6 text-lg font-bold">Deposit Rates</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/70 uppercase text-xs tracking-wider">
                    <th className="py-2 pr-4">Cylinder</th>
                    <th className="py-2">Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {deposits.map(([cyl, dep]) => (
                    <tr key={cyl}>
                      <td className="py-2.5 pr-4">{cyl}</td>
                      <td className="py-2.5 font-semibold text-green-300">{dep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-white/60">
              Note: connection includes regulator &amp; hose pipe (optional).
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHO WE SERVE ================= */}
      <section id="who-we-serve" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Who We Serve" title="Powering Homes, Businesses & Industry" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gpred">🏭 Industrial</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {industries.map((i) => (
                  <li key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{i}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gpnavy">🍽️ Commercial</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {commercial.map((i) => (
                  <li key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{i}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gpgreen">🏠 Domestic</h3>
              <p className="mt-4 text-sm text-gray-700">
                Households — safe, reliable and BIS-standard LPG delivered to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEALERSHIP ================= */}
      <section id="dealership" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Dealership Opportunity" title="Become a Gaspoint Dealer" />
          <div className="mt-8 rounded-2xl bg-gpred text-white text-center px-6 py-6 shadow-lg">
            <p className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-poppins)]">
              No Security Deposit for Dealership Allotment
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Dealership Enrolment", "No security deposit required."],
              ["Initial Cylinder Investment", "₹2,10,000 for 100 cylinders of 21 kg (alternate 200-cylinder model: ₹4,20,000)."],
              ["Gross Margin", "₹14/kg."],
              ["Logistics", "Depends on location; transport in dealer's scope (own vehicle)."],
              ["Payment", "100% advance with validated Purchase Order."],
              ["Eligibility", "Proprietorship / Partnership / Company / LLP; local resident; valid address & ID proof; prior experience preferable (not mandatory)."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gpnavy">{title}</h3>
                <p className="mt-2 text-sm text-gray-700">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROI CALCULATOR ================= */}
      <section id="roi" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Investment & ROI" title="Estimate Your Dealership Returns" />
          <div className="mt-10">
            <RoiCalculator />
          </div>
        </div>
      </section>

      {/* ================= DEALER SUPPORT ================= */}
      <section id="support" className="bg-gpnavy py-16 sm:py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Dealer Support" title="We Stand With Our Dealers" light />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportItems.map((s) => (
              <div key={s} className="rounded-xl bg-white/5 border border-white/10 p-5 text-sm">
                <span className="mr-2 text-gpgreen font-bold">✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GODOWN & PESO ================= */}
      <section id="godown" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Godown & PESO Requirements" title="PESO-Licensed Godown is Mandatory" />
          <p className="mt-4 text-center text-sm text-gray-600 max-w-2xl mx-auto">
            A PESO-licensed godown is mandatory (owned land preferred). Use the LOI from the
            bottling company for your PESO application.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[640px] text-sm bg-white">
              <thead className="bg-gpnavy text-white">
                <tr>
                  <th className="px-4 py-3 text-left">LPG Qty</th>
                  <th className="px-4 py-3 text-left">Plot Size (m)</th>
                  <th className="px-4 py-3 text-left">Plot Area (sq.m)</th>
                  <th className="px-4 py-3 text-left">Safety Distance (m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {godownRows.map((r) => (
                  <tr key={r.qty} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{r.qty}</td>
                    <td className="px-4 py-3">{r.plotSize}</td>
                    <td className="px-4 py-3">{r.plotArea}</td>
                    <td className="px-4 py-3">{r.safetyDistance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-6">
            <h3 className="font-bold text-gpnavy">Documents Required</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-700">
              {docsRequired.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section id="process" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle kicker="Step-by-Step Process" title="Your Path to Dealership" />
          <ol className="mt-10 space-y-0">
            {processSteps.map((step, i) => (
              <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
                {i < processSteps.length - 1 && (
                  <span className="absolute left-[18px] top-10 h-full w-0.5 bg-gpred/30" aria-hidden />
                )}
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gpred text-white text-sm font-bold">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-gray-800">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= DOCUMENTS CHECKLIST ================= */}
      <section id="documents" className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle kicker="Documents Checklist" title="What You'll Need" />
          <div className="mt-10">
            <DocumentsAccordion />
          </div>
        </div>
      </section>

      {/* ================= USP BANNER ================= */}
      <section className="bg-gradient-to-r from-gpgreen to-gpnavy py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-200">
            Our USP · First time in India
          </p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            &ldquo;Pay only for Gas you Use&rdquo;
          </h2>
          <p className="mt-3 text-lg font-semibold text-green-200">GIN KAR LO, GIN KAR DO</p>
          <p className="mt-4 text-sm sm:text-base text-white/85 max-w-2xl mx-auto">
            The dealer weighs the cylinder at delivery and at empty pickup; the refund for leftover
            gas is transferred to the dealer&apos;s account as a CN (credit note).
          </p>
        </div>
      </section>

      {/* ================= PRICING NOTE ================= */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <SectionTitle kicker="Pricing" title="Transparent, District-Wise Pricing" />
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <ul className="space-y-3 text-sm text-gray-700 list-disc pl-5">
              <li>District-wise LPG prices open on the 1st of every month.</li>
              <li>Landing price varies by transport &amp; octroi tax.</li>
              <li>Dealer margin is calculated on the district&apos;s average LPG landing price.</li>
            </ul>
            <div className="mt-6 rounded-xl bg-gpnavy/5 border border-gpnavy/20 p-5">
              <p className="text-sm font-semibold text-gpnavy">Example — Lucknow, Jan-2025</p>
              <p className="mt-1 text-sm text-gray-700">
                19 kg PSU cylinder <strong>₹1,643.50</strong> = <strong>₹86.5/kg</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= APPLY / CONTACT ================= */}
      <section id="apply" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <SectionTitle kicker="Apply Now" title="Dealership Enquiry Form" />
          <div className="mt-10">
            <ApplyForm />
          </div>
          <div id="map" className="mt-8 rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <iframe
              title="DS Shinde Gas Agency location map"
              src="https://www.google.com/maps?q=India&output=embed"
              width="100%"
              height="280"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
