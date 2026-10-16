import { PrismaClient } from '@prisma/client';
import { Role } from '../src/constants/enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DS Shinde Gas database...');


  // Create an administrator only when explicit deployment credentials are provided.
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHashAdmin = await bcrypt.hash(adminPassword, 12);
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: passwordHashAdmin },
      create: {
        email: adminEmail,
        phone: process.env.SEED_ADMIN_PHONE || null,
        name: process.env.SEED_ADMIN_NAME || 'Agency Admin',
        passwordHash: passwordHashAdmin,
        role: Role.ADMIN,
        isActive: true,
        isVerified: true,
      },
    });
    console.log(`Configured administrator account: ${adminUser.email}`);
  } else {
    console.log('Skipping administrator seed; set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.');
  }

  // 2. Sample Rider User & Rider record
  const riderUser = await prisma.user.upsert({
    where: { email: 'rider@dsshinde.com' },
    update: {},
    create: {
      email: 'rider@dsshinde.com',
      phone: '9876543210',
      name: 'Ramesh Pawar (Rider)',
      passwordHash: null,
      role: Role.RIDER,
      isActive: true,
      isVerified: true,
      riderProfile: {
        create: {
          vehicleNumber: 'MH-50-AB-1234',
          isAvailable: true,
        },
      },
    },
  });
  console.log(`Rider user created/verified: ${riderUser.email}`);

  // 3. Sample Customer User & Profile
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@dsshinde.com' },
    update: {},
    create: {
      email: 'customer@dsshinde.com',
      phone: '9822001122',
      name: 'Rahul Deshmukh',
      passwordHash: null,
      role: Role.CUSTOMER,
      isActive: true,
      isVerified: true,
      customerProfile: {
        create: {
          alternatePhone: '9822001123',
          addresses: {
            create: {
              fullName: 'Rahul Deshmukh',
              phone: '9822001122',
              addressLine1: 'Flat 302, Sai Residency',
              addressLine2: 'Near Shivaji Chowk',
              area: 'Malkapur',
              city: 'Karad',
              state: 'Maharashtra',
              pinCode: '415539',
              landmark: 'Opposite Bank of Maharashtra',
              isDefault: true,
            },
          },
        },
      },
    },
  });
  console.log(`Sample customer created/verified: ${customerUser.email}`);

  // 4. Cylinder Products (7 sizes)
  const products = [
    {
      name: '5 KG LPG Cylinder',
      sizeKg: 5,
      description: 'Compact, lightweight, and portable 5kg LPG cylinder. Perfect for small families, camping, students, and low-usage applications.',
      price: 420.0,
      deliveryCharge: 50.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 10,
      isCommercial: false,
      requiresQuotation: false,
      imageUrl: '/images/cylinder-5kg.png',
    },
    {
      name: '13 KG LPG Cylinder',
      sizeKg: 13,
      description: 'Mid-sized domestic cylinder for households with moderate cooking gas requirements.',
      price: 950.0,
      deliveryCharge: 60.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 5,
      isCommercial: false,
      requiresQuotation: false,
      imageUrl: '/images/cylinder-13kg.png',
    },
    {
      name: '15 KG LPG Cylinder',
      sizeKg: 15,
      description: 'Standard domestic LPG cylinder widely used in regular households with standard safety valves.',
      price: 1080.0,
      deliveryCharge: 60.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 5,
      isCommercial: false,
      requiresQuotation: false,
      imageUrl: '/images/cylinder-15kg.png',
    },
    {
      name: '19.2 KG Commercial Cylinder',
      sizeKg: 19.2,
      description: 'Standard commercial cylinder specifically designed for restaurants, fast-food outlets, tea stalls, and canteens.',
      price: 1850.0,
      deliveryCharge: 100.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 20,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/images/cylinder-19kg.png',
    },
    {
      name: '33 KG Commercial Cylinder',
      sizeKg: 33,
      description: 'Heavy-duty commercial LPG cylinder ideal for hotel banquets, sweet makers, and medium-scale food processing.',
      price: 3200.0,
      deliveryCharge: 150.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 20,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/images/cylinder-33kg.png',
    },
    {
      name: '50 KG Industrial Cylinder',
      sizeKg: 50,
      description: 'High-volume industrial cylinder engineered for intensive manufacturing processes, bakeries, and heating systems.',
      price: 4800.0,
      deliveryCharge: 200.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 50,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/images/cylinder-50kg.png',
    },
    {
      name: '425 KG Bulk LOT Cylinder',
      sizeKg: 425,
      description: 'Massive Liquid Off-Take (LOT) bulk cylinder installations for large industrial plants, hotels, and boiler facilities. Custom quote provided.',
      price: 39500.0,
      deliveryCharge: 1000.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 10,
      isCommercial: true,
      requiresQuotation: true,
      imageUrl: '/images/cylinder-425kg.png',
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({
      where: { sizeKg: prod.sizeKg },
    });

    if (!existing) {
      await prisma.product.create({
        data: prod,
      });
      console.log(`Created product: ${prod.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: prod,
      });
      console.log(`Updated product: ${prod.name}`);
    }
  }

  // 5. Default Agency Settings
  const settings = [
    {
      key: 'agency_name',
      value: 'DS Shinde Gas',
      description: 'Official registered name of the LPG agency',
    },
    {
      key: 'contact_phone_1',
      value: '9511760208',
      description: 'Primary customer support & booking hotline',
    },
    {
      key: 'contact_phone_2',
      value: '9975300929',
      description: 'Secondary emergency & dispatch phone number',
    },
    {
      key: 'agency_email',
      value: 'contact@dsshinde.com',
      description: 'Agency primary support email address',
    },
    {
      key: 'agency_address',
      value: 'Main Road, Opp. Market Yard, Karad, Maharashtra 415110',
      description: 'Agency physical godown and office address',
    },
    {
      key: 'delivery_charge_default',
      value: '50.00',
      description: 'Base delivery fee applied per domestic order',
    },
    {
      key: 'tax_percentage',
      value: '0',
      description: 'Applicable GST / VAT rate on commercial cylinders',
    },
    {
      key: 'online_payment_fee_percent',
      value: '0',
      description: 'Convenience charge percentage for online payments',
    },
    {
      key: 'service_areas',
      value: 'Karad, Malkapur, Ogalewadi, Saidapur, Vidyanagar, Wathar',
      description: 'Comma-separated coverage pin-codes / areas',
    },
    {
      key: 'support_hours',
      value: '8:00 AM - 8:00 PM (Monday to Saturday)',
      description: 'Working operational hours for delivery and booking',
    },
  ];

  for (const setting of settings) {
    await prisma.agencySetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: setting,
    });
    console.log(`Saved agency setting: ${setting.key}`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
