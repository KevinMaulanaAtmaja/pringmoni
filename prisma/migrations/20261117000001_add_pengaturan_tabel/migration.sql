-- CreateTable
CREATE TABLE "pengaturan" (
    "id" SERIAL NOT NULL,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengaturan_kunci_key" ON "pengaturan"("kunci");
