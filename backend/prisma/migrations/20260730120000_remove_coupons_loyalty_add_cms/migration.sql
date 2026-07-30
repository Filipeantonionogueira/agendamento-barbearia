-- Remove o modulo comercial de descontos (cupons) e o programa de fidelidade.
DROP TABLE IF EXISTS "CouponUsage";
DROP TABLE IF EXISTS "Coupon";
DROP TABLE IF EXISTS "LoyaltyTransaction";
DROP TYPE IF EXISTS "CouponType";

ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "discount_cents";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "coupon_id";

-- CMS da landing page: conteudo editavel armazenado como JSON versionado.
CREATE TABLE IF NOT EXISTS "SiteContent" (
    "id" TEXT NOT NULL,
    "barbeiro_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteContent_barbeiro_id_key" ON "SiteContent"("barbeiro_id");

ALTER TABLE "SiteContent"
    ADD CONSTRAINT "SiteContent_barbeiro_id_fkey"
    FOREIGN KEY ("barbeiro_id") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
