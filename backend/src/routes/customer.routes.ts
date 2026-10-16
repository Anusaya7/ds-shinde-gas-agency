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

const udyamUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new BadRequestError('Udyam certificate must be a PDF, JPEG, PNG, or WebP file.'));
      return;
    }
    callback(null, true);
  },
});

const udyamDetailsSchema = z.object({
  fsiNumber: z.string().trim().max(40).optional(),
  udyamConsent: z.literal('true').optional(),
});

const handleUploadError: import('express').ErrorRequestHandler = (error, _req, _res, next) => {
  if (error instanceof multer.MulterError) {
    next(new BadRequestError(
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Udyam certificate must be 5 MB or smaller.'
        : 'Upload one Udyam certificate at a time.'
    ));
    return;
  }
  next(error);
};

router.put(
  '/business-details',
  udyamUpload.single('udyamDocument'),
  handleUploadError,
  validate(udyamDetailsSchema),
  ApplicationController.saveCustomerDetails
);

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
