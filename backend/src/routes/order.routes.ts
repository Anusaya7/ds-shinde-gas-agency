import { Router } from 'express';
import { z } from 'zod';
import { OrderController } from '../controllers/order.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
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
  paymentMethod: z.enum(['ONLINE', 'COD', 'CARD']),
  notes: z.string().optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

// Create Order (Requires customer auth)
router.post('/', authenticateToken, validate(createOrderSchema), OrderController.createOrder);

// List Customer's Orders
router.get('/', authenticateToken, OrderController.listCustomerOrders);

// Track Order (Accessible to user or tracking link with optional auth)
router.get('/:id/track', optionalAuth, OrderController.trackOrder);

// Get Order Details
router.get('/:id', authenticateToken, OrderController.getOrderDetail);

// Cancel Order
router.post('/:id/cancel', authenticateToken, validate(cancelOrderSchema), OrderController.cancelOrder);

export default router;
