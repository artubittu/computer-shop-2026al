import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

import products from "../data/products.json";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    slug: "cpu",
    name: "Procesor",
  },
  {
    slug: "gpu",
    name: "Karta graficzna",
  },
  {
    slug: "ram",
    name: "Pamięć RAM",
  },
  {
    slug: "disk",
    name: "Dysk",
  },
];

async function main() {
  console.log("Rozpoczynam seedowanie bazy danych...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
      },
      create: category,
    });
  }

  const databaseCategories = await prisma.category.findMany();

  const categoryBySlug = new Map(
    databaseCategories.map((category) => [
      category.slug,
      category.id,
    ])
  );

  for (const product of products) {
    const categoryId = categoryBySlug.get(product.type);

    if (!categoryId) {
      throw new Error(
        `Nieznana kategoria produktu ${product.code}: ${product.type}`
      );
    }

    await prisma.product.upsert({
      where: {
        code: product.code,
      },
      update: {
        name: product.name,
        price: product.price,
        amount: product.amount,
        description: product.description,
        date: new Date(product.date),
        image: product.image,
        categoryId,
      },
      create: {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        amount: product.amount,
        description: product.description,
        date: new Date(product.date),
        image: product.image,
        categoryId,
      },
    });
  }

  console.log(`Kategorie: ${categories.length}`);
  console.log(`Produkty: ${products.length}`);
  console.log("Seedowanie zakończone.");
}

main()
  .catch((error) => {
    console.error("Błąd podczas seedowania:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });