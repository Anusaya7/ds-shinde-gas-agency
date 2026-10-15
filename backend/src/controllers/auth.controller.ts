import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.created(
        res,
        {
          user: result.user,
          token: result.accessToken,
          accessToken: result.accessToken,
        },
        'Registration successful'
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          user: result.user,
          token: result.accessToken,
          accessToken: result.accessToken,
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.sendAuthOtp(req.body);
      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.verifyAuthOtp(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          user: result.user,
          token: result.accessToken,
          accessToken: result.accessToken,
        },
        'Verification and login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.sendAuthOtp({
        identifier: req.body.identifier,
        purpose: 'FORGOT_PASSWORD' as any,
      });
      ApiResponse.success(res, result, 'Password reset OTP dispatched');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body);
      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      ApiResponse.success(res, user, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await AuthService.refreshToken(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(
        res,
        {
          user: result.user,
          token: result.accessToken,
          accessToken: result.accessToken,
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
