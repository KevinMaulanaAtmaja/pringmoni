-- AlterTable: add reset password fields
ALTER TABLE "users" ADD COLUMN "reset_token" TEXT;
ALTER TABLE "users" ADD COLUMN "reset_token_expiry" TIMESTAMP(3);
CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");
