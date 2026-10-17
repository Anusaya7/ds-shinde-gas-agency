import React from 'react';
import { ArrowRight, Flame, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

const cylinderSizes = ['12', '15', '17', '19.2', '21', '33', '50', '425'];

export const CylinderGallery: React.FC = () => {
  const { settings } = useSettings();

  return (
    <section className="bg-[#F6F8FB] py-14 sm:py-20" id="cylinder-gallery">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#F47721]">
            <Flame className="h-4 w-4" />
            Gaspoint reference
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#10284A] sm:text-4xl">
            {settings.cylinderSectionTitle || 'Gaspoint cylinder size guide'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {settings.cylinderSectionSubtitle ||
              'Compare the cylinder capacities shown in the supplied Gaspoint reference image.'}
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(16,40,74,0.35)] lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex min-h-64 items-center justify-center bg-white p-3 sm:p-6 lg:p-8">
            <img
              src="/assets/cylinders/cylinder-size-range.jpeg"
              alt="Gaspoint LPG cylinder comparison showing 12, 15, 17, 19.2, 21, 33, 50 and 425 kilogram capacities"
              className="h-auto w-full rounded-2xl object-contain"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col justify-center bg-[#10284A] p-6 text-white sm:p-8 lg:p-10">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-200">
              Capacities in the image
            </span>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {cylinderSizes.map((size) => (
                <span
                  key={size}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-center text-sm font-bold"
                >
                  {size} kg
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-blue-100">
              This is a size reference, not a live stock or price list. Please confirm the
              available cylinder and current price with DS Shinde Gas.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to="/products"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F47721] px-4 text-sm font-bold text-white transition hover:bg-[#DD6414]"
              >
                Check online catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${settings.primaryPhone}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Call {settings.primaryPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
