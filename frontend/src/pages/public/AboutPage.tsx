import React from 'react';
import { Flame, ShieldCheck, Award, Users, HeartHandshake, Truck, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
            About Our Agency
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Delivering Warmth, Safety & Reliability to Every Household
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            DS Shinde Gas is a trusted LPG distribution and home delivery agency serving households, commercial kitchens, and businesses.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-primaryDark">
              Our Journey & Commitment to Excellence
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Founded to bring transparent, punctual, and safe LPG cylinder delivery to our community, DS Shinde Gas has grown into a modern, technology-enabled cylinder distributor.
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We recognized the everyday needs of families and commercial kitchens. Our online booking, order status updates, and OTP-verified handover are designed to make the process clearer.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link to="/products">
                <Button variant="primary">Browse Cylinders</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Contact Our Team</Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-xl shadow">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">DS Shinde Gas</h4>
                <p className="text-xs text-gray-500">Local LPG Agency</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/60">
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-primary">OTP</span>
                <p className="text-xs text-gray-500 mt-1">Customer and rider sign-in</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-accent">Review</span>
                <p className="text-xs text-gray-500 mt-1">Booking checked before online payment</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-warm">1–31</span>
                <p className="text-xs text-gray-500 mt-1">Day booking period options</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-emerald-600">Status</span>
                <p className="text-xs text-gray-500 mt-1">Booking progress in your dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Values */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Core Operating Values</h2>
            <p className="text-sm text-gray-500 mt-2">The four pillars that guide our daily agency operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <ShieldCheck className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Safety Above All</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Follow LPG safety guidance and inspect the cylinder and seal at handover.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Punctual Fulfillment</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Check your booking status for the latest order progress and delivery updates.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <Award className="w-8 h-8 text-warm mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Clear Handover</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Review the cylinder and ask the delivery partner about a weight check at handover.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <HeartHandshake className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Customer Care</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Contact the agency for help with bookings, account details, and delivery questions.
              </p>
            </div>
          </div>
        </div>

        {/* Agency Helpline */}
        <div className="bg-primaryDark rounded-3xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Speak to our Agency Representatives</h2>
          <p className="text-sm text-blue-200 max-w-xl mx-auto mb-6">
            Have questions about booking, cylinder options, or your order status?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:9511760208"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-sm shadow"
            >
              <Phone className="w-4 h-4" /> 9511760208
            </a>
            <a
              href="tel:9975300929"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm border border-blue-700"
            >
              <Phone className="w-4 h-4" /> 9975300929
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
