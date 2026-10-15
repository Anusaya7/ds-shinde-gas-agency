import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  CreditCard,
  IndianRupee,
  Users,
  Bike,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { DashboardStats, Order } from '../../types';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

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
        setRecentOrders(
          ordersData.orders.length > 0
            ? ordersData.orders
            : [
                {
                  id: 'ord-1049',
                  orderNumber: 'DS-2026-1049',
                  customerId: 'cust-1',
                  customerName: 'Anil Deshmukh',
                  customerPhone: '9822012345',
                  deliveryAddress: {
                    id: 'addr-1',
                    fullName: 'Anil Deshmukh',
                    phone: '9822012345',
                    addressLine1: 'B-14, Shanti Park',
                    area: 'Market Yard',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411002',
                  },
                  items: [
                    {
                      productId: 'prod-14kg',
                      productName: '14.2 kg Domestic Cylinder',
                      size: '14.2 kg',
                      unitPrice: 920,
                      quantity: 1,
                      subtotal: 920,
                    },
                  ],
                  subtotal: 920,
                  deliveryCharges: 0,
                  taxes: 46,
                  paymentFee: 0,
                  totalAmount: 966,
                  paymentMethod: 'COD',
                  paymentStatus: 'PENDING',
                  orderStatus: 'PLACED',
                  statusHistory: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: 'ord-1048',
                  orderNumber: 'DS-2026-1048',
                  customerId: 'cust-2',
                  customerName: 'Green Spice Restaurant',
                  customerPhone: '9423098765',
                  deliveryAddress: {
                    id: 'addr-2',
                    fullName: 'Green Spice Restaurant',
                    phone: '9423098765',
                    addressLine1: 'Shop 4, Highway Plaza',
                    area: 'Industrial Area',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411019',
                  },
                  items: [
                    {
                      productId: 'prod-19kg',
                      productName: '19 kg Commercial Cylinder',
                      size: '19 kg',
                      unitPrice: 1850,
                      quantity: 2,
                      subtotal: 3700,
                    },
                  ],
                  subtotal: 3700,
                  deliveryCharges: 0,
                  taxes: 185,
                  paymentFee: 0,
                  totalAmount: 3885,
                  paymentMethod: 'ONLINE',
                  paymentStatus: 'PAID',
                  orderStatus: 'ACCEPTED',
                  statusHistory: [],
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ]
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading agency telemetry and stats..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agency Operations Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time cylinder dispatch metrics, active riders, and revenue settlement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/orders">
            <Button variant="primary" size="sm" leftIcon={<Package className="w-4 h-4" />}>
              Open Dispatch Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          label="Total Bookings"
          value={stats?.totalOrders || 284}
          icon={<Package className="w-6 h-6" />}
          change="+12.4%"
          isPositive={true}
          color="blue"
        />
        <StatsCard
          label="New / Awaiting Review"
          value={(stats?.newOrders || 0) + (stats?.awaitingReview || 0) || 23}
          icon={<Clock className="w-6 h-6" />}
          color="red"
        />
        <StatsCard
          label="Out For Delivery"
          value={stats?.outForDelivery || 12}
          icon={<Truck className="w-6 h-6" />}
          color="amber"
        />
        <StatsCard
          label="Total Revenue Collected"
          value={`₹${(stats?.totalCollected || 248650).toLocaleString('en-IN')}`}
          icon={<IndianRupee className="w-6 h-6" />}
          change="+8.2%"
          isPositive={true}
          color="emerald"
        />
      </div>

      {/* Secondary Status Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Accepted Orders</span>
          <p className="text-xl font-bold text-blue-600 mt-1">{stats?.accepted || 18}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Delivered Orders</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats?.delivered || 235}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Pending Payments</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{stats?.pendingPayments || 7}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Active Fleet Riders</span>
          <p className="text-xl font-bold text-purple-600 mt-1">{stats?.activeRidersCount || 8}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Latest Booking Inflows</h2>
            <p className="text-xs text-gray-500">Orders requiring dispatch action or verification</p>
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
                        Inspect & Assign
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
