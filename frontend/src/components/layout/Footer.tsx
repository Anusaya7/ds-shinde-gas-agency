import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  const agencyName = settings.agencyName || 'D.S SHINDE GAS AGENCY';
  const primaryPhone = settings.primaryPhone || '9511760208';
  const secondaryPhone = settings.secondaryPhone || '9975300929';
  const email = settings.email || 'support@dsshindegas.com';
  const address = settings.address || 'Shop No. 4, Main Road, Near Market Yard, Maharashtra, India';
  const businessHours = settings.businessHours || '8:00 AM – 8:00 PM (Monday to Saturday)';

  return (
    <footer className="bg-[#17365D] text-white pt-14 pb-8 border-t-4 border-[#F59E0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center shadow-md">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {agencyName}
              </span>
            </div>
            <p className="text-sm text-blue-100/80 leading-relaxed mb-6">
              Premier certified distributor providing dependable domestic & commercial LPG cylinder delivery, safe cylinder installations, and expedited doorstep refills.
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Certified Cylinders & Weight Check</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>Delivery: {businessHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F59E0B]" />
                <span>Govt. Standard Safety Compliant</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider border-b border-blue-900/80 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-blue-100/90">
              <li>
                <Link to="/" className="hover:text-[#F59E0B] transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#F59E0B] transition-colors">LPG Cylinder Products</Link>
              </li>
              <li>
                <Link to="/how-to-order" className="hover:text-[#F59E0B] transition-colors">How to Book an LPG Cylinder</Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-[#F59E0B] transition-colors">Delivery Coverage & Timing</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-[#F59E0B] transition-colors">LPG Safety & Leak Guidelines</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#F59E0B] transition-colors">Frequently Asked Questions (FAQ)</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F59E0B] transition-colors">About D.S Shinde Agency</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Agency Portals & Customer Care */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider border-b border-blue-900/80 pb-2">
              Agency Portals & Access
            </h4>
            <ul className="space-y-2.5 text-sm text-blue-100/90">
              <li>
                <Link to="/quick-book" className="hover:text-[#F59E0B] font-bold text-[#F59E0B] transition-colors flex items-center gap-1.5">
                  ⚡ Instant Cylinder Booking (No Login)
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors flex items-center gap-1.5 text-blue-200">
                  🛡️ Admin Management Portal
                </Link>
              </li>
              <li>
                <Link to="/rider/login" className="hover:text-white transition-colors flex items-center gap-1.5 text-amber-200">
                  🛵 Delivery Rider Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  👤 Customer Account Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#F59E0B] transition-colors">
                  New Customer Registration
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F59E0B] transition-colors">
                  Customer Support Helpdesk
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-[#F59E0B] transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Agency Address & Helpline */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider border-b border-blue-900/80 pb-2">
              Agency Hotline
            </h4>
            <div className="space-y-4 text-sm text-blue-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">{address}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <a href={`tel:${primaryPhone}`} className="hover:underline font-bold block text-sm">
                    +91 {primaryPhone}
                  </a>
                  {secondaryPhone && (
                    <a href={`tel:${secondaryPhone}`} className="hover:underline font-bold block mt-0.5 text-sm">
                      +91 {secondaryPhone}
                    </a>
                  )}
                  <span className="text-xs text-blue-300">Helpline active during delivery hours</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <a href={`mailto:${email}`} className="hover:underline text-xs sm:text-sm">
                  {email}
                </a>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-blue-950/80 border border-blue-900 text-xs text-blue-100">
              <span className="text-red-400 font-bold block mb-1">🚨 Emergency Gas Leak?</span>
              Turn off regulator knob immediately, open all doors & windows, do not switch electric appliances, and call our hotline instantly.
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 border-t border-blue-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300 gap-4">
          <p>© {new Date().getFullYear()} {agencyName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};