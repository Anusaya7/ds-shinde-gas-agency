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

      let products = await prisma.product.findMany({
        where,
        orderBy: { sizeKg: 'asc' },
      });

      if (products.length === 0 && !commercial) {
        const defaultProducts = [
          {
            name: 'Gaspoint 12 KG Cylinder',
            sizeKg: 12,
            description: 'Compact Gaspoint domestic cylinder for small families and light daily cooking needs.',
            price: 850.0,
            deliveryCharge: 50.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 10,
            isCommercial: false,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/12kg.svg',
          },
          {
            name: 'Gaspoint 15 KG Cylinder',
            sizeKg: 15,
            description: 'Standard Gaspoint domestic LPG cylinder widely used in regular households with standard safety valves.',
            price: 1080.0,
            deliveryCharge: 60.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 5,
            isCommercial: false,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/15kg.svg',
          },
          {
            name: 'Gaspoint 17 KG Cylinder',
            sizeKg: 17,
            description: 'Mid-size Gaspoint cylinder for larger households and small canteens with moderate usage.',
            price: 1250.0,
            deliveryCharge: 60.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 5,
            isCommercial: false,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/17kg.svg',
          },
          {
            name: 'Gaspoint 19 KG Cylinder',
            sizeKg: 19.2,
            description: 'Gaspoint commercial cylinder designed for restaurants, fast-food outlets, tea stalls, and canteens.',
            price: 1850.0,
            deliveryCharge: 100.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 20,
            isCommercial: true,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/19kg.svg',
          },
          {
            name: 'Gaspoint 21 KG Cylinder',
            sizeKg: 21,
            description: 'Gaspoint commercial cylinder for busy kitchens, bakeries, and medium food outlets.',
            price: 2050.0,
            deliveryCharge: 100.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 20,
            isCommercial: true,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/21kg.svg',
          },
          {
            name: 'Gaspoint 33 KG Cylinder',
            sizeKg: 33,
            description: 'Heavy-duty Gaspoint commercial cylinder ideal for hotel banquets, sweet makers, and medium-scale food processing.',
            price: 3200.0,
            deliveryCharge: 150.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 20,
            isCommercial: true,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/33kg.svg',
          },
          {
            name: 'Gaspoint 50 KG Cylinder',
            sizeKg: 50,
            description: 'High-volume Gaspoint industrial cylinder engineered for intensive manufacturing processes, bakeries, and heating systems.',
            price: 4800.0,
            deliveryCharge: 200.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 50,
            isCommercial: true,
            requiresQuotation: false,
            imageUrl: '/assets/cylinders/50kg.svg',
          },
          {
            name: 'Gaspoint 425 KG Bulk LOT Cylinder',
            sizeKg: 425,
            description: 'Massive Gaspoint Liquid Off-Take (LOT) bulk cylinder installations for large industrial plants, hotels, and boiler facilities. Custom quote provided.',
            price: 39500.0,
            deliveryCharge: 1000.0,
            isActive: true,
            minQuantity: 1,
            maxQuantity: 10,
            isCommercial: true,
            requiresQuotation: true,
            imageUrl: '/assets/cylinders/425kg.svg',
          },
        ];

        for (const p of defaultProducts) {
          await prisma.product.create({ data: p }).catch(() => {});
        }

        products = await prisma.product.findMany({
          where,
          orderBy: { sizeKg: 'asc' },
        });
      }

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
