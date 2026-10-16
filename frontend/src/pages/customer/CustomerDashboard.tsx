import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ShoppingCart,
  Package,
  MapPin,
  User,
  Clock,
  ArrowRight,
  Phone,
  ShieldCheck,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrders({ limit: 5 })
      .then((res) => {
        setRecentOrders(res.orders);
      })
      .catch((error: any) => {
        setRecentOrders([]);
        toast.error(error.response?.data?.message || 'Could not load your bookings.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeOrder = recentOrders.find(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'REJECTED'
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primaryDark via-primary to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-accentLight uppercase tracking-wider block mb-1">
            Official Consumer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Customer'}!
          </h1>
          <p className="text-sm text-blue-200 mt-1 max-w-xl">
            Welcome to your LPG management portal. Easily book new gas refills, monitor real-time delivery trucks, and manage your delivery addresses.
          </p>
        </div>

        <Link to="/dashboard/orders/new" className="shrink-0">
          <Button
            variant="accent"
            size="lg"
            className="font-bold shadow-xl hover:scale-105"
            leftIcon={<Flame className="w-5 h-5" />}
          >
            Book New Cylinder
          </Button>
        </Link>
      </div>

      {/* Active Order Highlight Card (if any) */}
      {activeOrder && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warm text-white flex items-center justify-center animate-bounce">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-warm-dark uppercase tracking-wider block">
                  {activeOrder.orderStatus === 'PLACED' || activeOrder.orderStatus === 'AWAITING_REVIEW'
                    ? 'Booking Status'
                    : 'Active Delivery'}
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  Order #{activeOrder.orderNumber}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={activeOrder.orderStatus} />
              <Link to={`/dashboard/orders/${activeOrder.id}/track`}>
                <Button variant="primary" size="sm">
                  View Status
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 block font-medium">Refill Item</span>
              <span className="font-bold text-gray-900">
                {activeOrder.items[0]?.productName} ({activeOrder.items[0]?.quantity} qty)
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Booking duration</span>
              <span className="font-bold text-gray-900">
                {activeOrder.bookingDurationDays ? `${activeOrder.bookingDurationDays} days` : 'As confirmed by the agency'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Delivery Executive</span>
              <span className="font-bold text-gray-900">
                {activeOrder.riderName
                  ? `${activeOrder.riderName} (${activeOrder.riderPhone})`
                  : activeOrder.orderStatus === 'PLACED' || activeOrder.orderStatus === 'AWAITING_REVIEW'
                    ? 'Assigned after agency approval'
                    : 'Rider assignment pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/dashboard/orders/new"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-accent transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Book Cylinder</h3>
          <p className="text-xs text-gray-500 mt-1">Order domestic or commercial refill</p>
        </Link>

        <Link
          to="/dashboard/orders"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">My Orders</h3>
          <p className="text-xs text-gray-500 mt-1">View invoice receipts & history</p>
        </Link>

        <Link
          to="/dashboard/addresses"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Saved Addresses</h3>
          <p className="text-xs text-gray-500 mt-1">Manage delivery drop points</p>
        </Link>

        <Link
          to="/dashboard/profile"
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Profile & KYC</h3>
          <p className="text-xs text-gray-500 mt-1">Update contact details & phone</p>
        </Link>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Cylinder Bookings</h2>
            <p className="text-xs text-gray-500">History of your latest refill requests</p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12">
            <Spinner label="Loading your orders..." />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                    <Badge status={order.orderStatus} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-gray-900">₹{order.totalAmount}</span>
                    <span className="block text-[11px] text-gray-400 capitalize">{order.paymentMethod}</span>
                  </div>
                  <Link to={`/dashboard/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-700">No Orders Yet</h4>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              You have not placed any cylinder refill requests yet.
            </p>
            <Link to="/dashboard/orders/new">
              <Button variant="accent" size="sm">
                Book Your First Cylinder
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Support Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-primary text-base">Direct Agency Dispatch Help</h4>
            <p className="text-xs text-gray-600">
              For immediate delivery requests, cylinder swaps, or billing questions, call our helpline.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:9511760208"
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primaryDark transition-colors"
          >
            Call 9511760208
          </a>
          <a
            href="tel:9975300929"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Call 9975300929
          </a>
        </div>
      </div>
    </div>
  );
};
