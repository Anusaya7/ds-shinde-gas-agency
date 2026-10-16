import React, { useState, useEffect } from 'react';
import { PackageCheck, Calendar, IndianRupee, MapPin } from 'lucide-react';
import { riderService } from '../../services/rider.service';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const CompletedDeliveries: React.FC = () => {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    riderService
      .getCompletedDeliveries()
      .then((data) => setCompletedOrders(data))
      .catch((error: any) => {
        setCompletedOrders([]);
        toast.error(error.response?.data?.message || 'Could not load completed deliveries.');
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCollectedToday = completedOrders
    .filter((o) => o.paymentMethod === 'COD')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Completed Deliveries Log</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Log of OTP-authenticated cylinder drop-offs completed by your vehicle
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs">
          <span className="text-gray-500 block">Total COD Collected:</span>
          <span className="text-base font-black text-emerald-700">
            ₹{totalCollectedToday.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner label="Loading completed deliveries..." />
        </div>
      ) : completedOrders.length > 0 ? (
        <div className="space-y-3">
          {completedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Delivered
                  </span>
                  {order.deliveredAt && (
                    <span className="text-[11px] text-gray-400">
                      at {new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-xs text-gray-800">{order.customerName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
                </p>
                <p className="text-[11px] text-gray-400">
                  {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-gray-900">₹{order.totalAmount}</span>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs">
          <PackageCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          No completed drops logged today.
        </div>
      )}
    </div>
  );
};
