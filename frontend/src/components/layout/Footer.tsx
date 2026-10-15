import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primaryDark text-white pt-16 pb-12 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-red-400">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                D.S SHINDE <span className="text-accentLight">GAS AGENCY</span>
              </span>
            </div>
            <p className="text-sm text-blue-100/80 leading-relaxed mb-6">
              Premier certified distributor providing dependable domestic & commercial LPG cylinder delivery, safe cylinder installations, and expedited doorstep refills.
            </p>
            <div className="flex flex-col gap-2 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Certified Cylinders & Weight Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warm-light" />
                <span>Delivery: 8:00 AM – 8:00 PM (All 7 Days)</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accentLight" />
                <span>Govt. Standard Safety Compliant</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-blue-800 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-blue-100/90">
              <li>
                <Link to="/" className="hover:text-accentLight transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-accentLight transition-colors">LPG Cylinder Products</Link>
              </li>
              <li>
                <Link to="/how-to-order" className="hover:text-accentLight transition-colors">How to Book an LPG Cylinder</Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-accentLight transition-colors">Delivery Coverage & Timing</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-accentLight transition-colors">LPG Safety & Leak Guidelines</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-accentLight transition-colors">Frequently Asked Questions (FAQ)</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accentLight transition-colors">About D.S Shinde Agency</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Legal Policies */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-blue-800 pb-2">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-blue-100/90">
              <li>
                <Link to="/contact" className="hover:text-accentLight transition-colors">Customer Support Helpdesk</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-accentLight transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accentLight transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-accentLight transition-colors">Refund & Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accentLight transition-colors">Customer Portal Login</Link>
              </li>
              <li>
                <Link to="/login" className="text-amber-300 font-semibold hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Staff & Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-accentLight transition-colors">New Connection Registration</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Agency Address & Helpline */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-blue-800 pb-2">
              Agency Hotline
            </h4>
            <div className="space-y-4 text-sm text-blue-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accentLight shrink-0 mt-0.5" />
                <span>Shop No. 4, Main Road, Near Market Yard, Maharashtra, India</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accentLight shrink-0 mt-0.5" />
                <div>
                  <a href="tel:9511760208" className="hover:underline font-bold block">
                    +91 9511760208
                  </a>
                  <a href="tel:9975300929" className="hover:underline font-bold block mt-0.5">
                    +91 9975300929
                  </a>
                  <span className="text-xs text-blue-300">Helpline open 8am - 8pm</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-accentLight shrink-0 mt-0.5" />
                <a href="mailto:support@dsshindegas.com" className="hover:underline">
                  support@dsshindegas.com
                </a>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-blue-900/60 border border-blue-800 text-xs">
              <span className="text-red-400 font-bold block mb-1">🚨 Emergency Gas Leak?</span>
              Turn off regulator immediately, open windows, do not switch electric appliances, and call our helpline instantly.
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-8 border-t border-blue-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300 gap-4">
          <p>© {new Date().getFullYear()} D.S SHINDE GAS AGENCY. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white">Refunds</Link>
            <Link to="/contact" className="hover:text-white">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
