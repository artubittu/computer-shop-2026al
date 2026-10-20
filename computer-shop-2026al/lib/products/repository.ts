import "server-only";

import { prisma } from "@/lib/prisma";
import type { CatalogCriteria } from "./catalog-params";
import type { Product, ProductType } from "./types";

export type ProductSort = "name" | "date";

type DatabaseProduct = {
  id: number;
  code: string;
  name: string;
  price: number;
  amount: number;
  description: string;
  date: Date;
  image: string;
  category: {
    slug: string;
  };
};

/**
 * Zamienia rekord z PostgreSQL/Prisma
 * na format Product używany przez aplikację.
 */
function toProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    type: product.category.slug as ProductType,
    price: product.price,
    amount: product.amount,
    description: product.description,
    date: product.date.toISOString(),
    image: product.image,
  };
}

export async function getProducts(
  sort: ProductSort = "name"
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy:
      sort === "name"
        ? [
            { nameSortKey: "asc" },
            { id: "asc" },
          ]
        : [
            { date: "desc" },
            { id: "asc" },
          ],
  });

  return products.map(toProduct);
}

/**
 * Zwraca produkty dostępne w magazynie.
 */
export async function getAvailableProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      amount: {
        gt: 0,
      },
    },
    include: {
      category: true,
    },
  });

  return products.map(toProduct);
}

/**
 * Zwraca produkty niedostępne w magazynie.
 */
export async function getUnavailableProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      amount: 0,
    },
    include: {
      category: true,
    },
  });

  return products.map(toProduct);
}

/**
 * Zwraca produkty należące do wybranej kategorii.
 */
export async function getProductsByType(
  type: ProductType
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: type,
      },
    },
    include: {
      category: true,
    },
  });

  return products.map(toProduct);
}

/**
 * Wyszukuje pojedynczy produkt po identyfikatorze.
 */
export async function getProductById(
  id: number
): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  return product ? toProduct(product) : null;
}

/**
 * Zwraca katalog zgodnie z kryteriami filtrowania i sortowania.
 */
export async function getCatalogProducts(
  criteria: CatalogCriteria
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      ...(criteria.type !== "all"
        ? {
            category: {
              slug: criteria.type,
            },
          }
        : {}),

      ...(criteria.stock === "available"
        ? {
            amount: {
              gt: 0,
            },
          }
        : {}),

      ...(criteria.stock === "unavailable"
        ? {
            amount: 0,
          }
        : {}),
    },

    include: {
      category: true,
    },

    orderBy:
      criteria.sort === "name"
        ? [
            { nameSortKey: "asc" },
            { id: "asc" },
          ]
        : [
            { date: "desc" },
            { id: "asc" },
          ],
  });

  return products.map(toProduct);
}