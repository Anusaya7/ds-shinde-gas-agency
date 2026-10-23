import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, FileCheck2, RefreshCw, X } from 'lucide-react';
import { applicationService } from '../../services/application.service';
import { CustomerApplication, CustomerApprovalStatus } from '../../types';
import { Spinner } from '../../components/ui/Spinner';

const statusLabels: Record<CustomerApprovalStatus, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const AdminCustomerApplications: React.FC = () => {
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [filter, setFilter] = useState<'ALL' | CustomerApprovalStatus>('PENDING');
  const [search, setSearch] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await applicationService.listCustomerApplications(
        filter === 'ALL' ? undefined : filter
      );
      setApplications(results);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not load customer KYC applications.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleApplications = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return applications;
    return applications.filter((application) =>
      [
        application.customerName,
        application.customerPhone,
        application.customerEmail,
        application.fsiNumber,
        application.maskedAadhaar,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [applications, search]);

  const review = async (application: CustomerApplication, status: 'APPROVED' | 'REJECTED') => {
    const reason = rejectionReasons[application.customerId]?.trim();
    if (status === 'REJECTED' && (!reason || reason.length < 3)) {
      setError('Add a rejection reason of at least 3 characters before rejecting.');
      return;
    }
    setActionId(application.customerId);
    setError('');
    setMessage('');
    try {
      await applicationService.reviewCustomerApplication(application.customerId, status, reason);
      setMessage(
        `${application.customerName}'s KYC was ${status.toLowerCase()}. The customer was notified.`
      );
      await refresh();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not review this KYC application.');
    } finally {
      setActionId('');
    }
  };

  const openFile = async (customerId: string, kind: 'aadhaar' | 'udyam') => {
    setActionId(customerId);
    setError('');
    try {
      const blob =
        kind === 'aadhaar'
          ? await applicationService.downloadCustomerAadhaarDocument(customerId)
          : await applicationService.downloadCustomerUdyamDocument(customerId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          (kind === 'aadhaar'
            ? 'Could not retrieve the protected Aadhaar document.'
            : 'Could not retrieve the protected Udyam certificate.')
      );
    } finally {
      setActionId('');
    }
  };

  const deleteDocuments = async (application: CustomerApplication) => {
    if (!window.confirm(`Permanently delete stored KYC files for ${application.customerName}?`)) {
      return;
    }
    setActionId(application.customerId);
    setError('');
    try {
      await applicationService.deleteCustomerDocuments(application.customerId);
      setMessage('Customer KYC documents permanently deleted.');
      await refresh();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not delete this customer document.');
    } finally {
      setActionId('');
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-orange-600">Customer KYC review</p>
          <h1 className="mt-2 text-2xl font-black text-[#10284A]">Customer applications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review Aadhaar, Udyam, and FSI details submitted during booking. Approve to unlock cylinder selection.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#10284A] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="sr-only">Search customer KYC applications</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, phone, email, Aadhaar or FSI"
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
          />
        </label>
        <label>
          <span className="sr-only">Filter KYC by status</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as 'ALL' | CustomerApprovalStatus)}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
          >
            <option value="PENDING">Pending review</option>
            <option value="ALL">All statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="py-14">
          <Spinner label="Loading customer KYC applications..." />
        </div>
      ) : visibleApplications.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No customer KYC applications match this filter.
        </p>
      ) : (
        <ul className="space-y-4">
          {visibleApplications.map((application) => (
            <li key={application.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-[#10284A]">{application.customerName}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        application.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : application.approvalStatus === 'REJECTED'
                            ? 'bg-red-50 text-red-800'
                            : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {statusLabels[application.approvalStatus]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {application.customerPhone} · {application.customerEmail || 'Email not provided'}
                  </p>
                  <p className="text-sm text-slate-700">
                    Aadhaar: <strong>{application.maskedAadhaar || 'Not provided'}</strong>
                  </p>
                  <p className="text-sm text-slate-700">
                    FSI number: <strong>{application.fsiNumber || 'Not provided'}</strong>
                  </p>
                  <p className="text-sm text-slate-700">
                    Documents:{' '}
                    <strong>
                      {[
                        application.hasAadhaarDocument ? 'Aadhaar file uploaded' : null,
                        application.hasUdyamDocument ? 'Udyam file uploaded' : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'No files uploaded'}
                    </strong>
                  </p>
                  {application.reviewedAt ? (
                    <p className="text-xs text-slate-500">
                      Last reviewed {new Date(application.reviewedAt).toLocaleString('en-IN')}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Submitted {new Date(application.createdAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              {application.rejectionReason ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  Rejection reason: {application.rejectionReason}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void openFile(application.customerId, 'aadhaar')}
                  disabled={!!actionId || !application.hasAadhaarDocument}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  <FileCheck2 className="h-4 w-4" /> Aadhaar file
                </button>
                <button
                  type="button"
                  onClick={() => void openFile(application.customerId, 'udyam')}
                  disabled={!!actionId || !application.hasUdyamDocument}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  <FileCheck2 className="h-4 w-4" /> Udyam file
                </button>
                <button
                  type="button"
                  onClick={() => void deleteDocuments(application)}
                  disabled={!!actionId || (!application.hasAadhaarDocument && !application.hasUdyamDocument)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Delete files
                </button>
              </div>

              {application.approvalStatus === 'PENDING' ? (
                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void review(application, 'APPROVED')}
                    disabled={!!actionId}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Approve KYC
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                    <label className="sr-only" htmlFor={`kyc-rejection-${application.customerId}`}>
                      Rejection reason
                    </label>
                    <input
                      id={`kyc-rejection-${application.customerId}`}
                      value={rejectionReasons[application.customerId] || ''}
                      onChange={(event) =>
                        setRejectionReasons((current) => ({
                          ...current,
                          [application.customerId]: event.target.value,
                        }))
                      }
                      maxLength={500}
                      placeholder="Reason required to reject"
                      className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm focus:border-[#10284A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void review(application, 'REJECTED')}
                      disabled={!!actionId}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-800 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
