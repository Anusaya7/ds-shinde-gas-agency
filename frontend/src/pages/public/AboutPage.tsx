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
            D.S SHINDE GAS AGENCY is a trusted LPG distribution and home delivery agency serving thousands of households, commercial kitchens, and enterprises.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-primaryDark">
              Our Journey & Commitment to Excellence
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Founded with the goal of bringing transparent, punctual, and safe LPG cylinder delivery to our local community, D.S SHINDE GAS AGENCY has evolved into a technologically modern cylinder distributor.
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We recognized the everyday struggle of families and commercial kitchens facing cylinder shortages, unpredictable delivery windows, and questionable cylinder weights. By coupling dedicated logistics with digital order tracking and transparent OTP delivery checks, we guarantee peace of mind with every cylinder.
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
                <h4 className="font-bold text-gray-900 text-lg">D.S SHINDE GAS AGENCY</h4>
                <p className="text-xs text-gray-500">Government Authorized LPG Distributor</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/60">
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-primary">10,000+</span>
                <p className="text-xs text-gray-500 mt-1">Cylinders Delivered</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-accent">99.8%</span>
                <p className="text-xs text-gray-500 mt-1">On-Time Refill Rate</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-warm">100%</span>
                <p className="text-xs text-gray-500 mt-1">Safety Seal Inspected</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-xs">
                <span className="text-2xl font-black text-emerald-600">7 Days</span>
                <p className="text-xs text-gray-500 mt-1">Weekly Delivery Service</p>
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
                Zero tolerance for leaky valves, expired testing dates, or damaged cylinders.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Punctual Fulfillment</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We value your cooking hours. Our dispatch routes guarantee prompt arrival.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <Award className="w-8 h-8 text-warm mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Certified Weight Accuracy</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every delivery vehicle carries calibrated electronic scales to weigh on demand.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <HeartHandshake className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Customer Care</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Instant helpline support for refill requests, emergency leaks, or new connections.
              </p>
            </div>
          </div>
        </div>

        {/* Agency Helpline */}
        <div className="bg-primaryDark rounded-3xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Speak to our Agency Representatives</h2>
          <p className="text-sm text-blue-200 max-w-xl mx-auto mb-6">
            Have questions regarding new gas connection, commercial manifold installation, or subsidy queries?
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
