import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById } from "../../../lib/products/repository";
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

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
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
    <main>
      <Link href="/product-list">
        ← Wróć do katalogu
      </Link>

      <article className="product-details">
        <Image
          src={product.image}
          alt={`Zdjęcie produktu ${product.name}`}
          width={500}
          height={350}
          className="product-details-image"
          priority
        />

        <div>
          <h1>{product.name}</h1>

          <p>
            <strong>Kod:</strong> {product.code}
          </p>

          <p>
            <strong>Kategoria:</strong>{" "}
            {categoryNames[product.type]}
          </p>

          <p>
            <strong>Opis:</strong> {product.description}
          </p>

          <p>
            <strong>Cena:</strong>{" "}
            {(product.price / 100).toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            zł
          </p>

          <p>
            <strong>Stan magazynowy:</strong>{" "}
            {product.amount > 0
              ? `${product.amount} szt.`
              : "Brak w magazynie"}
          </p>

          <p>
            <strong>Data:</strong>{" "}
            {new Date(product.date).toLocaleDateString("pl-PL")}
          </p>
        </div>
      </article>
    </main>
  );
}