CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "link" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "archived" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_user_id_read_archived_idx" ON "Notification"("user_id", "read", "archived");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WaitlistEntry" (
  "id" TEXT NOT NULL,
  "professional_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "service_ids" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'WAITING',
  "notified_at" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WaitlistEntry_professional_id_date_status_idx" ON "WaitlistEntry"("professional_id", "date", "status");
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
