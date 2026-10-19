import { Router } from 'express';
import { z } from 'zod';
import { OrderController } from '../controllers/order.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { Role } from '../constants/enums.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID format'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one cylinder must be selected'),
  deliveryName: z.string().min(2, 'Delivery contact name is required'),
  deliveryPhone: z.string().regex(/^[0-9]{10}$/, '10-digit phone number is required'),
  deliveryAltPhone: z.string().optional(),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliveryArea: z.string().min(2, 'Delivery area is required'),
  deliveryCity: z.string().min(2, 'Delivery city is required'),
  deliveryState: z.string().default('Maharashtra'),
  deliveryPinCode: z.string().regex(/^[0-9]{6}$/, '6-digit postal pin code is required'),
  deliveryLandmark: z.string().optional(),
  deliveryMapLink: z.string().optional(),
  paymentMethod: z.enum(['ONLINE', 'COD', 'CARD', 'UPI_QR']),
  bookingDurationDays: z.number().int().min(1).max(31).optional().default(1),
  remindersEnabled: z.boolean().optional().default(false),
  fsiNumber: z.string().trim().max(40).optional(),
  notes: z.string().optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});
const reminderPreferenceSchema = z.object({
  enabled: z.boolean(),
});

// Create Order (Requires customer auth)
router.post('/', authenticateToken, requireRole(Role.CUSTOMER), validate(createOrderSchema), OrderController.createOrder);

// List Customer's Orders
router.get('/', authenticateToken, requireRole(Role.CUSTOMER), OrderController.listCustomerOrders);

// Tracking exposes rider contact details and is limited to the signed-in customer.
router.get('/:id/track', authenticateToken, requireRole(Role.CUSTOMER), OrderController.trackOrder);

// Get Order Details
router.get('/:id', authenticateToken, requireRole(Role.CUSTOMER), OrderController.getOrderDetail);

// Cancel Order
router.post('/:id/cancel', authenticateToken, requireRole(Role.CUSTOMER), validate(cancelOrderSchema), OrderController.cancelOrder);
router.patch('/:id/reminders', authenticateToken, requireRole(Role.CUSTOMER), validate(reminderPreferenceSchema), OrderController.updateReminderPreference);

export default router;
