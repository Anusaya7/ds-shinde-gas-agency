"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix: string; label: string };

const stats: Stat[] = [
  { value: 58, suffix: "+", label: "Bottling Plants" },
  { value: 15, suffix: "+", label: "Cylinder Manufacturing Units (5 Million capacity)" },
  { value: 250, suffix: "+", label: "Auto LPG Stations" },
  { value: 5500, suffix: "+", label: "Dealer Network" },
  { value: 12, suffix: "+", label: "States Presence" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setDisplay(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-poppins)]">
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function TrustStats() {
  return (
    <section className="bg-gpnavy text-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <Counter target={s.value} suffix={s.suffix} />
              <p className="mt-2 text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <span className="inline-block rounded-full border border-gpred bg-gpred/10 px-5 py-2 text-sm font-semibold">
            Listed: NSE: <span className="font-bold">CONFIPET</span>
          </span>
          <p className="mt-3 text-xs text-white/50">
            Figures as per latest company presentation; subject to change.
          </p>
        </div>
      </div>
    </section>
  );
}
