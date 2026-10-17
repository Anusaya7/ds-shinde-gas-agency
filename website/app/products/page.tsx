import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ApplyForm from "@/components/ApplyForm";

export const metadata: Metadata = {
  title: "Products – LPG Cylinders & Deposit Rates",
  description:
    "Gaspoint LPG cylinders: 5–50 kg domestic/commercial range, 425 kg industrial cylinders and customized LPG banks, with deposit rates.",
};

const domestic = ["5 kg", "11 kg", "12 kg", "15 kg", "17 kg", "19.2 kg", "21 kg", "23 kg", "33 kg", "50 kg"];
const deposits = [
  ["15 kg", "₹1,600"],
  ["17 kg", "₹1,900"],
  ["21 kg / 19.2 kg", "₹2,100"],
  ["33 kg (VOT)", "₹3,850"],
  ["33 kg (LOT)", "₹4,850"],
];

export default function ProductsPage() {
  return (
    <>
      <section className="bg-gpnavy text-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            Gaspoint LPG Products
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            BIS-standard LPG cylinders for domestic, commercial and industrial use — from 5 kg to
            425 kg and customized LPG banks.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-gpnavy">Domestic / Commercial Range</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {domestic.map((size, i) => (
              <div key={size} className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className={`mx-auto flex h-24 w-14 items-end justify-center rounded-b-full rounded-t-lg ${i % 3 === 0 ? "bg-gpred" : i % 3 === 1 ? "bg-gpnavy" : "bg-gpgreen"} relative`}>
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <span className="mb-3 text-xs font-bold text-white">{size}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-gpnavy">{size} Cylinder</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gpnavy">Industrial Range</h2>
              <p className="mt-3 text-gray-700">
                425 kg cylinder plus customized LPG bank installations engineered for your plant&apos;s
                consumption profile.
              </p>
              <div className="mt-6 relative aspect-video rounded-2xl overflow-hidden border border-gray-200">
                <Image
                  src="/industrial-bank.svg"
                  alt="Gaspoint 425 kg industrial LPG cylinder bank installation"
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="rounded-2xl bg-gpnavy text-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Deposit Rates</h3>
              <div className="mt-4 overflow-x-auto">
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

          <div className="mt-12 text-center">
            <Link
              href="/dealership"
              className="inline-block rounded-full bg-gpred px-8 py-3 font-semibold text-white shadow hover:bg-red-700"
            >
              Become a Gaspoint Dealer
            </Link>
          </div>
        </div>
      </section>

      <section id="apply" className="bg-gray-50 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-gpnavy">Need a Connection? Enquire</h2>
          <div className="mt-8">
            <ApplyForm />
          </div>
        </div>
      </section>
    </>
  );
}
