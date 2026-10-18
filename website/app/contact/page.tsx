import type { Metadata } from "next";
import ApplyForm from "@/components/ApplyForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact DS Gas Agency — call +91 95117 60208 / +91 99753 00929 or send an enquiry. Helpline active 8:00 AM – 8:00 PM, Monday to Saturday.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-gpnavy text-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            Contact DS Gas Agency
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl">
            We&apos;re here to help — questions about your cylinder, delivery area or booking? Reach
            us during business hours: <strong>8:00 AM – 8:00 PM (Monday to Saturday)</strong>.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <a href="tel:+919511760208" className="hover:text-gpred">📞 +91 95117 60208</a>
            <a href="tel:+919975300929" className="hover:text-gpred">📞 +91 99753 00929</a>
            <a href="mailto:support@dsshindegas.com" className="hover:text-gpred">✉️ support@dsshindegas.com</a>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-white/80">
            <p>📍 Shop No. 4, Main Road, Near Market Yard, Maharashtra, India</p>
            <p>🚨 Gas leak emergency? Move to a safe place and call <strong>1906</strong>.</p>
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
              title="DS Gas Agency location map"
              src="https://www.google.com/maps?q=Maharashtra,India&output=embed"
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
