-- Simplify JenisAksiLog enum: remove CRUD types, add RESET_PASSWORD and specific cancel types
CREATE TYPE "JenisAksiLog_new" AS ENUM ('LOGIN', 'LOGOUT', 'RESET_PASSWORD', 'CREATE_ORDER', 'UPDATE_ORDER_STATUS', 'CANCEL_ORDER_KASIR', 'CANCEL_ORDER_EXPIRED', 'CANCEL_ORDER_STALE', 'PROCESS_PAYMENT');

ALTER TABLE "logs" ALTER COLUMN "aksi" DROP DEFAULT;
ALTER TABLE "logs" ALTER COLUMN "aksi" TYPE "JenisAksiLog_new" USING ("aksi"::text::"JenisAksiLog_new");
ALTER TABLE "logs" ALTER COLUMN "aksi" SET DEFAULT 'LOGIN'::"JenisAksiLog_new";

DROP TYPE "JenisAksiLog";
ALTER TYPE "JenisAksiLog_new" RENAME TO "JenisAksiLog";
