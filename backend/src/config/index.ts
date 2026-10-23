import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv === 'development';
const jwtSecret = process.env.JWT_SECRET || 'development-only-jwt-secret-change-before-production';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'development-only-refresh-secret-change-before-production';

if (nodeEnv === 'production') {
  const missingSecrets = [
    !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 ? 'JWT_SECRET (at least 32 characters)' : '',
    !process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32
      ? 'JWT_REFRESH_SECRET (at least 32 characters)'
      : '',
    !process.env.DOCUMENT_ENCRYPTION_KEY || !/^[a-fA-F0-9]{64}$/.test(process.env.DOCUMENT_ENCRYPTION_KEY)
      ? 'DOCUMENT_ENCRYPTION_KEY (64 hexadecimal characters)'
      : '',
  ].filter(Boolean);
  if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    missingSecrets.push('distinct JWT_SECRET and JWT_REFRESH_SECRET values');
  }
  if (missingSecrets.length > 0) {
    throw new Error(`Production secrets are missing or invalid: ${missingSecrets.join(', ')}.`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  isDev,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },

  jwt: {
    secret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'DS Shinde Gas Agency <noreply@dsshindegas.com>',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from:
      process.env.RESEND_FROM ||
      process.env.SMTP_FROM ||
      'DS Shinde Gas Agency <noreply@dsshindegas.com>',
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'mock',
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || 'DSSGAS',
    // MSG91 transactional OTP SMS (https://msg91.com)
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY || '',
      templateId: process.env.MSG91_OTP_TEMPLATE_ID || '',
    },
  },
  cronSecret: process.env.CRON_SECRET || '',

  otp: {
    devMode: isDev && process.env.OTP_DEV_MODE === 'true',
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
    maxAttempts: 5,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
    otpMax: parseInt(process.env.OTP_RATE_LIMIT_MAX || '5', 10),
  },
};

export default config;
