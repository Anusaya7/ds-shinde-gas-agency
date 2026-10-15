import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export class ProductController {
  /**
   * Get all active cylinder products (Public)
   */
  static async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { commercial } = req.query;

      const where: any = { isActive: true };
      if (commercial !== undefined) {
        where.isCommercial = commercial === 'true';
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { sizeKg: 'asc' },
      });

      ApiResponse.success(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID (Public)
   */
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product || !product.isActive) {
        throw new NotFoundError('Product not found or currently unavailable');
      }

      ApiResponse.success(res, product, 'Product details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
