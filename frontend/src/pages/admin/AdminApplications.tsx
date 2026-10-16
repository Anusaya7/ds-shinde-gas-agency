import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Download, FileCheck2, RefreshCw, Trash2, X } from 'lucide-react';
import {
  applicationService,
  RiderApplication,
  RiderApplicationStatus,
} from '../../services/application.service';

const documentLabels = [
  { key: 'rcDocument', label: 'RC book' },
  { key: 'frontPhoto', label: 'Bike front' },
  { key: 'backPhoto', label: 'Bike back' },
  { key: 'selfie', label: 'Rider selfie' },
];

const statusLabels: Record<RiderApplicationStatus, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<RiderApplication[]>([]);
  const [filter, setFilter] = useState<'ALL' | RiderApplicationStatus>('ALL');
  const [search, setSearch] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await applicationService.listRiderApplications(
        filter === 'ALL' ? undefined : filter
      );
      setApplications(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load rider applications.');
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
      [application.fullName, application.phone, application.email, application.vehicleNumber]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term))
    );
  }, [applications, search]);

  const review = async (application: RiderApplication, status: 'APPROVED' | 'REJECTED') => {
    const reason = rejectionReasons[application.id]?.trim();
    if (status === 'REJECTED' && (!reason || reason.length < 3)) {
      setError('Add a rejection reason of at least 3 characters before rejecting.');
      return;
    }
    setActionId(application.id);
    setError('');
    setSuccess('');
    try {
      await applicationService.reviewRiderApplication(application.id, status, reason);
      setSuccess(`${application.fullName}'s application was ${status.toLowerCase()}.`);
      await refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update this application.');
    } finally {
      setActionId('');
    }
  };

  const viewDocument = async (application: RiderApplication, document: string) => {
    setActionId(application.id);
    setError('');
    try {
      const blob = await applicationService.downloadRiderDocument(application.id, document);
      const url = URL.createObjectURL(blob);
      const link = documentCreateLink(url);
      link.rel = 'noopener noreferrer';
      link.target = '_blank';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not retrieve this protected document.');
    } finally {
      setActionId('');
    }
  };

  const deleteDocuments = async (application: RiderApplication) => {
    if (!window.confirm(`Permanently delete all documents attached to ${application.fullName}'s application?`)) {
      return;
    }
    setActionId(application.id);
    setError('');
    setSuccess('');
    try {
      await applicationService.deleteRiderDocuments(application.id);
      setSuccess('Application documents permanently deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete application documents.');
    } finally {
      setActionId('');
    }
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-orange-600">Access-controlled review</p>
          <h1 className="mt-2 text-2xl font-black text-[#10284A]">Rider applications</h1>
          <p className="mt-1 text-sm text-slate-600">Review applicant details and private documents before granting delivery access.</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#10284A] hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="application-search">Search rider applications</label>
          <input
            id="application-search"
            type="search"
            placeholder="Search by rider, contact or vehicle number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
          />
          <label>
            <span className="sr-only">Filter applications by status</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'ALL' | RiderApplicationStatus)}
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading applications…</p>
        ) : visibleApplications.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No applications match this filter.</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {visibleApplications.map((application) => (
              <li key={application.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#10284A]">{application.fullName}</h2>
                    <p className="mt-1 text-sm text-slate-600">{application.phone}{application.email ? ` · ${application.email}` : ''}</p>
                    <p className="mt-1 text-sm text-slate-700">Vehicle: <strong>{application.vehicleNumber}</strong></p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{application.address}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      application.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800'
                        : application.status === 'REJECTED'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {statusLabels[application.status]}
                  </span>
                </div>

                {application.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                    Rejection reason: {application.rejectionReason}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {documentLabels.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => void viewDocument(application, key)}
                      disabled={actionId === application.id}
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-[#10284A] hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>

                {application.status === 'PENDING' && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void review(application, 'APPROVED')}
                      disabled={actionId === application.id}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> Approve rider
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                      <label className="sr-only" htmlFor={`rejection-${application.id}`}>Rejection reason</label>
                      <input
                        id={`rejection-${application.id}`}
                        value={rejectionReasons[application.id] || ''}
                        onChange={(event) =>
                          setRejectionReasons((current) => ({
                            ...current,
                            [application.id]: event.target.value,
                          }))
                        }
                        maxLength={500}
                        placeholder="Reason required to reject"
                        className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm focus:border-[#10284A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void review(application, 'REJECTED')}
                        disabled={actionId === application.id}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-800 hover:bg-red-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {application.status !== 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => void deleteDocuments(application)}
                    disabled={actionId === application.id}
                    className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete documents securely
                  </button>
                )}
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  Application received {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

function documentCreateLink(url: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = url;
  return link;
}
