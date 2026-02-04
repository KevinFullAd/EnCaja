-- CreateTable
CREATE TABLE "OrderPrintLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "printerName" TEXT,
    "errorMessage" TEXT,
    "printedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedByUserId" TEXT NOT NULL,
    CONSTRAINT "OrderPrintLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderPrintLog_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OrderPrintLog_orderId_idx" ON "OrderPrintLog"("orderId");

-- CreateIndex
CREATE INDEX "OrderPrintLog_printedAt_idx" ON "OrderPrintLog"("printedAt");
