import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bike,
  Package,
  CheckCircle,
  Truck,
  IndianRupee,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { riderService, fallbackRiderStats } from '../../services/rider.service';
import { Order, RiderDashboardStats } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

export const RiderDashboard: React.FC = () => {
  const [stats, setStats] = useState<RiderDashboardStats>(fallbackRiderStats);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      riderService.getDashboardStats(),
      riderService.getAssignedOrders(),
    ])
      .then(([statsData, ordersData]) => {
        setStats(statsData);
        setAssignedOrders(
          ordersData.length > 0
            ? ordersData
            : [
                {
                  id: 'ord-1047',
                  orderNumber: 'DS-2026-1047',
                  customerId: 'cust-3',
                  customerName: 'Kavita Joshi',
                  customerPhone: '9890123456',
                  deliveryAddress: {
                    id: 'addr-3',
                    fullName: 'Kavita Joshi',
                    phone: '9890123456',
                    addressLine1: 'Flat 101, Sunshine Apts, 1st Floor',
                    area: 'Central City',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411001',
                    landmark: 'Opposite State Bank',
                  },
                  items: [
                    {
                      productId: 'prod-5kg',
                      productName: '5 kg Domestic Mini Cylinder',
                      size: '5 kg',
                      unitPrice: 360,
                      quantity: 1,
                      subtotal: 360,
                    },
                  ],
                  subtotal: 360,
                  deliveryCharges: 0,
                  taxes: 18,
                  paymentFee: 0,
                  totalAmount: 378,
                  paymentMethod: 'COD',
                  paymentStatus: 'PENDING',
                  orderStatus: 'ASSIGNED',
                  statusHistory: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  id: 'ord-1049',
                  orderNumber: 'DS-2026-1049',
                  customerId: 'cust-1',
                  customerName: 'Rahul Sharma',
                  customerPhone: '9876543210',
                  deliveryAddress: {
                    id: 'addr-1',
                    fullName: 'Rahul Sharma',
                    phone: '9876543210',
                    addressLine1: 'Flat 402, Sai Residency',
                    area: 'Central City',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411001',
                    landmark: 'Near Old Bus Stand',
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
                  orderStatus: 'OUT_FOR_DELIVERY',
                  statusHistory: [],
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ]
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const activeTrip = assignedOrders.find((o) => o.orderStatus === 'OUT_FOR_DELIVERY');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-primaryDark rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-accentLight uppercase tracking-wider block">
            Rider Operational Console
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-0.5">Field Delivery Assistant</h1>
          <p className="text-xs text-blue-200 mt-1">
            Always inspect cylinder collar seals and carry your calibrated hanging scale.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Active on Duty
        </div>
      </div>

      {/* Quick KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Assigned Tasks</span>
          <p className="text-2xl font-black text-primary mt-1">{stats.assignedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Active In-Transit</span>
          <p className="text-2xl font-black text-warm-dark mt-1">{stats.activeDeliveryCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Completed Today</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedTodayCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Cash In Hand (COD)</span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{stats.totalCashCollected.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Active Delivery Card (if any in transit) */}
      {activeTrip && (
        <div className="bg-gradient-to-r from-red-500 to-accent rounded-2xl p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              🚨 Active In-Transit Run
            </span>
            <span className="font-mono font-bold text-sm">#{activeTrip.orderNumber}</span>
          </div>

          <div>
            <h3 className="text-xl font-bold">{activeTrip.customerName}</h3>
            <p className="text-xs text-red-100 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {activeTrip.deliveryAddress.addressLine1},{' '}
              {activeTrip.deliveryAddress.area}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link to={`/rider/orders/${activeTrip.id}`} className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full text-accent font-bold">
                Open Delivery Step-by-Step Flow
              </Button>
            </Link>
            <a
              href={`tel:${activeTrip.customerPhone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold border border-white/30"
            >
              <Phone className="w-3.5 h-3.5" /> Call Customer
            </a>
          </div>
        </div>
      )}

      {/* Assigned Tasks List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Your Assigned Orders</h2>
            <p className="text-xs text-gray-500">Pick up cylinders from depot and deliver</p>
          </div>
          <Link
            to="/rider/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {assignedOrders.length > 0 ? (
            assignedOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <Badge status={order.orderStatus} size="sm" />
                  </div>
                  <p className="font-bold text-xs text-gray-800">
                    {order.customerName} • 📞 {order.customerPhone}
                  </p>
                  <p className="text-xs text-gray-600">
                    📍 {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Cylinder: {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span>
                    <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <Link to={`/rider/orders/${order.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Action Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              No orders currently assigned to you.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
