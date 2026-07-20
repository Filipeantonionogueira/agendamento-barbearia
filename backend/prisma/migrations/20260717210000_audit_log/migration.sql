CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "actor_name" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entity_id" TEXT,
  "metadata" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_entity_entity_id_idx" ON "AuditLog"("entity", "entity_id");
