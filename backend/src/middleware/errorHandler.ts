import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import config from '../config/index.js';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma error codes
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = (err.meta?.target as string[]) || [];
        message = `A record with this ${target.join(', ') || 'field'} already exists.`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        message = (err.meta?.cause as string) || 'Record not found.';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        message = 'Foreign key constraint violated.';
        break;
      }
      default: {
        statusCode = 400;
        message = `Database operation error: ${err.message}`;
      }
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  } else {
    // Unexpected error
    console.error('[UNHANDLED ERROR]', err);
    message = config.isDev ? err.message : 'Internal server error. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
    ...(config.isDev && { stack: err.stack }),
  });
}
