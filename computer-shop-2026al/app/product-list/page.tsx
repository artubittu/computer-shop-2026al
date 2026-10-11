import { getProducts } from "../../lib/products/repository";
import type { ProductType } from "../../lib/products/types";
import Image from "next/image";

const categoryNames: Record<ProductType, string> = {
  cpu: "Procesor",
  gpu: "Karta graficzna",
  ram: "Pamięć RAM",
  disk: "Dysk",
};

export default async function ProductListPage() {
  const products = await getProducts("name");

  return (
    <main>
      <h1>Katalog produktów</h1>

      <p>Liczba produktów: {products.length}</p>

      <div className="product-list">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <Image
                src={product.image}
                alt={`Zdjęcie produktu ${product.name}`}
                width={240}
                height={160}
                className="product-image"
            />
            <h2>{product.name}</h2>

            <p>
              <strong>Kategoria:</strong> {categoryNames[product.type]}
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
              <strong>Dostępność:</strong>{" "}
              {product.amount > 0
                ? `Dostępny (${product.amount} szt.)`
                : "Niedostępny"}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}