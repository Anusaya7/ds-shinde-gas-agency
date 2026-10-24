import { Address, Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

function amount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return Number((value as { toNumber: () => number }).toNumber());
  }
  return 0;
}

function status(value: string): OrderStatus {
  const known: Record<string, OrderStatus> = {
    ORDER_PLACED: 'PLACED',
    AWAITING_REVIEW: 'AWAITING_REVIEW',
    ACCEPTED: 'ACCEPTED',
    RIDER_ASSIGNED: 'ASSIGNED',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    ARRIVED: 'ARRIVED',
    OTP_PENDING: 'ARRIVED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED',
  };
  return known[value] || 'PLACED';
}

export function needsAdminReview(orderStatus: OrderStatus): boolean {
  return orderStatus === 'AWAITING_REVIEW' || orderStatus === 'PLACED';
}

export function canAssignDeliveryRider(orderStatus: OrderStatus): boolean {
  return orderStatus === 'ACCEPTED' || orderStatus === 'ASSIGNED';
}

export function normalizeOrder(value: any): Order {
  const raw = value?.order || value || {};
  const address: Address =
    typeof raw.deliveryAddress === 'object' && raw.deliveryAddress
      ? raw.deliveryAddress
      : {
          id: raw.addressId || `address-${raw.id || 'order'}`,
          fullName: raw.deliveryName || raw.customer?.name || '',
          phone: raw.deliveryPhone || raw.customer?.phone || '',
          altPhone: raw.deliveryAltPhone || '',
          addressLine1: raw.deliveryAddress || '',
          area: raw.deliveryArea || '',
          city: raw.deliveryCity || '',
          state: raw.deliveryState || '',
          pincode: raw.deliveryPinCode || '',
          landmark: raw.deliveryLandmark || '',
          mapLink: raw.deliveryMapLink || '',
        };

  return {
    id: String(raw.id || ''),
    orderNumber: String(raw.orderNumber || ''),
    customerId: String(raw.customerId || ''),
    customerName: raw.deliveryName || raw.customer?.name || raw.customerName || '',
    customerPhone: raw.deliveryPhone || raw.customer?.phone || raw.customerPhone || '',
    customerEmail: raw.customer?.email || raw.customerEmail || undefined,
    deliveryAddress: address,
    items: (raw.items || []).map((item: any) => ({
      id: item.id,
      productId: item.productId || '',
      productName: item.productName || item.product?.name || '',
      size: item.size || `${item.sizeKg ?? ''} kg`.trim(),
      unitPrice: amount(item.unitPrice),
      quantity: Number(item.quantity || 0),
      subtotal: amount(item.subtotal ?? item.totalPrice),
    })),
    subtotal: amount(raw.subtotal),
    deliveryCharges: amount(raw.deliveryCharges),
    taxes: amount(raw.taxes),
    paymentFee: amount(raw.paymentFee),
    totalAmount: amount(raw.totalAmount),
    paymentMethod: (raw.paymentMethod || 'COD') as PaymentMethod,
    paymentStatus: (raw.paymentStatus || 'PENDING') as PaymentStatus,
    welcomeOfferDiscount: amount(raw.welcomeOfferDiscount),
    orderStatus: status(raw.orderStatus || raw.status || ''),
    statusHistory: (raw.statusHistory || []).map((entry: any) => ({
      id: entry.id,
      status: status(entry.status),
      comment: entry.note || entry.comment || undefined,
      updatedBy: entry.changedBy?.name || undefined,
      timestamp: entry.createdAt || entry.timestamp || new Date().toISOString(),
    })),
    riderId: raw.riderId || undefined,
    riderName: raw.rider?.user?.name || raw.riderName || undefined,
    riderPhone: raw.rider?.user?.phone || raw.riderPhone || undefined,
    deliveryOtp:
      typeof raw.deliveryOtp === 'string' && raw.deliveryOtp.trim()
        ? raw.deliveryOtp.trim()
        : raw.deliveryOtp?.otpCode || undefined,
    otpGenerated: Boolean(
      raw.otpGenerated ||
        raw.deliveryOtp ||
        raw.deliveryOtp?.otpCode ||
        raw.deliveryOtp?.isUsed ||
        raw.isOtpVerified
    ),
    isOtpVerified: Boolean(raw.deliveryOtp?.isUsed || raw.isOtpVerified),
    cancellationReason: raw.cancellationReason || undefined,
    rejectionReason: raw.rejectionReason || undefined,
    notes: raw.notes || undefined,
    bookingDurationDays: Number(raw.bookingDurationDays || 1),
    remindersEnabled: Boolean(raw.remindersEnabled),
    estimatedDelivery: raw.estimatedDelivery
      ? new Date(raw.estimatedDelivery).toISOString()
      : undefined,
    deliveredAt: raw.deliveredAt ? new Date(raw.deliveredAt).toISOString() : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
  };
}
