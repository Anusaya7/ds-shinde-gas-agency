import bcrypt from 'bcryptjs';
import { Role, AuthOtpPurpose } from '../constants/enums.js';
import prisma from '../config/database.js';
import config from '../config/index.js';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/otp.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import { sendSms } from '../utils/sms.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  AppError,
} from '../utils/errors.js';

export interface RegisterDTO {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface LoginDTO {
  identifier: string; // email or phone
  password?: string;
}

export interface SendOtpDTO {
  identifier: string; // email or phone
  purpose: AuthOtpPurpose;
  role?: Role.CUSTOMER | Role.RIDER;
}

export interface VerifyOtpDTO {
  identifier: string;
  otp: string;
  purpose: AuthOtpPurpose;
  name?: string;
  role?: Role.CUSTOMER | Role.RIDER;
}

export interface ResetPasswordDTO {
  identifier: string;
  otp: string;
  newPassword: string;
}

export class AuthService {
  /**
   * Register a new customer
   */
  static async register(dto: RegisterDTO) {
    const { name, email, phone, password } = dto;

    if (!email && !phone) {
      throw new BadRequestError('Either email or phone number is required to register');
    }

    if (!password) {
      throw new BadRequestError('Password is required');
    }

    // Check existing
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        throw new ConflictError('A user with this email already exists');
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        throw new ConflictError('A user with this phone number already exists');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: Role.CUSTOMER,
        isActive: true,
        isVerified: false,
        customerProfile: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const accessToken = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    return { user, accessToken, refreshToken };
  }

