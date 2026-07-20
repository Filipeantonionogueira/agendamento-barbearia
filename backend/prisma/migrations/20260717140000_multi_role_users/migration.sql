-- Role enum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'BARBER', 'CLIENT');

-- User table
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "barbeiro_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "photoUrl" TEXT,
  "google_id" TEXT,
  "auth_provider" TEXT NOT NULL DEFAULT 'local',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");
ALTER TABLE "User" ADD CONSTRAINT "User_barbeiro_id_fkey" FOREIGN KEY ("barbeiro_id") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- UserRole join table
CREATE TABLE "UserRole" (
  "user_id" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_id", "role")
);
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Professional.user_id (owner-as-barber / barber login)
ALTER TABLE "Professional" ADD COLUMN "user_id" TEXT;
CREATE UNIQUE INDEX "Professional_user_id_key" ON "Professional"("user_id");
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Client.user_id (registered client; anonymous stays null)
ALTER TABLE "Client" ADD COLUMN "user_id" TEXT;
CREATE UNIQUE INDEX "Client_user_id_key" ON "Client"("user_id");
ALTER TABLE "Client" ADD CONSTRAINT "Client_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: existing Admin becomes a User with OWNER/ADMIN/BARBER roles
INSERT INTO "User" ("id", "barbeiro_id", "email", "passwordHash", "name", "auth_provider", "active", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, a."barbeiro_id", a."username" || '@barbearia.local', a."passwordHash", 'Administrador', 'local', true, now(), now()
FROM "Admin" a;

INSERT INTO "UserRole" ("user_id", "role")
SELECT u."id", r.role
FROM "User" u
CROSS JOIN (VALUES ('OWNER'::"Role"), ('ADMIN'::"Role"), ('BARBER'::"Role")) AS r(role);

-- Link the owner user to the earliest professional of the shop (their own agenda)
UPDATE "Professional" p
SET "user_id" = u."id"
FROM "User" u
WHERE u."barbeiro_id" = p."barbeiro_id"
  AND p."id" = (
    SELECT p2."id" FROM "Professional" p2
    WHERE p2."barbeiro_id" = u."barbeiro_id"
    ORDER BY p2."createdAt" ASC, p2."id" ASC
    LIMIT 1
  );

-- RefreshToken: move from adminId to user_id (clear existing ephemeral tokens)
DELETE FROM "RefreshToken";
ALTER TABLE "RefreshToken" DROP COLUMN "adminId";
ALTER TABLE "RefreshToken" ADD COLUMN "user_id" TEXT NOT NULL;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
