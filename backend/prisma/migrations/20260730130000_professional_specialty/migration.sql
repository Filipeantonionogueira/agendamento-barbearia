-- Especialidade exibida no card do profissional na landing page.
ALTER TABLE "Professional" ADD COLUMN IF NOT EXISTS "specialty" TEXT;
