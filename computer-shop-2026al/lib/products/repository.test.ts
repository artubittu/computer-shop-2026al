import { describe, expect, it } from "vitest";

import { validateProducts } from "./validation";

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