const MAX_PRODUCT_ID = 2147483647;

export function parseProductId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    return null;
  }

  if (id < 1 || id > MAX_PRODUCT_ID) {
    return null;
  }

  return id;
}