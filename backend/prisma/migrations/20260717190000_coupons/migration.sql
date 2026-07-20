CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED');

ALTER TABLE "Appointment" ADD COLUMN "discount_cents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Appointment" ADD COLUMN "coupon_id" TEXT;

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "barbeiro_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "type" "CouponType" NOT NULL DEFAULT 'PERCENT',
  "value" INTEGER NOT NULL,
  "min_price_cents" INTEGER NOT NULL DEFAULT 0,
  "max_uses" INTEGER,
  "used_count" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expires_at" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "CouponUsage" (
  "id" TEXT NOT NULL,
  "coupon_id" TEXT NOT NULL,
  "appointment_id" TEXT NOT NULL,
  "user_id" TEXT,
  "discount_cents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CouponUsage_appointment_id_key" ON "CouponUsage"("appointment_id");
CREATE INDEX "CouponUsage_coupon_id_idx" ON "CouponUsage"("coupon_id");
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
