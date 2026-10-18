"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix: string; label: string };

const stats: Stat[] = [
  { value: 7, suffix: "+", label: "Cylinder Sizes Available" },
  { value: 6, suffix: "", label: "Days a Week Delivery (8AM–8PM)" },
  { value: 100, suffix: "%", label: "Safety Checked Cylinders" },
  { value: 1906, suffix: "", label: "National LPG Emergency No." },
  { value: 2026, suffix: "", label: "Established" },
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
            DS Gas Agency · Established <span className="font-bold">2026</span>
          </span>
        </div>
      </div>
    </section>
  );
}
