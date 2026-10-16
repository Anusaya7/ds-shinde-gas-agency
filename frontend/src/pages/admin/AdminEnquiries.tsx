import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, CheckCircle2, Clock, Search, Filter, MessageSquare, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { ContactEnquiry } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'REVIEWED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEnquiries();
      setEnquiries(data);
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'NEW' | 'REVIEWED' | 'RESOLVED') => {
    setUpdatingId(id);
    try {
      await adminService.updateEnquiryStatus(id, newStatus);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(`Enquiry marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update enquiry status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.message || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
            Customer Inquiries
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Contact Messages & Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View messages submitted via the public contact form and track resolution status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEnquiries}
          className="self-start sm:self-auto font-bold"
        >
          Refresh Leads
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'NEW', 'REVIEWED', 'RESOLVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-[#17365D] text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Inquiries' : status} (
              {status === 'ALL' ? enquiries.length : enquiries.filter((e) => e.status === status).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, message..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading customer inquiries..." />
        </div>
      ) : filteredEnquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-gray-900">{enquiry.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        enquiry.status === 'NEW'
                          ? 'bg-amber-100 text-amber-800'
                          : enquiry.status === 'REVIEWED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enquiry.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      +91 {enquiry.phone}
                    </span>
                    {enquiry.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {enquiry.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(enquiry.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {enquiry.subject && (
                    <p className="text-xs font-bold text-primary mt-2">
                      Subject: {enquiry.subject}
                    </p>
                  )}

                  <div className="mt-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                    {enquiry.message}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer
                  </a>

                  {enquiry.email && (
                    <a
                      href={`mailto:${enquiry.email}?subject=RE: ${encodeURIComponent(enquiry.subject || 'D.S Shinde Gas Enquiry')}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  )}

                  {enquiry.status !== 'RESOLVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={updatingId === enquiry.id}
                      onClick={() => handleUpdateStatus(enquiry.id, 'RESOLVED')}
                      className="text-xs font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark Resolved
                    </Button>
                  )}

                  {enquiry.status === 'NEW' && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={updatingId === enquiry.id}
                      onClick={() => handleUpdateStatus(enquiry.id, 'REVIEWED')}
                      className="text-xs font-bold text-gray-600"
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-700">No Inquiries Found</p>
          <p className="text-xs text-gray-400 mt-1">
            New contact submissions from the public website will show up here.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
