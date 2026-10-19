const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  const columns = [
    { name: 'aadhaarNumber', def: 'TEXT' },
    { name: 'aadhaarDocument', def: 'BLOB' },
    { name: 'aadhaarMimeType', def: 'TEXT' },
    { name: 'aadhaarConsentAt', def: 'DATETIME' },
    { name: 'approvalStatus', def: "TEXT DEFAULT 'APPROVED'" },
    { name: 'rejectionReason', def: 'TEXT' },
    { name: 'reviewedAt', def: 'DATETIME' },
    { name: 'reviewedById', def: 'TEXT' },
  ];

  for (const col of columns) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE CustomerProfile ADD COLUMN ${col.name} ${col.def};`);
      console.log(`Added column ${col.name}`);
    } catch (e) {
      if (e.message && e.message.includes('duplicate column')) {
        console.log(`Column ${col.name} already exists.`);
      } else {
        console.log(`Column ${col.name} note: ${e.message}`);
      }
    }
  }

  // Ensure default seeded customer is APPROVED
  try {
    await prisma.$executeRawUnsafe("UPDATE CustomerProfile SET approvalStatus = 'APPROVED' WHERE approvalStatus IS NULL;");
  } catch (e) {
    // Ignore
  }

  await prisma.$disconnect();
  console.log('Local SQLite migration complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
