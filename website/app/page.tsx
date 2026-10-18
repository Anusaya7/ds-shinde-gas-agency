import Link from "next/link";
import TrustStats from "@/components/TrustStats";
import ApplyForm from "@/components/ApplyForm";
import { processSteps } from "@/lib/data";

const products = [
  { size: "5 kg", use: "Domestic Mini — bachelors, small homes, camping", tone: "bg-gpred" },
  { size: "13 kg", use: "Domestic — regular household cooking", tone: "bg-gpnavy" },
  { size: "15 kg", use: "Commercial — restaurants & catering", tone: "bg-gpgreen" },
  { size: "19.2 kg", use: "Large Domestic — big families", tone: "bg-gpred" },
  { size: "33 kg", use: "Commercial — hotels & canteens", tone: "bg-gpnavy" },
  { size: "50 kg", use: "Industrial — large kitchens & units", tone: "bg-gpgreen" },
  { size: "425 kg", use: "Industrial Vessel — bulk supply", tone: "bg-gpred" },
];

const services = [
  { icon: "🏠", title: "Domestic LPG", body: "Safe and reliable LPG cylinders for households, delivered right to your doorstep." },
  { icon: "🍽️", title: "Commercial LPG", body: "Mid and heavy-duty cylinders for restaurants, hotels, canteens and catering businesses." },
  { icon: "🏭", title: "Industrial LPG", body: "Manifold cylinders and bulk vessels for factories and large-scale manufacturing." },
  { icon: "🚚", title: "Doorstep Delivery", body: "Quick local delivery with clear order updates and careful handling at every step." },
  { icon: "✅", title: "Safety First", body: "Every cylinder is safety checked before dispatch and reviewed with you at handover." },
  { icon: "📞", title: "Local Support", body: "Our team is available during business hours for bookings, refills and questions." },
];

const whyUs = [
  ["Established 2026", "A fresh, trusted local gas agency serving our community."],
  ["Booking to doorstep", "Book from your phone in a few easy steps and track your order."],
  ["Safety checked", "Carefully handled cylinders with safety checks at delivery."],
  ["Local support", "Direct help from the DS Gas Agency team — no long waits."],
];

