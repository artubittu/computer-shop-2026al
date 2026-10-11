import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getAvailableProducts,
  getProductById,
  getProducts,
  getProductsByType,
  getUnavailableProducts,
} from "./repository";

import { validateProducts } from "./validation";

describe("Product repository", () => {
  it("sortuje produkty po nazwie", async () => {
    const products = await getProducts("name");

    const names = products.map((product) => product.name);
    const expected = [...names].sort((a, b) =>
      a.localeCompare(b, "pl")
    );

    expect(names).toEqual(expected);
  });

  it("sortuje produkty po dacie malejąco", async () => {
    const products = await getProducts("date");

    for (let i = 1; i < products.length; i++) {
      const previousDate = new Date(
        products[i - 1].date
      ).getTime();

      const currentDate = new Date(
        products[i].date
      ).getTime();

      expect(previousDate).toBeGreaterThanOrEqual(currentDate);
    }
  });

  it("sortowanie nie zmienia danych źródłowych", async () => {
    const firstResult = await getProducts("name");

    const originalFirstProduct = {
      ...firstResult[0],
    };

    // Sortujemy ponownie, tym razem po dacie.
    await getProducts("date");

    const secondResult = await getProducts("name");

    expect(secondResult[0]).toEqual(originalFirstProduct);
  });

  it("zwraca tylko dostępne produkty", async () => {
    const products = await getAvailableProducts();

    expect(products.length).toBeGreaterThan(0);

    expect(
      products.every((product) => product.amount > 0)
    ).toBe(true);
  });

  it("zwraca tylko niedostępne produkty", async () => {
    const products = await getUnavailableProducts();

    expect(products.length).toBeGreaterThan(0);

    expect(
      products.every((product) => product.amount === 0)
    ).toBe(true);
  });

  it("filtruje produkty według kategorii", async () => {
    const products = await getProductsByType("cpu");

    expect(products.length).toBeGreaterThan(0);

    expect(
      products.every((product) => product.type === "cpu")
    ).toBe(true);
  });

  it("zwraca null dla nieistniejącego identyfikatora", async () => {
    const product = await getProductById(999999);

    expect(product).toBeNull();
  });
});

describe("Product validation", () => {
  it("odrzuca produkt z ujemną ceną", () => {
    const products = [
      {
        id: 1,
        code: "PRD0000001",
        name: "Procesor testowy",
        type: "cpu",
        price: -100,
        amount: 10,
        description: "Produkt testowy",
        date: "2026-01-01T00:00:00.000Z",
        image: "/images/products/cpu.webp",
      },
    ];

    expect(() => validateProducts(products)).toThrow();
  });

  it("odrzuca duplikat identyfikatora", () => {
    const products = [
      {
        id: 1,
        code: "PRD0000001",
        name: "Procesor 1",
        type: "cpu",
        price: 10000,
        amount: 10,
        description: "Produkt testowy",
        date: "2026-01-01T00:00:00.000Z",
        image: "/images/products/cpu.webp",
      },
      {
        id: 1,
        code: "PRD0000002",
        name: "Procesor 2",
        type: "cpu",
        price: 20000,
        amount: 5,
        description: "Produkt testowy",
        date: "2026-01-02T00:00:00.000Z",
        image: "/images/products/cpu.webp",
      },
    ];

    expect(() => validateProducts(products)).toThrow(
      "Duplikat identyfikatora produktu: 1"
    );
  });

  it("odrzuca duplikat kodu produktu", () => {
    const products = [
      {
        id: 1,
        code: "PRD0000001",
        name: "Procesor 1",
        type: "cpu",
        price: 10000,
        amount: 10,
        description: "Produkt testowy",
        date: "2026-01-01T00:00:00.000Z",
        image: "/images/products/cpu.webp",
      },
      {
        id: 2,
        code: "PRD0000001",
        name: "Procesor 2",
        type: "cpu",
        price: 20000,
        amount: 5,
        description: "Produkt testowy",
        date: "2026-01-02T00:00:00.000Z",
        image: "/images/products/cpu.webp",
      },
    ];

    expect(() => validateProducts(products)).toThrow(
      "Duplikat kodu produktu: PRD0000001"
    );
  });
});