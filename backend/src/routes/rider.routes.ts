import { Router } from 'express';
import { z } from 'zod';
import { Role } from '../constants/enums.js';
import { RiderController } from '../controllers/rider.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Protect all rider routes
router.use(authenticateToken, requireRole(Role.RIDER));

const rejectAssignmentSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const collectPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  transactionId: z.string().optional(),
});

router.get('/orders', RiderController.getAssignedOrders);
router.get('/orders/:id', RiderController.getOrderDetail);
router.put('/orders/:id/accept', RiderController.acceptAssignment);
router.put('/orders/:id/reject', validate(rejectAssignmentSchema), RiderController.rejectAssignment);
router.put('/orders/:id/out-for-delivery', RiderController.markOutForDelivery);
router.put('/orders/:id/arrived', RiderController.markArrived);
router.post('/orders/:id/send-otp', RiderController.sendDeliveryOtp);
router.post('/orders/:id/verify-otp', validate(verifyOtpSchema), RiderController.verifyDeliveryOtp);
router.put('/orders/:id/complete', RiderController.completeDelivery);
router.put('/orders/:id/collect-payment', validate(collectPaymentSchema), RiderController.collectPayment);
router.get('/profile', RiderController.getProfile);
router.get('/completed', RiderController.getCompletedDeliveries);

export default router;
