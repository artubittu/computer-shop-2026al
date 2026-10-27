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

export type CartActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
      field?: "productId" | "itemId" | "quantity";
    };

async function getAuthenticatedUser() {
  try {
    return await requireCurrentUser();
  } catch {
    return null;
  }
}

export async function addProductAction(
  productId: number,
): Promise<CartActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: "Musisz być zalogowany, aby dodać produkt do koszyka.",
    };
  }

  if (!isValidProductId(productId)) {
    return {
      success: false,
      error: "Nieprawidłowy identyfikator produktu.",
      field: "productId",
    };
  }

  try {
    await addProduct(user.id, productId);

    revalidatePath("/basket");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error:
        "Nie udało się dodać produktu. Sprawdź jego dostępność i spróbuj ponownie.",
    };
  }
}

export async function updateItemQuantityAction(
  itemId: number,
  quantity: number,
): Promise<CartActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: "Musisz być zalogowany, aby zmienić koszyk.",
    };
  }

  if (!isValidCartItemId(itemId)) {
    return {
      success: false,
      error: "Nieprawidłowa pozycja koszyka.",
      field: "itemId",
    };
  }

  if (!isValidQuantity(quantity)) {
    return {
      success: false,
      error: "Ilość musi być liczbą całkowitą od 1 do 99.",
      field: "quantity",
    };
  }

  try {
    await updateItemQuantity(user.id, itemId, quantity);

    revalidatePath("/basket");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error:
        "Nie udało się zmienić ilości. Sprawdź dostępny stan produktu.",
      field: "quantity",
    };
  }
}

export async function removeItemAction(
  itemId: number,
): Promise<CartActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: "Musisz być zalogowany, aby zmienić koszyk.",
    };
  }

  if (!isValidCartItemId(itemId)) {
    return {
      success: false,
      error: "Nieprawidłowa pozycja koszyka.",
      field: "itemId",
    };
  }

  try {
    await removeItem(user.id, itemId);

    revalidatePath("/basket");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Nie udało się usunąć produktu z koszyka.",
    };
  }
}