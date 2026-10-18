"use client";

import Link from "next/link";
import { useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About us" },
  { href: "/products", label: "Products" },
  { href: "/#how", label: "How it works" },
  { href: "/#booking", label: "Booking" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top strip */}
      <div className="bg-gpnavy text-white text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-between gap-2">
          <span className="font-medium">LPG, delivered with care</span>
          <span className="hidden sm:inline text-white/80">
            Trusted local LPG delivery · Est. 2026
          </span>
          <a href="tel:+919511760208" className="font-semibold hover:underline">
            📞 9511760208
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-gpred text-white text-xl font-bold">
              <span aria-hidden>🔥</span>
            </span>
            <span className="leading-tight">
              <span className="block text-xl font-extrabold font-[family-name:var(--font-poppins)] text-gpred">
                DS Gas
              </span>
              <span className="block text-[11px] text-gpnavy font-medium">
                DS Gas Agency
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gpnavy hover:text-gpred transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#booking"
              className="rounded-full bg-gpred px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
            >
              Customer Booking
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-gpnavy"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l14 14M20 6L6 20" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="lg:hidden border-t bg-white px-4 pb-4">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-gpnavy border-b border-gray-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#booking"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-gpred px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Customer Booking
          </Link>
        </nav>
      )}
    </header>
  );
}
