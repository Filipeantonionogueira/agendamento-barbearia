CREATE TABLE "LoyaltyTransaction" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "appointment_id" TEXT,
  "points" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LoyaltyTransaction_appointment_id_key" ON "LoyaltyTransaction"("appointment_id");
CREATE INDEX "LoyaltyTransaction_user_id_idx" ON "LoyaltyTransaction"("user_id");
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
