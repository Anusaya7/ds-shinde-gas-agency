import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/dealership", label: "Dealership" },
  { href: "/#roi", label: "Investment & ROI" },
  { href: "/dealership#documents", label: "Documents" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-gpnavy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="text-2xl font-extrabold font-[family-name:var(--font-poppins)]">
            <span className="text-white">Confidence</span> <span className="text-gpred">Group</span>
          </p>
          <p className="mt-1 text-sm text-white/70">NSE: CONFIPET · Listed on BSE & NSE</p>
          <p className="mt-4 text-sm text-white/80">
            Gaspoint Petroleum India Limited — a Confidence Group company. Essential Energy, Endless
            Opportunity.
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
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="tel:7030970436" className="hover:text-gpred">📞 7030970436</a>
            </li>
            <li>
              <a href="tel:7030514530" className="hover:text-gpred">📞 7030514530</a>
            </li>
            <li>
              <a href="tel:9112260266" className="hover:text-gpred">📞 9112260266</a>
            </li>
            <li>
              <a href="https://www.gaspoint.in" className="hover:text-gpred">
                🌐 www.gaspoint.in
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-white/80">
            DS Shinde Gas Agency, Authorized Gaspoint LPG Dealer, India.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60 space-y-2">
          <p>
            <strong className="text-white/80">Disclaimer:</strong> Figures on this site (investment,
            ROI, margins, network stats) are indicative/illustrative, sourced from company
            presentations, and subject to change. Dealership allotment is at the sole discretion of
            Gaspoint Petroleum India Limited. This is not an offer or contract.
          </p>
          <p>
            © {new Date().getFullYear()} DS Shinde Gas Agency · Authorized Gaspoint LPG Dealer. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
