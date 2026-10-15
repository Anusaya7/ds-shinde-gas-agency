import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Truck,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  Phone,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { productService } from '../../services/product.service';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productService.getProducts().then((res) => {
      setProducts(res.slice(0, 4));
    });
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNumber.trim()) return;
    navigate(`/dashboard/orders/${trackOrderNumber.trim()}/track`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primaryDark via-primary to-blue-900 text-white overflow-hidden py-16 sm:py-24">
        {/* Abstract decorative gas flame circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/80 border border-blue-700 text-xs sm:text-sm font-semibold text-blue-200">
                <Flame className="w-4 h-4 text-accentLight" />
                <span>Certified LPG Distributor & Fast Delivery Partner</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Reliable LPG Cylinder Delivery at Your <span className="text-accentLight">Doorstep</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
                Order genuine domestic & commercial LPG cylinders easily online. Enjoy verified weight checks, guaranteed safety seals, and instant real-time delivery tracking across our network.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to={isAuthenticated ? '/dashboard/orders/new' : '/login'} className="w-full sm:w-auto">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto text-base font-bold shadow-xl hover:scale-105"
                    leftIcon={<Flame className="w-5 h-5" />}
                  >
                    Book a Cylinder Now
                  </Button>
                </Link>

                <a href="#quick-track" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-white border-white/60 hover:bg-white/10 hover:border-white"
                    leftIcon={<Search className="w-5 h-5" />}
                  >
                    Track My Order
                  </Button>
                </a>
              </div>

              {/* Feature Pills */}
              <div className="pt-6 border-t border-blue-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-100">Same-Day Dispatch</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-100">Digital Weight Check</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-100">Secure OTP Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Card / Fast Order Booking Box */}
            <div className="lg:col-span-5" id="quick-track">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-gray-900 border border-blue-100">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-extrabold text-primaryDark">Quick Order Lookup</h3>
                    <p className="text-xs text-gray-500">Track real-time status of your cylinder</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>

                <form onSubmit={handleTrackSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Order Number / Reference ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={trackOrderNumber}
                        onChange={(e) => setTrackOrderNumber(e.target.value)}
                        placeholder="e.g. ORD-1001 or DS-2026-..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Track Delivery Status
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Need an immediate domestic refill?
                  </p>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-accent block">Standard 14.2 kg Refill</span>
                      <span className="text-xs text-gray-600">Quick booking for registered homes</span>
                    </div>
                    <Link
                      to={isAuthenticated ? '/dashboard/orders/new' : '/login'}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      Book <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Call helpline prompt */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Prefer booking on phone? Call{' '}
                    <a href="tel:9511760208" className="font-bold text-primary hover:underline">
                      9511760208
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
              Why Choose D.S Shinde Gas Agency
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Built on Trust, Safety, and Guaranteed Speed
            </h2>
            <p className="text-base text-gray-600 mt-3">
              We eliminate delivery delays and substandard refills. Here is what makes our agency the region's preferred LPG provider.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Doorstep Delivery</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Prompt dispatch routes and trained delivery riders guarantee same-day or next-morning arrival directly at your door.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Strict Safe Handling</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tamper-proof safety seals, leak tests, and digital scales on all delivery vehicles to verify net weight in front of you.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-warm-dark flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Multiple Cylinder Sizes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                From compact 5 kg FTL cylinders to 14.2 kg domestic cylinders and 19 kg / 47.5 kg commercial giants, we stock it all.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Flexible Payment Modes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pay online via UPI, credit/debit card, net banking, or choose Cash on Delivery (COD) upon physical handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-blue-100 px-3 py-1 rounded-full">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              How to Book Your LPG Cylinder
            </h2>
            <p className="text-base text-gray-600 mt-2">
              Booking your cooking gas cylinder takes less than 60 seconds with zero paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
              <span className="absolute -top-3 left-6 bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Step 01
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">Register / Login</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Log in using your registered mobile number or complete a quick 10-second registration.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
              <span className="absolute -top-3 left-6 bg-accent text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Step 02
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">Select Cylinder</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Choose domestic (14.2 kg / 5 kg) or commercial (19 kg) and select your quantity.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
              <span className="absolute -top-3 left-6 bg-warm text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Step 03
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">Choose Payment</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Select Cash on Delivery or pay seamlessly online using Razorpay UPI / Cards.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
              <span className="absolute -top-3 left-6 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Step 04
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-2">Get Delivered</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Track rider on the map, provide delivery OTP, verify cylinder weight, and enjoy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
                Cylinder Catalog
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
                Available Cylinder Options & Rates
              </h2>
              <p className="text-base text-gray-600 mt-2">
                Official rates regulated with safety inspection certificates.
              </p>
            </div>
            <Link to="/products" className="mt-4 md:mt-0">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Cylinders
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        prod.type === 'COMMERCIAL'
                          ? 'bg-blue-100 text-primary'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prod.type}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock
                    </span>
                  </div>

                  <div className="w-16 h-16 mx-auto my-3 rounded-2xl bg-blue-50 text-accent flex items-center justify-center">
                    <Flame className="w-10 h-10" />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 text-center">{prod.name}</h3>
                  <p className="text-xs text-gray-500 mt-2 text-center line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Current Price</span>
                    <span className="text-xl font-extrabold text-gray-900">₹{prod.price}</span>
                  </div>
                  <Link to={isAuthenticated ? '/dashboard/orders/new' : '/login'}>
                    <Button variant="accent" size="sm">
                      Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Hotline Strip */}
      <section className="bg-primary py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primaryDark rounded-2xl p-8 sm:p-10 border border-blue-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-bold text-accentLight uppercase tracking-wider">
                Emergency & Support Hotline
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Need Fast Gas Delivery or Urgent Leakage Assistance?
              </h3>
              <p className="text-sm text-blue-200 max-w-xl">
                Our agency operates dedicated lines to assist domestic and commercial patrons with instant dispatch and safety guidelines.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <a
                href="tel:9511760208"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-sm shadow-lg transition-transform hover:scale-105"
              >
                <Phone className="w-4 h-4" /> Call 9511760208
              </a>
              <a
                href="tel:9975300929"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm border border-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call 9975300929
              </a>
              <Link to="/contact">
                <Button variant="outline" size="md" className="text-white border-blue-400">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
