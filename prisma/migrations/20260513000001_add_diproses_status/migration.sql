-- AlterEnum: add 'diproses' to StatusPesanan (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StatusPesanan' AND e.enumlabel = 'diproses'
  ) THEN
    ALTER TYPE "StatusPesanan" ADD VALUE 'diproses';
  END IF;
END $$;
