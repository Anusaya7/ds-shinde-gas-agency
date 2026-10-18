import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About DS Gas Agency" },
  { href: "/products", label: "LPG Cylinder Products" },
  { href: "/#how", label: "How to Book" },
  { href: "/#booking", label: "Customer Booking" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-gpnavy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-2xl font-extrabold font-[family-name:var(--font-poppins)]">
            <span className="text-white">DS</span> <span className="text-gpred">Gas Agency</span>
          </p>
          <p className="mt-1 text-sm text-white/70">LPG, delivered with care · Est. 2026</p>
          <p className="mt-4 text-sm text-white/80">
            LPG cylinder booking for households and local businesses, with clear order status,
            customer support, and delivery handover guidance. Founded by <strong>Sagar Shinde</strong>.
          </p>
          <p className="mt-3 text-sm text-white/70">
            🕗 Delivery: 8:00 AM – 8:00 PM (Monday to Saturday)
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-gpred transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Agency Contact</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>📍 Shop No. 4, Main Road, Near Market Yard, Maharashtra, India</li>
            <li>
              <a href="tel:+919511760208" className="hover:text-gpred">📞 +91 95117 60208</a>
            </li>
            <li>
              <a href="tel:+919975300929" className="hover:text-gpred">📞 +91 99753 00929</a>
            </li>
            <li>
              <a href="mailto:support@dsshindegas.com" className="hover:text-gpred">
                ✉️ support@dsshindegas.com
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-white/80">
            🚨 <strong>Gas leak emergency?</strong> Avoid flames &amp; electrical switches, move to
            safety and call <strong>1906</strong>.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60 space-y-2">
          <p>
            © {new Date().getFullYear()} DS Gas Agency. All rights reserved. Cylinder prices and
            product availability are confirmed with your booking.
          </p>
        </div>
      </div>
    </footer>
  );
}
