import { Router } from 'express';
import { z } from 'zod';
import { PaymentController } from '../controllers/payment.controller.js';
import { Role } from '../constants/enums.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createOrderSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
  razorpayOrderId: z.string().min(1, 'razorpayOrderId is required'),
  razorpayPaymentId: z.string().min(1, 'razorpayPaymentId is required'),
  razorpaySignature: z.string().min(1, 'razorpaySignature is required'),
});

const failedPaymentSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
  razorpayOrderId: z.string().min(1, 'razorpayOrderId is required'),
});

router.post(
  '/create-razorpay-order',
  authenticateToken,
  requireRole(Role.CUSTOMER),
  validate(createOrderSchema),
  PaymentController.createRazorpayOrder
);

router.post(
  '/verify',
  authenticateToken,
  requireRole(Role.CUSTOMER),
  validate(verifyPaymentSchema),
  PaymentController.verifyPayment
);

router.post(
  '/failed',
  authenticateToken,
  requireRole(Role.CUSTOMER),
  validate(failedPaymentSchema),
  PaymentController.markPaymentFailed
);

router.post('/webhook', PaymentController.webhook);

export default router;