  /**
   * Login with email or phone and password
   */
  static async login(dto: LoginDTO) {
    const { identifier, password } = dto;

    if (!identifier || !password) {
      throw new BadRequestError('Identifier (email/phone) and password are required');
    }

    const isEmail = identifier.includes('@');
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
      include: {
        customerProfile: true,
        riderProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Please contact support.');
    }

    if (user.role !== Role.ADMIN || !user.passwordHash) {
      throw new UnauthorizedError('Use one-time-code sign-in for customer or rider accounts.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      customerProfile: user.customerProfile,
      riderProfile: user.riderProfile,
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  /**
   * Generate and dispatch an OTP for Login, Register, or Forgot Password
   */
  static async sendAuthOtp(dto: SendOtpDTO) {
    const { identifier, purpose } = dto;
    const role = dto.role || Role.CUSTOMER;

    const isEmail = identifier.includes('@');
    if (purpose === AuthOtpPurpose.FORGOT_PASSWORD) {
      throw new BadRequestError('Password recovery is only available to administrator accounts.');
    }

    const existingUser = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });
    if (!existingUser && purpose === AuthOtpPurpose.LOGIN) {
      throw new NotFoundError('No account found with the provided identifier. Create an account to continue.');
    }
    if (existingUser && (existingUser.role !== role || !existingUser.isActive)) {
      throw new BadRequestError('This contact belongs to an account that cannot use this sign-in portal.');
    }
    if (purpose === AuthOtpPurpose.REGISTER && existingUser) {
      throw new ConflictError('An account with this contact already exists. Please sign in.');
    }

    // Invalidate previous unexpired OTPs for same identifier & purpose
    await prisma.authOtp.updateMany({
      where: {
        identifier,
        purpose,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    const plainOtp = generateOtp(6);
    const otpHash = await hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    const otpRecord = await prisma.authOtp.create({
      data: {
        identifier,
        otpHash,
        purpose,
        expiresAt,
        attempts: 0,
        maxAttempts: config.otp.maxAttempts,
        isUsed: false,
      },
    });

    const message = `Your DS Shinde Gas verification code is: ${plainOtp}. Valid for ${config.otp.expiryMinutes} minutes. Never share this with anyone.`;

    // Dispatch OTP
    let delivered: boolean;
    try {
      delivered = isEmail
        ? await sendEmail({
        to: identifier,
        subject: `DS Shinde Gas - Verification Code (${purpose})`,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ea580c;">DS Shinde Gas</h2>
          <p>Your one-time verification code is:</p>
          <h1 style="letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; display: inline-block;">${plainOtp}</h1>
          <p>This code will expire in ${config.otp.expiryMinutes} minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>`,
      })
        : await sendSms({
        phone: identifier,
        message,
      });
    } catch (error) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw error;
    }
    if (!delivered) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new AppError('OTP delivery is not configured. Please contact the agency.', 503);
    }

    // Dev mode logging
    if (config.otp.devMode) {
      console.log(`[AUTH OTP DEV MODE] Identifier: ${identifier} | Purpose: ${purpose} | OTP: ${plainOtp}`);
    }

    return {
      message: `OTP sent successfully to ${identifier}`,
    };
  }

  /**
   * Verify Auth OTP and login/register
   */
  static async verifyAuthOtp(dto: VerifyOtpDTO) {
    const { identifier, otp, purpose, name } = dto;
    const role = dto.role || Role.CUSTOMER;

    const otpRecord = await prisma.authOtp.findFirst({
      where: {
        identifier,
        purpose,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestError('No active OTP found. Please request a new OTP.');
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new BadRequestError('Maximum attempts exceeded. Please request a new OTP.');
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new BadRequestError('OTP has expired. Please request a new OTP.');
    }

    const isValid = await verifyOtpHash(otp, otpRecord.otpHash);
    if (!isValid) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestError('Invalid OTP entered. Please try again.');
    }

    // Mark OTP as used
    await prisma.authOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const isEmail = identifier.includes('@');
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
      include: { customerProfile: true, riderProfile: true, riderApplication: true },
    });

    // If REGISTER purpose and user doesn't exist, create user
    if (user && (user.role !== role || !user.isActive)) {
      throw new UnauthorizedError('This account cannot sign in through this portal.');
    }

    if (!user && purpose === AuthOtpPurpose.LOGIN) {
      throw new NotFoundError('No account found with the provided identifier. Create an account to continue.');
    }

    if (!user && purpose === AuthOtpPurpose.REGISTER) {
      user = await prisma.user.create({
        data: {
          name: name ||
            (role === Role.RIDER ? `Rider ${identifier.slice(-4)}` :
              isEmail ? identifier.split('@')[0] : `Customer ${identifier.slice(-4)}`),
          email: isEmail ? identifier : null,
          phone: !isEmail ? identifier : null,
          passwordHash: null,
          role,
          isActive: true,
          isVerified: true,
          ...(role === Role.CUSTOMER && { customerProfile: {
            create: {},
          } }),
        },
        include: { customerProfile: true, riderProfile: true, riderApplication: true },
      });
    }

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Ensure user is verified if successfully verified via OTP
    if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      user.isVerified = true;
    }

    const accessToken = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        customerProfile: user.customerProfile,
        riderProfile: user.riderProfile,
        riderApplication: user.riderApplication,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Reset Password with verified OTP
   */
  static async resetPassword(dto: ResetPasswordDTO) {
    const { identifier, otp, newPassword } = dto;

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters long');
    }

    const otpRecord = await prisma.authOtp.findFirst({
      where: {
        identifier,
        purpose: AuthOtpPurpose.FORGOT_PASSWORD,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestError('No active password reset request found. Please request an OTP.');
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new BadRequestError('Maximum attempts exceeded. Please request a new OTP.');
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new BadRequestError('OTP has expired. Please request a new OTP.');
    }

    const isValid = await verifyOtpHash(otp, otpRecord.otpHash);
    if (!isValid) {
      await prisma.authOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestError('Invalid OTP entered.');
    }

    // Mark OTP used
    await prisma.authOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const isEmail = identifier.includes('@');
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const decoded = verifyRefreshToken(oldRefreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User inactive or invalid token');
    }

    const newAccessToken = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    });

    const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  /**
   * Fetch current authenticated user
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        customerProfile: {
          include: {
            addresses: true,
          },
        },
        riderProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}
