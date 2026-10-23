import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  MapPin,
  Flame,
  CreditCard,
  KeyRound,
  ArrowRight,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

export const HowToOrderPage: React.FC = () => {
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const bookingPaused = settings.isOrderingEnabled === false;
  const startHref = bookingPaused
    ? `tel:${settings.primaryPhone}`
    : isAuthenticated
      ? '/dashboard/orders/new'
      : '/login';
  const steps = [
    {
      step: '01',
      title: 'Sign In or Create Your Account',
      description:
        'Sign in or create an account securely using a one-time code sent to your email. No password is needed.',
      icon: UserCheck,
      color: 'bg-blue-100 text-primary',
    },
    {
      step: '02',
      title: 'Confirm Delivery Address',
      description:
        'Select a saved home or business address, or input a new location with landmark and GPS coordinates for precision doorstep delivery.',
      icon: MapPin,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      step: '03',
      title: 'Select Cylinder Capacity & Quantity',
      description:
        'Choose an available cylinder size from the current catalog. Each option shows its capacity, price, and availability.',
      icon: Flame,
      color: 'bg-red-100 text-[#F59E0B]',
    },
    {
      step: '04',
      title: 'Choose Payment Option',
      description:
        'Select online payment or Cash on Delivery. Online payment becomes available after the agency approves your booking.',
      icon: CreditCard,
      color: 'bg-amber-100 text-warm-dark',
    },
    {
      step: '05',
      title: 'Track Booking & Confirm Handover',
      description:
        'Follow your booking status in your dashboard. At delivery, inspect the cylinder and share the 6-digit delivery OTP only after handover.',
      icon: KeyRound,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
            Ordering Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
            How to Order Your LPG Cylinder
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            A clear guide to booking LPG cylinders, tracking order status, and arranging a safe handover.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-200 hover:shadow-lg transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-gray-200 group-hover:text-primary transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}

          {/* Quick Support Card */}
          <div className="bg-primary rounded-2xl p-7 text-white flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs font-semibold text-accentLight uppercase tracking-wider">
                Prefer Phone Assistance?
              </span>
              <h3 className="text-xl font-bold mt-2">Book by Phone Call</h3>
              <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                Contact the agency during the listed support hours for phone booking and assistance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-800">
              <a
                href={`tel:${settings.primaryPhone}`}
                className="inline-flex items-center gap-2 font-bold text-accentLight hover:underline text-sm"
              >
                <Phone className="w-4 h-4" /> Call {settings.primaryPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Customer checklist before delivery */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-8 sm:p-10 mb-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-primaryDark mb-3">
              Delivery Handover Best Practices:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mt-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Check the cylinder weight:</strong> Ask the delivery partner to verify the weight with you at handover.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Inspect White Seal:</strong> Ensure the safety seal cap is intact with unbroken plastic wire.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Prepare Empty Cylinder:</strong> Keep the empty cylinder ready for handover during refill swap.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Keep OTP Handy:</strong> Check your SMS or customer dashboard for the 6-digit confirmation code.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          {bookingPaused ? (
            <a href={`tel:${settings.primaryPhone}`}>
              <Button variant="accent" size="lg" className="font-bold shadow-lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Call {settings.primaryPhone}
              </Button>
            </a>
          ) : (
            <Link to={startHref}>
              <Button variant="accent" size="lg" className="font-bold shadow-lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Get Started with Your First Order
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
