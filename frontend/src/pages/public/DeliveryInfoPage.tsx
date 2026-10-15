import React from 'react';
import { Truck, Clock, MapPin, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const DeliveryInfoPage: React.FC = () => {
  const deliveryAreas = [
    { name: 'Central City & Downtown', turnaround: 'Same Day (2 - 4 Hours)' },
    { name: 'East Suburb & Extension Wards', turnaround: 'Same Day (3 - 5 Hours)' },
    { name: 'North Colony & Highway Zone', turnaround: 'Within 24 Hours' },
    { name: 'Market Yard & Commercial Hub', turnaround: 'Express 2 Hours' },
    { name: 'South Avenue & Industrial Area', turnaround: 'Same Day' },
    { name: 'Outskirts & Rural Perimeter', turnaround: 'Scheduled Morning Runs' },
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
            Logistics & Coverage
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Delivery Coverage, Schedules & Policy
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            We operate automated dispatch logistics to ensure domestic homes and commercial kitchens never run out of cooking fuel.
          </p>
        </div>

        {/* Operating Hours Banner */}
        <div className="bg-primaryDark text-white rounded-3xl p-8 mb-16 shadow-lg border-2 border-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Daily Delivery Hours</h3>
                <p className="text-sm text-blue-200">8:00 AM – 8:00 PM</p>
                <span className="text-xs text-blue-300">All 7 days a week</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Same-Day Cutoff</h3>
                <p className="text-sm text-blue-200">Orders placed by 4:00 PM</p>
                <span className="text-xs text-blue-300">Dispatched the same evening</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Digital OTP Guarantee</h3>
                <p className="text-sm text-blue-200">Zero Contactless Misplacement</p>
                <span className="text-xs text-blue-300">OTP required for release</span>
              </div>
            </div>
          </div>
        </div>

        {/* Areas Covered */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Current Distribution Zones</h2>
            <p className="text-sm text-gray-500 mt-1">
              Active sectors with dedicated rider assignments and express response.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveryAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-primary/40 transition-colors flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{area.name}</h4>
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {area.turnaround}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions of Delivery */}
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 mb-12">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" /> Important Delivery Policies
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span><strong>Empty Cylinder Exchange:</strong> Cylinder refills require an empty LPG cylinder of identical brand or standard specification to be handed over at delivery.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span><strong>Floor Carry Charges:</strong> Delivery is free to ground floor or buildings with operating service lifts. Multi-floor staircase carries above 2nd floor may incur standard nominal porterage if no lift is available.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span><strong>Mandatory Leak Testing:</strong> Delivery riders carry O-ring checking tools and soap solution to test valve seating upon cylinder connection if requested.</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link to="/products">
            <Button variant="accent" size="lg">
              Check Products & Book Delivery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
