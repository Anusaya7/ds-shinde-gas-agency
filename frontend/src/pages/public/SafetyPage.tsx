import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Phone, Flame, AlertTriangle, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const SafetyPage: React.FC = () => {
  const dos = [
    'Always store the LPG cylinder in an upright, vertical position on a flat floor.',
    'Keep your kitchen well ventilated with open windows and exhaust paths.',
    'Always switch OFF the cylinder pressure regulator knob after cooking at night.',
    'Use only BIS/IS-certified Suraksha rubber hose with steel braiding.',
    'Check rubber hose condition every 6 months and replace every 5 years.',
    'Place your gas stove at a higher level than the cylinder (never on the same level or below).',
    'Verify safety cap, sealing wire, and gross cylinder weight at the time of delivery.',
  ];

  const donts = [
    'NEVER keep cylinder inside enclosed unventilated cabinets or under sinks without air vents.',
    'NEVER roll the cylinder horizontally on the road or ground.',
    'NEVER operate electric light switches, fans, or matchsticks if you smell LPG odor.',
    'NEVER tilt or heat cylinder to consume residual gas.',
    'NEVER use open flames (candles/lighters) to inspect for suspected gas leaks.',
    'NEVER tamper with safety relief valve or attempt repairs yourself.',
    'NEVER purchase gas from unauthorized or uncertified vendors.',
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
            Zero Accident Protocol
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
            LPG Cylinder Safety Guidelines & Precautions
          </h1>
          <p className="mt-3 text-base text-gray-600">
            LPG (Liquefied Petroleum Gas) is an efficient, clean fuel, but requires disciplined handling. Follow these essential safety standards to protect your family and property.
          </p>
        </div>

        {/* Emergency Action Banner */}
        <div className="bg-gradient-to-r from-red-600 via-accent to-red-700 text-white rounded-3xl p-8 sm:p-10 mb-16 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-white" /> Emergency Response
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Smell Gas? Take Immediate Action:
              </h2>
              <ol className="list-decimal list-inside space-y-1.5 text-sm sm:text-base text-red-50 max-w-2xl">
                <li>Turn off regulator knob immediately and cover with safety cap.</li>
                <li>Open all windows and doors for ventilation; LPG is heavier than air.</li>
                <li>Do NOT turn any electrical switch ON or OFF (sparks can ignite gas).</li>
                <li>Do NOT strike matchsticks, light cigarettes, or use cellphones near leak.</li>
                <li>Move to a safe location and call the national LPG emergency number 1906.</li>
              </ol>
            </div>

            <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-2xl shrink-0 w-full sm:w-80 text-center space-y-3">
              <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                Emergency Hotline
              </span>
              <a
                href="tel:9511760208"
                className="text-2xl font-black text-accent block hover:underline"
              >
                9511760208
              </a>
              <a
                href="tel:9975300929"
                className="text-lg font-bold text-primary block hover:underline"
              >
                9975300929
              </a>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                National LPG Helpline: <strong className="text-gray-900">1906</strong>
              </div>
            </div>
          </div>
        </div>

        {/* DOs and DON'Ts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* DOs */}
          <div className="bg-emerald-50/60 rounded-3xl p-8 border border-emerald-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-emerald-950">Safety DOs</h3>
            </div>
            <ul className="space-y-3.5 text-sm text-emerald-900">
              {dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DON'Ts */}
          <div className="bg-red-50/60 rounded-3xl p-8 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold">
                ✕
              </div>
              <h3 className="text-xl font-bold text-red-950">Safety DONT's</h3>
            </div>
            <ul className="space-y-3.5 text-sm text-red-900">
              {donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Soap solution testing guide */}
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 mb-12">
          <div className="max-w-3xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              How to Safely Test for Cylinder Valve Leakage (Soap Water Test)
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Never use a matchstick or lighter to search for a gas leak. Use the standard soap water method:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="font-bold text-primary block mb-1">1. Mix Solution</span>
                Mix mild soap or liquid detergent with a small cup of clean water until foamy.
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="font-bold text-primary block mb-1">2. Apply to Joints</span>
                Using a small sponge or brush, apply lather around the regulator nozzle and hose joints.
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="font-bold text-primary block mb-1">3. Observe Bubbles</span>
                If soap bubbles expand, a leak is present. Shut regulator immediately and request replacement.
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/products">
            <Button variant="primary" size="lg">
              Book Safe Inspected Cylinder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
