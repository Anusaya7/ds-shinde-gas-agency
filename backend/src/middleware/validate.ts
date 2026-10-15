import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schema: ValidationSchema | ZodTypeAny) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('safeParseAsync' in schema && typeof schema.safeParseAsync === 'function') {
        // Direct schema assumed to validate body
        const parsed = await schema.parseAsync(req.body);
        req.body = parsed;
      } else {
        const fullSchema = schema as ValidationSchema;
        if (fullSchema.body) {
          req.body = await fullSchema.body.parseAsync(req.body);
        }
        if (fullSchema.query) {
          req.query = await fullSchema.query.parseAsync(req.query);
        }
        if (fullSchema.params) {
          req.params = await fullSchema.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}
