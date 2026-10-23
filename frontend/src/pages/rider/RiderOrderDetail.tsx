import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  Phone,
  Mail,
  CheckCircle2,
  Truck,
  Home,
  KeyRound,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { riderService } from '../../services/rider.service';
import { paymentService } from '../../services/payment.service';
import { Order, PaymentMethod } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const RiderOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Workflow states
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [amountCollected, setAmountCollected] = useState<number>(0);
  const [collectionMethod, setCollectionMethod] = useState<PaymentMethod>('COD');
  const [transactionId, setTransactionId] = useState('');
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const loadOrder = async () => {
    if (!id) return null;
    const data = await riderService.getOrderDetail(id);
    setOrder(data);
    setAmountCollected(data.totalAmount);
    setCollectionMethod(data.paymentMethod || 'COD');
    if (data.isOtpVerified) setOtpVerified(true);
    return data;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadOrder()
      .catch((error: any) => {
        setOrder(null);
        toast.error(error.response?.data?.message || 'Could not load this assigned delivery.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Step 2: Accept Assignment
  const handleAcceptAssignment = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await riderService.acceptAssignment(order.id);
      await loadOrder();
      toast.success('Assignment accepted. Next: start the trip to the customer.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not accept this delivery assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Step 5: Start Delivery (Out for Delivery)
  const handleStartDelivery = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await riderService.startDelivery(order.id);
      await loadOrder();
      toast.success('Trip started. Next: mark arrived when you reach the customer.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update delivery status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Step 6: Mark Arrived at Doorstep
  const handleMarkArrived = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await riderService.markArrived(order.id);
      await loadOrder();
      toast.success('Arrived. Next: send or enter the customer handover OTP.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update delivery status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Step 7: Send OTP to Customer
  const handleSendOtp = async () => {
    if (!order) return;
    setOtpSending(true);
    try {
      const res = await riderService.sendDeliveryOtp(order.id);
      toast.success(res.message || 'OTP sent to the customer email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not send delivery OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 9: Verify OTP
  const handleVerifyOtp = async () => {
    if (!order || !otpInput.trim()) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await riderService.verifyDeliveryOtp(order.id, otpInput.trim());
      if (res.verified) {
        setOtpVerified(true);
        toast.success(res.message || 'Customer OTP verified. You can complete the delivery.');
      } else {
        toast.error(res.message || 'Invalid OTP code. Please verify with customer.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not verify delivery OTP.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleRazorpayCollect = async () => {
    if (!order) return;
    setRazorpayLoading(true);
    try {
      const result = await paymentService.openCheckout(order);
      if (result === 'paid') {
        await loadOrder();
        toast.success('Razorpay payment verified. You can now mark the order delivered.');
      } else if (result === 'failed') {
        toast.error('Razorpay payment failed. Ask the customer to retry, or collect cash.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Could not open Razorpay checkout.');
    } finally {
      setRazorpayLoading(false);
    }
  };

  // Step 12: Final Mark as Delivered
  const handleCompleteDelivery = async () => {
    if (!order) return;
    if (!otpVerified) {
      toast.error('Cannot complete delivery without verifying OTP first');
      return;
    }
    if (order.paymentStatus !== 'PAID' && amountCollected !== order.totalAmount) {
      toast.error(`Confirm collection of the exact payable amount: ₹${order.totalAmount}.`);
      return;
    }
    if (order.paymentStatus !== 'PAID' && collectionMethod !== 'COD' && transactionId.trim().length < 4) {
      toast.error('Enter the UPI / online / card transaction reference.');
      return;
    }

    setActionLoading(true);
    try {
      if (order.paymentStatus !== 'PAID') {
        await riderService.collectPayment(order.id, {
          amount: amountCollected,
          method: collectionMethod,
          transactionId: collectionMethod === 'COD' ? undefined : transactionId.trim(),
        });
      }
      const updated = await riderService.completeDelivery(order.id);
      setOrder(updated);
      toast.success('Order Marked as DELIVERED! Great job.');
      navigate('/rider/completed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not complete this delivery.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading delivery route checklist..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <h3 className="font-bold text-gray-800">Order not found</h3>
        <Button variant="primary" size="sm" onClick={() => navigate('/rider/orders')} className="mt-4">
          Back to Assigned Runs
        </Button>
      </div>
    );
  }

  const mapsQuery = encodeURIComponent(
    `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city}`
  );
  const mapsUrl = order.deliveryAddress.mapLink || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // Current workflow status checks
  const isAssigned = order.orderStatus === 'ASSIGNED';
  const riderAcceptedAssignment = (order.statusHistory || []).some((entry) =>
    /accepted delivery assignment/i.test(String(entry.comment || ''))
  );
  const isReadyToStartTrip = isAssigned && riderAcceptedAssignment;
  const isOutForDelivery = order.orderStatus === 'OUT_FOR_DELIVERY';
  const isArrived = order.orderStatus === 'ARRIVED';
  const isDelivered = order.orderStatus === 'DELIVERED';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rider/orders')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <Badge status={order.orderStatus} />
            </div>
            <p className="text-xs text-gray-500">Step-by-Step Delivery Handover Workflow</p>
          </div>
        </div>
      </div>

      {/* STEP 1: ORDER DETAILS OVERVIEW */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-sm text-gray-900">1. Customer & Delivery Destination</h3>
          <span className="text-xs font-black text-gray-900">₹{order.totalAmount}</span>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-base font-bold text-gray-900">{order.customerName}</p>
          {order.customerPhone && (
            <p className="font-semibold text-gray-800">📞 {order.customerPhone}</p>
          )}
          {order.customerEmail ? (
            <p className="font-semibold text-gray-800">✉️ {order.customerEmail}</p>
          ) : (
            <p className="text-gray-500">✉️ Email not on this booking</p>
          )}
          <p className="text-gray-600 leading-relaxed">
            {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area},{' '}
            {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
          </p>
          {order.deliveryAddress.landmark && (
            <p className="text-gray-500 font-medium">
              Landmark: {order.deliveryAddress.landmark}
            </p>
          )}

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-gray-800 space-y-1">
            <span className="font-bold block text-[11px] uppercase tracking-wider text-primary">
              Cylinder Consignment:
            </span>
            {order.items.map((i, idx) => (
              <p key={idx} className="font-semibold">
                • {i.productName} ({i.quantity} units) @ ₹{i.unitPrice} each
              </p>
            ))}
            <div className="pt-1 flex justify-between font-bold text-gray-900">
              <span>Payment Mode:</span>
              <span className="text-accent uppercase">
                {order.paymentMethod} ({order.paymentStatus})
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Navigate, Call, Email */}
        <div className={`grid gap-3 pt-2 ${order.customerEmail ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-primary border border-blue-200 font-bold text-xs hover:bg-blue-100 transition-colors"
          >
            <Navigation className="w-4 h-4 text-primary" /> Navigate on Maps
          </a>

          <a
            href={`tel:${order.customerPhone}`}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-600" /> Call Customer
          </a>
          {order.customerEmail && (
            <a
              href={`mailto:${order.customerEmail}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-600" /> Email Customer
            </a>
          )}
        </div>
      </div>

      {/* STEP-BY-STEP PROGRESSION PANEL */}

      {/* Step 2: Accept Assignment */}
      {isAssigned && !riderAcceptedAssignment && (
        <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Step 2: Accept Assignment</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Confirm that you have picked up this cylinder from the depot and are preparing for delivery.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold mt-2"
            onClick={handleAcceptAssignment}
            isLoading={actionLoading}
          >
            Accept Assignment & Load Cylinder
          </Button>
        </div>
      )}

      {/* Step 3: Start Delivery */}
      {isReadyToStartTrip && (
        <div className="bg-white rounded-2xl p-6 border-2 border-warm shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-warm-dark flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Step 3: Start Delivery Transit</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Cylinder is loaded. Start the trip now. The customer will be notified that you are out for delivery.
          </p>
          <Button
            variant="accent"
            size="lg"
            className="w-full font-bold mt-2 shadow"
            onClick={handleStartDelivery}
            isLoading={actionLoading}
            leftIcon={<Truck className="w-5 h-5" />}
          >
            Start Trip (Out for Delivery)
          </Button>
        </div>
      )}

      {/* Step 6: Mark Arrived */}
      {isOutForDelivery && (
        <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center mx-auto">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900">Step 4: Arrived at Customer Doorstep</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click once you have parked outside customer premises and reached the door with cylinder.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold mt-2 shadow"
            onClick={handleMarkArrived}
            isLoading={actionLoading}
            leftIcon={<Home className="w-5 h-5" />}
          >
            I Have Arrived at Doorstep
          </Button>
        </div>
      )}

      {/* Step 7, 8, 9: Customer OTP Handover Verification */}
      {(isArrived || otpVerified) && (
        <div className="bg-white rounded-2xl p-6 border-2 border-accent shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-sm text-gray-900">
                Step 5: Verify 6-Digit Delivery OTP
              </h3>
            </div>
            {otpVerified ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>

          {!otpVerified ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 leading-relaxed">
                Send the 6-digit OTP to the customer email, then enter the code they share with you. You cannot mark delivery complete without this OTP.
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full font-bold"
                onClick={handleSendOtp}
                isLoading={otpSending}
                leftIcon={<Mail className="w-4 h-4" />}
              >
                {otpSending
                  ? 'Sending OTP email...'
                  : order.customerEmail
                    ? `Send OTP to ${order.customerEmail}`
                    : 'Send OTP to customer'}
              </Button>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter 6-digit customer OTP"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono font-bold tracking-widest text-lg"
                />
                <Button
                  variant="primary"
                  onClick={handleVerifyOtp}
                  isLoading={otpVerifying}
                  disabled={otpInput.length < 4}
                >
                  Verify OTP
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Delivery OTP successfully validated for consumer +91 {order.customerPhone}.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Step 10, 11, 12: Payment Collection & Final Mark as Delivered */}
      {otpVerified && !isDelivered && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-gray-900">
              Step 6: Confirm Handover & Complete Delivery
            </h3>
          </div>

          {order.paymentStatus !== 'PAID' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Amount due from customer</span>
                <span className="text-xl font-black text-gray-900">₹{order.totalAmount}</span>
              </div>
              <p className="text-xs text-gray-600">
                Choose how the customer is paying now. Preferred at booking: {order.paymentMethod.replace('_', ' ')}.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: 'COD' as const, label: 'Cash', hint: 'Collect physical cash', icon: Banknote },
                    { id: 'UPI_QR' as const, label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: QrCode },
                    { id: 'ONLINE' as const, label: 'Online', hint: 'Net banking / UPI app', icon: Smartphone },
                    { id: 'CARD' as const, label: 'Card', hint: 'Debit or credit card', icon: CreditCard },
                  ] as const
                ).map((option) => {
                  const selected = collectionMethod === option.id;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCollectionMethod(option.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`mb-2 h-5 w-5 ${selected ? 'text-emerald-700' : 'text-gray-500'}`} />
                      <p className="text-sm font-bold text-gray-900">{option.label}</p>
                      <p className="text-[11px] text-gray-500">{option.hint}</p>
                    </button>
                  );
                })}
              </div>

              <Input
                label="Amount collected (₹)"
                type="number"
                required
                value={amountCollected}
                onChange={(e) => setAmountCollected(Number(e.target.value))}
              />

              {collectionMethod !== 'COD' && (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    onClick={handleRazorpayCollect}
                    isLoading={razorpayLoading}
                    leftIcon={<CreditCard className="h-4 w-4" />}
                  >
                    Collect ₹{order.totalAmount} with Razorpay
                  </Button>
                  <Input
                    label={
                      collectionMethod === 'CARD'
                        ? 'Card transaction / approval ID (if paid outside Razorpay)'
                        : 'UPI / online transaction reference (if paid outside Razorpay)'
                    }
                    placeholder="Only needed if you did not use Razorpay checkout"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </>
              )}

              <p className="text-xs text-amber-900">
                {collectionMethod === 'COD'
                  ? 'Count the cash and confirm it matches the amount due.'
                  : 'Open Razorpay so the customer can pay by UPI, card, or net banking on this phone. Use the reference field only if they already paid in another app.'}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold">
              ✓ Payment already received (₹{order.totalAmount} · {order.paymentMethod.replace('_', ' ')}). No further collection needed.
            </div>
          )}

          <Button
            variant="accent"
            size="lg"
            className="w-full font-bold shadow-xl"
            onClick={handleCompleteDelivery}
            isLoading={actionLoading}
            leftIcon={<CheckCircle2 className="w-5 h-5" />}
          >
            Mark Order as DELIVERED
          </Button>
        </div>
      )}

      {/* DELIVERED SUCCESS STATE */}
      {isDelivered && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-lg text-emerald-950">Delivered Successfully!</h3>
          <p className="text-xs text-emerald-800">
            This cylinder order has been verified and settled.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/rider/orders')}
            className="mt-2"
          >
            Return to Active List
          </Button>
        </div>
      )}
    </div>
  );
};
