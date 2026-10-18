"use client";

import { useState } from "react";

const subjects = [
  "New Cylinder Booking",
  "Refill / Delivery Query",
  "Delivery Area Question",
  "Complaint / Feedback",
  "Other",
];

export default function ApplyForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
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
          Your enquiry has been received. The DS Gas Agency team will contact you shortly. For
          urgent queries call +91 95117 60208.
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
        <label className="block text-sm font-medium text-gray-700">Subject *</label>
        <select name="subject" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="">Select…</option>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City / Area *</label>
        <input name="city" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State *</label>
        <input name="state" required defaultValue="Maharashtra" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
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
        <label className="block text-sm font-medium text-gray-700">Cylinder Size of Interest</label>
        <select name="cylinder" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
          <option value="">Select…</option>
          <option>5 kg Domestic Mini</option>
          <option>13 kg Domestic</option>
          <option>15 kg Commercial</option>
          <option>19.2 kg Large Domestic</option>
          <option>33 kg Commercial</option>
          <option>50 kg Industrial</option>
          <option>425 kg Industrial Vessel</option>
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
            I consent to DS Gas Agency contacting me regarding my enquiry and using the details
            provided for this purpose.
          </span>
        </label>
      </div>
      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-gpred">
          Something went wrong. Please call us at +91 95117 60208 / +91 99753 00929.
        </p>
      )}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-gpred px-8 py-3 font-semibold text-white shadow hover:bg-red-700 transition-colors"
        >
          Send Enquiry
        </button>
        <p className="text-xs text-gray-500">
          Or call: <a href="tel:+919511760208" className="font-semibold text-gpred">+91 95117 60208</a> /{" "}
          <a href="tel:+919975300929" className="font-semibold text-gpred">+91 99753 00929</a>
        </p>
      </div>
    </form>
  );
}
