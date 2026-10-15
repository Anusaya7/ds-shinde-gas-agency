import { Router } from 'express';
import { z } from 'zod';
import { Role } from '../constants/enums.js';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Strict Admin protection for all admin endpoints
router.use(authenticateToken, requireRole(Role.ADMIN));

const rejectOrderSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

const assignRiderSchema = z.object({
  riderId: z.string().uuid('Valid rider ID is required'),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

const createRiderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, '10-digit phone number is required'),
  email: z.string().email().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  vehicleNumber: z.string().optional(),
});

const updateRiderSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  vehicleNumber: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sizeKg: z.number().positive('Size in kg must be greater than 0'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  deliveryCharge: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  minQuantity: z.number().int().min(1).optional(),
  maxQuantity: z.number().int().min(1).optional(),
  isCommercial: z.boolean().optional(),
  requiresQuotation: z.boolean().optional(),
  imageUrl: z.string().optional(),
});

const settingSchema = z.union([
  z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.any(),
    description: z.string().optional(),
  }),
  z.object({
    agencyName: z.string().optional(),
    primaryPhone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    deliveryAreas: z.array(z.string()).optional(),
    deliveryCharges: z.number().optional(),
    taxPercentage: z.number().optional(),
    onlinePaymentFee: z.number().optional(),
    cardPaymentFee: z.number().optional(),
    codPaymentFee: z.number().optional(),
    isOrderingEnabled: z.boolean().optional(),
    businessHours: z.string().optional(),
  }),
]);

// Dashboard
router.get('/dashboard', AdminController.getDashboardStats);

// Orders
router.get('/orders', AdminController.getAllOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.put('/orders/:id/accept', AdminController.acceptOrder);
router.put('/orders/:id/reject', validate(rejectOrderSchema), AdminController.rejectOrder);
router.put('/orders/:id/assign-rider', validate(assignRiderSchema), AdminController.assignRider);
router.put('/orders/:id/cancel', validate(cancelOrderSchema), AdminController.cancelOrder);

// Riders
router.get('/riders', AdminController.listRiders);
router.post('/riders', validate(createRiderSchema), AdminController.createRider);
router.put('/riders/:id', validate(updateRiderSchema), AdminController.updateRider);
router.put('/riders/:id/toggle-status', AdminController.toggleRiderStatus);

// Customers
router.get('/customers', AdminController.listCustomers);
router.get('/customers/:id', AdminController.getCustomerDetail);

// Products
router.get('/products', AdminController.listProducts);
router.post('/products', validate(productSchema), AdminController.createProduct);
router.put('/products/:id', validate(productSchema.partial()), AdminController.updateProduct);

// Reports
router.get('/reports/orders', AdminController.getOrdersReport);
router.get('/reports/payments', AdminController.getPaymentsReport);
router.get('/reports/riders', AdminController.getRidersReport);
router.get('/reports/export', AdminController.exportOrdersCsv);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', validate(settingSchema), AdminController.updateSettings);

// Notifications
router.get('/notifications', AdminController.getNotifications);

export default router;
