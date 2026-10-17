"use client";

import { useMemo, useState } from "react";

const GP_PER_KG = 14;

export default function RoiCalculator() {
  const [demand, setDemand] = useState(200);
  const [size, setSize] = useState(19.2);
  const [rotations, setRotations] = useState(2);
  const [expenses, setExpenses] = useState(36000);

  const result = useMemo(() => {
    const floorStock = 40;
    const installed = Math.max(demand - floorStock, 0);
    const cylinders = floorStock + installed;
    // Deposit: ₹2,100 per 19.2 kg / 21 kg cylinder
    const perCylInvestment = 2100;
    const investment = cylinders * perCylInvestment;
    const altInvestment = cylinders * perCylInvestment * 2; // 200-cyl alternate model (₹4,20,000 for 200)
    const kgPerMonth = demand * size * rotations;
    const grossProfit = kgPerMonth * GP_PER_KG;
    const netProfit = grossProfit - expenses;
    const breakEven = netProfit > 0 ? investment / netProfit : Infinity;
    return { cylinders, investment, altInvestment, kgPerMonth, grossProfit, netProfit, breakEven };
  }, [demand, size, rotations, expenses]);

  const fmt = (n: number) =>
    isFinite(n) ? "₹" + Math.round(n).toLocaleString("en-IN") : "—";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gpnavy">Calculator</h3>
        <div className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Area demand (cylinders): <span className="font-bold text-gpred">{demand}</span>
            </label>
            <input
              type="range" min={50} max={1000} step={10} value={demand}
              onChange={(e) => setDemand(+e.target.value)}
              className="mt-2 w-full accent-gpred"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cylinder size</label>
            <select
              value={size}
              onChange={(e) => setSize(+e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value={19.2}>19.2 kg</option>
              <option value={21}>21 kg</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly rotations: <span className="font-bold text-gpred">{rotations}</span>
            </label>
            <input
              type="range" min={1} max={8} step={1} value={rotations}
              onChange={(e) => setRotations(+e.target.value)}
              className="mt-2 w-full accent-gpred"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estimated monthly expenses (₹)
            </label>
            <input
              type="number" min={0} value={expenses}
              onChange={(e) => setExpenses(Math.max(0, +e.target.value || 0))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="rounded-2xl bg-gpnavy text-white p-6 shadow-sm">
        <h3 className="text-lg font-bold">Your Estimate</h3>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/70">Cylinders in rotation (40 floor + {result.cylinders - 40} installed)</dt>
            <dd className="font-semibold">{result.cylinders}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/70">Total investment (₹2,100/cylinder)</dt>
            <dd className="font-semibold">{fmt(result.investment)}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/70">Gas sold (kg / month)</dt>
            <dd className="font-semibold">{Math.round(result.kgPerMonth).toLocaleString("en-IN")} kg</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/70">Gross profit / month ({`kg × ₹${GP_PER_KG}`})</dt>
            <dd className="font-semibold text-green-300">{fmt(result.grossProfit)}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/70">Estimated monthly expenses</dt>
            <dd className="font-semibold">{fmt(expenses)}</dd>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <dt className="text-white/70">Net profit / month</dt>
            <dd className="font-semibold text-green-300">{fmt(result.netProfit)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/70">Break-even</dt>
            <dd className="font-semibold">
              {isFinite(result.breakEven) ? `~${Math.ceil(result.breakEven)} months` : "Not reached"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-white/50">
          Alternate 200-cylinder model (floor stock doubled): investment {fmt(result.altInvestment)}.
        </p>
      </div>

      {/* Reference models */}
      <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-gpgreen/40 bg-green-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gpgreen">
            Reference model (updated deck)
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
            <li>200 cylinders (40 floor stock + 160 installed), 19.2 kg, 2 rotations/month</li>
            <li>6,144 kg/month → GP <strong>₹86,016</strong></li>
            <li>Expenses ₹36,000 → Net <strong>₹50,016 / month</strong></li>
            <li>Full ROI in <strong>~10 months</strong></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Legacy example (shown for comparison)
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
            <li>500 cylinders demand → investment <strong>₹10,50,000</strong>*</li>
            <li>Month 5: gross ₹3,02,400 → net <strong>₹2,32,400</strong></li>
            <li>ROI <strong>~10 months</strong></li>
          </ul>
          <p className="mt-2 text-[11px] text-gray-500">
            * Legacy deck figure; the updated model above uses ₹2,100/cylinder.
          </p>
        </div>
      </div>

      <p className="lg:col-span-2 text-xs text-gray-500">
        Disclaimer: All calculator outputs and reference models are illustrative only, based on a
        gross margin of ₹14/kg and the figures in company presentations. Actual results depend on
        demand, logistics, expenses and company pricing.
      </p>
    </div>
  );
}
