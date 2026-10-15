import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 400,
    errors: unknown = null
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors ?? undefined,
    });
  }

  static paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Data retrieved successfully'
  ): Response {
    const totalPages = Math.ceil(total / limit) || 1;
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: meta,
    });
  }
}
