import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Role } from '../constants/enums.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApplicationController } from '../controllers/application.controller.js';
import { BadRequestError } from '../utils/errors.js';

const router = Router();

// Ensure customer or admin
router.use(authenticateToken, requireRole(Role.CUSTOMER, Role.ADMIN));

const kycUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, callback) => {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new BadRequestError('Uploaded files must be PDF, JPEG, PNG, or WebP.'));
      return;
    }
    callback(null, true);
  },
});

const kycDetailsSchema = z.object({
  fsiNumber: z.string().trim().max(40).optional(),
  udyamConsent: z.literal('true').optional(),
  aadhaarNumber: z.string().trim().regex(/^$|^[0-9]{12}$/, 'Aadhaar number must be 12 digits').optional(),
  aadhaarConsent: z.literal('true').optional(),
  kycSubmit: z.literal('true').optional(),
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(15).optional(),
  altPhone: z.string().trim().max(15).optional(),
  addressLine1: z.string().trim().max(200).optional(),
  addressLine2: z.string().trim().max(200).optional(),
  area: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  pinCode: z.string().trim().max(10).optional(),
  pincode: z.string().trim().max(10).optional(),
  landmark: z.string().trim().max(200).optional(),
  mapLink: z.string().trim().max(500).optional(),
  bookingDurationDays: z.string().trim().max(2).optional(),
  remindersEnabled: z.string().optional(),
});

const handleUploadError: import('express').ErrorRequestHandler = (error, _req, _res, next) => {
  if (error instanceof multer.MulterError) {
    next(new BadRequestError(
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded documents must be 5 MB or smaller.'
        : 'Please upload only genuine documents.'
    ));
    return;
  }
  next(error);
};

router.put(
  '/business-details',
  kycUpload.fields([
    { name: 'udyamDocument', maxCount: 1 },
    { name: 'aadhaarDocument', maxCount: 1 },
  ]),
  handleUploadError,
  validate(kycDetailsSchema),
  ApplicationController.saveCustomerDetails
);

router.put(
  '/kyc',
  kycUpload.fields([
    { name: 'udyamDocument', maxCount: 1 },
    { name: 'aadhaarDocument', maxCount: 1 },
  ]),
  handleUploadError,
  validate(kycDetailsSchema),
  ApplicationController.saveCustomerDetails
);

router.get('/kyc-status', ApplicationController.getCustomerKycStatus);

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  alternatePhone: z.string().optional(),
  fsiNumber: z.string().trim().max(40).optional(),
});

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, '10-digit phone number is required'),
  addressLine1: z.string().min(3, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  area: z.string().min(2, 'Area is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  pinCode: z.string().regex(/^[0-9]{6}$/, 'Valid 6-digit pin code is required'),
  landmark: z.string().optional(),
  mapLink: z.string().optional(),
  isDefault: z.boolean().optional(),
});

router.get('/profile', CustomerController.getProfile);
router.put('/profile', validate(updateProfileSchema), CustomerController.updateProfile);
router.get('/addresses', CustomerController.getAddresses);
router.post('/addresses', validate(addressSchema), CustomerController.createAddress);
router.put('/addresses/:id', validate(addressSchema.partial()), CustomerController.updateAddress);
router.delete('/addresses/:id', CustomerController.deleteAddress);

export default router;
