import { Router } from 'express';
import { z } from 'zod';
import { Role } from '../constants/enums.js';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Ensure customer or admin
router.use(authenticateToken, requireRole(Role.CUSTOMER, Role.ADMIN));

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  alternatePhone: z.string().optional(),
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
