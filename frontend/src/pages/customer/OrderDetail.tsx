import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Phone,
  Clock,
  Printer,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  User,
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusTimeline } from '../../components/ui/StatusTimeline';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [updatingReminders, setUpdatingReminders] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError('');
    orderService
      .getOrderById(id)
      .then((data) => setOrder(data))
      .catch((error: any) => {
        setOrder(null);
        const message = error.response?.data?.message || 'Could not load this booking.';
        setLoadError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      toast.error('Please specify a cancellation reason');
      return;
    }
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id, cancelReason);
      setOrder(await orderService.getOrderById(order.id));
      setCancelModalOpen(false);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not cancel this booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = async () => {
    if (!order || paying) return;
    setPaying(true);
    try {
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Secure checkout could not be loaded. Please try again later.');
      }
      const gatewayOrder = await paymentService.createRazorpayOrder(order.id);
      const checkout = new window.Razorpay({
        key: gatewayOrder.keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        name: 'DS Shinde Gas',
        description: `Cylinder booking ${order.orderNumber}`,
        order_id: gatewayOrder.razorpayOrderId,
        prefill: { name: order.customerName, contact: order.customerPhone },
        theme: { color: '#10284A' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentService.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setOrder((current) => current ? { ...current, paymentStatus: 'PAID' } : current);
            toast.success('Payment verified. Your receipt is available to print.');
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment confirmation is pending. Check the booking status before retrying.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      checkout.on('payment.failed', async (response: any) => {
        try {
          await paymentService.markPaymentFailed(
            order.id,
            response.error?.metadata?.order_id || gatewayOrder.razorpayOrderId
          );
          setOrder((current) => current ? { ...current, paymentStatus: 'FAILED' } : current);
          toast.error('Payment failed. You can retry from this booking after checking its status.');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Could not confirm the payment result. Check the booking status.');
        } finally {
          setPaying(false);
        }
      });
      checkout.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Could not start secure payment.');
      setPaying(false);
    }
  };

  const toggleReminders = async () => {
    if (!order || updatingReminders) return;
    setUpdatingReminders(true);
    try {
      const updated = await orderService.updateReminderPreference(order.id, !order.remindersEnabled);
      setOrder(updated);
      toast.success(updated.remindersEnabled ? 'In-app reminders enabled.' : 'In-app reminders turned off.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update reminder preferences.');
    } finally {
      setUpdatingReminders(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Fetching order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <h3 className="text-base font-bold text-gray-800">Booking unavailable</h3>
        <p role="alert" className="text-xs text-red-700 mt-1 mb-4">
          {loadError || 'We could not locate the requested booking.'}
        </p>
        <Link to="/dashboard/orders">
          <Button variant="primary" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel = order.orderStatus === 'PLACED' || order.orderStatus === 'AWAITING_REVIEW' || order.orderStatus === 'ACCEPTED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <Badge status={order.orderStatus} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
            <Link to={`/dashboard/orders/${order.id}/track`}>
              <Button variant="primary" size="sm" leftIcon={<Truck className="w-4 h-4" />}>
                View Delivery Status
              </Button>
            </Link>
          )}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-accent border-accent/40 hover:bg-red-50 hover:text-accent"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Delivery OTP Notice (if pending delivery) */}
      {order.deliveryOtp && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-primary text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold">
              🔑
            </div>
            <div>
              <span className="text-xs text-blue-200 uppercase tracking-wider block">
                Doorstep Delivery Passcode (OTP)
              </span>
              <span className="text-2xl font-black tracking-widest font-mono text-white">
                {order.deliveryOtp}
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-200 max-w-xs text-center sm:text-right">
            Provide this code to the delivery rider only after verifying cylinder safety seal and digital weight check.
          </p>
        </div>
      )}

      {/* Main Grid: Status Timeline + Order Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Timeline */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
            Order Status Progression
          </h3>
          <StatusTimeline
            currentStatus={order.orderStatus}
            history={order.statusHistory}
            createdAt={order.createdAt}
            deliveredAt={order.deliveredAt}
          />
        </div>

        {/* Assigned Rider & Delivery Address */}
        <div className="md:col-span-5 space-y-6">
          {/* Rider Card */}
          {order.riderName ? (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                Assigned Delivery Executive
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{order.riderName}</h4>
                  <p className="text-xs text-gray-500">Official Delivery Partner</p>
                </div>
              </div>
              {order.riderPhone && (
                <a
                  href={`tel:${order.riderPhone}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Rider ({order.riderPhone})
                </a>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs text-gray-500 text-center">
              A delivery rider will be assigned once agency accepts the dispatch queue.
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Delivery Destination
            </span>
            <p className="font-bold text-sm text-gray-900">{order.deliveryAddress.fullName}</p>
            <p className="text-gray-600">
              {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
            </p>
            <p className="text-gray-600">
              {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
              {order.deliveryAddress.pincode}
            </p>
            {order.deliveryAddress.landmark && (
              <p className="text-gray-500">Landmark: {order.deliveryAddress.landmark}</p>
            )}
            <p className="text-primary font-semibold pt-1">📞 {order.deliveryAddress.phone}</p>
          </div>
        </div>
      </div>

      {/* Items & Invoice Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          Refill Items & Billing
        </h3>

        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-bold text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  Size: {item.size} • Rate: ₹{item.unitPrice} each × {item.quantity}
                </p>
              </div>

              {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'REJECTED' && (
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">In-app refill reminders</p>
                    <p className="text-sm text-slate-600">
                      {order.remindersEnabled
                        ? 'You have opted in to a reminder every two days during this booking period.'
                        : 'Reminders are off. Enable them if you would like in-app notifications.'}
                    </p>
                  </div>
                  <Button variant="outline" isLoading={updatingReminders} onClick={toggleReminders}>
                    {order.remindersEnabled ? 'Turn reminders off' : 'Turn reminders on'}
                  </Button>
                </div>
              )}
              <span className="font-black text-gray-900">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs border border-gray-100">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery charges</span>
            <span className="font-semibold text-gray-900">₹{order.deliveryCharges}</span>
          </div>
          {order.taxes > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Applicable configured taxes</span>
              <span className="font-semibold text-gray-900">₹{order.taxes}</span>
            </div>
          )}
          {(order.welcomeOfferDiscount || 0) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>New customer welcome offer</span>
              <span className="font-semibold">−₹{order.welcomeOfferDiscount}</span>
            </div>
          )}
          {order.paymentFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Card Processing Fee</span>
              <span className="font-semibold text-gray-900">₹{order.paymentFee}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-extrabold text-gray-900">
            <span>Total Billed</span>
            <span className="text-primary">₹{order.totalAmount}</span>
          </div>
          <div className="flex justify-between text-gray-500 pt-1">
            <span>Payment Mode:</span>
            <span className="font-bold uppercase text-gray-700">
              {order.paymentMethod} ({order.paymentStatus})
            </span>
          </div>
        </div>
      </div>

      {['ACCEPTED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'ARRIVED', 'OTP_PENDING'].includes(order.orderStatus) &&
        order.paymentMethod !== 'COD' &&
        order.paymentStatus !== 'PAID' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-amber-950">Booking approved — payment pending</h3>
                <p className="mt-1 text-sm text-amber-900">
                  Pay ₹{order.totalAmount} using secure Razorpay checkout. Payment details are not stored by DS Shinde Gas.
                </p>
              </div>
              <Button variant="primary" onClick={handlePayment} isLoading={paying} leftIcon={<CreditCard className="h-4 w-4" />}>
                Pay ₹{order.totalAmount}
              </Button>
            </div>
          </div>
        )}

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Cylinder Order"
        description="Are you sure you want to cancel this cylinder booking? Please let us know the reason."
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Booked by mistake, ordered alternative cylinder, travelling..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelOrder}
              isLoading={cancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
