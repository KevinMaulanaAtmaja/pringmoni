-- Alias token opsional untuk tipe Bebas (token asli tetap tersimpan, tidak pernah berubah)
ALTER TABLE "tipe_meja" ADD COLUMN "token_tipe_alias" TEXT;

CREATE UNIQUE INDEX "tipe_meja_token_tipe_alias_key" ON "tipe_meja"("token_tipe_alias");
