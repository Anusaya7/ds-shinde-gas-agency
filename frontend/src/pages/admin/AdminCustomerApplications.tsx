import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, FileCheck2, RefreshCw, X } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { applicationService } from '../../services/application.service';
import { Order } from '../../types';
import { Spinner } from '../../components/ui/Spinner';

export const AdminCustomerApplications: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [placed, awaitingReview] = await Promise.all([
        adminService.getOrders({ status: 'ORDER_PLACED', limit: 100 }),
        adminService.getOrders({ status: 'AWAITING_REVIEW', limit: 100 }),
      ]);
      const unique = new Map([...placed.orders, ...awaitingReview.orders].map((order) => [order.id, order]));
      setOrders([...unique.values()]);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not load customer booking applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      [order.orderNumber, order.customerName, order.customerPhone, order.deliveryAddress.addressLine1]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [orders, search]);

  const review = async (order: Order, approve: boolean) => {
    const reason = approve ? undefined : window.prompt('Enter a reason for rejecting this booking:')?.trim();
    if (!approve && (!reason || reason.length < 3)) {
      setError('A rejection reason of at least 3 characters is required.');
      return;
    }
    setActionId(order.id);
    setError('');
    setMessage('');
    try {
      if (approve) {
        await adminService.acceptOrder(order.id);
      } else {
        await adminService.rejectOrder(order.id, reason!);
      }
      setMessage(`Booking ${order.orderNumber} was ${approve ? 'approved' : 'rejected'}. The customer was notified.`);
      await refresh();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not review this booking.');
    } finally {
      setActionId('');
    }
  };

  const openCertificate = async (customerId: string) => {
    setActionId(customerId);
    setError('');
    try {
      const blob = await applicationService.downloadCustomerUdyamDocument(customerId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not retrieve the protected certificate.');
    } finally {
      setActionId('');
    }
  };

  const openAadhaar = async (customerId: string) => {
    setActionId(customerId);
    setError('');
    try {
      const blob = await applicationService.downloadCustomerAadhaarDocument(customerId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not retrieve the protected Aadhaar document.');
    } finally {
      setActionId('');
    }
  };

  const deleteCertificate = async (customerId: string) => {
    if (!window.confirm('Permanently delete this customer’s stored business certificate?')) return;
    setActionId(customerId);
    setError('');
    try {
      await applicationService.deleteCustomerDocuments(customerId);
      setMessage('Customer document permanently deleted.');
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
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-orange-600">Customer review queue</p>
          <h1 className="mt-2 text-2xl font-black text-[#10284A]">Customer booking applications</h1>
          <p className="mt-1 text-sm text-slate-600">Review newly submitted customer details before dispatch approval.</p>
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

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <label className="block">
        <span className="sr-only">Search customer applications</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by booking, customer, phone or address"
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
        />
      </label>

      {loading ? (
        <div className="py-14"><Spinner label="Loading customer applications..." /></div>
      ) : visibleOrders.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No customer applications need review.</p>
      ) : (
        <ul className="space-y-4">
          {visibleOrders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-[#10284A]">{order.customerName}</h2>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{order.orderStatus}</span>
                    <span className="text-xs text-slate-500">#{order.orderNumber}</span>
                  </div>
                  <p className="text-sm text-slate-600">{order.customerPhone} · {order.customerEmail || 'Email not provided'}</p>
                  <p className="text-sm text-slate-700">
                    {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}, {order.deliveryAddress.city} {order.deliveryAddress.pincode}
                  </p>
                  <p className="text-sm text-slate-700">
                    {order.items.map((item) => `${item.size} × ${item.quantity}`).join(', ')} · {order.bookingDurationDays || 1} day(s)
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    Payable ₹{order.totalAmount} · {order.paymentMethod} / {order.paymentStatus}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-[#10284A]" to={`/admin/orders/${order.id}`}>
                    View booking
                  </Link>
                  <button
                    type="button"
                    onClick={() => void openCertificate(order.customerId)}
                    disabled={!!actionId}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <FileCheck2 className="h-4 w-4" /> Udyam file
                  </button>
                  <button
                    type="button"
                    onClick={() => void openAadhaar(order.customerId)}
                    disabled={!!actionId}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <FileCheck2 className="h-4 w-4" /> Aadhaar file
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCertificate(order.customerId)}
                    disabled={!!actionId}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> Delete file
                  </button>
                  <button
                    type="button"
                    onClick={() => void review(order, true)}
                    disabled={!!actionId}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-700 px-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void review(order, false)}
                    disabled={!!actionId}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-red-700 px-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
