-- Landing page fields on Barber
ALTER TABLE "Barber" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "Barber" ADD COLUMN "aboutText" TEXT;
ALTER TABLE "Barber" ADD COLUMN "addressLine" TEXT;
ALTER TABLE "Barber" ADD COLUMN "openingHoursText" TEXT;

-- New Professional table
CREATE TABLE "Professional" (
  "id" TEXT NOT NULL,
  "barbeiro_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "photoUrl" TEXT,
  "bio" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Professional" ADD CONSTRAINT "Professional_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: one Professional per existing Barber (shop), representing "the barber themself"
INSERT INTO "Professional" ("id", "barbeiro_id", "name", "active", "displayOrder", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", "shopName", true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Barber";

-- Availability: move from barbeiro_id to profissional_id
ALTER TABLE "Availability" ADD COLUMN "profissional_id" TEXT;
UPDATE "Availability" a
SET "profissional_id" = p."id"
FROM "Professional" p
WHERE p."barbeiro_id" = a."barbeiro_id";
ALTER TABLE "Availability" ALTER COLUMN "profissional_id" SET NOT NULL;
DROP INDEX "Availability_barbeiro_id_dayOfWeek_key";
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_barbeiro_id_fkey";
ALTER TABLE "Availability" DROP COLUMN "barbeiro_id";
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Availability_profissional_id_dayOfWeek_key" ON "Availability"("profissional_id", "dayOfWeek");

-- ScheduleBlock: move from barbeiro_id to profissional_id
ALTER TABLE "ScheduleBlock" ADD COLUMN "profissional_id" TEXT;
UPDATE "ScheduleBlock" b
SET "profissional_id" = p."id"
FROM "Professional" p
WHERE p."barbeiro_id" = b."barbeiro_id";
ALTER TABLE "ScheduleBlock" ALTER COLUMN "profissional_id" SET NOT NULL;
ALTER TABLE "ScheduleBlock" DROP CONSTRAINT "ScheduleBlock_barbeiro_id_fkey";
ALTER TABLE "ScheduleBlock" DROP COLUMN "barbeiro_id";
ALTER TABLE "ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Appointment: add profissional_id (keeps barbeiro_id for shop-wide scoping)
ALTER TABLE "Appointment" ADD COLUMN "profissional_id" TEXT;
UPDATE "Appointment" ap
SET "profissional_id" = p."id"
FROM "Professional" p
WHERE p."barbeiro_id" = ap."barbeiro_id";
ALTER TABLE "Appointment" ALTER COLUMN "profissional_id" SET NOT NULL;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Appointment_profissional_id_startAt_endAt_idx" ON "Appointment"("profissional_id", "startAt", "endAt");
