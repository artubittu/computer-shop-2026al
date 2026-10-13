import type { ProductType } from "./types";

export type CatalogType = ProductType | "all";
export type CatalogStock = "all" | "available" | "unavailable";
export type CatalogSort = "name" | "newest";

export type CatalogCriteria = {
  type: CatalogType;
  stock: CatalogStock;
  sort: CatalogSort;
};

export type CatalogParamsResult = {
  criteria: CatalogCriteria;
  warnings: string[];
};

export type RawSearchParams = {
  [key: string]: string | string[] | undefined;
};

const allowedTypes: CatalogType[] = [
  "all",
  "cpu",
  "gpu",
  "ram",
  "disk",
];

const allowedStocks: CatalogStock[] = [
  "all",
  "available",
  "unavailable",
];

const allowedSorts: CatalogSort[] = [
  "name",
  "newest",
];

function parseValue<T extends string>(
  value: string | string[] | undefined,
  allowedValues: readonly T[],
  defaultValue: T,
  parameterName: string,
  warnings: string[]
): T {
  if (value === undefined) {
    return defaultValue;
  }

  if (
    Array.isArray(value) ||
    value === "" ||
    !allowedValues.includes(value as T)
  ) {
    warnings.push(
      `Pominięto nieprawidłową wartość parametru "${parameterName}".`
    );

    return defaultValue;
  }

  return value as T;
}

export function parseCatalogParams(
  searchParams: RawSearchParams
): CatalogParamsResult {
  const warnings: string[] = [];

  const type = parseValue(
    searchParams.type,
    allowedTypes,
    "all",
    "type",
    warnings
  );

  const stock = parseValue(
    searchParams.stock,
    allowedStocks,
    "all",
    "stock",
    warnings
  );

  const sort = parseValue(
    searchParams.sort,
    allowedSorts,
    "name",
    "sort",
    warnings
  );

  return {
    criteria: {
      type,
      stock,
      sort,
    },
    warnings,
  };
}