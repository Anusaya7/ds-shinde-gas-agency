import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  CreditCard,
  Flame,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { ReportItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}-01`;
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    adminService
      .getReports({ startDate, endDate })
      .then((data) => {
        if (!cancelled) setReports(Array.isArray(data) ? data : []);
      })
      .catch((error: any) => {
        if (cancelled) return;
        setReports([]);
        const message = error.response?.data?.message || 'Could not load report data.';
        setLoadError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const rows = Array.isArray(reports) ? reports : [];
  const totalOrders = rows.reduce((acc, r) => acc + (Number(r.ordersCount) || 0), 0);
  const totalDelivered = rows.reduce((acc, r) => acc + (Number(r.deliveredCount) || 0), 0);
  const totalRevenue = rows.reduce((acc, r) => acc + (Number(r.totalRevenue) || 0), 0);

  // Aggregate breakdown
  const aggregateCylinders: Record<string, number> = {};
  const aggregatePayments: Record<string, number> = {};

  rows.forEach((r) => {
    Object.entries(r.cylinderBreakdown || {}).forEach(([k, v]) => {
      aggregateCylinders[k] = (aggregateCylinders[k] || 0) + v;
    });
    Object.entries(r.paymentBreakdown || {}).forEach(([k, v]) => {
      aggregatePayments[k] = (aggregatePayments[k] || 0) + v;
    });
  });

  const exportCSV = () => {
    if (loadError) {
      toast.error('Reports are unavailable; no CSV was created.');
      return;
    }
    const headers = ['Date', 'Total Orders', 'Delivered Orders', 'Revenue (INR)'];
    const csvRows = rows.map((r) => [r.date, r.ordersCount, r.deliveredCount, r.totalRevenue]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DS_Shinde_Gas_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully');
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading revenue and operations reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError} Adjust the date range or refresh the page to try again.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Revenue & Operations Reports</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Audit cylinder consumption volumes, payment reconciliations, and daily fulfillments
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={exportCSV} leftIcon={<Download className="w-4 h-4" />}>
          Export CSV Report
        </Button>
      </div>

      {/* Date Range Picker Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold uppercase text-gray-600">Reporting Interval:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Orders In Interval</span>
          <p className="text-3xl font-black text-primary mt-1">{totalOrders}</p>
          <span className="text-xs text-emerald-600 font-medium">
            {totalDelivered} successful handovers
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Gross Refill Revenue</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-gray-500">Collected via online & COD</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Delivery Success Rate</span>
          <p className="text-3xl font-black text-accent mt-1">
            {totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 100}%
          </p>
          <span className="text-xs text-blue-600 font-medium">OTP Authenticated drops</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cylinders Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
            <Flame className="w-4 h-4 text-accent" /> Refill Volume by Cylinder Weight
          </h3>
          <div className="space-y-3">
            {Object.keys(aggregateCylinders).length === 0 ? (
              <p className="text-sm text-gray-500">No cylinder bookings in this interval.</p>
            ) : (
              Object.entries(aggregateCylinders).map(([size, count]) => (
              <div key={size} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{size} Cylinder</span>
                  <span>{count} units</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${(count / (totalOrders || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Payments Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payment Method Reconciliations
          </h3>
          <div className="space-y-3">
            {Object.keys(aggregatePayments).length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded in this interval.</p>
            ) : (
              Object.entries(aggregatePayments).map(([method, count]) => (
              <div key={method} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{method}</span>
                  <span>{count} orders</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{
                      width: `${(count / (totalOrders || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Daily Performance Audit Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Booked Orders</th>
                <th className="px-5 py-3">Delivered</th>
                <th className="px-5 py-3">Gross Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                    No orders in this date range yet. New bookings will appear here automatically.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-semibold text-gray-900">{r.date}</td>
                  <td className="px-5 py-3 text-gray-800">{r.ordersCount} orders</td>
                  <td className="px-5 py-3 text-emerald-600 font-semibold">
                    {r.deliveredCount} drops
                  </td>
                  <td className="px-5 py-3 font-black text-gray-900">
                    ₹{Number(r.totalRevenue || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
