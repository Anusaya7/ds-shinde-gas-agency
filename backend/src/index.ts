import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import prisma from './config/database.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// 1. Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || config.isDev) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-razorpay-signature'],
  })
);

// 3. Body parsers with raw body retention for webhook signature verification
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Global API rate limiting
app.use('/api', apiLimiter);

// 5. Mount API Routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    agency: 'D.S SHINDE GAS AGENCY',
    tagline: 'Reliable LPG Cylinder Delivery Platform',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 6. 404 Route Handler
app.use((req: Request, res: Response, next) => {
  next(new NotFoundError(`Resource not found on endpoint: ${req.method} ${req.originalUrl}`));
});

// 7. Global Error Handler
app.use(errorHandler);

// 8. Start Server
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  D.S SHINDE GAS AGENCY BACKEND API`);
  console.log(`  Mode: ${config.nodeEnv}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  URL: http://localhost:${config.port}`);
  console.log(`  Health Check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connections closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
