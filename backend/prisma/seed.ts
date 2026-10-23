import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { Role } from '../src/constants/enums';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DS Shinde Gas database...');


  // Create an administrator
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@dsshinde.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const passwordHashAdmin = await bcrypt.hash(adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: passwordHashAdmin },
    create: {
      email: adminEmail,
      phone: process.env.SEED_ADMIN_PHONE || '9511760208',
      name: process.env.SEED_ADMIN_NAME || 'Agency Admin',
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });
  console.log(`Configured administrator account: ${adminUser.email}`);

  // 2. Sample Rider User & Rider record
  const passwordHashRider = await bcrypt.hash('Rider@123', 10);
  const riderUser = await prisma.user.upsert({
    where: { email: 'rider@dsshinde.com' },
    update: { passwordHash: passwordHashRider },
    create: {
      email: 'rider@dsshinde.com',
      phone: '9876543210',
      name: 'Ramesh Pawar (Rider)',
      passwordHash: passwordHashRider,
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
  const passwordHashCustomer = await bcrypt.hash('Customer@123', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@dsshinde.com' },
    update: { passwordHash: passwordHashCustomer },
    create: {
      email: 'customer@dsshinde.com',
      phone: '9822001122',
      name: 'Rahul Deshmukh',
      passwordHash: passwordHashCustomer,
      role: Role.CUSTOMER,
      isActive: true,
      isVerified: true,
      customerProfile: {
        create: {
          alternatePhone: '9822001123',
          approvalStatus: 'APPROVED',
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
  // Ensure existing customer profile has approvalStatus = APPROVED
  await prisma.customerProfile.updateMany({
    where: { userId: customerUser.id },
    data: { approvalStatus: 'APPROVED' },
  });
  console.log(`Sample customer created/verified: ${customerUser.email}`);

  // Cylinder Products (sizes 12kg to 425kg, branded Gaspoint)
  const products = [
    {
      name: 'Gaspoint 12 KG Cylinder',
      sizeKg: 12,
      description: 'Compact Gaspoint domestic cylinder for small families and light daily cooking needs.',
      price: 850.0,
      deliveryCharge: 50.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 10,
      isCommercial: false,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/12kg.svg',
    },
    {
      name: 'Gaspoint 15 KG Cylinder',
      sizeKg: 15,
      description: 'Standard Gaspoint domestic LPG cylinder widely used in regular households with standard safety valves.',
      price: 1080.0,
      deliveryCharge: 60.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 5,
      isCommercial: false,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/15kg.svg',
    },
    {
      name: 'Gaspoint 17 KG Cylinder',
      sizeKg: 17,
      description: 'Mid-size Gaspoint cylinder for larger households and small canteens with moderate usage.',
      price: 1250.0,
      deliveryCharge: 60.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 5,
      isCommercial: false,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/17kg.svg',
    },
    {
      name: 'Gaspoint 19 KG Cylinder',
      sizeKg: 19.2,
      description: 'Gaspoint commercial cylinder designed for restaurants, fast-food outlets, tea stalls, and canteens.',
      price: 1850.0,
      deliveryCharge: 100.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 20,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/19kg.svg',
    },
    {
      name: 'Gaspoint 21 KG Cylinder',
      sizeKg: 21,
      description: 'Gaspoint commercial cylinder for busy kitchens, bakeries, and medium food outlets.',
      price: 2050.0,
      deliveryCharge: 100.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 20,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/21kg.svg',
    },
    {
      name: 'Gaspoint 33 KG Cylinder',
      sizeKg: 33,
      description: 'Heavy-duty Gaspoint commercial cylinder ideal for hotel banquets, sweet makers, and medium-scale food processing.',
      price: 3200.0,
      deliveryCharge: 150.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 20,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/33kg.svg',
    },
    {
      name: 'Gaspoint 50 KG Cylinder',
      sizeKg: 50,
      description: 'High-volume Gaspoint industrial cylinder engineered for intensive manufacturing processes, bakeries, and heating systems.',
      price: 4800.0,
      deliveryCharge: 200.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 50,
      isCommercial: true,
      requiresQuotation: false,
      imageUrl: '/assets/cylinders/50kg.svg',
    },
    {
      name: 'Gaspoint 425 KG Bulk LOT Cylinder',
      sizeKg: 425,
      description: 'Massive Gaspoint Liquid Off-Take (LOT) bulk cylinder installations for large industrial plants, hotels, and boiler facilities. Custom quote provided.',
      price: 39500.0,
      deliveryCharge: 1000.0,
      isActive: true,
      minQuantity: 1,
      maxQuantity: 10,
      isCommercial: true,
      requiresQuotation: true,
      imageUrl: '/assets/cylinders/425kg.svg',
    },
  ];

  // Remove legacy products outside the 12kg-425kg range (skip if referenced by existing orders)
  const legacySizes = [5, 13];
  for (const sizeKg of legacySizes) {
    const legacy = await prisma.product.findFirst({ where: { sizeKg } });
    if (legacy) {
      try {
        await prisma.product.delete({ where: { id: legacy.id } });
        console.log(`Removed legacy product: ${legacy.name} (${sizeKg} kg)`);
      } catch {
        await prisma.product.update({
          where: { id: legacy.id },
          data: { isActive: false, name: `${legacy.name} (discontinued)` },
        });
        console.log(`Deactivated legacy product: ${legacy.name} (${sizeKg} kg) — still referenced by past orders`);
      }
    }
  }

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
