import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  IndianRupee,
  ArrowRight,
  FileCheck2,
  Mail,
  Layers,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DashboardStats, Order } from '../../types';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getOrders({ limit: 6 }),
    ])
      .then(([statsData, ordersData]) => {
        setStats(statsData);
        setRecentOrders(ordersData.orders);
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || 'Could not load current dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading home..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Home</h1>
          <p className="mt-0.5 text-sm text-gray-500">See bookings that need action, then open the right page.</p>
        </div>
        <Link to="/admin/orders">
          <Button variant="primary" size="sm" leftIcon={<Package className="w-4 h-4" />}>
            Open orders
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/orders" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#10284A]">
          <Package className="h-5 w-5 text-[#10284A]" />
          <p className="mt-3 text-sm font-bold text-[#10284A]">Orders</p>
          <p className="mt-1 text-xs text-slate-500">Accept, assign, and track deliveries</p>
        </Link>
        <Link to="/admin/customer-applications" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#10284A]">
          <FileCheck2 className="h-5 w-5 text-[#10284A]" />
          <p className="mt-3 text-sm font-bold text-[#10284A]">Customer KYC</p>
          <p className="mt-1 text-xs text-slate-500">Approve Aadhaar and business papers</p>
        </Link>
        <Link to="/admin/enquiries" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#10284A]">
          <Mail className="h-5 w-5 text-[#10284A]" />
          <p className="mt-3 text-sm font-bold text-[#10284A]">Messages</p>
          <p className="mt-1 text-xs text-slate-500">Read contact form enquiries</p>
        </Link>
        <Link to="/admin/products" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#10284A]">
          <Layers className="h-5 w-5 text-[#10284A]" />
          <p className="mt-3 text-sm font-bold text-[#10284A]">Prices</p>
          <p className="mt-1 text-xs text-slate-500">Change cylinder rates and delivery fees</p>
        </Link>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          label="Total Bookings"
          value={stats?.totalOrders ?? 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          label="Waiting for review"
          value={(stats?.newOrders ?? 0) + (stats?.awaitingReview ?? 0)}
          icon={<Clock className="w-6 h-6" />}
          color="red"
        />
        <StatsCard
          label="Out for delivery"
          value={stats?.outForDelivery ?? 0}
          icon={<Truck className="w-6 h-6" />}
          color="amber"
        />
        <StatsCard
          label="Money collected"
          value={`₹${(stats?.totalCollected ?? 0).toLocaleString('en-IN')}`}
          icon={<IndianRupee className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Secondary Status Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400">Accepted</span>
          <p className="text-xl font-bold text-blue-600 mt-1">{stats?.accepted ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400">Delivered</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats?.delivered ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400">Payments due</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{stats?.pendingPayments ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-gray-400">Riders ready</span>
          <p className="text-xl font-bold text-purple-600 mt-1">{stats?.activeRidersCount ?? 0}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Latest orders</h2>
            <p className="text-xs text-gray-500">Newest bookings from customers</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Cylinder Item</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                    No bookings yet. New customer orders will appear here.
                  </td>
                </tr>
              ) : null}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                    #{order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-[11px] text-gray-400">📞 {order.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">₹{order.totalAmount}</td>
                  <td className="px-5 py-3.5">
                    <span className="uppercase font-semibold text-gray-700 block">
                      {order.paymentMethod}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize">{order.paymentStatus}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={order.orderStatus} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button variant="secondary" size="sm">
                        Open
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
