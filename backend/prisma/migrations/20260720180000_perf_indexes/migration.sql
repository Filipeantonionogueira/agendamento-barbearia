-- Historico do cliente: Appointment -> Client (FK nao e indexada automaticamente no PostgreSQL).
CREATE INDEX IF NOT EXISTS "Appointment_clientId_idx" ON "Appointment"("clientId");

-- Dashboard/relatorios filtram por status + periodo.
CREATE INDEX IF NOT EXISTS "Appointment_status_startAt_idx" ON "Appointment"("status", "startAt");
