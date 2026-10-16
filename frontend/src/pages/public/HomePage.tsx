import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Truck, ShieldCheck, CreditCard, Layers, ArrowRight, Phone, Search, CheckCircle2, Clock, Sparkles, MapPin, HelpCircle, DollarSign, Users, Calendar, Mail, Award, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CylinderGallery } from '../../components/layout/CylinderGallery';
import { productService } from '../../services/product.service';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
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

  const heroHeadline = settings.heroHeadline || 'Your Trusted LPG Gas Partner';
  const heroSubheadline = settings.heroSubheadline || 'Reliable LPG Cylinder Solutions for Home and Business';
  const heroDescription = settings.heroDescription || 'Explore cylinder capacities, place your order conveniently and manage your delivery through a simple ordering experience.';
  const heroPrimaryCtaText = settings.heroPrimaryCtaText || 'Order a Cylinder';
  const heroPrimaryCtaLink = settings.heroPrimaryCtaLink || '/dashboard/orders/new';
  const heroSecondaryCtaText = settings.heroSecondaryCtaText || 'Explore Cylinder Sizes';
  const heroSecondaryCtaLink = settings.heroSecondaryCtaLink || '#cylinder-gallery';
  const heroImageUrl = settings.heroImageUrl || '/assets/cylinders/hero-cylinder.jpg';

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-[#F3F8FD] py-14 sm:py-20 overflow-hidden border-b border-[#E2E8F0]">
        {/* Soft background ambient glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[450px] h-[450px] rounded-full bg-[#2878C8]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[380px] h-[380px] rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2878C8]/10 border border-[#2878C8]/25 text-xs sm:text-sm font-bold text-[#17365D]">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Govt. Authorized LPG Cylinder Distributor</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-[#17365D]">
                  {heroHeadline}
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#2878C8]">
                  {heroSubheadline}
                </p>
              </div>

              <p className="text-base sm:text-lg text-[#64748B] max-w-2xl leading-relaxed">
                {heroDescription}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={isAuthenticated ? heroPrimaryCtaLink : '/quick-book'}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-[#F59E0B] hover:bg-[#d98206] text-white border-0"
                    leftIcon={<Truck className="w-5 h-5" />}
                  >
                    {heroPrimaryCtaText}
                  </Button>
                </Link>

                <a href={heroSecondaryCtaLink} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-[#17365D] border-[#2878C8]/30 hover:bg-[#2878C8]/10 hover:border-[#2878C8] font-bold transition-all"
                    leftIcon={<Search className="w-5 h-5 text-[#2878C8]" />}
                  >
                    {heroSecondaryCtaText}
                  </Button>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1F2937]">Weight Checked</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1F2937]">Safety Sealed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1F2937]">100% Inspected</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#1F2937]">Express Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Side - Photorealistic Cylinder & Trust Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual frame with soft glowing backdrop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2878C8]/20 to-[#F59E0B]/20 rounded-3xl transform rotate-2 scale-95 blur-xl pointer-events-none" />

                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col items-center">
                  {/* Floating badge top */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#17365D] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md">
                    <Award className="w-4 h-4 text-[#F59E0B]" />
                    <span>PESO & ISI Certified</span>
                  </div>

                  {/* Cylinder Image */}
                  <div className="w-full aspect-[4/4] flex items-center justify-center p-4 relative">
                    <img
                      src={heroImageUrl}
                      alt="D.S Shinde LPG Cylinder"
                      className="max-h-[340px] w-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/cylinders/hero-cylinder.jpg';
                      }}
                    />
                  </div>

                  {/* Floating feature pills beneath image */}
                  <div className="w-full pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#F3F8FD] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <span className="block text-xs font-extrabold text-[#17365D]">Tare-Weight Tested</span>
                      <span className="text-[11px] text-[#64748B]">Digital scale verification</span>
                    </div>
                    <div className="bg-[#F3F8FD] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <span className="block text-xs font-extrabold text-[#17365D]">Tamper-Proof Seal</span>
                      <span className="text-[11px] text-[#64748B]">Zero leakage guarantee</span>
                    </div>
                  </div>
                </div>

                {/* Floating bottom badge */}
                <div className="absolute -bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 bg-white text-[#17365D] border border-[#E2E8F0] px-4 py-2 rounded-2xl shadow-lg">
                  <div className="w-7 h-7 rounded-full bg-[#15803D]/15 text-[#15803D] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-[#17365D]">Rapid Delivery</span>
                    <span className="text-[10px] text-[#64748B]">Direct to your doorstep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Track & Helplines Strip */}
          <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#E2E8F0]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#2878C8]/10 text-[#2878C8] flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#17365D] uppercase tracking-wider">Quick Order Tracking</h3>
                  <p className="text-xs text-[#64748B]">Live GPS delivery status for active orders</p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="lg:col-span-5 flex items-center gap-2">
                <input
                  type="text"
                  value={trackOrderNumber}
                  onChange={(e) => setTrackOrderNumber(e.target.value)}
                  placeholder="Enter order ID (e.g. ORD-1001)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2878C8] text-sm text-[#1F2937]"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="bg-[#2878C8] hover:bg-[#1f63a6] text-white font-bold shrink-0 shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Track
                </Button>
              </form>

              <div className="lg:col-span-3 flex items-center justify-end gap-2 text-right">
                <div className="text-right">
                  <span className="text-[11px] text-[#64748B] block font-semibold">Immediate Booking Hotline</span>
                  <a
                    href={`tel:${settings.primaryPhone || '9511760208'}`}
                    className="text-sm font-black text-[#17365D] hover:text-[#2878C8] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                    +91 {settings.primaryPhone || '9511760208'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Cylinder Gallery - NEW SECTION */}
        <CylinderGallery />

        {/* How It Works Section */}
        <section className="py-16 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                Simple 4-Step Process
              </span>
              <h2 className="text-3xl font-extrabold text-text-primary mt-3 tracking-tight">
                How to Book Your LPG Cylinder
              </h2>
              <p className="text-base text-text-secondary mt-2">
                Booking your cooking gas cylinder takes less than 60 seconds with zero paperwork.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-6 border border-border-light shadow-soft relative">
                <span className="absolute -top-3 left-6 bg-primary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Step 01
                </span>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 mt-2">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mt-2">Register / Login</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Log in using your registered mobile number or complete a quick 10-second registration.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-6 border border-border-light shadow-soft relative">
                <span className="absolute -top-3 left-6 bg-secondary text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Step 02
                </span>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 mt-2">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mt-2">Select Cylinder</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Choose domestic (5 kg / 14.2 kg) or commercial (15 kg / 33 kg) and select your quantity.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-6 border border-border-light shadow-soft relative">
                <span className="absolute -top-3 left-6 bg-accent text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Step 03
                </span>
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 mt-2">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mt-2">Choose Payment</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Select Cash on Delivery or pay seamlessly online using Razorpay UPI / Cards.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl p-6 border border-border-light shadow-soft relative">
                <span className="absolute -top-3 left-6 bg-success text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Step 04
                </span>
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4 mt-2">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-text-primary mt-2">Get Delivered</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Track rider on the map, provide delivery OTP, verify cylinder weight, and enjoy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose D.S SHINDE GAS AGENCY */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                Premium Service
              </span>
              <h2 className="text-3xl font-extrabold text-text-primary mt-3 tracking-tight">
                Why Choose D.S SHINDE GAS AGENCY
              </h2>
              <p className="text-base text-text-secondary mt-3">
                We deliver more than just LPG cylinders - we provide peace of mind with verified safety standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature Card 1 */}
              <div className="p-6 rounded-2xl border border-border-light bg-background-secondary/50 hover:bg-white hover:shadow-card-hover transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Quick Doorstep Delivery</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Prompt dispatch routes and trained delivery riders guarantee same-day or next-morning arrival directly at your door.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="p-6 rounded-2xl border border-border-light bg-background-secondary/50 hover:bg-white hover:shadow-card-hover transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Strict Safe Handling</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Tamper-proof safety seals, leak tests, and digital scales on all delivery vehicles to verify net weight in front of you.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="p-6 rounded-2xl border border-border-light bg-background-secondary/50 hover:bg-white hover:shadow-card-hover transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Best Market Rates</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Transparent pricing with no hidden fees. Compare our rates and see the value in every cylinder you purchase.
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="p-6 rounded-2xl border border-border-light bg-background-secondary/50 hover:bg-white hover:shadow-card-hover transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Flexible Scheduling</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Book refills anytime, schedule regular deliveries, or request emergency refills with our flexible service options.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact and customer support */}
        <section className="bg-[#17365D] py-14 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1b4170] rounded-3xl p-8 sm:p-10 border border-[#2878C8]/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/20">
                  Emergency & Support Hotline
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
                  Need Fast Gas Delivery or Leakage Assistance?
                </h3>
                <p className="text-sm text-blue-100 max-w-xl">
                  Our agency operates dedicated lines to assist domestic and commercial patrons with instant dispatch and safety guidelines.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <a
                  href={`tel:${settings.primaryPhone || '9511760208'}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#d98206] text-white font-bold text-sm shadow-lg transition-transform hover:scale-105"
                >
                  <Phone className="w-4 h-4" /> Call +91 {settings.primaryPhone || '9511760208'}
                </a>
                {settings.secondaryPhone && (
                  <a
                    href={`tel:${settings.secondaryPhone}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2878C8] hover:bg-[#1f63a6] text-white font-bold text-sm border border-[#2878C8]/50 transition-colors shadow-md"
                  >
                    <Phone className="w-4 h-4" /> Call +91 {settings.secondaryPhone}
                  </a>
                )}
                <Link to="/contact">
                  <Button variant="outline" size="md" className="text-white border-white/40 hover:bg-white/10">
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

export default HomePage;