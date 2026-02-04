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
    "userId" TEXT,
    CONSTRAINT "Order_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_lastPrintedByUserId_fkey" FOREIGN KEY ("lastPrintedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_voidedByUserId_fkey" FOREIGN KEY ("voidedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "createdByUserId", "id", "isVoided", "notes", "orderNumber", "total", "voidReason", "voidedAt", "voidedByUserId") SELECT "createdAt", "createdByUserId", "id", "isVoided", "notes", "orderNumber", "total", "voidReason", "voidedAt", "voidedByUserId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "Order_createdByUserId_idx" ON "Order"("createdByUserId");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
