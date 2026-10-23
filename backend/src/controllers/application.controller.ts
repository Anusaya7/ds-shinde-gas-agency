import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { NotificationType, Role } from '../constants/enums.js';
import prisma from '../config/database.js';
import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors.js';
import { sendEmail } from '../utils/email.js';
import { sendSms } from '../utils/sms.js';
import { decryptDocument, encryptDocument } from '../utils/secureDocuments.js';
import { recordAuditLog } from '../services/audit.service.js';

const riderApplicationSelect = {
  id: true,
  userId: true,
  fullName: true,
  phone: true,
  email: true,
  address: true,
  vehicleNumber: true,
  status: true,
  rejectionReason: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  consentAt: true,
} satisfies Prisma.RiderApplicationSelect;

function isValidImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return isJpeg || isPng || isWebp;
}

function isValidPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseKycSnapshot(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function snapshotFromBody(body: Record<string, unknown>) {
  const duration = Number.parseInt(String(body.bookingDurationDays || ''), 10);
  return {
    fullName: text(body.fullName),
    phone: text(body.phone),
    altPhone: text(body.altPhone),
    addressLine1: text(body.addressLine1),
    addressLine2: text(body.addressLine2),
    area: text(body.area),
    city: text(body.city),
    state: text(body.state) || 'Maharashtra',
    pincode: text(body.pinCode || body.pincode),
    landmark: text(body.landmark),
    mapLink: text(body.mapLink),
    bookingDurationDays: Number.isInteger(duration) && duration >= 1 && duration <= 31 ? duration : null,
    remindersEnabled: body.remindersEnabled === 'true' || body.remindersEnabled === true,
  };
}

function hasAddress(snapshot: ReturnType<typeof snapshotFromBody>) {
  return Boolean(snapshot.fullName && snapshot.phone && snapshot.addressLine1 && snapshot.area && snapshot.city && snapshot.pincode);
}

export class ApplicationController {
  static async saveCustomerDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const udyamFile = files?.['udyamDocument']?.[0] || (req.file?.fieldname === 'udyamDocument' ? req.file : undefined);
      const aadhaarFile = files?.['aadhaarDocument']?.[0] || (req.file?.fieldname === 'aadhaarDocument' ? req.file : undefined);

      if (udyamFile && req.body.udyamConsent !== 'true') {
        throw new BadRequestError('Consent is required before uploading a Udyam certificate.');
      }
      if (aadhaarFile && req.body.aadhaarConsent !== 'true') {
        throw new BadRequestError('Consent is required before uploading an Aadhaar document.');
      }

      let encryptedUdyam: Buffer | undefined;
      if (udyamFile) {
        const validImage = udyamFile.mimetype.startsWith('image/') && isValidImage(udyamFile.buffer);
        const validPdf = udyamFile.mimetype === 'application/pdf' && isValidPdf(udyamFile.buffer);
        if (!validImage && !validPdf) {
          throw new BadRequestError('Upload a genuine PDF, JPEG, PNG, or WebP Udyam certificate.');
        }
        encryptedUdyam = encryptDocument(udyamFile.buffer);
      }

      let encryptedAadhaar: Buffer | undefined;
      if (aadhaarFile) {
        const validImage = aadhaarFile.mimetype.startsWith('image/') && isValidImage(aadhaarFile.buffer);
        const validPdf = aadhaarFile.mimetype === 'application/pdf' && isValidPdf(aadhaarFile.buffer);
        if (!validImage && !validPdf) {
          throw new BadRequestError('Upload a genuine PDF, JPEG, PNG, or WebP Aadhaar document.');
        }
        encryptedAadhaar = encryptDocument(aadhaarFile.buffer);
      }

      const aadhaarNumber = req.body.aadhaarNumber ? req.body.aadhaarNumber.toString().replace(/\D/g, '') : undefined;
      if (aadhaarNumber && aadhaarNumber.length !== 12) {
        throw new BadRequestError('Aadhaar number must be exactly 12 digits.');
      }

      const snapshot = snapshotFromBody(req.body as Record<string, unknown>);
      const existing = await prisma.customerProfile.findUnique({
        where: { userId: req.user!.id },
        select: { approvalStatus: true, aadhaarNumber: true },
      });
      const hasNewIdentityUpload = Boolean(encryptedAadhaar || encryptedUdyam);
      const aadhaarChanged = Boolean(aadhaarNumber && aadhaarNumber !== existing?.aadhaarNumber);
      const isSubmittingKyc = Boolean(
        hasNewIdentityUpload || aadhaarChanged || req.body.kycSubmit === 'true'
      );
      const shouldReopenForReview =
        isSubmittingKyc &&
        (existing?.approvalStatus !== 'APPROVED' || hasNewIdentityUpload || aadhaarChanged);

      const profile = await prisma.customerProfile.upsert({
        where: { userId: req.user!.id },
        update: {
          ...(req.body.fsiNumber !== undefined && { fsiNumber: req.body.fsiNumber.trim() || null }),
          ...(aadhaarNumber && { aadhaarNumber }),
          ...(encryptedAadhaar && {
            aadhaarDocument: encryptedAadhaar,
            aadhaarMimeType: aadhaarFile!.mimetype,
            aadhaarConsentAt: new Date(),
          }),
          ...(encryptedUdyam && {
            udyamDocument: encryptedUdyam,
            udyamMimeType: udyamFile!.mimetype,
            udyamConsentAt: new Date(),
          }),
          ...(hasAddress(snapshot) && { kycSnapshot: JSON.stringify(snapshot) }),
          ...(snapshot.altPhone && { alternatePhone: snapshot.altPhone }),
          ...(shouldReopenForReview && {
            approvalStatus: 'PENDING',
            rejectionReason: null,
            reviewedAt: null,
            reviewedById: null,
          }),
        },
        create: {
          userId: req.user!.id,
          fsiNumber: req.body.fsiNumber?.trim() || null,
          aadhaarNumber: aadhaarNumber || null,
          alternatePhone: snapshot.altPhone || null,
          kycSnapshot: hasAddress(snapshot) ? JSON.stringify(snapshot) : null,
          ...(encryptedAadhaar && {
            aadhaarDocument: encryptedAadhaar,
            aadhaarMimeType: aadhaarFile!.mimetype,
            aadhaarConsentAt: new Date(),
          }),
          ...(encryptedUdyam && {
            udyamDocument: encryptedUdyam,
            udyamMimeType: udyamFile!.mimetype,
            udyamConsentAt: new Date(),
          }),
          approvalStatus: isSubmittingKyc ? 'PENDING' : 'APPROVED',
        },
        select: {
          id: true,
          fsiNumber: true,
          aadhaarNumber: true,
          udyamMimeType: true,
          aadhaarMimeType: true,
          approvalStatus: true,
          rejectionReason: true,
          kycSnapshot: true,
          alternatePhone: true,
        },
      });

      if (hasAddress(snapshot)) {
        const existingDefault = await prisma.savedAddress.findFirst({
          where: { customerProfileId: profile.id, isDefault: true },
        });
        const addressData = {
          fullName: snapshot.fullName,
          phone: snapshot.phone,
          addressLine1: snapshot.addressLine1,
          addressLine2: snapshot.addressLine2 || null,
          area: snapshot.area,
          city: snapshot.city,
          state: snapshot.state,
          pinCode: snapshot.pincode,
          landmark: snapshot.landmark || null,
          mapLink: snapshot.mapLink || null,
          isDefault: true,
        };
        if (existingDefault) {
          await prisma.savedAddress.update({
            where: { id: existingDefault.id },
            data: addressData,
          });
        } else {
          await prisma.savedAddress.updateMany({
            where: { customerProfileId: profile.id },
            data: { isDefault: false },
          });
          await prisma.savedAddress.create({
            data: { customerProfileId: profile.id, ...addressData },
          });
        }
      }

      if (snapshot.fullName || snapshot.phone) {
        await prisma.user.update({
          where: { id: req.user!.id },
          data: {
            ...(snapshot.fullName && { name: snapshot.fullName }),
            ...(snapshot.phone && /^\d{10}$/.test(snapshot.phone) && { phone: snapshot.phone }),
          },
        });
      }

      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'CUSTOMER_PROFILE_UPDATE',
        entity: 'CustomerProfile',
        entityId: req.user!.id,
        details: `Customer KYC details updated; Aadhaar: ${encryptedAadhaar ? 'uploaded' : 'unchanged'}, Udyam: ${encryptedUdyam ? 'uploaded' : 'unchanged'}.`,
        ipAddress: req.ip,
      });

      if (isSubmittingKyc) {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { name: true, phone: true },
        });
        await NotificationService.notifyAdmins({
          title: 'Customer KYC Submitted',
          message: `${user?.name || user?.phone || 'A customer'} submitted verification documents for review.`,
        });
        await NotificationService.createNotification({
          userId: req.user!.id,
          title: 'KYC Submitted',
          message: 'Your verification details have been received and are pending agency review.',
          type: NotificationType.SYSTEM,
        });
      }

      ApiResponse.success(res, profile, 'Customer details saved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerKycStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: req.user!.id },
        select: {
          approvalStatus: true,
          rejectionReason: true,
          fsiNumber: true,
          aadhaarNumber: true,
          aadhaarMimeType: true,
          udyamMimeType: true,
          reviewedAt: true,
          kycSnapshot: true,
          alternatePhone: true,
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
      });

      const snapshot = parseKycSnapshot(profile?.kycSnapshot);
      const defaultAddress = profile?.addresses?.[0];
      const maskedAadhaar = profile?.aadhaarNumber
        ? `XXXX-XXXX-${profile.aadhaarNumber.slice(-4)}`
        : null;

      ApiResponse.success(
        res,
        {
          approvalStatus: profile?.approvalStatus || 'APPROVED',
          rejectionReason: profile?.rejectionReason || null,
          fsiNumber: profile?.fsiNumber || null,
          aadhaarNumber: profile?.aadhaarNumber || null,
          maskedAadhaar,
          hasAadhaarDocument: Boolean(profile?.aadhaarMimeType),
          hasUdyamDocument: Boolean(profile?.udyamMimeType),
          reviewedAt: profile?.reviewedAt || null,
          alternatePhone: (snapshot?.altPhone as string) || profile?.alternatePhone || null,
          bookingDurationDays: snapshot?.bookingDurationDays || null,
          remindersEnabled: Boolean(snapshot?.remindersEnabled),
          delivery: {
            fullName: (snapshot?.fullName as string) || defaultAddress?.fullName || '',
            phone: (snapshot?.phone as string) || defaultAddress?.phone || '',
            altPhone: (snapshot?.altPhone as string) || profile?.alternatePhone || '',
            addressLine1: (snapshot?.addressLine1 as string) || defaultAddress?.addressLine1 || '',
            addressLine2: (snapshot?.addressLine2 as string) || defaultAddress?.addressLine2 || '',
            area: (snapshot?.area as string) || defaultAddress?.area || '',
            city: (snapshot?.city as string) || defaultAddress?.city || '',
            state: (snapshot?.state as string) || defaultAddress?.state || 'Maharashtra',
            pincode: (snapshot?.pincode as string) || defaultAddress?.pinCode || '',
            landmark: (snapshot?.landmark as string) || defaultAddress?.landmark || '',
            mapLink: (snapshot?.mapLink as string) || defaultAddress?.mapLink || '',
          },
        },
        'Customer KYC status retrieved.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerUdyamDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: req.params.customerId },
        select: { udyamDocument: true, udyamMimeType: true },
      });
      if (!profile?.udyamDocument || !profile.udyamMimeType) {
        throw new NotFoundError('No Udyam certificate is available.');
      }
      const bytes = decryptDocument(profile.udyamDocument);
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'DOCUMENT_VIEW',
        entity: 'CustomerProfile',
        entityId: req.params.customerId,
        details: 'Viewed Udyam certificate.',
        ipAddress: req.ip,
      });
      res.setHeader('Content-Type', profile.udyamMimeType);
      res.setHeader('Content-Length', bytes.length);
      res.setHeader('Content-Disposition', 'inline; filename="udyam-certificate"');
      res.setHeader('Cache-Control', 'private, no-store, max-age=0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.status(200).send(bytes);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerAadhaarDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: req.params.customerId },
        select: { aadhaarDocument: true, aadhaarMimeType: true },
      });
      if (!profile?.aadhaarDocument || !profile.aadhaarMimeType) {
        throw new NotFoundError('No Aadhaar document is available.');
      }
      const bytes = decryptDocument(profile.aadhaarDocument);
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'DOCUMENT_VIEW',
        entity: 'CustomerProfile',
        entityId: req.params.customerId,
        details: 'Viewed Aadhaar document.',
        ipAddress: req.ip,
      });
      res.setHeader('Content-Type', profile.aadhaarMimeType);
      res.setHeader('Content-Length', bytes.length);
      res.setHeader('Content-Disposition', 'inline; filename="aadhaar-document"');
      res.setHeader('Cache-Control', 'private, no-store, max-age=0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.status(200).send(bytes);
    } catch (error) {
      next(error);
    }
  }

  static async listCustomerApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
      const profiles = await prisma.customerProfile.findMany({
        where: status
          ? { approvalStatus: status }
          : {
              OR: [
                { approvalStatus: 'PENDING' },
                { aadhaarNumber: { not: null } },
                { aadhaarMimeType: { not: null } },
                { udyamMimeType: { not: null } },
              ],
            },
        select: {
          id: true,
          userId: true,
          fsiNumber: true,
          aadhaarNumber: true,
          aadhaarMimeType: true,
          udyamMimeType: true,
          approvalStatus: true,
          rejectionReason: true,
          reviewedAt: true,
          createdAt: true,
          updatedAt: true,
          kycSnapshot: true,
          alternatePhone: true,
          addresses: {
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
            take: 1,
          },
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ approvalStatus: 'asc' }, { updatedAt: 'desc' }],
        take: 100,
      });

      const formatted = profiles.map((p) => {
        const snapshot = parseKycSnapshot(p.kycSnapshot);
        const address = p.addresses[0];
        return {
          id: p.id,
          customerId: p.userId,
          customerName: (snapshot?.fullName as string) || p.user.name,
          customerPhone: (snapshot?.phone as string) || p.user.phone,
          customerEmail: p.user.email,
          alternatePhone: (snapshot?.altPhone as string) || p.alternatePhone || null,
          fsiNumber: p.fsiNumber,
          maskedAadhaar: p.aadhaarNumber ? `XXXX-XXXX-${p.aadhaarNumber.slice(-4)}` : null,
          hasAadhaarDocument: Boolean(p.aadhaarMimeType),
          hasUdyamDocument: Boolean(p.udyamMimeType),
          approvalStatus: p.approvalStatus,
          rejectionReason: p.rejectionReason,
          reviewedAt: p.reviewedAt,
          createdAt: p.createdAt,
          bookingDurationDays: snapshot?.bookingDurationDays || null,
          remindersEnabled: Boolean(snapshot?.remindersEnabled),
          delivery: {
            fullName: (snapshot?.fullName as string) || address?.fullName || p.user.name,
            phone: (snapshot?.phone as string) || address?.phone || p.user.phone,
            altPhone: (snapshot?.altPhone as string) || p.alternatePhone || '',
            addressLine1: (snapshot?.addressLine1 as string) || address?.addressLine1 || '',
            addressLine2: (snapshot?.addressLine2 as string) || address?.addressLine2 || '',
            area: (snapshot?.area as string) || address?.area || '',
            city: (snapshot?.city as string) || address?.city || '',
            state: (snapshot?.state as string) || address?.state || '',
            pincode: (snapshot?.pincode as string) || address?.pinCode || '',
            landmark: (snapshot?.landmark as string) || address?.landmark || '',
            mapLink: (snapshot?.mapLink as string) || address?.mapLink || '',
          },
        };
      });

      ApiResponse.success(res, formatted, 'Customer applications retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async reviewCustomerApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, reason } = req.body as { status: 'APPROVED' | 'REJECTED'; reason?: string };
      const { customerId } = req.params;

      const profile = await prisma.customerProfile.findUnique({
        where: { userId: customerId },
        include: { user: true },
      });
      if (!profile) throw new NotFoundError('Customer profile not found.');

      const reviewedAt = new Date();
      const updated = await prisma.customerProfile.update({
        where: { userId: customerId },
        data: {
          approvalStatus: status,
          rejectionReason: status === 'REJECTED' ? reason?.trim() || 'Verification criteria not met' : null,
          reviewedAt,
          reviewedById: req.user!.id,
        },
      });

      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: `CUSTOMER_KYC_${status}`,
        entity: 'CustomerProfile',
        entityId: profile.id,
        details: status === 'REJECTED' ? `Rejection reason: ${reason?.trim()}` : 'Customer KYC approved.',
        ipAddress: req.ip,
      });

      const message =
        status === 'APPROVED'
          ? 'Your customer KYC has been approved. Cylinder booking is now fully unlocked.'
          : `Your customer KYC application was not approved. Reason: ${reason?.trim() || 'Details could not be verified'}`;

      await NotificationService.createNotification({
        userId: customerId,
        title: `KYC Application ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message,
        type: NotificationType.SYSTEM,
      });

      if (profile.user.phone) {
        await sendSms({ phone: profile.user.phone, message });
      }
      if (profile.user.email) {
        await sendEmail({
          to: profile.user.email,
          subject: `DS Shinde Gas KYC ${status.toLowerCase()}`,
          text: message,
          html: `<p>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
        });
      }

      ApiResponse.success(res, updated, `Customer KYC ${status.toLowerCase()}.`);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomerDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await prisma.customerProfile.updateMany({
        where: { userId: req.params.customerId },
        data: {
          udyamDocument: null,
          udyamMimeType: null,
          aadhaarDocument: null,
          aadhaarMimeType: null,
        },
      });
      if (profile.count === 0) throw new NotFoundError('Customer profile not found.');
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'DOCUMENT_DELETE',
        entity: 'CustomerProfile',
        entityId: req.params.customerId,
        details: 'Deleted stored KYC documents.',
        ipAddress: req.ip,
      });
      ApiResponse.success(res, null, 'Customer documents securely deleted.');
    } catch (error) {
      next(error);
    }
  }

  static async getRiderApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const application = await prisma.riderApplication.findUnique({
        where: { userId: req.user!.id },
        select: riderApplicationSelect,
      });
      ApiResponse.success(res, application, 'Rider application status retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async submitRiderApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user || user.role !== Role.RIDER) {
        throw new NotFoundError('Rider account not found.');
      }
      if (!user.phone && !user.email) {
        throw new BadRequestError('Verify your phone number or email address before applying.');
      }
      const submittedPhone = String(req.body.phone || '').replace(/\D/g, '');
      if (submittedPhone.length !== 10) {
        throw new BadRequestError('Enter a valid 10-digit mobile number.');
      }
      if (user.phone && user.phone !== submittedPhone) {
        throw new BadRequestError('Your verified mobile number cannot be changed from this form.');
      }
      if (!user.phone) {
        const phoneTaken = await prisma.user.findFirst({
          where: { phone: submittedPhone, NOT: { id: user.id } },
          select: { id: true },
        });
        if (phoneTaken) {
          throw new ConflictError('This mobile number is already used by another account.');
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: submittedPhone },
        });
        user.phone = submittedPhone;
      }
      const consented =
        req.body.consent === true ||
        req.body.consent === 'true' ||
        req.body.consent === 'on' ||
        req.body.consent === '1';
      if (!consented) {
        throw new BadRequestError('Consent is required before storing rider application documents.');
      }

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const document = (field: string): Express.Multer.File => {
        const file = files?.[field]?.[0];
        if (!file) throw new BadRequestError(`The ${field} document is required.`);
        if (!file.buffer || file.buffer.length === 0) {
          throw new BadRequestError(`The ${field} document is empty.`);
        }
        return file;
      };

      const rc = document('rcDocument');
      const front = document('frontPhoto');
      const back = document('backPhoto');
      const selfie = document('selfie');
      const isImage = (file: Express.Multer.File) =>
        file.mimetype.startsWith('image/') && isValidImage(file.buffer);
      if (
        !((rc.mimetype === 'application/pdf' && isValidPdf(rc.buffer)) || isImage(rc)) ||
        !isImage(front) ||
        !isImage(back) ||
        !isImage(selfie)
      ) {
        throw new BadRequestError('Upload genuine PDF or image files: RC book as PDF/image; all photos as images.');
      }
      const current = await prisma.riderApplication.findUnique({ where: { userId: user.id } });
      if (current?.status === 'APPROVED') {
        throw new ConflictError('Your rider application is already approved.');
      }

      const application = await prisma.riderApplication.upsert({
        where: { userId: user.id },
        update: {
          fullName: req.body.fullName.trim(),
          phone: user.phone || submittedPhone,
          email: user.email,
          address: req.body.address.trim(),
          vehicleNumber: req.body.vehicleNumber.trim().toUpperCase(),
          rcDocument: encryptDocument(rc.buffer),
          rcMimeType: rc.mimetype,
          frontPhoto: encryptDocument(front.buffer),
          frontPhotoMimeType: front.mimetype,
          backPhoto: encryptDocument(back.buffer),
          backPhotoMimeType: back.mimetype,
          selfie: encryptDocument(selfie.buffer),
          selfieMimeType: selfie.mimetype,
          status: 'PENDING',
          consentAt: new Date(),
          rejectionReason: null,
          reviewedAt: null,
          reviewedById: null,
        },
        create: {
          userId: user.id,
          consentAt: new Date(),
          fullName: req.body.fullName.trim(),
          phone: user.phone || submittedPhone,
          email: user.email,
          address: req.body.address.trim(),
          vehicleNumber: req.body.vehicleNumber.trim().toUpperCase(),
          rcDocument: encryptDocument(rc.buffer),
          rcMimeType: rc.mimetype,
          frontPhoto: encryptDocument(front.buffer),
          frontPhotoMimeType: front.mimetype,
          backPhoto: encryptDocument(back.buffer),
          backPhotoMimeType: back.mimetype,
          selfie: encryptDocument(selfie.buffer),
          selfieMimeType: selfie.mimetype,
        },
        select: riderApplicationSelect,
      });
      await recordAuditLog(prisma, {
        userId: user.id,
        action: 'RIDER_APPLICATION_SUBMIT',
        entity: 'RiderApplication',
        entityId: application.id,
        details: 'Rider application submitted or updated with encrypted documents.',
        ipAddress: req.ip,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { name: application.fullName },
      });

      await NotificationService.notifyAdmins({
        title: 'New rider application',
        message: `${application.fullName} submitted a rider application for ${application.vehicleNumber}.`,
      });
      await NotificationService.createNotification({
        userId: user.id,
        title: 'Application submitted',
        message: 'Your rider application is pending administrator review.',
        type: NotificationType.SYSTEM,
      });

      ApiResponse.created(res, application, 'Rider application submitted for administrator review.');
    } catch (error) {
      next(error);
    }
  }

  static async listRiderApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
      if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        throw new BadRequestError('Filter status must be PENDING, APPROVED, or REJECTED.');
      }
      const applications = await prisma.riderApplication.findMany({
        where: status ? { status } : undefined,
        select: {
          ...riderApplicationSelect,
          user: { select: { isActive: true } },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
        take: 100,
      });
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'RIDER_APPLICATION_LIST',
        entity: 'RiderApplication',
        entityId: 'list',
        details: `Listed rider applications${status ? ` with status ${status}` : ''}.`,
        ipAddress: req.ip,
      });
      ApiResponse.success(res, applications, 'Rider applications retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async reviewRiderApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, reason } = req.body as { status: 'APPROVED' | 'REJECTED'; reason?: string };
      const application = await prisma.riderApplication.findUnique({ where: { id: req.params.id } });
      if (!application) throw new NotFoundError('Rider application not found.');

      if (application.status === 'APPROVED') {
        throw new ConflictError('An approved rider application cannot be changed.');
      }

      const reviewedAt = new Date();
      const result = await prisma.$transaction(async (tx) => {
        const reviewed = await tx.riderApplication.update({
          where: { id: application.id },
          data: {
            status,
            rejectionReason: status === 'REJECTED' ? reason!.trim() : null,
            reviewedAt,
            reviewedById: req.user!.id,
          },
          select: riderApplicationSelect,
        });

        if (status === 'APPROVED') {
          await tx.rider.upsert({
            where: { userId: application.userId },
            update: { vehicleNumber: application.vehicleNumber, isAvailable: true },
            create: {
              userId: application.userId,
              vehicleNumber: application.vehicleNumber,
              isAvailable: true,
            },
          });
        } else {
          await tx.rider.deleteMany({ where: { userId: application.userId } });
        }
        await recordAuditLog(tx, {
          userId: req.user!.id,
          action: `RIDER_APPLICATION_${status}`,
          entity: 'RiderApplication',
          entityId: application.id,
          details: status === 'REJECTED' ? `Rejection reason: ${reason!.trim()}` : 'Application approved.',
          ipAddress: req.ip,
        });
        return reviewed;
      });

      const message =
        status === 'APPROVED'
          ? 'Your rider application has been approved. You can now access rider deliveries.'
          : `Your rider application was not approved. Reason: ${reason!.trim()}`;
      await NotificationService.createNotification({
        userId: application.userId,
        title: `Rider application ${status === 'APPROVED' ? 'approved' : 'reviewed'}`,
        message,
        type: NotificationType.SYSTEM,
      });

      const contact = await prisma.user.findUnique({
        where: { id: application.userId },
        select: { phone: true, email: true },
      });
      if (contact?.phone) {
        await sendSms({ phone: contact.phone, message });
      }
      if (contact?.email) {
        await sendEmail({
          to: contact.email,
          subject: `DS Shinde Gas rider application ${status.toLowerCase()}`,
          text: message,
          html: `<p>${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
        });
      }

      ApiResponse.success(res, result, `Rider application ${status.toLowerCase()}.`);
    } catch (error) {
      next(error);
    }
  }

  static async getRiderDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documentFields = {
        rcDocument: { bytes: 'rcDocument', mime: 'rcMimeType' },
        frontPhoto: { bytes: 'frontPhoto', mime: 'frontPhotoMimeType' },
        backPhoto: { bytes: 'backPhoto', mime: 'backPhotoMimeType' },
        selfie: { bytes: 'selfie', mime: 'selfieMimeType' },
      } as const;
      const selected = documentFields[req.params.document as keyof typeof documentFields];
      if (!selected) throw new BadRequestError('Unknown rider document.');

      const application = await prisma.riderApplication.findUnique({
        where: { id: req.params.id },
        select: {
          [selected.bytes]: true,
          [selected.mime]: true,
        },
      });
      if (!application) throw new NotFoundError('Rider application not found.');
      const encryptedBytes = application[selected.bytes] as Uint8Array | null;
      const mimeType = application[selected.mime] as string | null;
      if (!encryptedBytes || !mimeType) throw new NotFoundError('Rider document not found.');
      const bytes = decryptDocument(encryptedBytes);
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'DOCUMENT_VIEW',
        entity: 'RiderApplication',
        entityId: req.params.id,
        details: `Viewed ${req.params.document}.`,
        ipAddress: req.ip,
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', bytes.length);
      res.setHeader('Content-Disposition', `inline; filename="${req.params.document}"`);
      res.setHeader('Cache-Control', 'private, no-store, max-age=0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.status(200).send(Buffer.from(bytes));
    } catch (error) {
      next(error);
    }
  }

  static async deleteRiderDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await prisma.riderApplication.updateMany({
        where: { id: req.params.id },
        data: {
          rcDocument: null,
          frontPhoto: null,
          backPhoto: null,
          selfie: null,
        },
      });
      if (deleted.count === 0) throw new NotFoundError('Rider application not found.');
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'DOCUMENT_DELETE',
        entity: 'RiderApplication',
        entityId: req.params.id,
        details: 'Deleted stored rider application documents.',
        ipAddress: req.ip,
      });
      ApiResponse.success(res, null, 'Rider application documents securely deleted.');
    } catch (error) {
      next(error);
    }
  }
}
