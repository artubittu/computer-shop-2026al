import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isValidProductId,
  MAX_CART_QUANTITY,
} from "@/lib/cart/validation";

const MAX_TRANSACTION_RETRIES = 3;

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      items: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
              amount: true,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!cart) {
    return {
      items: [],
      total: 0,
    };
  }

  const items = cart.items.map((item) => {
    const value = item.product.price * item.quantity;

    if (!Number.isSafeInteger(value)) {
      throw new Error("Cart item value exceeds the safe integer range");
    }

    return {
      id: item.id,
      quantity: item.quantity,
      product: item.product,
      value,
    };
  });

  const total = items.reduce((sum, item) => {
    const nextTotal = sum + item.value;

    if (!Number.isSafeInteger(nextTotal)) {
      throw new Error("Cart total exceeds the safe integer range");
    }

    return nextTotal;
  }, 0);

  return {
    items,
    total,
  };
}

async function addProductTransaction(userId: string, productId: number) {
  return prisma.$transaction(
    async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          amount: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.amount < 1) {
        throw new Error("Product is unavailable");
      }

      const cart = await tx.cart.upsert({
        where: {
          userId,
        },
        update: {},
        create: {
          userId,
        },
        select: {
          id: true,
        },
      });

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        select: {
          id: true,
          quantity: true,
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;

        if (
          !Number.isSafeInteger(newQuantity) ||
          newQuantity > MAX_CART_QUANTITY ||
          newQuantity > product.amount
        ) {
          throw new Error("Product quantity limit exceeded");
        }

        const updated = await tx.cartItem.updateMany({
          where: {
            id: existingItem.id,
            cartId: cart.id,
            quantity: existingItem.quantity,
          },
          data: {
            quantity: newQuantity,
          },
        });

        if (updated.count !== 1) {
          throw new Error("Cart was modified concurrently");
        }

        return;
      }

      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function addProduct(userId: string, productId: number) {
  if (!isValidProductId(productId)) {
    throw new Error("Invalid product ID");
  }

  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt++) {
    try {
      await addProductTransaction(userId, productId);
      return;
    } catch (error) {
      const isRetryableConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2034" || error.code === "P2002");

      if (!isRetryableConflict || attempt === MAX_TRANSACTION_RETRIES) {
        throw error;
      }
    }
  }
}
export async function updateItemQuantity(
  userId: string,
  itemId: number,
  quantity: number,
) {
  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid cart item ID");
  }

  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CART_QUANTITY
  ) {
    throw new Error("Invalid quantity");
  }

  return prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      select: {
        id: true,
        product: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!item) {
      throw new Error("Cart item not found");
    }

    if (quantity > item.product.amount) {
      throw new Error("Requested quantity exceeds available stock");
    }

    const updated = await tx.cartItem.updateMany({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      data: {
        quantity,
      },
    });

    if (updated.count !== 1) {
      throw new Error("Cart item not found");
    }
  });
}

export async function removeItem(userId: string, itemId: number) {
  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid cart item ID");
  }

  const deleted = await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cart: {
        userId,
      },
    },
  });

  if (deleted.count !== 1) {
    throw new Error("Cart item not found");
  }
}