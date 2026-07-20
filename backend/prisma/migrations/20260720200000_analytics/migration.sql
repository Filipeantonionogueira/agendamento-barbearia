CREATE TABLE "SiteVisit" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "referrer" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SiteVisit_createdAt_idx" ON "SiteVisit"("createdAt");
CREATE INDEX "SiteVisit_session_id_idx" ON "SiteVisit"("session_id");
