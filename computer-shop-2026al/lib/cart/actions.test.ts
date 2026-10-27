import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireCurrentUserMock,
  addProductMock,
  updateItemQuantityMock,
  removeItemMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  requireCurrentUserMock: vi.fn(),
  addProductMock: vi.fn(),
  updateItemQuantityMock: vi.fn(),
  removeItemMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/session", () => ({
  requireCurrentUser: requireCurrentUserMock,
}));

vi.mock("@/lib/cart/cart", () => ({
  addProduct: addProductMock,
  updateItemQuantity: updateItemQuantityMock,
  removeItem: removeItemMock,
}));

import {
  addProductAction,
  removeItemAction,
  updateItemQuantityAction,
} from "@/lib/cart/actions";

describe("protected cart actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses user A from the session when adding a product", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-a",
      name: "User A",
      email: "user-a@example.com",
    });

    addProductMock.mockResolvedValue(undefined);

    const result = await addProductAction(1);

    expect(result).toEqual({
      success: true,
    });

    expect(addProductMock).toHaveBeenCalledWith("user-a", 1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/basket");
  });

  it("uses user B from the session when adding a product", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-b",
      name: "User B",
      email: "user-b@example.com",
    });

    addProductMock.mockResolvedValue(undefined);

    const result = await addProductAction(1);

    expect(result).toEqual({
      success: true,
    });

    expect(addProductMock).toHaveBeenCalledWith("user-b", 1);
  });

  it("does not add a product without a valid session", async () => {
    requireCurrentUserMock.mockRejectedValue(
      new Error("Unauthorized"),
    );

    const result = await addProductAction(1);

    expect(result.success).toBe(false);
    expect(addProductMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("does not update an item without a valid session", async () => {
    requireCurrentUserMock.mockRejectedValue(
      new Error("Unauthorized"),
    );

    const result = await updateItemQuantityAction(1, 2);

    expect(result.success).toBe(false);
    expect(updateItemQuantityMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("does not remove an item without a valid session", async () => {
    requireCurrentUserMock.mockRejectedValue(
      new Error("Unauthorized"),
    );

    const result = await removeItemAction(1);

    expect(result.success).toBe(false);
    expect(removeItemMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("passes the session owner to quantity update", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-a",
      name: "User A",
      email: "user-a@example.com",
    });

    updateItemQuantityMock.mockResolvedValue(undefined);

    const result = await updateItemQuantityAction(10, 3);

    expect(result).toEqual({
      success: true,
    });

    expect(updateItemQuantityMock).toHaveBeenCalledWith(
      "user-a",
      10,
      3,
    );

    expect(revalidatePathMock).toHaveBeenCalledWith("/basket");
  });

  it("passes the session owner to item removal", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-b",
      name: "User B",
      email: "user-b@example.com",
    });

    removeItemMock.mockResolvedValue(undefined);

    const result = await removeItemAction(20);

    expect(result).toEqual({
      success: true,
    });

    expect(removeItemMock).toHaveBeenCalledWith(
      "user-b",
      20,
    );

    expect(revalidatePathMock).toHaveBeenCalledWith("/basket");
  });

  it("rejects invalid quantity before modifying the cart", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-a",
      name: "User A",
      email: "user-a@example.com",
    });

    const result = await updateItemQuantityAction(1, 0);

    expect(result).toEqual({
      success: false,
      error: "Ilość musi być liczbą całkowitą od 1 do 99.",
      field: "quantity",
    });

    expect(updateItemQuantityMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns a controlled error when the cart operation fails", async () => {
    requireCurrentUserMock.mockResolvedValue({
      id: "user-a",
      name: "User A",
      email: "user-a@example.com",
    });

    addProductMock.mockRejectedValue(
      new Error("Prisma database error"),
    );

    const result = await addProductAction(1);

    expect(result).toEqual({
      success: false,
      error:
        "Nie udało się dodać produktu. Sprawdź jego dostępność i spróbuj ponownie.",
    });

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});