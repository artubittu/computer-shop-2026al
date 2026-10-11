import "server-only";

import rawProducts from "../../data/products.json";

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

export async function getProducts(
  sort: ProductSort = "name"
): Promise<Product[]> {
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