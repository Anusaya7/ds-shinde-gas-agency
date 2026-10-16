import React, { useEffect, useState } from 'react';
import { Bike, CheckCircle, Phone, User } from 'lucide-react';
import { riderService, RiderProfileData } from '../../services/rider.service';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const RiderProfile: React.FC = () => {
  const [profile, setProfile] = useState<RiderProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riderService
      .getProfile()
      .then(setProfile)
      .catch((error: any) => {
        toast.error(error.response?.data?.message || 'Could not load your rider profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner label="Loading rider profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        Rider profile details are unavailable. Please contact DS Shinde Gas support.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rider Profile</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Verified contact and vehicle details associated with your rider account
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#10284A] text-white flex items-center justify-center">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
              profile.isActive ? 'text-emerald-700' : 'text-gray-600'
            }`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {profile.isActive ? 'Active rider account' : 'Inactive rider account'}
            </span>
          </div>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-500">Mobile number</dt>
              <dd className="font-semibold text-gray-900">{profile.phone}</dd>
            </div>
          </div>
          {profile.email && (
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="font-semibold text-gray-900">{profile.email}</dd>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Bike className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-500">Vehicle registration</dt>
              <dd className="font-semibold text-gray-900">{profile.vehicleNumber || 'Not provided'}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
};
