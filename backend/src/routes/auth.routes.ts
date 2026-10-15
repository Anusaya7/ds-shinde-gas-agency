import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

const sendOtpSchema = z.object({
  identifier: z.string().min(3, 'Identifier (phone or email) is required'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'FORGOT_PASSWORD']),
});

const verifyOtpSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'FORGOT_PASSWORD']),
  name: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
});

const resetPasswordSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), AuthController.sendOtp);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticateToken, AuthController.me);

export default router;
