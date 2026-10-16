import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bike, MapPin, Phone, ArrowRight, Filter, Search, RotateCcw } from 'lucide-react';
import { riderService } from '../../services/rider.service';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const RiderOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadOrders = () => {
    setLoading(true);
    riderService
      .getAssignedOrders()
      .then((data) => setOrders(data))
      .catch((error: any) => {
        setOrders([]);
        toast.error(error.response?.data?.message || 'Could not load your assigned deliveries.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.orderStatus === filter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.deliveryAddress.area.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Delivery Runs</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Deliveries allocated to your bike or van
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, area..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
        >
          <option value="ALL">All Active Runs</option>
          <option value="ASSIGNED">Assigned (Not Started)</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="ARRIVED">Arrived at Door</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20">
          <Spinner label="Loading assigned orders..." />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-base text-gray-900">
                    #{order.orderNumber}
                  </span>
                  <Badge status={order.orderStatus} />
                </div>
                <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
                </p>
                <p className="text-[11px] text-gray-400">
                  Refill: {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-gray-900">₹{order.totalAmount}</span>
                  <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                    {order.paymentMethod} • {order.paymentStatus}
                  </span>
                </div>

                <Link to={`/rider/orders/${order.id}`}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Workflow
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs">
          No orders match the filter.
        </div>
      )}
    </div>
  );
};
