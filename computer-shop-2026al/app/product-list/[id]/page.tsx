import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  getProductById,
  getProducts,
} from "../../../lib/products/repository";

import { parseProductId } from "../../../lib/products/route-id";
import type { ProductType } from "../../../lib/products/types";

const categoryNames: Record<ProductType, string> = {
  cpu: "Procesor",
  gpu: "Karta graficzna",
  ram: "Pamięć RAM",
  disk: "Dysk",
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts("name");

  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  await connection();
  const { id: rawId } = await params;

  const id = parseProductId(rawId);

  if (id === null) {
    return {
      title: "Nie znaleziono produktu | Computer Shop",
    };
  }

  const product = await getProductById(id);

  if (product === null) {
    return {
      title: "Nie znaleziono produktu | Computer Shop",
    };
  }

  //   if (id === 1) {
  //   throw new Error("TESTOWA AWARIA GENERATE METADATA");
  // }

  return {
    title: `${product.name} | Computer Shop`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  await connection();
  const { id: rawId } = await params;

  const id = parseProductId(rawId);

  if (id === null) {
    notFound();
  }

  //   if (id === 1) {
  //   throw new Error("TESTOWA AWARIA SZCZEGÓŁÓW PRODUKTU");
  // }

  const product = await getProductById(id);

  if (product === null) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/product-list"
        className="mb-8 inline-block font-semibold text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
      >
        ← Wróć do katalogu
      </Link>

      <article className="grid gap-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div className="flex items-center justify-center rounded-xl bg-gray-50 p-6">
          <Image
            src={product.image}
            alt={`Zdjęcie produktu ${product.name}`}
            width={500}
            height={350}
            className="h-auto w-full max-w-lg object-contain"
            priority
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          <div className="space-y-4 text-lg text-gray-700">
            <p>
              <strong className="font-semibold text-gray-900">
                Kod:
              </strong>{" "}
              {product.code}
            </p>

            <p>
              <strong className="font-semibold text-gray-900">
                Kategoria:
              </strong>{" "}
              {categoryNames[product.type]}
            </p>

            <p>
              <strong className="font-semibold text-gray-900">
                Opis:
              </strong>{" "}
              {product.description}
            </p>

            <p>
              <strong className="font-semibold text-gray-900">
                Cena:
              </strong>{" "}
              {(product.price / 100).toLocaleString("pl-PL", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              zł
            </p>

            <p>
              <strong className="font-semibold text-gray-900">
                Stan magazynowy:
              </strong>{" "}
              {product.amount > 0
                ? `${product.amount} szt.`
                : "Brak w magazynie"}
            </p>

            <p>
              <strong className="font-semibold text-gray-900">
                Data:
              </strong>{" "}
              {new Date(product.date).toLocaleDateString("pl-PL")}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}