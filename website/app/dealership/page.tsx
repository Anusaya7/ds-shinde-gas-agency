import type { Metadata } from "next";
import Link from "next/link";
import RoiCalculator from "@/components/RoiCalculator";
import DocumentsAccordion from "@/components/DocumentsAccordion";
import ApplyForm from "@/components/ApplyForm";
import { godownRows, processSteps } from "@/lib/data";

export const metadata: Metadata = {
  title: "Dealership Opportunity – Investment, ROI & Requirements",
  description:
    "Become a Gaspoint LPG dealer: no security deposit, ₹2,10,000 initial cylinder investment for 100 cylinders of 21 kg, ₹14/kg gross margin, with PESO godown guidance and full dealer support.",
};

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

export default function DealershipPage() {
  return (
    <>
      <section className="bg-gpred text-white py-14">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            Dealership Opportunity
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-bold">
            No Security Deposit for Dealership Allotment
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Dealership Enrolment", "No security deposit required."],
            ["Initial Cylinder Investment", "₹2,10,000 for 100 cylinders of 21 kg (alternate 200-cylinder model: ₹4,20,000)."],
            ["Gross Margin", "₹14/kg."],
            ["Logistics", "Depends on location; transport in dealer's scope (own vehicle)."],
            ["Payment", "100% advance with validated Purchase Order."],
            ["Eligibility", "Proprietorship / Partnership / Company / LLP; local resident; valid address & ID proof; prior experience preferable (not mandatory)."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-gpnavy">{title}</h2>
              <p className="mt-2 text-sm text-gray-700">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roi" className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gpnavy">
            Investment & ROI Calculator
          </h2>
          <div className="mt-8">
            <RoiCalculator />
          </div>
        </div>
      </section>

      <section id="support" className="bg-gpnavy py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-extrabold">Dealer Support</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportItems.map((s) => (
              <div key={s} className="rounded-xl bg-white/5 border border-white/10 p-5 text-sm">
                <span className="mr-2 text-gpgreen font-bold">✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="godown" className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gpnavy">
            Godown & PESO Requirements
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600 max-w-2xl mx-auto">
            A PESO-licensed godown is mandatory (owned land preferred).
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

      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gpnavy">
            Step-by-Step Process
          </h2>
          <ol className="mt-10">
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

      <section id="documents" className="py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gpnavy">
            Documents Checklist
          </h2>
          <div className="mt-8">
            <DocumentsAccordion />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-gpgreen to-gpnavy py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-200">
            Our USP · First time in India
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold">
            &ldquo;Pay only for Gas you Use&rdquo; — GIN KAR LO, GIN KAR DO
          </h2>
          <p className="mt-3 text-sm text-white/85">
            The dealer weighs the cylinder at delivery and empty pickup; refund for leftover gas is
            transferred to the dealer&apos;s account as a CN.
          </p>
        </div>
      </section>

      <section id="apply" className="py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gpnavy">
            Apply for Dealership
          </h2>
          <div className="mt-8">
            <ApplyForm />
          </div>
        </div>
      </section>

      <div className="pb-10 text-center">
        <Link href="/products" className="text-gpred font-semibold hover:underline">
          View our products →
        </Link>
      </div>
    </>
  );
}
