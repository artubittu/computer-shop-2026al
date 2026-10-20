-- 1. Dodaj nameSortKey tymczasowo jako nullable
ALTER TABLE "Product"
ADD COLUMN "nameSortKey" TEXT COLLATE "C";

-- 2. Uzupełnij nameSortKey dla istniejących produktów
UPDATE "Product"
SET "nameSortKey" = "name";

-- 3. Po uzupełnieniu danych ustaw NOT NULL
ALTER TABLE "Product"
ALTER COLUMN "nameSortKey" SET NOT NULL;

-- 4. Zmień typ daty na timestamp ze strefą czasową
ALTER TABLE "Product"
ALTER COLUMN "date"
SET DATA TYPE TIMESTAMPTZ(3)
USING "date" AT TIME ZONE 'UTC';

-- 5. Ograniczenie ceny
ALTER TABLE "Product"
ADD CONSTRAINT "Product_price_check"
CHECK ("price" >= 0 AND "price" <= 2147483647);

-- 6. Ograniczenie stanu magazynowego
ALTER TABLE "Product"
ADD CONSTRAINT "Product_amount_check"
CHECK ("amount" >= 0 AND "amount" <= 2147483647);