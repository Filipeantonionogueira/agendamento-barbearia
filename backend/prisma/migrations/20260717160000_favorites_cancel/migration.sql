ALTER TABLE "Appointment" ADD COLUMN "notes" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "cancel_reason" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "canceled_at" TIMESTAMP(3);

CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "service_id" TEXT,
  "professional_id" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Favorite_user_id_service_id_key" ON "Favorite"("user_id", "service_id");
CREATE UNIQUE INDEX "Favorite_user_id_professional_id_key" ON "Favorite"("user_id", "professional_id");
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
