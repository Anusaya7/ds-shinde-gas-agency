-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN "welcomeOfferUsedAt" DATETIME;

-- Existing customers with booking history are not eligible for a first-booking offer.
UPDATE "CustomerProfile"
SET "welcomeOfferUsedAt" = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1
    FROM "Order"
    WHERE "Order"."customerId" = "CustomerProfile"."userId"
);

-- Do not carry forward the unverified starter tax rate.
UPDATE "AgencySetting" SET "value" = '0' WHERE "key" = 'tax_percentage';

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
    "welcomeOfferDiscount" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("bookingDurationDays", "cancellationReason", "createdAt", "customerId", "deliveredAt", "deliveryAddress", "deliveryAltPhone", "deliveryArea", "deliveryCharges", "deliveryCity", "deliveryLandmark", "deliveryMapLink", "deliveryName", "deliveryPhone", "deliveryPinCode", "deliveryState", "estimatedDelivery", "fsiNumber", "id", "nextReminderAt", "notes", "orderNumber", "paymentFee", "paymentMethod", "paymentStatus", "rejectionReason", "remindersEnabled", "remindersEndAt", "riderId", "status", "subtotal", "taxes", "totalAmount", "updatedAt") SELECT "bookingDurationDays", "cancellationReason", "createdAt", "customerId", "deliveredAt", "deliveryAddress", "deliveryAltPhone", "deliveryArea", "deliveryCharges", "deliveryCity", "deliveryLandmark", "deliveryMapLink", "deliveryName", "deliveryPhone", "deliveryPinCode", "deliveryState", "estimatedDelivery", "fsiNumber", "id", "nextReminderAt", "notes", "orderNumber", "paymentFee", "paymentMethod", "paymentStatus", "rejectionReason", "remindersEnabled", "remindersEndAt", "riderId", "status", "subtotal", "taxes", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX "Order_customerId_status_idx" ON "Order"("customerId", "status");
CREATE INDEX "Order_riderId_status_idx" ON "Order"("riderId", "status");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
