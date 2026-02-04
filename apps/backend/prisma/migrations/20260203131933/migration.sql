/*
  Warnings:

  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "notes" TEXT,
    "total" INTEGER NOT NULL DEFAULT 0,
    "printedAt" DATETIME,
    "printStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "printerName" TEXT,
    "printError" TEXT,
    "lastPrintedByUserId" TEXT,
    "isVoided" BOOLEAN NOT NULL DEFAULT false,
    "voidedByUserId" TEXT,
    "voidedAt" DATETIME,
    "voidReason" TEXT,
    CONSTRAINT "Order_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_lastPrintedByUserId_fkey" FOREIGN KEY ("lastPrintedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_voidedByUserId_fkey" FOREIGN KEY ("voidedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "createdByUserId", "id", "isVoided", "lastPrintedByUserId", "notes", "orderNumber", "printError", "printStatus", "printedAt", "printerName", "total", "voidReason", "voidedAt", "voidedByUserId") SELECT "createdAt", "createdByUserId", "id", "isVoided", "lastPrintedByUserId", "notes", "orderNumber", "printError", "printStatus", "printedAt", "printerName", "total", "voidReason", "voidedAt", "voidedByUserId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "Order_createdByUserId_idx" ON "Order"("createdByUserId");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERARIO',
    "pinHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "displayName", "id", "isActive", "pinHash", "role", "updatedAt") SELECT "createdAt", "displayName", "id", "isActive", "pinHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
