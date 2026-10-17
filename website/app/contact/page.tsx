import type { Metadata } from "next";
import ApplyForm from "@/components/ApplyForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact DS Shinde Gas Agency — authorized Gaspoint LPG dealer. Call 7030970436 / 7030514530 / 9112260266 or send an enquiry.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-gpnavy text-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            Contact DS Shinde Gas Agency
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <a href="tel:7030970436" className="hover:text-gpred">📞 7030970436</a>
            <a href="tel:7030514530" className="hover:text-gpred">📞 7030514530</a>
            <a href="tel:9112260266" className="hover:text-gpred">📞 9112260266</a>
            <a href="https://www.gaspoint.in" className="hover:text-gpred">🌐 www.gaspoint.in</a>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-extrabold text-gpnavy">Send us an Enquiry</h2>
          <div className="mt-6">
            <ApplyForm />
          </div>
          <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200">
            <iframe
              title="DS Shinde Gas Agency location map"
              src="https://www.google.com/maps?q=India&output=embed"
              width="100%"
              height="320"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
