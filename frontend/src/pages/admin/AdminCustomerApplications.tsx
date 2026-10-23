import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, FileCheck2, RefreshCw, X } from 'lucide-react';
import { applicationService } from '../../services/application.service';
import { CustomerApplication, CustomerApprovalStatus } from '../../types';
import { Spinner } from '../../components/ui/Spinner';

type KycTab = 'PENDING' | 'APPROVED';

const statusLabels: Record<CustomerApprovalStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

function deliveryText(application: CustomerApplication): string {
  return [
    application.delivery?.addressLine1,
    application.delivery?.area,
    application.delivery?.city,
    application.delivery?.state,
    application.delivery?.pincode,
  ]
    .filter(Boolean)
    .join(', ') || '—';
}

export const AdminCustomerApplications: React.FC = () => {
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [tab, setTab] = useState<KycTab>('PENDING');
  const [search, setSearch] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await applicationService.listCustomerApplications();
      setApplications(results);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not load customer KYC applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pendingCount = applications.filter((item) => item.approvalStatus === 'PENDING').length;
  const approvedCount = applications.filter((item) => item.approvalStatus === 'APPROVED').length;

  const visibleApplications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((application) => {
      if (application.approvalStatus !== tab) return false;
      if (!term) return true;
      return [
        application.customerName,
        application.customerPhone,
        application.alternatePhone,
        application.customerEmail,
        application.fsiNumber,
        application.maskedAadhaar,
        application.delivery?.city,
        application.delivery?.pincode,
        application.delivery?.addressLine1,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [applications, search, tab]);

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
      setApplications((current) =>
        current.map((item) =>
          item.customerId === application.customerId
            ? { ...item, approvalStatus: status, rejectionReason: status === 'REJECTED' ? reason : null, reviewedAt: new Date().toISOString() }
            : item
        )
      );
      if (status === 'APPROVED') setTab('APPROVED');
      setMessage(
        `${application.customerName}'s KYC was ${status.toLowerCase()}. The customer was notified.`
      );
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

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-orange-600">Customer KYC</p>
          <h1 className="mt-2 text-2xl font-black text-[#10284A]">KYC applications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pending records wait here. After you approve, they stay in the Approved KYC table.
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

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('PENDING')}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            tab === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Pending KYC ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setTab('APPROVED')}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            tab === 'APPROVED' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Approved KYC ({approvedCount})
        </button>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, phone, email, Aadhaar, city"
          className="min-h-10 min-w-[220px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
        />
      </div>

      {loading ? (
        <div className="py-14">
          <Spinner label="Loading KYC table..." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Aadhaar</th>
                  <th className="px-4 py-3">FSI / GST</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                      {tab === 'PENDING' ? 'No pending KYC applications.' : 'No approved KYC records yet.'}
                    </td>
                  </tr>
                ) : (
                  visibleApplications.map((application) => {
                    const open = expandedId === application.id;
                    return (
                      <React.Fragment key={application.id}>
                        <tr className="align-top hover:bg-blue-50/40">
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#10284A]">{application.customerName}</p>
                            <p className="text-[11px] text-slate-500">{application.customerEmail || 'No email'}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {application.customerPhone || '—'}
                            {application.alternatePhone ? (
                              <span className="mt-0.5 block text-[11px] text-slate-500">{application.alternatePhone}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {deliveryText(application)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {application.maskedAadhaar || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{application.fsiNumber || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {application.bookingDurationDays ? `${application.bookingDurationDays} days` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                application.approvalStatus === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {statusLabels[application.approvalStatus]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setExpandedId(open ? '' : application.id)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {open ? 'Hide' : 'Details'}
                              </button>
                              {application.approvalStatus === 'PENDING' ? (
                                <button
                                  type="button"
                                  disabled={!!actionId}
                                  onClick={() => void review(application, 'APPROVED')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 font-bold text-white disabled:opacity-50"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                        {open ? (
                          <tr className="bg-slate-50/80">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                                <p><strong>Landmark:</strong> {application.delivery?.landmark || '—'}</p>
                                <p>
                                  <strong>Map:</strong>{' '}
                                  {application.delivery?.mapLink ? (
                                    <a className="text-[#10284A] underline" href={application.delivery.mapLink} target="_blank" rel="noreferrer">
                                      Open location
                                    </a>
                                  ) : (
                                    '—'
                                  )}
                                </p>
                                <p>
                                  <strong>Reminders:</strong> {application.remindersEnabled ? 'Requested' : 'Not requested'}
                                </p>
                                <p>
                                  <strong>Documents:</strong>{' '}
                                  {[
                                    application.hasAadhaarDocument ? 'Aadhaar file' : null,
                                    application.hasUdyamDocument ? 'Udyam file' : null,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || 'No files uploaded'}
                                </p>
                                <p>
                                  <strong>Submitted:</strong>{' '}
                                  {new Date(application.createdAt).toLocaleString('en-IN')}
                                </p>
                                <p>
                                  <strong>Reviewed:</strong>{' '}
                                  {application.reviewedAt
                                    ? new Date(application.reviewedAt).toLocaleString('en-IN')
                                    : 'Not reviewed'}
                                </p>
                              </div>
                              {application.rejectionReason ? (
                                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                                  Rejection reason: {application.rejectionReason}
                                </p>
                              ) : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={!!actionId || !application.hasAadhaarDocument}
                                  onClick={() => void openFile(application.customerId, 'aadhaar')}
                                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold disabled:opacity-50"
                                >
                                  <FileCheck2 className="h-3.5 w-3.5" /> Aadhaar file
                                </button>
                                <button
                                  type="button"
                                  disabled={!!actionId || !application.hasUdyamDocument}
                                  onClick={() => void openFile(application.customerId, 'udyam')}
                                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold disabled:opacity-50"
                                >
                                  <FileCheck2 className="h-3.5 w-3.5" /> Udyam file
                                </button>
                              </div>
                              {application.approvalStatus === 'PENDING' ? (
                                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                  <input
                                    value={rejectionReasons[application.customerId] || ''}
                                    onChange={(event) =>
                                      setRejectionReasons((current) => ({
                                        ...current,
                                        [application.customerId]: event.target.value,
                                      }))
                                    }
                                    maxLength={500}
                                    placeholder="Reason required to reject"
                                    className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm"
                                  />
                                  <button
                                    type="button"
                                    disabled={!!actionId}
                                    onClick={() => void review(application, 'REJECTED')}
                                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-800"
                                  >
                                    <X className="h-4 w-4" /> Reject
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
