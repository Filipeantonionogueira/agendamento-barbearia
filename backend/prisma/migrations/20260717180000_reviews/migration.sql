CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "appointment_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "professional_id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "photo_url" TEXT,
  "reply" TEXT,
  "replied_at" TIMESTAMP(3),
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Review_appointment_id_key" ON "Review"("appointment_id");
CREATE INDEX "Review_professional_id_idx" ON "Review"("professional_id");
CREATE INDEX "Review_published_createdAt_idx" ON "Review"("published", "createdAt");
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
