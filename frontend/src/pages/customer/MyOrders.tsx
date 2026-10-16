import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight, Clock, Truck, Flame, Filter } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    orderService
      .getOrders()
      .then((res) => {
        setOrders(res.orders);
      })
      .catch((error: any) => {
        setOrders([]);
        toast.error(error.response?.data?.message || 'Could not load your bookings.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Cylinder Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Track current deliveries and view previous cylinder refill invoices
          </p>
        </div>
        <Link to="/dashboard/orders/new">
          <Button variant="accent" size="sm" leftIcon={<Flame className="w-4 h-4" />}>
            Book New Cylinder
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or product..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="AWAITING_REVIEW">Pending Approval</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16">
          <Spinner label="Loading your order history..." />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-gray-900">
                    #{order.orderNumber}
                  </span>
                  <Badge status={order.orderStatus} />
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Items: </span>
                  {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                </div>

                <div className="text-xs text-gray-500">
                  <span>Deliver to: </span>
                  {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
                </div>
                <div className="text-xs text-gray-500">
                  <span>Booking duration: </span>
                  {order.bookingDurationDays ? `${order.bookingDurationDays} days` : 'Not specified'}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-left md:text-right">
                  <span className="text-lg font-black text-gray-900">₹{order.totalAmount}</span>
                  <span className="block text-[11px] text-gray-400 capitalize">
                    {order.paymentMethod} • {order.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                    <Link to={`/dashboard/orders/${order.id}/track`}>
                      <Button variant="outline" size="sm" leftIcon={<Truck className="w-3.5 h-3.5" />}>
                        Track
                      </Button>
                    </Link>
                  )}
                  <Link to={`/dashboard/orders/${order.id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No orders found</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            There are no orders matching your current filter criteria.
          </p>
          <Link to="/dashboard/orders/new">
            <Button variant="accent" size="sm">
              Book a Cylinder Now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
