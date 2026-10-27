export const MIN_CART_QUANTITY = 1;
export const MAX_CART_QUANTITY = 99;

export const MIN_DATABASE_ID = 1;
export const MAX_DATABASE_ID = 2_147_483_647;

export function isValidProductId(productId: number): boolean {
  return (
    Number.isSafeInteger(productId) &&
    productId >= MIN_DATABASE_ID &&
    productId <= MAX_DATABASE_ID
  );
}

export function isValidCartItemId(itemId: number): boolean {
  return (
    Number.isSafeInteger(itemId) &&
    itemId >= MIN_DATABASE_ID &&
    itemId <= MAX_DATABASE_ID
  );
}

export function isValidQuantity(quantity: number): boolean {
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= MIN_CART_QUANTITY &&
    quantity <= MAX_CART_QUANTITY
  );
}