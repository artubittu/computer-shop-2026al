import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../../lib/prisma";
import { createNameSortKey } from "../../lib/products/name-sort-key";
import {
  getCatalogProducts,
  getProductById,
} from "../../lib/products/repository";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.includes("computer_shop_test")) {
  throw new Error(
    "Testy integracyjne mogą działać tylko na bazie computer_shop_test."
  );
}

async function clearDatabase() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

beforeAll(async () => {
  await clearDatabase();

  const cpu = await prisma.category.create({
    data: {
      id: 1,
      slug: "cpu",
      name: "Procesor",
    },
  });

  const gpu = await prisma.category.create({
    data: {
      id: 2,
      slug: "gpu",
      name: "Karta graficzna",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        id: 1,
        code: "TESTCPU001",
        name: "Żeton CPU",
        nameSortKey: createNameSortKey("Żeton CPU"),
        price: 10000,
        amount: 5,
        description: "Dostępny procesor testowy",
        date: new Date("2026-01-01T10:00:00.000Z"),
        image: "/test/cpu-1.jpg",
        categoryId: cpu.id,
      },
      {
        id: 2,
        code: "TESTCPU002",
        name: "Alfa CPU",
        nameSortKey: createNameSortKey("Alfa CPU"),
        price: 20000,
        amount: 0,
        description: "Niedostępny procesor testowy",
        date: new Date("2026-03-01T10:00:00.000Z"),
        image: "/test/cpu-2.jpg",
        categoryId: cpu.id,
      },
      {
        id: 3,
        code: "TESTGPU001",
        name: "Beta GPU",
        nameSortKey: createNameSortKey("Beta GPU"),
        price: 30000,
        amount: 2,
        description: "Dostępna karta graficzna testowa",
        date: new Date("2026-02-01T10:00:00.000Z"),
        image: "/test/gpu-1.jpg",
        categoryId: gpu.id,
      },
    ],
  });
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe("Product repository - integration", () => {
  it("pobiera produkt po ID i mapuje dane do modelu domenowego", async () => {
    const product = await getProductById(1);

    expect(product).not.toBeNull();

    expect(product).toMatchObject({
      id: 1,
      code: "TESTCPU001",
      name: "Żeton CPU",
      type: "cpu",
      price: 10000,
      amount: 5,
    });

    expect(product?.date).toBe("2026-01-01T10:00:00.000Z");
  });

  it("zwraca null dla nieistniejącego produktu", async () => {
    const product = await getProductById(999999);

    expect(product).toBeNull();
  });

  it("odrzuca ID równe 0", async () => {
  const product = await getProductById(0);

  expect(product).toBeNull();
});

it("odrzuca ujemne ID", async () => {
  const product = await getProductById(-1);

  expect(product).toBeNull();
});

it("odrzuca ID większe niż maksymalny INTEGER PostgreSQL", async () => {
  const product = await getProductById(2_147_483_648);

  expect(product).toBeNull();
});

it("odrzuca ID niebędące liczbą całkowitą", async () => {
  const product = await getProductById(1.5);

  expect(product).toBeNull();
});

  it("filtruje produkty według kategorii", async () => {
    const products = await getCatalogProducts({
      type: "cpu",
      stock: "all",
      sort: "name",
    });

    expect(products).toHaveLength(2);
    expect(products.every((product) => product.type === "cpu")).toBe(true);
  });

  it("filtruje tylko dostępne produkty", async () => {
    const products = await getCatalogProducts({
      type: "all",
      stock: "available",
      sort: "name",
    });

    expect(products.map((product) => product.id)).toEqual([3, 1]);
  });

  it("filtruje tylko niedostępne produkty", async () => {
    const products = await getCatalogProducts({
      type: "all",
      stock: "unavailable",
      sort: "name",
    });

    expect(products.map((product) => product.id)).toEqual([2]);
  });

  it("sortuje produkty według nazwy", async () => {
    const products = await getCatalogProducts({
      type: "all",
      stock: "all",
      sort: "name",
    });

    expect(products.map((product) => product.id)).toEqual([2, 3, 1]);
  });

  it("sortuje produkty od najnowszych", async () => {
    const products = await getCatalogProducts({
      type: "all",
      stock: "all",
      sort: "newest",
    });

    expect(products.map((product) => product.id)).toEqual([2, 3, 1]);
  });
});

describe("PostgreSQL constraints - integration", () => {
  it("baza odrzuca produkt z ujemną ceną", async () => {
    await expect(
      prisma.product.create({
        data: {
          id: 101,
          code: "NEGPRICE01",
          name: "Ujemna cena",
          nameSortKey: createNameSortKey("Ujemna cena"),
          price: -1,
          amount: 1,
          description: "Test ograniczenia ceny",
          date: new Date("2026-04-01T10:00:00.000Z"),
          image: "/test/negative-price.jpg",
          categoryId: 1,
        },
      })
    ).rejects.toThrow();
  });

  it("baza odrzuca duplikat kodu produktu", async () => {
    await expect(
      prisma.product.create({
        data: {
          id: 102,
          code: "TESTCPU001",
          name: "Duplikat kodu",
          nameSortKey: createNameSortKey("Duplikat kodu"),
          price: 10000,
          amount: 1,
          description: "Test unikalności kodu",
          date: new Date("2026-04-02T10:00:00.000Z"),
          image: "/test/duplicate-code.jpg",
          categoryId: 1,
        },
      })
    ).rejects.toThrow();
  });

  it("baza odrzuca produkt z nieistniejącą kategorią", async () => {
    await expect(
      prisma.product.create({
        data: {
          id: 103,
          code: "BADCAT0001",
          name: "Błędna kategoria",
          nameSortKey: createNameSortKey("Błędna kategoria"),
          price: 10000,
          amount: 1,
          description: "Test klucza obcego",
          date: new Date("2026-04-03T10:00:00.000Z"),
          image: "/test/bad-category.jpg",
          categoryId: 999999,
        },
      })
    ).rejects.toThrow();
  });
});