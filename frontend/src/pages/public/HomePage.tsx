import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Truck, ShieldCheck, CreditCard, Layers, ArrowRight, Phone, Search, CheckCircle2, Clock, Sparkles, MapPin, HelpCircle, DollarSign, Users, Calendar, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CylinderGallery } from '../../components/layout/CylinderGallery';
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
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background-primary to-secondary/5 py-16 sm:py-24 overflow-hidden">
          {/* Abstract decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-semibold text-primary">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span>Trusted LPG Distributor Since Years</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-text-primary">
                  Reliable LPG Cylinders. Delivered with <span className="text-secondary">Care.</span>
                </h1>

                <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
                  Choose the right cylinder size for your home, business or industrial requirements.
                  All cylinders are weight-verified, safety-sealed, and delivered with complete documentation.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link to={isAuthenticated ? '/dashboard/orders/new' : '/login'} className="w-full sm:w-auto">
                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full sm:w-auto text-base font-bold shadow-xl hover:scale-105 transition-all"
                      leftIcon={<Truck className="w-5 h-5" />}
                    >
                      Order a Cylinder
                    </Button>
                  </Link>

                  <a href="#cylinder-gallery" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto text-text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all"
                      leftIcon={<Search className="w-5 h-5" />}
                    >
                      Explore Cylinder Sizes
                    </Button>
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="pt-6 border-t border-border-light grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary">Weight Checked</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary">Safety Sealed</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary">Documented</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Trust Card */}
              <div className="lg:col-span-5" id="quick-track">
                <div className="bg-white rounded-2xl shadow-card-hover p-6 sm:p-8 border border-border-light relative overflow-hidden">
                  {/* Subtle accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -mr-16 -mt-16" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between pb-4 border-b border-border-light">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">Track Your Order</h3>
                        <p className="text-xs text-text-secondary">Enter order number to track delivery status</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                    </div>

                    <form onSubmit={handleTrackSubmit} className="mt-5 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                          Order Number / Reference ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={trackOrderNumber}
                            onChange={(e) => setTrackOrderNumber(e.target.value)}
                            placeholder="e.g. ORD-1001 or DS-2026-..."
                            className="w-full px-4 py-3 rounded-lg border border-border-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full font-bold shadow-soft hover:shadow-card-hover"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Track Delivery Status
                      </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-border-light space-y-3">
                      <p className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                        Need immediate service?
                      </p>
                      <div className="p-3 rounded-xl bg-background-secondary border border-border-light flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-accent block">Standard 14.2 kg Refill</span>
                          <span className="text-xs text-text-secondary">Quick booking for registered homes</span>
                        </div>
                        <Link
                          to={isAuthenticated ? '/dashboard/orders/new' : '/login'}
                          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          Book <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Call helpline prompt */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-text-secondary">
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
        <section className="bg-primaryDark py-12 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-2xl p-8 sm:p-10 border border-blue-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
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
                  <Button variant="outline" size="md" className="text-white border-blue-400 bg-blue-800/50">
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