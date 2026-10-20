-- This is an empty migration.

CREATE INDEX "Product_available_name_idx"
ON "Product" ("categoryId", "nameSortKey" COLLATE "C", "id")
WHERE "amount" > 0;