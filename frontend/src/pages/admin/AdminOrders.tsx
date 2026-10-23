import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Bike,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Order, Rider, OrderStatus } from '../../types';
import { canAssignDeliveryRider, needsAdminReview } from '../../utils/order';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Quick Action Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    setLoadError('');
    Promise.all([adminService.getOrders(), adminService.getRiders()])
      .then(([ordersRes, ridersData]) => {
        setOrders(ordersRes.orders);
        setRiders(ridersData);
      })
      .catch((error: any) => {
        setOrders([]);
        setRiders([]);
        setLoadError(error.response?.data?.message || 'Could not load current orders and riders.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId: string) => {
    try {
      await adminService.acceptOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'ACCEPTED' } : o))
      );
      toast.success('Order approved. Assign a rider to start delivery.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not accept this order.');
    }
  };

  const handleOpenAssign = (order: Order) => {
    setSelectedOrder(order);
    setSelectedRiderId(riders.find((rider) => rider.isActive)?.id || '');
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedOrder || !selectedRiderId) return;
    setActionLoading(true);
    try {
      const riderObj = riders.find((r) => r.id === selectedRiderId);
      await adminService.assignRider(selectedOrder.id, selectedRiderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                orderStatus: 'ASSIGNED',
                riderId: selectedRiderId,
                riderName: riderObj?.name,
                riderPhone: riderObj?.phone,
              }
            : o
        )
      );
      toast.success(`Assigned to ${riderObj?.name || 'Rider'}`);
      setAssignModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not assign this rider.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (order: Order) => {
    setSelectedOrder(order);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedOrder || !rejectReason.trim()) {
      toast.error('Please specify rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectOrder(selectedOrder.id, rejectReason);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, orderStatus: 'REJECTED', rejectionReason: rejectReason }
            : o
        )
      );
      toast.success('Order rejected');
      setRejectModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not reject this order.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cylinder Orders Dispatch</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage inbound booking queues, verify payments, and allocate delivery partners
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Orders
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="AWAITING_REVIEW">Awaiting Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="COD">Cash on Delivery</option>
            <option value="ONLINE">Online UPI</option>
            <option value="CARD">Card</option>
          </select>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="py-20">
          <Spinner label="Loading orders dispatch matrix..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-5 py-3.5">Order Info</th>
                  <th className="px-5 py-3.5">Customer / Contact</th>
                  <th className="px-5 py-3.5">Delivery Address</th>
                  <th className="px-5 py-3.5">Cylinders</th>
                  <th className="px-5 py-3.5">Total & Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Rider</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-sm text-gray-900 block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-gray-500">📞 {order.customerPhone}</p>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="truncate text-gray-700">
                          {order.deliveryAddress.addressLine1}, {order.deliveryAddress.area}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-gray-800">
                        {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-gray-900 text-sm block">
                          ₹{order.totalAmount}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge status={order.orderStatus} size="sm" />
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {order.riderName ? (
                          <div>
                            <span className="font-semibold text-gray-800 block text-xs">
                              {order.riderName}
                            </span>
                            <span className="text-[11px] text-gray-400">{order.riderPhone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1">
                        <Link to={`/admin/orders/${order.id}`}>
                          <button
                            className="p-1.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        {needsAdminReview(order.orderStatus) && (
                          <>
                            <button
                              onClick={() => handleAccept(order.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                              title="Approve Order"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenReject(order)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                              title="Reject Order"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {canAssignDeliveryRider(order.orderStatus) && (
                          <button
                            onClick={() => handleOpenAssign(order)}
                            className="p-1.5 rounded-lg text-primary hover:bg-blue-50"
                            title="Assign Delivery Rider"
                          >
                            <Bike className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Rider Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Delivery Partner"
        description={`Allocate order #${selectedOrder?.orderNumber} to an active field rider`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Select Field Delivery Rider
            </label>
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {riders.filter((rider) => rider.isActive).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone}) - {r.assignedOrdersCount} active orders
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmAssign}
              isLoading={actionLoading}
              disabled={!selectedRiderId}
            >
              Assign Rider Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Order Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Order"
        description={`Specify reason for rejecting order #${selectedOrder?.orderNumber}`}
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Outside service boundary, out of commercial stock, unverified consumer..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              isLoading={actionLoading}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
