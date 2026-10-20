import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const MAX_INT = 2_147_483_647;

function parseInteger(value: string | undefined, name: string): number {
  if (value === undefined || !/^\d+$/.test(value)) {
    throw new Error(`${name} musi być nieujemną liczbą całkowitą.`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed > MAX_INT) {
    throw new Error(`${name} musi mieścić się w zakresie 0-${MAX_INT}.`);
  }

  return parsed;
}

async function main() {
  const [idArg, amountArg] = process.argv.slice(2);

  const id = parseInteger(idArg, "ID");
  const amount = parseInteger(amountArg, "amount");

  if (id < 1) {
    throw new Error("ID musi być większe lub równe 1.");
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL nie jest ustawione.");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    const result = await prisma.product.updateMany({
      where: {
        id,
      },
      data: {
        amount,
      },
    });

    if (result.count !== 1) {
      throw new Error(
        `Oczekiwano zmiany dokładnie 1 produktu, zmieniono: ${result.count}.`,
      );
    }

    console.log(`Produkt ${id}: ustawiono amount = ${amount}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});