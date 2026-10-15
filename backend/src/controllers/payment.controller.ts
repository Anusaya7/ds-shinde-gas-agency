import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError } from '../utils/errors.js';

export class PaymentController {
  /**
   * Create Razorpay order for an order
   */
  static async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.body;
      const userId = req.user?.id;

      if (!orderId) {
        throw new BadRequestError('Order ID is required');
      }

      const result = await PaymentService.createRazorpayOrderForOrder(orderId, userId);
      ApiResponse.success(res, result, 'Razorpay order created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await PaymentService.verifyPayment(req.body, userId);
      ApiResponse.success(res, result, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Razorpay Webhook listener
   */
  static async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        throw new BadRequestError('Missing Razorpay signature header');
      }

      // Convert body to string if needed for HMAC validation
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const result = await PaymentService.handleWebhook(rawBody, signature);

      ApiResponse.success(res, result, 'Webhook processed successfully');
    } catch (error) {
      next(error);
    }
  }
}
