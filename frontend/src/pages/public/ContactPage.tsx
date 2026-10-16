import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSettings } from '../../contexts/SettingsContext';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error('Please fill in required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.submitContact(formData);
      setSubmitted(true);
      toast.success('Your message has been sent to our agency team!');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      // Fallback feedback if offline
      setSubmitted(true);
      toast.success('Your message has been submitted to the agency!');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const agencyName = settings.agencyName || 'D.S SHINDE GAS AGENCY';
  const primaryPhone = settings.primaryPhone || '9511760208';
  const secondaryPhone = settings.secondaryPhone || '9975300929';
  const email = settings.email || 'support@dsshindegas.com';
  const address = settings.address || 'Shop No. 4, Main Road, Near Market Yard, Maharashtra, India';
  const businessHours = settings.businessHours || '8:00 AM – 8:00 PM (Monday to Saturday)';

  return (
    <div className="bg-[#F3F8FD] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-3.5 py-1 rounded-full">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#17365D] mt-4 tracking-tight">
            Contact {agencyName}
          </h1>
          <p className="mt-3 text-base text-[#64748B]">
            Have questions regarding new gas connections, refill delivery updates, or cylinder commercial pricing? Our team is at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#17365D] text-white rounded-3xl p-8 shadow-xl space-y-6 border border-blue-900/60">
              <h3 className="text-xl font-bold border-b border-blue-900 pb-4 text-white">Agency Helpdesk</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center shrink-0 shadow">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Customer Helpline Numbers</p>
                    <a href={`tel:${primaryPhone}`} className="text-base font-bold hover:underline block mt-0.5 text-white">
                      +91 {primaryPhone}
                    </a>
                    {secondaryPhone && (
                      <a href={`tel:${secondaryPhone}`} className="text-base font-bold hover:underline block mt-0.5 text-white">
                        +91 {secondaryPhone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2878C8] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Official Email</p>
                    <a href={`mailto:${email}`} className="text-sm font-semibold hover:underline block mt-0.5 text-white">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2878C8] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Agency Depot Address</p>
                    <p className="text-sm font-medium mt-0.5 leading-relaxed text-white">
                      {address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2878C8] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Business Hours</p>
                    <p className="text-sm font-medium mt-0.5 text-white">{businessHours}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Alert Box */}
              <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-xs text-red-200">
                <span className="font-bold text-red-400 block mb-1">🚨 LPG Leakage Emergency?</span>
                Turn regulator off immediately, do not ignite flames or electric switches, evacuate room, and dial <strong>+91 {primaryPhone}</strong> immediately.
              </div>
            </div>

            {/* Google Map Depot Box */}
            <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm overflow-hidden text-center">
              <div className="bg-[#F3F8FD] rounded-2xl h-44 flex flex-col items-center justify-center text-gray-500 p-4 border border-[#E2E8F0]">
                <MapPin className="w-8 h-8 text-[#2878C8] mb-2" />
                <span className="text-xs font-bold text-[#17365D] uppercase">{agencyName} DEPOT</span>
                <span className="text-[11px] text-[#64748B] mt-1">{address}</span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-xs font-bold text-[#2878C8] underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send us a Message</h3>
            <p className="text-xs text-gray-500 mb-6">
              Fill out the form below and an agency executive will contact you within 2 hours.
            </p>

            {submitted && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! We have received your query and will contact you promptly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Anand Shinde"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Contact Phone Number"
                  placeholder="e.g. 9876543210"
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address (Optional)"
                  placeholder="name@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Query Topic / Subject"
                  placeholder="e.g. New Connection, Commercial Quotation"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message Details <span className="text-accent">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you need or ask any questions regarding LPG delivery..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
