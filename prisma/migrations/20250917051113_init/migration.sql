-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientName" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "insuranceStatus" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Billing_id_key" ON "Billing"("id");
