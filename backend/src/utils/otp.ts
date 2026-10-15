import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a cryptographically secure numeric OTP string of given length
 */
export function generateOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

/**
 * Hash plain OTP for secure database storage
 */
export async function hashOtp(otp: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

/**
 * Compare plain OTP against stored hash
 */
export async function verifyOtpHash(otp: string, hashedOtp: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOtp);
}
