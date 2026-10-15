import React, { useState } from 'react';
import { Bike, Phone, User, Shield, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const RiderProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || 'Ramesh Patil');
  const [phone, setPhone] = useState(user?.phone || '9975300929');
  const [vehicleNumber, setVehicleNumber] = useState('MH-12-AB-1234');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      updateUser({ name, phone });
      toast.success('Rider profile updated');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rider Profile & Duty Log</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Delivery partner credentials, vehicle verification and shift timings
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-2xl shadow shrink-0">
          <Bike className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Verified Rider
            </span>
          </div>
          <p className="text-xs text-gray-500">📞 {phone} • Vehicle: {vehicleNumber}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Safety & Emergency Training Certified
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card title="Rider Information">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              required
            />
            <Input
              label="Assigned Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              Save Rider Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Agency Dispatcher Contacts */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
        <h4 className="font-bold text-sm text-primaryDark">Agency Depot Dispatch Helplines</h4>
        <p className="text-gray-600">
          In case of empty cylinder disputes, vehicle breakdown or customer absence:
        </p>
        <div className="flex flex-wrap gap-4 pt-1 font-bold text-primary">
          <a href="tel:9511760208" className="hover:underline">
            📞 Depot Manager: 9511760208
          </a>
          <a href="tel:9975300929" className="hover:underline">
            📞 Operations Desk: 9975300929
          </a>
        </div>
      </div>
    </div>
  );
};
