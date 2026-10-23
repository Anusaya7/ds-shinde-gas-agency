import { PrismaClient } from '@prisma/client';
import config from './index.js';

// Prisma client singleton for connection pooling
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: config.isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: { url: config.database.url },
    },
  });

if (config.isDev) {
  global.__prisma = prisma;
}

export default prisma;
