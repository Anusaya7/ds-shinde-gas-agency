"use client";

import { useState } from "react";

const firmTypes = ["Proprietorship", "Partnership", "Company", "LLP"];

export default function ApplyForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      // POST to the existing backend enquiry endpoint (adjust path if needed)
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      form.reset();
      setConsent(false);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border-2 border-gpgreen bg-green-50 p-8 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-lg font-bold text-gpgreen">Thank you!</h3>
        <p className="mt-1 text-sm text-gray-700">
          Your enquiry has been received. Our team will contact you shortly. For urgent queries call
          7030970436.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm grid gap-4 sm:grid-cols-2"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <input name="name" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Firm Type *</label>
        <select name="firmType" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="">Select…</option>
          {firmTypes.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City / District *</label>
        <input name="city" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State *</label>
        <input name="state" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone *</label>
        <input
          name="phone" type="tel" required pattern="[0-9]{10}"
          placeholder="10-digit mobile number"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input name="email" type="email" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Investment Capacity</label>
        <select name="investment" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="">Select…</option>
          <option>Up to ₹2,00,000</option>
          <option>₹2,10,000 – ₹4,20,000</option>
          <option>₹4,20,000 – ₹10,00,000</option>
          <option>Above ₹10,00,000</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea name="message" rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox" name="consent" required checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-gpred"
          />
          <span>
            I consent to DS Shinde Gas Agency / Gaspoint Petroleum India Limited contacting me
            regarding dealership opportunities and using the details provided for this purpose.
          </span>
        </label>
      </div>
      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-gpred">
          Something went wrong. Please call us at 7030970436 / 7030514530 / 9112260266.
        </p>
      )}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-gpred px-8 py-3 font-semibold text-white shadow hover:bg-red-700 transition-colors"
        >
          Submit Enquiry
        </button>
        <p className="text-xs text-gray-500">
          Or call: <a href="tel:7030970436" className="font-semibold text-gpred">7030970436</a> /{" "}
          <a href="tel:7030514530" className="font-semibold text-gpred">7030514530</a> /{" "}
          <a href="tel:9112260266" className="font-semibold text-gpred">9112260266</a> ·{" "}
          <a href="https://www.gaspoint.in" className="font-semibold text-gpred">www.gaspoint.in</a>
        </p>
      </div>
    </form>
  );
}
