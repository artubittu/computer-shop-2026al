import "server-only";

import { getCart } from "@/lib/cart/cart";
import { requireCurrentUser } from "@/lib/session";

export async function getCurrentUserCart() {
  const user = await requireCurrentUser();

  return getCart(user.id);
}