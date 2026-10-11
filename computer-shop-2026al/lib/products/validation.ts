import type { Product, ProductType } from "./types";

const productTypes: ProductType[] = [
  "cpu",
  "gpu",
  "ram",
  "disk",
];

export function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;

  return (
    Number.isInteger(product.id) &&
    (product.id as number) > 0 &&

    typeof product.code === "string" &&
    /^[A-Z0-9]{10}$/.test(product.code) &&

    typeof product.name === "string" &&
    product.name.trim().length > 0 &&

    typeof product.type === "string" &&
    productTypes.includes(product.type as ProductType) &&

    Number.isInteger(product.price) &&
    (product.price as number) >= 0 &&

    Number.isInteger(product.amount) &&
    (product.amount as number) >= 0 &&

    typeof product.description === "string" &&

    typeof product.date === "string" &&
    !Number.isNaN(Date.parse(product.date)) &&

    typeof product.image === "string" &&
    product.image.length > 0
  );
}

export function validateProducts(values: unknown): Product[] {
  if (!Array.isArray(values)) {
    throw new Error("Dane produktów muszą być tablicą.");
  }

  if (!values.every(isProduct)) {
    throw new Error("Dane zawierają nieprawidłowy produkt.");
  }

  const ids = new Set<number>();
  const codes = new Set<string>();

  for (const product of values) {
    if (ids.has(product.id)) {
      throw new Error(
        `Duplikat identyfikatora produktu: ${product.id}`
      );
    }

    if (codes.has(product.code)) {
      throw new Error(
        `Duplikat kodu produktu: ${product.code}`
      );
    }

    ids.add(product.id);
    codes.add(product.code);
  }

  return values;
}