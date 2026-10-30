import { Router } from 'express';
import { z } from 'zod';
import { Role } from '../constants/enums.js';
import { AdminController } from '../controllers/admin.controller.js';
import { ApplicationController } from '../controllers/application.controller.js';
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
  z.record(z.any()),
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
router.delete('/orders/:id/items/:itemId', AdminController.deleteOrderItem);
router.post('/orders/:id/payment-reminder', AdminController.sendPaymentReminder);

// Riders
router.get('/riders', AdminController.listRiders);
router.get('/rider-applications', ApplicationController.listRiderApplications);
router.get('/rider-applications/:id/documents/:document', ApplicationController.getRiderDocument);
router.delete('/rider-applications/:id/documents', ApplicationController.deleteRiderDocuments);
router.patch(
  '/rider-applications/:id/review',
  validate(
    z.discriminatedUnion('status', [
      z.object({ status: z.literal('APPROVED') }),
      z.object({ status: z.literal('REJECTED'), reason: z.string().trim().min(3).max(500) }),
    ])
  ),
  ApplicationController.reviewRiderApplication
);
router.put('/riders/:id', validate(updateRiderSchema), AdminController.updateRider);
router.put('/riders/:id/toggle-status', AdminController.toggleRiderStatus);

// Customers
router.get('/customers', AdminController.listCustomers);
router.get('/customers/:id', AdminController.getCustomerDetail);
router.get('/customer-applications', ApplicationController.listCustomerApplications);
router.patch(
  '/customer-applications/:customerId/review',
  validate(
    z.discriminatedUnion('status', [
      z.object({ status: z.literal('APPROVED') }),
      z.object({ status: z.literal('REJECTED'), reason: z.string().trim().min(3).max(500).optional() }),
    ])
  ),
  ApplicationController.reviewCustomerApplication
);
router.get('/customers/:customerId/udyam-certificate', ApplicationController.getCustomerUdyamDocument);
router.get('/customers/:customerId/aadhaar-document', ApplicationController.getCustomerAadhaarDocument);
router.delete('/customers/:customerId/documents', ApplicationController.deleteCustomerDocuments);

// Products
router.get('/products', AdminController.listProducts);
router.post('/products', validate(productSchema), AdminController.createProduct);
router.put('/products/:id', validate(productSchema.partial()), AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Reports
router.get('/reports/orders', AdminController.getOrdersReport);
router.get('/reports/payments', AdminController.getPaymentsReport);
router.get('/reports/riders', AdminController.getRidersReport);
router.get('/reports/export', AdminController.exportOrdersCsv);

// Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', validate(settingSchema), AdminController.updateSettings);

// Contact Enquiries
router.get('/enquiries', AdminController.getContactEnquiries);
router.put('/enquiries/:id/status', AdminController.updateEnquiryStatus);

// Notifications
router.get('/notifications', AdminController.getNotifications);

export default router;
