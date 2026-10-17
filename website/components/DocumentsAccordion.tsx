"use client";

import { useState } from "react";

const groups: { title: string; items: string[] }[] = [
  {
    title: "General (Proprietorship)",
    items: [
      "Shop & Establishment Certificate / NOC",
      "Shop agreement (if rented)",
      "Owner KYC — Aadhaar / Voter ID / Bank passbook with photo",
      "PAN of firm & owner",
      "GST (as applicable)",
      "2 passport photos",
      "₹100 stamp papers × 2",
    ],
  },
  {
    title: "Partnership Firms",
    items: [
      "Each partner's KYC",
      "Registered partnership deed",
      "Each partner's PAN + firm PAN acknowledgement",
    ],
  },
];

export default function DocumentsAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-sm">
      {groups.map((g, i) => (
        <div key={g.title}>
          <button
            className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-gpnavy hover:bg-gray-50"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {g.title}
            <span className={`text-gpred transition-transform ${open === i ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {open === i && (
            <ul className="px-6 pb-5 space-y-2 text-sm text-gray-700">
              {g.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gpgreen font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
