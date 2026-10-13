import { describe, expect, it } from "vitest";

import { parseCatalogParams } from "./catalog-params";

describe("parseCatalogParams", () => {
  it("interpretuje poprawną kombinację parametrów", () => {
    const result = parseCatalogParams({
      type: "gpu",
      stock: "available",
      sort: "newest",
    });

    expect(result.criteria).toEqual({
      type: "gpu",
      stock: "available",
      sort: "newest",
    });

    expect(result.warnings).toEqual([]);
  });

  it("stosuje wartości domyślne przy braku parametrów", () => {
    const result = parseCatalogParams({});

    expect(result.criteria).toEqual({
      type: "all",
      stock: "all",
      sort: "name",
    });

    expect(result.warnings).toEqual([]);
  });

  it("zastępuje nieznaną wartość wartością domyślną", () => {
    const result = parseCatalogParams({
      type: "telefon",
      stock: "available",
      sort: "newest",
    });

    expect(result.criteria).toEqual({
      type: "all",
      stock: "available",
      sort: "newest",
    });

    expect(result.warnings).toHaveLength(1);
  });

  it("zastępuje pustą wartość wartością domyślną", () => {
    const result = parseCatalogParams({
      type: "",
    });

    expect(result.criteria.type).toBe("all");
    expect(result.warnings).toHaveLength(1);
  });

  it("zastępuje powtórzony parametr wartością domyślną", () => {
    const result = parseCatalogParams({
      type: ["gpu", "cpu"],
      sort: "newest",
    });

    expect(result.criteria).toEqual({
      type: "all",
      stock: "all",
      sort: "newest",
    });

    expect(result.warnings).toHaveLength(1);
  });

  it("ignoruje nieznane nazwy parametrów", () => {
    const result = parseCatalogParams({
      type: "cpu",
      unknown: "test",
    });

    expect(result.criteria).toEqual({
      type: "cpu",
      stock: "all",
      sort: "name",
    });

    expect(result.warnings).toEqual([]);
  });
});