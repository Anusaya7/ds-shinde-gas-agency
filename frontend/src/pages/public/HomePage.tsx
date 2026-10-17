import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Flame,
  Headphones,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CylinderGallery } from '../../components/layout/CylinderGallery';
import { productService } from '../../services/product.service';
import { Product } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Safety you can trust',
    description: 'Carefully handled cylinders and a safety-first delivery.',
  },
  {
    icon: Truck,
    title: 'Doorstep delivery',
    description: 'Choose an available LPG size and book from your phone.',
  },
  {
    icon: BadgeCheck,
    title: 'Clear order updates',
    description: 'Follow your booking and stay in touch with our team.',
  },
];

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogUnavailable, setCatalogUnavailable] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    productService
      .getProducts()
      .then((available) => setProducts(available.filter((product) => product.isActive).slice(0, 3)))
      .catch(() => setCatalogUnavailable(true));
  }, []);

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate bg-[#F6F8FB]">
        <div className="pointer-events-none absolute -right-28 -top-28 h-[390px] w-[390px] rounded-full bg-orange-100/90 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-[340px] w-[340px] rounded-full bg-blue-100/70 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-20">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-[#10284A] shadow-sm sm:text-sm">
              <Flame className="h-4 w-4 text-[#F47721]" />
              A reliable local LPG delivery partner
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-[#10284A] sm:text-5xl lg:text-[62px]">
              Cooking at home?
              <span className="mt-2 block text-[#F47721]">We’ll bring the gas.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Book an LPG cylinder in a few easy steps. Pick the right size, tell us where to
              deliver, and follow your booking from your customer dashboard.
            </p>
            {settings.welcomeOfferEnabled && settings.welcomeOfferAmount > 0 && (
              <p className="mt-4 inline-flex rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-[#10284A]">
                New customer welcome offer: ₹{settings.welcomeOfferAmount} off your first booking.
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login">
                <Button
                  variant="accent"
                  size="lg"
                  className="min-h-12 w-full bg-[#F47721] px-6 font-bold text-white hover:bg-[#DD6414] sm:w-auto"
                  leftIcon={<Flame className="h-5 w-5" />}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Customer Booking
                </Button>
              </Link>
              <Link to="/rider/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-12 w-full border-[#10284A] px-6 font-bold text-[#10284A] hover:bg-blue-50 sm:w-auto"
                >
                  Rider Booking
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Safety-first service
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#F47721]" /> Booking updates
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute inset-4 rotate-3 rounded-[2rem] bg-[#F47721]/10" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[#10284A] p-6 text-white shadow-[0_28px_80px_-30px_rgba(16,40,74,0.45)] sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#F47721]/20 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-orange-200">
                    <Flame className="h-4 w-4" />
                    Gaspoint size guide
                  </span>
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                </div>
                <h2 className="mt-6 text-2xl font-black leading-tight sm:text-3xl">
                  The right cylinder size, made clear.
                </h2>
                <p className="mt-3 text-sm leading-6 text-blue-100">
                  Explore the capacities shown in the Gaspoint reference image. Ask our team to
                  confirm availability and today’s price before booking.
                </p>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {['12', '15', '17', '19.2', '21', '33', '50', '425'].map((size) => (
                    <span
                      key={size}
                      className="rounded-xl border border-white/15 bg-white/10 px-2 py-2.5 text-center text-xs font-extrabold text-white sm:text-sm"
                    >
                      {size} kg
                    </span>
                  ))}
                </div>
                <Link
                  to="/#cylinder-gallery"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F47721] px-4 text-sm font-bold text-white transition hover:bg-[#DD6414]"
                >
                  View the size guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div className="flex items-start gap-3 rounded-2xl p-3 sm:p-4" key={title}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#10284A]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-[#10284A]">{title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CylinderGallery />

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F47721]">
              Simple, step by step
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#10284A] sm:text-4xl">
              From booking to doorstep
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              No passwords to remember for customer or rider accounts. Sign in securely with a
              verification code, then see important updates in your dashboard.
            </p>
            <div className="mt-7 space-y-4">
              {[
                ['01', 'Sign in with a one-time code', 'Verify your mobile number or email.'],
                ['02', 'Choose your cylinder and address', 'Review the cylinder price and delivery details.'],
                ['03', 'Follow your order', 'Check payment and delivery status in your dashboard.'],
              ].map(([number, title, text]) => (
                <div key={number} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-[#10284A]">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#10284A]">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/how-to-order"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#F47721] hover:text-orange-700"
            >
              See how ordering works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[2rem] bg-[#10284A] p-7 text-white sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
              <MapPin className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-black sm:text-3xl">We’re here to help</h2>
            <p className="mt-3 max-w-md leading-7 text-blue-100">
              Questions about your cylinder or delivery area? Contact DS Shinde Gas
              team during our business hours.
            </p>
            <p className="mt-5 text-sm font-semibold text-blue-100">{settings.businessHours}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={`tel:${settings.primaryPhone}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F47721] px-5 text-sm font-bold text-white hover:bg-[#DD6414]"
              >
                <Phone className="h-4 w-4" /> Call {settings.primaryPhone}
              </a>
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-bold text-white hover:bg-white/10"
              >
                Contact support <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-blue-200">
              Cylinder prices and product availability are confirmed with your booking.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#F6F8FB] py-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-xl font-extrabold text-[#10284A]">Find the LPG size that fits</h2>
          {catalogUnavailable ? (
            <p className="mt-2 text-sm text-slate-600">
              Cylinder prices are temporarily unavailable. Please contact our team for assistance.
            </p>
          ) : products.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {products.map((product) => (
                <span
                  key={product.id}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-[#10284A]"
                >
                  {product.size}
                </span>
              ))}
            </div>
          ) : null}
          <Link to="/products" className="mt-5 inline-block text-sm font-bold text-[#F47721] hover:text-orange-700">
            Browse available cylinder sizes <ArrowRight className="inline h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};
