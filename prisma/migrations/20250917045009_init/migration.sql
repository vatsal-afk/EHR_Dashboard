-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gender" TEXT,
    "birthDate" TEXT
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "status" TEXT,
    "criticality" TEXT,
    "patientId" TEXT,
    CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT,
    "description" TEXT,
    "start" TEXT,
    "end" TEXT,
    "patientId" TEXT,
    "provider" TEXT,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "patientId" TEXT,
    CONSTRAINT "Condition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT,
    "class" TEXT,
    "subject" TEXT,
    "start" TEXT,
    "end" TEXT,
    "patientId" TEXT,
    CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Immunization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT,
    "vaccine" TEXT,
    "patientId" TEXT,
    "primarySource" BOOLEAN,
    CONSTRAINT "Immunization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "status" TEXT,
    "patientId" TEXT,
    CONSTRAINT "Medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT,
    "code" TEXT,
    "value" TEXT,
    "date" TEXT,
    "patientId" TEXT,
    CONSTRAINT "Observation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiagnosticReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT,
    "code" TEXT,
    "subject" TEXT,
    "effectiveDate" TEXT,
    "issued" TEXT,
    "patientId" TEXT,
    CONSTRAINT "DiagnosticReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Practitioner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "identifiers" TEXT
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT,
    "code" TEXT,
    "performed" TEXT,
    "patientId" TEXT,
    CONSTRAINT "Procedure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_id_key" ON "Patient"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Allergy_id_key" ON "Allergy"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_id_key" ON "Appointment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_id_key" ON "Condition"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_id_key" ON "Encounter"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Immunization_id_key" ON "Immunization"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Medication_id_key" ON "Medication"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Observation_id_key" ON "Observation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticReport_id_key" ON "DiagnosticReport"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_id_key" ON "Practitioner"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_id_key" ON "Procedure"("id");
