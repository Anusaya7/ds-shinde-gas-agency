import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Bike,
  ShieldAlert,
  Printer,
  Phone,
  MapPin,
  Clock,
  User,
  CreditCard,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Order, Rider } from '../../types';
import { canAssignDeliveryRider, needsAdminReview } from '../../utils/order';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusTimeline } from '../../components/ui/StatusTimeline';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return null;
    const [orderData, ridersData] = await Promise.all([
      adminService.getOrderById(id),
      adminService.getRiders(),
    ]);
    setOrder(orderData);
    setRiders(ridersData);
    if (ridersData.length > 0) {
      setSelectedRiderId((current) => current || ridersData[0].id);
    }
    return { orderData, ridersData };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadOrder()
      .catch((error: any) => {
        setOrder(null);
        setRiders([]);
        setSelectedRiderId('');
        toast.error(error.response?.data?.message || 'Could not load this order.');
      })
      .finally(() => setLoading(false));
  }, [id, loadOrder]);

  const handleAccept = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await adminService.acceptOrder(order.id);
      const refreshed = await loadOrder();
      toast.success('Order approved. Next: assign a delivery rider to start dispatch.');
      if (refreshed?.ridersData.length) {
        setAssignModalOpen(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not approve this order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRider = async () => {
    if (!order || !selectedRiderId) return;
    setActionLoading(true);
    try {
      const riderObj = riders.find((r) => r.id === selectedRiderId);
      await adminService.assignRider(order.id, selectedRiderId);
      await loadOrder();
      setAssignModalOpen(false);
      toast.success(`Assigned to ${riderObj?.name}. Rider can now pick up and start delivery.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not assign this rider.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!order || !reason.trim()) {
      toast.error('Rejection reason required');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectOrder(order.id, reason);
      await loadOrder();
      setRejectModalOpen(false);
      toast.success('Order rejected');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not reject this order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !reason.trim()) {
      toast.error('Cancellation reason required');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.cancelOrder(order.id, reason);
      await loadOrder();
      setCancelModalOpen(false);
      toast.success('Order cancelled');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not cancel this order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string | undefined, productName: string) => {
    if (!order || !itemId) {
      toast.error('This item cannot be removed.');
      return;
    }
    if (!window.confirm(`Remove "${productName}" from this order and recalculate the total?`)) return;
    setActionLoading(true);
    try {
      await adminService.deleteOrderItem(order.id, itemId);
      await loadOrder();
      toast.success('Item removed from order');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not remove this item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentReminder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await adminService.sendPaymentReminder(order.id);
      toast.success('Payment reminder sent to customer');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not send payment reminder.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading order dispatch file..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <h3 className="font-bold text-gray-800">Order not found</h3>
        <Link to="/admin/orders">
          <Button variant="primary" size="sm" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
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
            <p className="text-xs text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {needsAdminReview(order.orderStatus) && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAccept}
                isLoading={actionLoading}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Approve Order
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setReason('');
                  setRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
            </>
          )}

          {canAssignDeliveryRider(order.orderStatus) && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setAssignModalOpen(true)}
              leftIcon={<Bike className="w-4 h-4" />}
            >
              {order.riderId ? 'Re-assign Rider' : 'Assign Rider'}
            </Button>
          )}

          {order.paymentStatus !== 'PAID' &&
            order.orderStatus !== 'DELIVERED' &&
            order.orderStatus !== 'CANCELLED' &&
            order.orderStatus !== 'REJECTED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePaymentReminder}
              isLoading={actionLoading}
            >
              Payment Reminder
            </Button>
          )}

          {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'REJECTED' && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => {
                setReason('');
                setCancelModalOpen(true);
              }}
            >
              Cancel Order
            </Button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {needsAdminReview(order.orderStatus) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-base font-black text-gray-900">Approve this booking to start delivery</h2>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  The customer placed this cylinder order and it is waiting for DS Shinde Gas admin review.
                  Approve it to accept the booking, then assign a rider. After that the rider can pick up,
                  go out for delivery, and complete handover with OTP.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleAccept}
                isLoading={actionLoading}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Approve Order
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setReason('');
                  setRejectModalOpen(true);
                }}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {order.orderStatus === 'ACCEPTED' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">Booking approved. Assign a rider next</h2>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                Dispatch starts after you assign a delivery partner. The rider then picks up the cylinder,
                marks out for delivery, and verifies handover with OTP.
              </p>
            </div>
            <Button
              variant="accent"
              size="md"
              onClick={() => setAssignModalOpen(true)}
              leftIcon={<Bike className="w-4 h-4" />}
            >
              Assign Rider
            </Button>
          </div>
        </div>
      )}

      {/* Grid: Details + Rider Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Customer & Address */}
        <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Customer & Delivery Location
          </h3>
          <div className="space-y-2 text-xs">
            <p className="text-base font-bold text-gray-900">{order.customerName}</p>
            <p className="text-primary font-semibold">📞 {order.customerPhone}</p>
            {order.deliveryAddress.altPhone && (
              <p className="text-slate-600 font-medium">📞 Alt: {order.deliveryAddress.altPhone}</p>
            )}
            {order.customerEmail && <p className="text-gray-500">✉️ {order.customerEmail}</p>}
            <div className="pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-500 uppercase block mb-1">Destination</span>
              <p className="text-gray-700 font-medium">
                {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
              </p>
              <p className="text-gray-700">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
                {order.deliveryAddress.pincode}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-gray-500 mt-1">Landmark: {order.deliveryAddress.landmark}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Rider & Security OTP */}
        <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Delivery Rider & Verification
          </h3>
          <div className="space-y-3 text-xs">
            {order.riderName ? (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-primary uppercase block">
                  Assigned Partner
                </span>
                <p className="font-bold text-sm text-gray-900 mt-0.5">{order.riderName}</p>
                <p className="text-gray-600">Phone: {order.riderPhone}</p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 italic">
                No delivery rider assigned yet.
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-warm-dark uppercase block">
                Delivery Handover OTP
              </span>
              <span className="text-xl font-mono font-black text-gray-900 block mt-0.5">
                {order.deliveryOtp ||
                  (order.otpGenerated || order.isOtpVerified
                    ? 'Sent to customer email'
                    : 'Not generated')}
              </span>
              <span className="text-[10px] text-gray-500">
                Status:{' '}
                {order.isOtpVerified
                  ? 'Verified by Rider'
                  : order.deliveryOtp || order.otpGenerated
                    ? 'Generated — waiting for rider'
                    : 'Pending Handover'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items & Status Progression */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Order Items & Financial Breakdown
          </h3>

          <div className="divide-y divide-gray-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center gap-3">
                <div>
                  <p className="font-bold text-gray-900">{item.productName}</p>
                  <p className="text-gray-500">
                    Size: {item.size} • Rate: ₹{item.unitPrice} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                  {order.orderStatus !== 'DELIVERED' &&
                    order.orderStatus !== 'CANCELLED' &&
                    order.orderStatus !== 'REJECTED' &&
                    order.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.productName)}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 text-xs border border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Applicable configured taxes</span>
              <span className="font-semibold text-gray-900">₹{order.taxes}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery charges</span>
              <span className="font-semibold text-gray-900">₹{order.deliveryCharges}</span>
            </div>
            {order.paymentFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Payment fee</span>
                <span className="font-semibold text-gray-900">₹{order.paymentFee}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Amount</span>
              <span className="text-primary">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-500 pt-1">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase text-gray-800">
                {order.paymentMethod} ({order.paymentStatus})
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Status History
          </h3>
          <StatusTimeline
            currentStatus={order.orderStatus}
            history={order.statusHistory}
            createdAt={order.createdAt}
            deliveredAt={order.deliveredAt}
          />
        </div>
      </div>

      {/* Assign Rider Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Delivery Partner"
        description="Choose a delivery rider for this cylinder consignment"
      >
        <div className="space-y-4">
          <select
            value={selectedRiderId}
            onChange={(e) => setSelectedRiderId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {riders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.phone}) - {r.assignedOrdersCount} active
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignRider} isLoading={actionLoading}>
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Order"
        description="Provide reason for rejecting this booking"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={actionLoading}>
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
        description="Provide reason for cancellation"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={actionLoading}>
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
