import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../../lib/prisma";
import { createNameSortKey } from "../../lib/products/name-sort-key";
import {
  addProduct,
  getCart,
  removeItem,
  updateItemQuantity,
} from "../../lib/cart/cart";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.includes("computer_shop_test")) {
  throw new Error(
    "Testy integracyjne mogą działać tylko na bazie computer_shop_test."
  );
}

const USER_A_ID = "test-user-a";
const USER_B_ID = "test-user-b";

async function clearDatabase() {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

async function createTestData() {
  const category = await prisma.category.create({
    data: {
      id: 1,
      slug: "cpu",
      name: "Procesor",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        id: 1,
        code: "CARTCPU001",
        name: "Procesor testowy",
        nameSortKey: createNameSortKey("Procesor testowy"),
        price: 10000,
        amount: 5,
        description: "Produkt do testowania koszyka",
        date: new Date("2026-01-01T10:00:00.000Z"),
        image: "/test/cart-cpu.jpg",
        categoryId: category.id,
      },
      {
        id: 2,
        code: "CARTCPU002",
        name: "Procesor z jedną sztuką",
        nameSortKey: createNameSortKey("Procesor z jedną sztuką"),
        price: 25000,
        amount: 1,
        description: "Produkt do testu współbieżności",
        date: new Date("2026-01-02T10:00:00.000Z"),
        image: "/test/cart-cpu-2.jpg",
        categoryId: category.id,
      },
      {
        id: 3,
        code: "CARTCPU003",
        name: "Produkt niedostępny",
        nameSortKey: createNameSortKey("Produkt niedostępny"),
        price: 5000,
        amount: 0,
        description: "Produkt bez stanu magazynowego",
        date: new Date("2026-01-03T10:00:00.000Z"),
        image: "/test/cart-cpu-3.jpg",
        categoryId: category.id,
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: USER_A_ID,
        name: "User A",
        email: "user-a@example.com",
        emailVerified: true,
      },
      {
        id: USER_B_ID,
        name: "User B",
        email: "user-b@example.com",
        emailVerified: true,
      },
    ],
  });
}

beforeAll(async () => {
  await clearDatabase();
  await createTestData();
});

beforeEach(async () => {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe("Cart - integration", () => {
  it("nowy użytkownik ma pusty koszyk i sumę równą 0", async () => {
    const cart = await getCart(USER_A_ID);

    expect(cart.items).toEqual([]);
    expect(cart.total).toBe(0);
  });

  it("dodaje produkt do koszyka użytkownika", async () => {
    await addProduct(USER_A_ID, 1);

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      quantity: 1,
      value: 10000,
    });

    expect(cart.items[0].product).toMatchObject({
      id: 1,
      name: "Procesor testowy",
      price: 10000,
    });

    expect(cart.total).toBe(10000);
  });

  it("ponowne dodanie tego samego produktu zwiększa ilość zamiast tworzyć duplikat", async () => {
    await addProduct(USER_A_ID, 1);
    await addProduct(USER_A_ID, 1);

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[0].value).toBe(20000);
    expect(cart.total).toBe(20000);

    const rows = await prisma.cartItem.count();

    expect(rows).toBe(1);
  });

  it("nie pozwala dodać produktu bez stanu magazynowego", async () => {
    await expect(addProduct(USER_A_ID, 3)).rejects.toThrow();

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toEqual([]);
    expect(cart.total).toBe(0);
  });

  it("nie pozwala przekroczyć aktualnego stanu magazynowego", async () => {
    await addProduct(USER_A_ID, 2);

    await expect(addProduct(USER_A_ID, 2)).rejects.toThrow();

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(1);
  });

  it("zmienia ilość produktu w koszyku", async () => {
    await addProduct(USER_A_ID, 1);

    const cartBefore = await getCart(USER_A_ID);
    const itemId = cartBefore.items[0].id;

    await updateItemQuantity(USER_A_ID, itemId, 4);

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items[0].quantity).toBe(4);
    expect(cartAfter.items[0].value).toBe(40000);
    expect(cartAfter.total).toBe(40000);
  });

  it("nie pozwala ustawić ilości większej od stanu magazynowego", async () => {
    await addProduct(USER_A_ID, 1);

    const cart = await getCart(USER_A_ID);
    const itemId = cart.items[0].id;

    await expect(
      updateItemQuantity(USER_A_ID, itemId, 6)
    ).rejects.toThrow();

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items[0].quantity).toBe(1);
  });

  it("usuwa produkt z koszyka", async () => {
    await addProduct(USER_A_ID, 1);

    const cartBefore = await getCart(USER_A_ID);
    const itemId = cartBefore.items[0].id;

    await removeItem(USER_A_ID, itemId);

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items).toEqual([]);
    expect(cartAfter.total).toBe(0);
  });
});

