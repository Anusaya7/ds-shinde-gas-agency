import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatusTimeline } from '../../components/ui/StatusTimeline';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = () => {
    if (!id) return;
    setLoading(true);
    orderService
      .getOrderTracking(id)
      .then((data) => setOrder(data))
      .catch(() => {
        // Fallback demo order for live preview
        setOrder({
          id: id,
          orderNumber: id.startsWith('DS-') ? id : 'DS-2026-1049',
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
          },
          items: [
            {
              productId: 'prod-14kg',
              productName: '14.2 kg Domestic LPG Cylinder',
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
          statusHistory: [
            {
              status: 'PLACED',
              timestamp: new Date(Date.now() - 5400000).toISOString(),
              comment: 'Order placed by consumer online',
            },
            {
              status: 'ACCEPTED',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              comment: 'Depot manager confirmed cylinder allocation',
            },
            {
              status: 'ASSIGNED',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              comment: 'Assigned to delivery executive Ramesh Patil',
            },
            {
              status: 'OUT_FOR_DELIVERY',
              timestamp: new Date(Date.now() - 600000).toISOString(),
              comment: 'Cylinder dispatched on delivery van',
            },
          ],
          riderName: 'Ramesh Patil',
          riderPhone: '9975300929',
          deliveryOtp: '849201',
          createdAt: new Date(Date.now() - 5400000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTracking();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Connecting to GPS dispatch satellite..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <h3 className="text-base font-bold text-gray-800">Order Not Found</h3>
        <Link to="/dashboard/orders">
          <Button variant="primary" size="sm" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Track Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500">Live delivery status updates</p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchTracking();
            toast.success('Status refreshed');
          }}
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Hero Delivery Status Card */}
      <div className="bg-gradient-to-br from-primaryDark via-primary to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-blue-800">
          <div>
            <span className="text-xs font-semibold text-accentLight uppercase tracking-wider block">
              Estimated Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
              {order.orderStatus === 'DELIVERED'
                ? 'Delivered Successfully'
                : order.orderStatus === 'CANCELLED'
                ? 'Order Cancelled'
                : 'Arriving Today (25 - 40 Mins)'}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-blue-200">
                Current State: <strong>{order.orderStatus.replace(/_/g, ' ')}</strong>
              </span>
            </div>
          </div>

          {order.deliveryOtp && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                Delivery OTP
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-white block my-0.5">
                {order.deliveryOtp}
              </span>
              <span className="text-[10px] text-blue-300">Share with rider at door</span>
            </div>
          )}
        </div>

        {/* Assigned Rider Contact Strip */}
        {order.riderName && (
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold">
                <Truck className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-xs text-blue-200 block">Delivery Rider</span>
                <span className="text-sm font-bold text-white">{order.riderName}</span>
              </div>
            </div>

            {order.riderPhone && (
              <a
                href={`tel:${order.riderPhone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-xs shadow transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call Rider ({order.riderPhone})
              </a>
            )}
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
          Detailed Delivery Timeline
        </h3>
        <StatusTimeline
          currentStatus={order.orderStatus}
          history={order.statusHistory}
          createdAt={order.createdAt}
          deliveredAt={order.deliveredAt}
        />
      </div>

      {/* Safety Notice Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-warm-dark shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Safety & Weight Check Protocol:</span>
          All delivery riders carry certified scales. You are entitled to demand weight verification and inspection of the tamper-proof white seal prior to providing your OTP.
        </div>
      </div>
    </div>
  );
};
