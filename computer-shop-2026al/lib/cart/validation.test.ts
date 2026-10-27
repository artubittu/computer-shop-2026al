import { describe, expect, it } from "vitest";

import {
  isValidCartItemId,
  isValidProductId,
  isValidQuantity,
  MAX_CART_QUANTITY,
} from "@/lib/cart/validation";

describe("cart validation", () => {
  describe("isValidProductId", () => {
    it("accepts a positive safe integer", () => {
      expect(isValidProductId(1)).toBe(true);
      expect(isValidProductId(123)).toBe(true);
    });

    it("rejects zero and negative values", () => {
      expect(isValidProductId(0)).toBe(false);
      expect(isValidProductId(-1)).toBe(false);
    });

    it("rejects non-integer values", () => {
      expect(isValidProductId(1.5)).toBe(false);
    });

    it("rejects unsafe integers", () => {
      expect(isValidProductId(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    });
  });

  describe("isValidCartItemId", () => {
    it("accepts a positive safe integer", () => {
      expect(isValidCartItemId(1)).toBe(true);
    });

    it("rejects invalid IDs", () => {
      expect(isValidCartItemId(0)).toBe(false);
      expect(isValidCartItemId(-1)).toBe(false);
      expect(isValidCartItemId(1.5)).toBe(false);
      expect(
        isValidCartItemId(Number.MAX_SAFE_INTEGER + 1),
      ).toBe(false);
    });
  });

  describe("isValidQuantity", () => {
    it("accepts quantities from 1 to 99", () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(50)).toBe(true);
      expect(isValidQuantity(MAX_CART_QUANTITY)).toBe(true);
    });

    it("rejects quantities outside the allowed range", () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-1)).toBe(false);
      expect(isValidQuantity(MAX_CART_QUANTITY + 1)).toBe(false);
    });

    it("rejects non-integer and unsafe values", () => {
      expect(isValidQuantity(1.5)).toBe(false);
      expect(
        isValidQuantity(Number.MAX_SAFE_INTEGER + 1),
      ).toBe(false);
    });
  });
});