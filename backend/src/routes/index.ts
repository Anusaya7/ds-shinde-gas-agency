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

// Public Settings endpoint
apiRouter.get('/settings/public', async (req, res) => {
  try {
    const settingsList = await prisma.agencySetting.findMany();
    const map = new Map(settingsList.map((s) => [s.key, s.value]));

    const structured = {
      agencyName: map.get('agency_name') || 'D.S SHINDE GAS AGENCY',
      primaryPhone: map.get('contact_phone_1') || '9511760208',
      secondaryPhone: map.get('contact_phone_2') || '9975300929',
      email: map.get('agency_email') || 'support@dsshindegas.com',
      address: map.get('agency_address') || 'Shop No. 4, Main Road, Near Market Yard, Maharashtra, India',
      deliveryAreas: (map.get('service_areas') || 'Karad, Malkapur, Ogalewadi, Saidapur, Vidyanagar, Wathar')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      businessHours: map.get('support_hours') || '8:00 AM - 8:00 PM (Monday to Saturday)',
      heroHeadline: map.get('hero_headline') || 'Your Trusted LPG Gas Partner',
      heroSubheadline: map.get('hero_subheadline') || 'Reliable LPG Cylinder Solutions for Home and Business',
      heroDescription: map.get('hero_description') || 'Explore cylinder capacities, place your order conveniently and manage your delivery through a simple ordering experience.',
      heroPrimaryCtaText: map.get('hero_primary_cta_text') || 'Order a Cylinder',
      heroPrimaryCtaLink: map.get('hero_primary_cta_link') || '/dashboard/orders/new',
      heroSecondaryCtaText: map.get('hero_secondary_cta_text') || 'Explore Cylinder Sizes',
      heroSecondaryCtaLink: map.get('hero_secondary_cta_link') || '/#cylinder-gallery',
      heroImageUrl: map.get('hero_image_url') || '/assets/cylinders/hero-cylinder.jpg',
      cylinderSectionTitle: map.get('cylinder_section_title') || 'Explore Our LPG Cylinder Sizes',
      cylinderSectionSubtitle: map.get('cylinder_section_subtitle') || 'Choose a cylinder capacity that matches your requirements.',
      announcementBanner: map.get('announcement_banner') || '',
      headerCtaText: map.get('header_cta_text') || 'Order Cylinder',
      headerCtaLink: map.get('header_cta_link') || '/dashboard/orders/new',
    };

    res.status(200).json({
      success: true,
      data: structured,
      message: 'Public settings loaded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load public settings',
    });
  }
});

// Public Contact Form Enquiry endpoint
apiRouter.post('/contact', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number and message are required',
      });
    }

    const enquiry = await (prisma as any).contactEnquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        subject: subject || 'General Customer Enquiry',
        message,
        status: 'NEW',
      },
    });

    res.status(201).json({
      success: true,
      data: enquiry,
      message: 'Thank you for reaching out! Your message has been received by our agency team.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry. Please call our hotline directly.',
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
