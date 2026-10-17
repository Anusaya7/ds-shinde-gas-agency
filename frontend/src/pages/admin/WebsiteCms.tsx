import React, { useState, useEffect } from 'react';
import { Globe, Save, Sparkles, Image, Eye, RefreshCw, CheckCircle2, Flame, Layers } from 'lucide-react';
import { adminService, fallbackSettings } from '../../services/admin.service';
import { AgencySettings } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const WebsiteCms: React.FC = () => {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<AgencySettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService
      .getSettings()
      .then((data) => setSettings(data))
      .catch((error: any) => {
        setLoadError(error.response?.data?.message || 'Could not load website settings. Refresh the page to try again.');
        toast.error(error.response?.data?.message || 'Could not load website settings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      await refreshSettings();
      toast.success('Website CMS content updated and published live!');
    } catch {
      toast.error('Failed to update website content. Check backend connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading Website CMS..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {loadError}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
              Website CMS Manager
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Homepage & Public Content Control
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Modify hero headlines, cylinder catalog headings, CTAs, and images without writing code.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          isLoading={saving}
          variant="primary"
          size="md"
          className="font-bold shadow-md bg-[#2878C8] hover:bg-[#1f63a6]"
          leftIcon={<Save className="w-4 h-4" />}
        >
          Publish Live Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hero Section Configuration */}
        <Card title="Hero Section Headline & Content" subtitle="Control the primary message displayed to website visitors">
          <div className="space-y-5">
            <Input
              label="Primary Hero Headline"
              placeholder="e.g. Your Trusted LPG Gas Partner"
              value={settings.heroHeadline || ''}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
              required
            />

            <Input
              label="Hero Subheadline"
              placeholder="e.g. Reliable LPG Cylinder Solutions for Home and Business"
              value={settings.heroSubheadline || ''}
              onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Hero Description Paragraph
              </label>
              <textarea
                rows={3}
                value={settings.heroDescription || ''}
                onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm leading-relaxed"
                placeholder="Brief summary of cylinder capacities, safety guarantees, and ordering convenience..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Button Text"
                value={settings.heroPrimaryCtaText || ''}
                onChange={(e) => setSettings({ ...settings, heroPrimaryCtaText: e.target.value })}
                required
              />
              <Input
                label="Primary Button Link / URL"
                value={settings.heroPrimaryCtaLink || ''}
                onChange={(e) => setSettings({ ...settings, heroPrimaryCtaLink: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Secondary Button Text"
                value={settings.heroSecondaryCtaText || ''}
                onChange={(e) => setSettings({ ...settings, heroSecondaryCtaText: e.target.value })}
                required
              />
              <Input
                label="Secondary Button Link / URL"
                value={settings.heroSecondaryCtaLink || ''}
                onChange={(e) => setSettings({ ...settings, heroSecondaryCtaLink: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Hero Cylinder Image Path / URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={settings.heroImageUrl || ''}
                  onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                  placeholder="/assets/cylinders/cylinder-size-range.jpeg"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setSettings({ ...settings, heroImageUrl: e.target.value });
                  }}
                  className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white"
                >
                  <option value="">Preset Images</option>
                  <option value="/assets/cylinders/cylinder-size-range.jpeg">Gaspoint Cylinder Size Guide</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Preview Card */}
        <div className="bg-[#F3F8FD] rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-black uppercase text-[#17365D] tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#F59E0B]" /> Live Preview of Hero Section
            </span>
            <span className="text-[11px] text-[#64748B]">Real-time preview matching public styles</span>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-[#2878C8]/10 text-[#17365D] text-[11px] font-bold">
                Gaspoint LPG cylinder size reference
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#17365D] leading-tight">
                {settings.heroHeadline || 'Your Trusted LPG Gas Partner'}
              </h2>
              <p className="text-sm font-bold text-[#2878C8]">
                {settings.heroSubheadline || 'Reliable LPG Cylinder Solutions for Home and Business'}
              </p>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {settings.heroDescription || 'Explore cylinder capacities, place your order conveniently and manage your delivery...'}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="px-4 py-2 rounded-xl bg-[#F59E0B] text-white text-xs font-bold shadow">
                  {settings.heroPrimaryCtaText || 'Order a Cylinder'}
                </span>
                <span className="px-4 py-2 rounded-xl border border-[#2878C8]/40 text-[#17365D] text-xs font-bold">
                  {settings.heroSecondaryCtaText || 'Explore Cylinder Sizes'}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex items-center justify-center p-3 bg-[#F3F8FD] rounded-2xl border border-[#E2E8F0]">
              <img
                src={settings.heroImageUrl || '/assets/cylinders/cylinder-size-range.jpeg'}
                alt="Gaspoint LPG cylinder size guide preview"
                className="max-h-36 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/assets/cylinders/cylinder-size-range.jpeg';
                }}
              />
            </div>
          </div>
        </div>

        {/* Cylinder Catalog Section Configuration */}
        <Card title="Cylinder Size Guide Headings" subtitle="Customize the heading and supporting text shown with the Gaspoint capacity image">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cylinder Section Title"
              value={settings.cylinderSectionTitle || ''}
              onChange={(e) => setSettings({ ...settings, cylinderSectionTitle: e.target.value })}
              placeholder="Explore Our LPG Cylinder Sizes"
              required
            />
            <Input
              label="Cylinder Section Subtitle"
              value={settings.cylinderSectionSubtitle || ''}
              onChange={(e) => setSettings({ ...settings, cylinderSectionSubtitle: e.target.value })}
              placeholder="Choose a cylinder capacity that matches your requirements."
              required
            />
          </div>
        </Card>

        {/* Top Announcement Bar */}
        <Card title="Header Announcement Banner" subtitle="Display promotional alerts, holiday timing or delivery notices">
          <Input
            label="Announcement Banner Text (Leave blank to hide)"
            value={settings.announcementBanner || ''}
            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
            placeholder="e.g. Instant deliveries active! Order before 6:00 PM for same-day delivery."
          />
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            isLoading={saving}
            variant="primary"
            size="lg"
            className="font-bold shadow-lg bg-[#2878C8] hover:bg-[#1f63a6]"
            leftIcon={<Save className="w-5 h-5" />}
          >
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteCms;
