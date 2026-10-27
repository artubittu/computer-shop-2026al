export const MIN_CART_QUANTITY = 1;
export const MAX_CART_QUANTITY = 99;

export function isValidProductId(productId: number): boolean {
  return Number.isSafeInteger(productId) && productId > 0;
}

export function isValidCartItemId(itemId: number): boolean {
  return Number.isSafeInteger(itemId) && itemId > 0;
}

export function isValidQuantity(quantity: number): boolean {
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= MIN_CART_QUANTITY &&
    quantity <= MAX_CART_QUANTITY
  );
}