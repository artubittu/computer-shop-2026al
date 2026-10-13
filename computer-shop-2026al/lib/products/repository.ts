import "server-only";

import rawProducts from "../../data/products.json";
import type { CatalogCriteria } from "./catalog-params";
import type {
  Product,
  ProductType,
} from "./types";

import {
  validateProducts,
} from "./validation";

// Walidacja danych w momencie wczytania repozytorium.
const products: Product[] = validateProducts(rawProducts);

export type ProductSort = "name" | "date";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProducts(
  sort: ProductSort = "name"
): Promise<Product[]> {
  if (process.env.PRODUCTS_DELAY === "true") {
    await delay(2000);
  }

  const result = [...products];

  if (sort === "name") {
    result.sort((a, b) =>
      a.name.localeCompare(b.name, "pl")
    );
  }

  if (sort === "date") {
    result.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
  }

  return result;
}

/**
 * Zwraca produkty dostępne w magazynie.
 */
export async function getAvailableProducts(): Promise<Product[]> {
  return products.filter(
    (product) => product.amount > 0
  );
}

/**
 * Zwraca produkty niedostępne w magazynie.
 */
export async function getUnavailableProducts(): Promise<Product[]> {
  return products.filter(
    (product) => product.amount === 0
  );
}

/**
 * Zwraca produkty należące do wybranej kategorii.
 */
export async function getProductsByType(
  type: ProductType
): Promise<Product[]> {
  return products.filter(
    (product) => product.type === type
  );
}

/**
 Wyszukuje pojedynczy produkt po identyfikatorze.
 */
export async function getProductById(
  id: number
): Promise<Product | null> {
  return (
    products.find(
      (product) => product.id === id
    ) ?? null
  );
}

export async function getCatalogProducts(
  criteria: CatalogCriteria
): Promise<Product[]> {
  let result = [...products];

  // Filtrowanie po kategorii
  if (criteria.type !== "all") {
    result = result.filter(
      (product) => product.type === criteria.type
    );
  }

  // Filtrowanie po dostępności
  if (criteria.stock === "available") {
    result = result.filter(
      (product) => product.amount > 0
    );
  }

  if (criteria.stock === "unavailable") {
    result = result.filter(
      (product) => product.amount === 0
    );
  }

  // Sortowanie
  if (criteria.sort === "name") {
    result.sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name, "pl");

      if (nameComparison !== 0) {
        return nameComparison;
      }

      return a.id - b.id;
    });
  }

  if (criteria.sort === "newest") {
    result.sort((a, b) => {
      const dateComparison =
        new Date(b.date).getTime() - new Date(a.date).getTime();

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return a.id - b.id;
    });
  }

  return result;
}