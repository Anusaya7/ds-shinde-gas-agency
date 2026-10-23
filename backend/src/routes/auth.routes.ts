import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const loginSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^[0-9]{10}$/, '10-digit mobile number is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

function requireCustomerEmail(
  data: { identifier: string; role?: 'CUSTOMER' | 'RIDER' },
  ctx: z.RefinementCtx
) {
  if ((data.role || 'CUSTOMER') !== 'CUSTOMER') return;
  const parsed = z.string().email().safeParse(data.identifier);
  if (!parsed.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['identifier'],
      message: 'Customer sign-in requires a valid email address.',
    });
  }
}

const sendOtpSchema = z
  .object({
    identifier: z.string().trim().min(3, 'Identifier is required').max(254),
    purpose: z.enum(['LOGIN', 'REGISTER', 'FORGOT_PASSWORD']),
    role: z.enum(['CUSTOMER', 'RIDER']).optional(),
  })
  .superRefine(requireCustomerEmail)
  .transform((data) => ({
    ...data,
    identifier: data.identifier.includes('@') ? data.identifier.toLowerCase() : data.identifier,
  }));

const verifyOtpSchema = z
  .object({
    identifier: z.string().trim().min(3, 'Identifier is required').max(254),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    purpose: z.enum(['LOGIN', 'REGISTER', 'FORGOT_PASSWORD']),
    role: z.enum(['CUSTOMER', 'RIDER']).optional(),
    name: z.string().trim().min(2).max(100).optional(),
  })
  .superRefine(requireCustomerEmail)
  .transform((data) => ({
    ...data,
    identifier: data.identifier.includes('@') ? data.identifier.toLowerCase() : data.identifier,
  }));

router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), AuthController.sendOtp);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticateToken, AuthController.me);

export default router;
