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

export class ApplicationController {
  static async saveCustomerDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (file && req.body.udyamConsent !== 'true') {
        throw new BadRequestError('Consent is required before uploading a Udyam certificate.');
      }
      let encryptedDocument: Buffer | undefined;
      if (file) {
        const validImage = file.mimetype.startsWith('image/') && isValidImage(file.buffer);
        const validPdf = file.mimetype === 'application/pdf' && isValidPdf(file.buffer);
        if (!validImage && !validPdf) {
          throw new BadRequestError('Upload a genuine PDF, JPEG, PNG, or WebP Udyam certificate.');
        }
        encryptedDocument = encryptDocument(file.buffer);
      }

      const profile = await prisma.customerProfile.upsert({
        where: { userId: req.user!.id },
        update: {
          ...(req.body.fsiNumber !== undefined && { fsiNumber: req.body.fsiNumber.trim() || null }),
          ...(encryptedDocument && {
            udyamDocument: encryptedDocument,
            udyamMimeType: file!.mimetype,
            udyamConsentAt: new Date(),
          }),
        },
        create: {
          userId: req.user!.id,
          fsiNumber: req.body.fsiNumber?.trim() || null,
          ...(encryptedDocument && {
            udyamDocument: encryptedDocument,
            udyamMimeType: file!.mimetype,
            udyamConsentAt: new Date(),
          }),
        },
        select: { fsiNumber: true, udyamMimeType: true },
      });
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'CUSTOMER_PROFILE_UPDATE',
        entity: 'CustomerProfile',
        entityId: req.user!.id,
        details: `Business details updated; Udyam document ${encryptedDocument ? 'uploaded' : 'not changed'}.`,
        ipAddress: req.ip,
      });
      ApiResponse.success(res, profile, 'Optional business details saved securely.');
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

  static async deleteCustomerDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await prisma.customerProfile.updateMany({
        where: { userId: req.params.customerId },
        data: { udyamDocument: null, udyamMimeType: null },
      });
      if (profile.count === 0) throw new NotFoundError('Customer profile not found.');
      await recordAuditLog(prisma, {
        userId: req.user!.id,
        action: 'DOCUMENT_DELETE',
        entity: 'CustomerProfile',
        entityId: req.params.customerId,
        details: 'Deleted stored Udyam certificate.',
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
      if (req.body.consent !== 'true') {
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
          phone: user.phone || '',
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
          phone: user.phone || '',
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
