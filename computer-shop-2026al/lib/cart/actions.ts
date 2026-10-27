"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/session";
import {
  addProduct,
  removeItem,
  updateItemQuantity,
} from "@/lib/cart/cart";
import {
  isValidCartItemId,
  isValidProductId,
  isValidQuantity,
} from "@/lib/cart/validation";

export async function addProductAction(productId: number) {
  const user = await requireCurrentUser();

  if (!isValidProductId(productId)) {
    throw new Error("Invalid product ID");
  }

  await addProduct(user.id, productId);

  revalidatePath("/basket");
}

export async function updateItemQuantityAction(
  itemId: number,
  quantity: number,
) {
  const user = await requireCurrentUser();

  if (!isValidCartItemId(itemId)) {
    throw new Error("Invalid cart item ID");
  }

  if (!isValidQuantity(quantity)) {
    throw new Error("Invalid quantity");
  }

  await updateItemQuantity(user.id, itemId, quantity);

  revalidatePath("/basket");
}

export async function removeItemAction(itemId: number) {
  const user = await requireCurrentUser();

  if (!isValidCartItemId(itemId)) {
    throw new Error("Invalid cart item ID");
  }

  await removeItem(user.id, itemId);

  revalidatePath("/basket");
}