describe("Cart ownership - integration", () => {
  it("użytkownik B nie widzi koszyka użytkownika A", async () => {
    await addProduct(USER_A_ID, 1);

    const cartA = await getCart(USER_A_ID);
    const cartB = await getCart(USER_B_ID);

    expect(cartA.items).toHaveLength(1);
    expect(cartB.items).toEqual([]);
    expect(cartB.total).toBe(0);
  });

  it("użytkownik B nie może zmienić elementu użytkownika A", async () => {
    await addProduct(USER_A_ID, 1);

    const cartA = await getCart(USER_A_ID);
    const itemId = cartA.items[0].id;

    await expect(
      updateItemQuantity(USER_B_ID, itemId, 2)
    ).rejects.toThrow();

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items[0].quantity).toBe(1);
  });

  it("użytkownik B nie może usunąć elementu użytkownika A", async () => {
    await addProduct(USER_A_ID, 1);

    const cartA = await getCart(USER_A_ID);
    const itemId = cartA.items[0].id;

    await expect(
      removeItem(USER_B_ID, itemId)
    ).rejects.toThrow();

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items).toHaveLength(1);
  });
});

describe("Cart database constraints - integration", () => {
  it("baza odrzuca ilość równą 0 z pominięciem walidatora aplikacji", async () => {
    const cart = await prisma.cart.create({
      data: {
        userId: USER_A_ID,
      },
    });

    await expect(
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: 1,
          quantity: 0,
        },
      })
    ).rejects.toThrow();
  });

  it("baza odrzuca ilość większą niż 99 z pominięciem walidatora aplikacji", async () => {
    const cart = await prisma.cart.create({
      data: {
        userId: USER_A_ID,
      },
    });

    await expect(
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: 1,
          quantity: 100,
        },
      })
    ).rejects.toThrow();
  });

  it("baza nie pozwala utworzyć dwóch koszyków dla tego samego użytkownika", async () => {
    await prisma.cart.create({
      data: {
        userId: USER_A_ID,
      },
    });

    await expect(
      prisma.cart.create({
        data: {
          userId: USER_A_ID,
        },
      })
    ).rejects.toThrow();
  });

  it("baza nie pozwala na duplikat produktu w tym samym koszyku", async () => {
    const cart = await prisma.cart.create({
      data: {
        userId: USER_A_ID,
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: 1,
        quantity: 1,
      },
    });

    await expect(
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: 1,
          quantity: 1,
        },
      })
    ).rejects.toThrow();
  });
});

describe("Cart concurrency - integration", () => {
  it("dwa równoległe dodania tego samego produktu kończą się ilością 2", async () => {
    const results = await Promise.allSettled([
      addProduct(USER_A_ID, 1),
      addProduct(USER_A_ID, 1),
    ]);

    expect(results.every((result) => result.status === "fulfilled")).toBe(true);

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it("przy jednej dostępnej sztuce tylko jedno z dwóch równoległych dodań zostaje zaakceptowane", async () => {
    const results = await Promise.allSettled([
      addProduct(USER_A_ID, 2),
      addProduct(USER_A_ID, 2),
    ]);

    const fulfilled = results.filter(
      (result) => result.status === "fulfilled"
    );

    const rejected = results.filter(
      (result) => result.status === "rejected"
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(1);
  });

    it("dwie równoległe zmiany ilości nie uszkadzają stanu koszyka", async () => {
    await addProduct(USER_A_ID, 1);

    const cartBefore = await getCart(USER_A_ID);
    const itemId = cartBefore.items[0].id;

    const results = await Promise.allSettled([
      updateItemQuantity(USER_A_ID, itemId, 2),
      updateItemQuantity(USER_A_ID, itemId, 4),
    ]);

    const fulfilled = results.filter(
      (result) => result.status === "fulfilled"
    );

    const rejected = results.filter(
      (result) => result.status === "rejected"
    );

    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
    expect(fulfilled.length + rejected.length).toBe(2);

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items).toHaveLength(1);
    expect([2, 4]).toContain(cartAfter.items[0].quantity);

    const rows = await prisma.cartItem.count({
      where: {
        cart: {
          userId: USER_A_ID,
        },
        productId: 1,
      },
    });

    expect(rows).toBe(1);
  });

  it("równoległa zmiana ilości i usunięcie pozostawiają spójny stan koszyka", async () => {
    await addProduct(USER_A_ID, 1);

    const cartBefore = await getCart(USER_A_ID);
    const itemId = cartBefore.items[0].id;

    const results = await Promise.allSettled([
      updateItemQuantity(USER_A_ID, itemId, 3),
      removeItem(USER_A_ID, itemId),
    ]);

    expect(results).toHaveLength(2);

    const cartAfter = await getCart(USER_A_ID);

    expect(cartAfter.items.length).toBeLessThanOrEqual(1);

    if (cartAfter.items.length === 1) {
      expect(cartAfter.items[0].quantity).toBe(3);
    }

    const rows = await prisma.cartItem.count({
      where: {
        cart: {
          userId: USER_A_ID,
        },
        productId: 1,
      },
    });

    expect(rows).toBeLessThanOrEqual(1);
  });

  it("dwie sesje tego samego użytkownika nie tworzą duplikatu produktu", async () => {
    const sessionOneOperation = addProduct(USER_A_ID, 1);
    const sessionTwoOperation = addProduct(USER_A_ID, 1);

    const results = await Promise.allSettled([
      sessionOneOperation,
      sessionTwoOperation,
    ]);

    expect(results.every((result) => result.status === "fulfilled")).toBe(true);

    const cart = await getCart(USER_A_ID);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);

    const databaseItems = await prisma.cartItem.findMany({
      where: {
        cart: {
          userId: USER_A_ID,
        },
        productId: 1,
      },
    });

    expect(databaseItems).toHaveLength(1);
    expect(databaseItems[0].quantity).toBe(2);
  });
});