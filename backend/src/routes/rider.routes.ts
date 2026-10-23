import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Role } from '../constants/enums.js';
import { RiderController } from '../controllers/rider.controller.js';
import { ApplicationController } from '../controllers/application.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import prisma from '../config/database.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

const router = Router();

// Protect all rider routes
router.use(authenticateToken, requireRole(Role.RIDER));

const applicationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  address: z.string().trim().min(10).max(500),
  vehicleNumber: z.string().trim().min(5).max(20),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length === 10, 'Enter a valid 10-digit mobile number.'),
  consent: z
    .union([z.literal('true'), z.literal(true), z.literal('on'), z.literal('1')])
    .transform(() => 'true' as const),
});

const uploadRiderDocuments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, callback) => {
    const isRc = file.fieldname === 'rcDocument';
    const allowed = isRc
      ? ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      callback(new BadRequestError('RC documents must be PDF or an image; photos must be JPEG, PNG, or WebP.'));
      return;
    }
    callback(null, true);
  },
}).fields([
  { name: 'rcDocument', maxCount: 1 },
  { name: 'frontPhoto', maxCount: 1 },
  { name: 'backPhoto', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

const handleUploadError = (error: unknown, _req: unknown, _res: unknown, next: (err?: unknown) => void) => {
  if (error instanceof multer.MulterError) {
    next(new BadRequestError(
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Each application document must be 5 MB or smaller.'
        : 'Upload exactly one RC book and three rider photos.'
    ));
    return;
  }
  next(error);
};

const ensureApprovedRider = async (_req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
  try {
    const [rider, application] = await Promise.all([
      prisma.rider.findUnique({
        where: { userId: _req.user!.id },
        select: { id: true },
      }),
      prisma.riderApplication.findUnique({
        where: { userId: _req.user!.id },
        select: { status: true },
      }),
    ]);
    if (!rider) throw new NotFoundError('Your rider application must be approved before accessing delivery tasks.');
    if (application && application.status !== 'APPROVED') {
      throw new BadRequestError('Your rider application must be approved before accessing delivery tasks.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get('/application', ApplicationController.getRiderApplication);
router.post(
  '/application',
  (req, res, next) => uploadRiderDocuments(req, res, (error) => handleUploadError(error, req, res, next)),
  validate(applicationSchema),
  ApplicationController.submitRiderApplication
);

router.use(ensureApprovedRider);

router.get('/dashboard', RiderController.getDashboardStats);
const rejectAssignmentSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const collectPaymentSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  transactionId: z.string().trim().min(4).max(80).optional(),
  method: z.enum(['COD', 'UPI_QR', 'ONLINE', 'CARD']).optional(),
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
