export type Role = 'CUSTOMER' | 'ADMIN' | 'RIDER';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: Role;
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  mapLink?: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  name: string;
  size: string; // e.g. "14.2 kg", "19 kg", "5 kg"
  description: string;
  price: number;
  inStock: boolean;
  stockQuantity?: number;
  imageUrl?: string;
  type: 'DOMESTIC' | 'COMMERCIAL';
  isActive: boolean;
}

export type OrderStatus =
  | 'PLACED'
  | 'AWAITING_REVIEW'
  | 'ACCEPTED'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'ONLINE' | 'COD' | 'CARD';

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface StatusHistoryItem {
  id?: string;
  status: OrderStatus;
  comment?: string;
  updatedBy?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  taxes: number;
  paymentFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryItem[];
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  deliveryOtp?: string;
  isOtpVerified?: boolean;
  cancellationReason?: string;
  rejectionReason?: string;
  notes?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleNumber?: string;
  isActive: boolean;
  assignedOrdersCount: number;
  completedOrdersCount: number;
  currentOrderId?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  awaitingReview: number;
  accepted: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  rejected: number;
  pendingPayments: number;
  totalCollected: number;
  activeRidersCount: number;
  activeCustomersCount: number;
}

export interface RiderDashboardStats {
  assignedCount: number;
  activeDeliveryCount: number;
  completedTodayCount: number;
  totalDelivered: number;
  totalCashCollected: number;
}

export interface AgencySettings {
  agencyName: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  address: string;
  deliveryAreas: string[];
  deliveryCharges: number;
  taxPercentage: number;
  onlinePaymentFee: number;
  cardPaymentFee: number;
  codPaymentFee: number;
  isOrderingEnabled: boolean;
  businessHours: string;
  // CMS & Public Site Fields
  heroHeadline?: string;
  heroSubheadline?: string;
  heroDescription?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  heroImageUrl?: string;
  cylinderSectionTitle?: string;
  cylinderSectionSubtitle?: string;
  announcementBanner?: string;
  headerCtaText?: string;
  headerCtaLink?: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'SYSTEM' | 'ALERT';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ReportItem {
  date: string;
  ordersCount: number;
  deliveredCount: number;
  totalRevenue: number;
  cylinderBreakdown: Record<string, number>;
  paymentBreakdown: Record<string, number>;
}
