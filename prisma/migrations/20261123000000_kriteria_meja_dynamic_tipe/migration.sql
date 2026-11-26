-- Add prefix_kode for dynamic meja type/kriteria
ALTER TABLE "kriteria_meja" ADD COLUMN "prefix_kode" TEXT;

UPDATE kriteria_meja k
SET prefix_kode = COALESCE(NULLIF(LEFT(UPPER(REGEXP_REPLACE(nama_kriteria, '[^A-Za-z]', '', 'g')), 1), ''), 'K' || id::text);

DO $$
DECLARE r RECORD; pfx TEXT; n INT; letters TEXT;
BEGIN
  FOR r IN SELECT id, prefix_kode, UPPER(REGEXP_REPLACE(nama_kriteria,'[^A-Za-z]','','g')) l FROM kriteria_meja ORDER BY id LOOP
    pfx := r.prefix_kode; letters := NULLIF(r.l,''); n := GREATEST(LENGTH(pfx),1);
    WHILE EXISTS (SELECT 1 FROM kriteria_meja k2 WHERE k2.prefix_kode=pfx AND k2.id<>r.id) LOOP
      n := n+1;
      IF letters IS NOT NULL AND n <= LENGTH(letters) THEN pfx := LEFT(letters,n);
      ELSIF letters IS NOT NULL THEN pfx := letters || (n-LENGTH(letters))::text;
      ELSE pfx := 'K' || r.id::text || n::text; END IF;
    END LOOP;
    UPDATE kriteria_meja SET prefix_kode=pfx WHERE id=r.id;
  END LOOP;
END $$;

ALTER TABLE "kriteria_meja" ALTER COLUMN "prefix_kode" SET NOT NULL;
CREATE UNIQUE INDEX "kriteria_meja_prefix_kode_key" ON "kriteria_meja"("prefix_kode");
