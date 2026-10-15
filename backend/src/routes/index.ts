import { Router } from 'express';
import authRoutes from './auth.routes.js';
import customerRoutes from './customer.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import adminRoutes from './admin.routes.js';
import riderRoutes from './rider.routes.js';
import notificationRoutes from './notification.routes.js';
import prisma from '../config/database.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', async (req, res) => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      service: 'D.S SHINDE GAS AGENCY API',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      service: 'D.S SHINDE GAS AGENCY API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/customer', customerRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/rider', riderRoutes);
apiRouter.use('/notifications', notificationRoutes);

export default apiRouter;
