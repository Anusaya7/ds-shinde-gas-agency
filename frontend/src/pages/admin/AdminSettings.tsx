import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, Phone, Mail, MapPin, DollarSign, Clock, ShieldCheck, Plus, X, Globe, ArrowRight } from 'lucide-react';
import { adminService, fallbackSettings } from '../../services/admin.service';
import { AgencySettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AgencySettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService
      .getSettings()
      .then((data) => setSettings(data))
      .catch((error: any) => {
        setLoadError(error.response?.data?.message || 'Could not load agency settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('Agency settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save agency settings.');
    } finally {
      setSaving(false);
    }
  };

  const addArea = () => {
    if (!newAreaInput.trim()) return;
    const areas = Array.isArray(settings.deliveryAreas) ? settings.deliveryAreas : [];
    if (areas.includes(newAreaInput.trim())) {
      toast.error('Area already exists');
      return;
    }
    setSettings({
      ...settings,
      deliveryAreas: [...areas, newAreaInput.trim()],
    });
    setNewAreaInput('');
  };

  const removeArea = (area: string) => {
    const areas = Array.isArray(settings.deliveryAreas) ? settings.deliveryAreas : [];
    setSettings({
      ...settings,
      deliveryAreas: areas.filter((a) => a !== area),
    });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading agency configuration..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <p role="alert" className="text-sm text-red-800">{loadError}</p>
        <Button className="mt-4" variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agency Configuration & Rules</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Configure agency contact helplines, coverage zones, tariffs, and payment gateways
          </p>
        </div>
        <Link
          to="/admin/cms"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 text-xs font-bold transition-colors"
        >
          <Globe className="w-4 h-4" /> Edit website <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Agency Info */}
        <Card title="Agency Profile & Helplines">
          <div className="space-y-4">
            <Input
              label="Official Agency Name"
              value={settings.agencyName}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Helpline Number"
                value={settings.primaryPhone}
                onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
              <Input
                label="Secondary / Emergency Hotline"
                value={settings.secondaryPhone}
                onChange={(e) => setSettings({ ...settings, secondaryPhone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Support Email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4" />}
                type="email"
                required
              />
              <Input
                label="Operating Hours"
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                leftIcon={<Clock className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="Physical Depot Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>
        </Card>

        {/* Pricing, Delivery Fees & Tax Rates */}
        <Card title="Fee Structures & Taxation">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Standard Delivery Fee (₹)"
              type="number"
              min={0}
              value={settings.deliveryCharges}
              onChange={(e) =>
                setSettings({ ...settings, deliveryCharges: Number(e.target.value) })
              }
              helperText="Set 0 for free doorstep delivery"
            />
            <Input
              label="Tax Rate Percentage (%)"
              type="number"
              min={0}
              value={settings.taxPercentage}
              onChange={(e) =>
                setSettings({ ...settings, taxPercentage: Number(e.target.value) })
              }
              helperText="Defaults to 0. Configure only after verifying the applicable tax treatment."
            />
          </div>
        </Card>

        <Card title="New Customer Welcome Offer">
          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={settings.welcomeOfferEnabled}
                onChange={(event) =>
                  setSettings({ ...settings, welcomeOfferEnabled: event.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#10284A] focus:ring-[#10284A]"
              />
              <span>
                Enable a one-time fixed-amount discount for a customer’s first booking.
                The offer is disabled by default and applies only when an amount is configured.
              </span>
            </label>
            <Input
              label="First booking discount (₹)"
              type="number"
              min={0}
              step={0.01}
              value={settings.welcomeOfferAmount}
              onChange={(event) =>
                setSettings({ ...settings, welcomeOfferAmount: Number(event.target.value) })
              }
              helperText="The backend applies this once to eligible new customers and caps it at the order total."
            />
          </div>
        </Card>

        {/* Delivery Coverage Areas */}
        <Card title="Active Coverage Zones">
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Only consumers residing in these designated areas can confirm cylinder bookings.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                placeholder="Enter new zone / area name..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addArea} leftIcon={<Plus className="w-4 h-4" />}>
                Add Zone
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {(Array.isArray(settings.deliveryAreas) ? settings.deliveryAreas : []).map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-primary border border-blue-200 text-xs font-semibold"
                >
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => removeArea(area)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Master Ordering Switch */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-base">Consumer Online Booking Status</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Toggle off to pause public refill bookings during unexpected emergency holidays or inventory stockouts.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isOrderingEnabled}
              onChange={(e) => setSettings({ ...settings, isOrderingEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};
