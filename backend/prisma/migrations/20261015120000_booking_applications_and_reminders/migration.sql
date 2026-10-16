-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN "fsiNumber" TEXT;
ALTER TABLE "CustomerProfile" ADD COLUMN "udyamConsentAt" DATETIME;
ALTER TABLE "CustomerProfile" ADD COLUMN "udyamDocument" BLOB;
ALTER TABLE "CustomerProfile" ADD COLUMN "udyamMimeType" TEXT;

-- CreateTable
CREATE TABLE "RiderApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "rcDocument" BLOB,
    "rcMimeType" TEXT NOT NULL,
    "frontPhoto" BLOB,
    "frontPhotoMimeType" TEXT NOT NULL,
    "backPhoto" BLOB,
    "backPhotoMimeType" TEXT NOT NULL,
    "selfie" BLOB,
    "selfieMimeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "consentAt" DATETIME,
    "rejectionReason" TEXT,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RiderApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactEnquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDER_PLACED',
    "rejectionReason" TEXT,
    "cancellationReason" TEXT,
    "deliveryName" TEXT NOT NULL,
    "deliveryPhone" TEXT NOT NULL,
    "deliveryAltPhone" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryArea" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryState" TEXT NOT NULL,
    "deliveryPinCode" TEXT NOT NULL,
    "deliveryLandmark" TEXT,
    "deliveryMapLink" TEXT,
    "subtotal" DECIMAL NOT NULL,
    "deliveryCharges" DECIMAL NOT NULL,
    "taxes" DECIMAL NOT NULL DEFAULT 0,
    "paymentFee" DECIMAL NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "riderId" TEXT,
    "deliveredAt" DATETIME,
    "estimatedDelivery" DATETIME,
    "notes" TEXT,
    "bookingDurationDays" INTEGER NOT NULL DEFAULT 1,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "nextReminderAt" DATETIME,
    "remindersEndAt" DATETIME,
    "fsiNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("cancellationReason", "createdAt", "customerId", "deliveredAt", "deliveryAddress", "deliveryAltPhone", "deliveryArea", "deliveryCharges", "deliveryCity", "deliveryLandmark", "deliveryMapLink", "deliveryName", "deliveryPhone", "deliveryPinCode", "deliveryState", "estimatedDelivery", "id", "notes", "orderNumber", "paymentFee", "paymentMethod", "paymentStatus", "rejectionReason", "riderId", "status", "subtotal", "taxes", "totalAmount", "updatedAt") SELECT "cancellationReason", "createdAt", "customerId", "deliveredAt", "deliveryAddress", "deliveryAltPhone", "deliveryArea", "deliveryCharges", "deliveryCity", "deliveryLandmark", "deliveryMapLink", "deliveryName", "deliveryPhone", "deliveryPinCode", "deliveryState", "estimatedDelivery", "id", "notes", "orderNumber", "paymentFee", "paymentMethod", "paymentStatus", "rejectionReason", "riderId", "status", "subtotal", "taxes", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX "Order_customerId_status_idx" ON "Order"("customerId", "status");
CREATE INDEX "Order_riderId_status_idx" ON "Order"("riderId", "status");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isActive", "isVerified", "name", "passwordHash", "phone", "role", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "isVerified", "name", "passwordHash", "phone", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RiderApplication_userId_key" ON "RiderApplication"("userId");
CREATE INDEX "RiderApplication_status_createdAt_idx" ON "RiderApplication"("status", "createdAt");
CREATE INDEX "ContactEnquiry_status_idx" ON "ContactEnquiry"("status");
CREATE INDEX "ContactEnquiry_createdAt_idx" ON "ContactEnquiry"("createdAt");
