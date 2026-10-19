import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class CustomerController {
  /**
   * Get customer profile with addresses
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          customerProfile: {
            select: {
              id: true,
              alternatePhone: true,
              fsiNumber: true,
              approvalStatus: true,
              rejectionReason: true,
              aadhaarNumber: true,
              aadhaarMimeType: true,
              udyamMimeType: true,
              reviewedAt: true,
              addresses: {
                orderBy: { isDefault: 'desc' },
              },
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('Customer not found');
      }

      ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update customer profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, email, phone, alternatePhone, fsiNumber } = req.body;

      const updatedUser = await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { id: userId },
          select: { email: true, phone: true },
        });
        if (!existingUser) {
          throw new NotFoundError('Customer not found');
        }
        if ((email && email !== existingUser.email) || (phone && phone !== existingUser.phone)) {
          throw new BadRequestError('Changing your phone or email requires OTP verification. Please contact the agency for assistance.');
        }

        const user = await tx.user.update({
          where: { id: userId },
          data: {
            ...(name && { name }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        });

        if (alternatePhone !== undefined || fsiNumber !== undefined) {
          await tx.customerProfile.upsert({
            where: { userId },
            update: {
              ...(alternatePhone !== undefined && { alternatePhone }),
              ...(fsiNumber !== undefined && { fsiNumber }),
            },
            create: { userId, alternatePhone, fsiNumber },
          });
        }

        return user;
      });

      ApiResponse.success(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all saved addresses for current customer
   */
  static async getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      let profile = await prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await prisma.customerProfile.create({
          data: { userId },
        });
      }

      const addresses = await prisma.savedAddress.findMany({
        where: { customerProfileId: profile.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      ApiResponse.success(res, addresses, 'Addresses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new saved address
   */
  static async createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        area,
        city,
        state,
        pinCode,
        landmark,
        mapLink,
        isDefault,
      } = req.body;

      let profile = await prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await prisma.customerProfile.create({
          data: { userId },
        });
      }

      const newAddress = await prisma.$transaction(async (tx) => {
        // If this address is set as default or is the first address, reset other default addresses
        const existingCount = await tx.savedAddress.count({
          where: { customerProfileId: profile!.id },
        });

        const shouldBeDefault = isDefault || existingCount === 0;

        if (shouldBeDefault) {
          await tx.savedAddress.updateMany({
            where: { customerProfileId: profile!.id },
            data: { isDefault: false },
          });
        }

        return tx.savedAddress.create({
          data: {
            customerProfileId: profile!.id,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            area,
            city,
            state: state || 'Maharashtra',
            pinCode,
            landmark,
            mapLink,
            isDefault: shouldBeDefault,
          },
        });
      });

      ApiResponse.created(res, newAddress, 'Address saved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an address
   */
  static async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        area,
        city,
        state,
        pinCode,
        landmark,
        mapLink,
        isDefault,
      } = req.body;

      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new NotFoundError('Customer profile not found');
      }

      const existingAddress = await prisma.savedAddress.findFirst({
        where: { id, customerProfileId: profile.id },
      });

      if (!existingAddress) {
        throw new NotFoundError('Address not found or does not belong to you');
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (isDefault) {
          await tx.savedAddress.updateMany({
            where: { customerProfileId: profile.id },
            data: { isDefault: false },
          });
        }

        return tx.savedAddress.update({
          where: { id },
          data: {
            ...(fullName && { fullName }),
            ...(phone && { phone }),
            ...(addressLine1 && { addressLine1 }),
            addressLine2: addressLine2 !== undefined ? addressLine2 : existingAddress.addressLine2,
            ...(area && { area }),
            ...(city && { city }),
            ...(state && { state }),
            ...(pinCode && { pinCode }),
            landmark: landmark !== undefined ? landmark : existingAddress.landmark,
            mapLink: mapLink !== undefined ? mapLink : existingAddress.mapLink,
            ...(isDefault !== undefined && { isDefault }),
          },
        });
      });

      ApiResponse.success(res, updated, 'Address updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new NotFoundError('Customer profile not found');
      }

      const existingAddress = await prisma.savedAddress.findFirst({
        where: { id, customerProfileId: profile.id },
      });

      if (!existingAddress) {
        throw new NotFoundError('Address not found');
      }

      await prisma.savedAddress.delete({
        where: { id },
      });

      ApiResponse.success(res, null, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