function SectionTitle({ kicker, title, light = false }: { kicker?: string; title: string; light?: boolean }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      {kicker && (
        <p className={`text-xs font-bold uppercase tracking-widest ${light ? "text-green-300" : "text-gpred"}`}>{kicker}</p>
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
              LPG, Delivered with Care
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-poppins)] leading-tight">
              DS Gas Agency — <span className="text-green-300">Reliable LPG</span>, Delivered with Care
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/85">
              A trusted local LPG delivery partner. Cooking at home? We&apos;ll bring the gas.
              Book a cylinder in a few easy steps and follow your booking to your doorstep.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/#booking"
                className="rounded-full bg-white text-gpred px-6 py-3 font-semibold shadow-lg hover:bg-red-50 transition-colors"
              >
                Book Your Cylinder
              </Link>
              <Link
                href="/products"
                className="rounded-full border-2 border-white/70 px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
              >
                View Products
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["🔥", "Safety checked", "Every cylinder is inspected before delivery."],
              ["🚪", "At your doorstep", "Fast local delivery to homes & businesses."],
              ["📲", "Booking updates", "Track your order from booking to handover."],
              ["🤝", "Local support", "Real help from our team during business hours."],
            ].map(([icon, title, body]) => (
              <div key={title} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-5">
                <span className="text-2xl">{icon}</span>
                <p className="mt-2 font-bold">{title}</p>
                <p className="mt-1 text-sm text-white/75">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST STATS ================= */}
      <TrustStats />

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="About Us" title="Serving Our Community with Safe LPG" />
            <p className="mt-6 text-gray-700 leading-relaxed">
              <strong>DS Gas Agency</strong> was established in <strong>2026</strong> by
              <strong> Sagar Shinde</strong> with a simple mission — provide safe, reliable and
              affordable LPG cylinder delivery to households and businesses in our area.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              From small 5 kg domestic cylinders to large 425 kg industrial vessels, we deliver
              with proper safety checks, clear booking updates and genuine local support. Every
              cylinder is carefully handled and reviewed with you at handover.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Need help with a booking, refill or delivery area question? Our helpline is active
              from <strong>8:00 AM to 8:00 PM, Monday to Saturday</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center">
            {[
              ["2026", "Established"],
              ["7+", "Cylinder Sizes"],
              ["8AM–8PM", "Delivery Hours"],
              ["1906", "Emergency No."],
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
          <SectionTitle kicker="Cylinder Catalog" title="Explore Our LPG Cylinder Sizes" />
          <p className="mt-3 text-center text-sm text-gray-600 max-w-2xl mx-auto">
            Choose a cylinder capacity that matches your requirements — domestic, commercial or industrial.
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <span className="mt-2 inline-block rounded-full bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">
                  In Stock
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-gpnavy text-white p-6 sm:p-8 text-center">
            <h3 className="text-lg font-bold">Need the full list with details &amp; pricing?</h3>
            <p className="mt-2 text-sm text-white/85">View all cylinder sizes and find the one that fits your needs.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-gpred px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              View All Cylinder Details
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WHY US / SERVICES ================= */}
      <section id="why-us" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle kicker="Why DS Gas Agency" title="Safety You Can Trust" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl">{s.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gpnavy">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-gpred/20 bg-gpred/5 p-5">
                <p className="font-bold text-gpred">{title}</p>
                <p className="mt-1 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW TO ORDER ================= */}
      <section id="how" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle kicker="Simple, Step by Step" title="From Booking to Doorstep" />
          <p className="mt-4 text-center text-sm text-gray-600">
            No passwords to remember — sign in securely with a verification code and follow your booking in your dashboard.
          </p>
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
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
            <p className="text-sm text-gray-600">
              Questions about your cylinder or delivery area? Call us during business hours:
            </p>
            <a href="tel:+919511760208" className="mt-2 inline-block text-xl font-extrabold text-gpred">
              📞 +91 95117 60208
            </a>
          </div>
        </div>
      </section>

      {/* ================= SAFETY BANNER ================= */}
      <section className="bg-gradient-to-r from-gpgreen to-gpnavy py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-200">Safety First</p>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
            🚨 Gas Leak Emergency?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/85 max-w-2xl mx-auto">
            Avoid flames and electrical switches, move to a safe place, and call the national LPG
            emergency number <strong>1906</strong> immediately.
          </p>
        </div>
      </section>

      {/* ================= BOOKING / CONTACT ================= */}
      <section id="booking" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <SectionTitle kicker="Book Now" title="Book Your LPG Cylinder" />
          <p className="mt-3 text-center text-sm text-gray-600">
            Sign in with your mobile number or email and book from your customer dashboard. Cylinder
            prices and availability are confirmed with your booking.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-gpred text-white p-6 text-center shadow-lg">
              <h3 className="text-lg font-bold">Customer Booking</h3>
              <p className="mt-2 text-sm text-white/85">Book a cylinder and track your delivery.</p>
              <Link
                href="/login"
                className="mt-4 inline-block rounded-full bg-white text-gpred px-5 py-2 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Customer Login
              </Link>
            </div>
            <div className="rounded-2xl bg-gpnavy text-white p-6 text-center shadow-lg">
              <h3 className="text-lg font-bold">Rider Booking</h3>
              <p className="mt-2 text-sm text-white/85">Riders — sign in to manage deliveries.</p>
              <Link
                href="/rider-login"
                className="mt-4 inline-block rounded-full bg-white text-gpnavy px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Rider Login
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <ApplyForm />
          </div>
          <div id="map" className="mt-8 rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <iframe
              title="DS Gas Agency location map"
              src="https://www.google.com/maps?q=Maharashtra,India&output=embed"
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
