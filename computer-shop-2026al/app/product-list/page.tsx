import { getCatalogProducts } from "../../lib/products/repository";
import {
  parseCatalogParams,
  type RawSearchParams,
} from "../../lib/products/catalog-params";
import type { ProductType } from "../../lib/products/types";
import Image from "next/image";
import Link from "next/link";

const categoryNames: Record<ProductType, string> = {
  cpu: "Procesor",
  gpu: "Karta graficzna",
  ram: "Pamięć RAM",
  disk: "Dysk",
};

type ProductListPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function ProductListPage({
  searchParams,
}: ProductListPageProps) {
  //  const forceError = true;

  // if (forceError) {
  //   throw new Error("TESTOWA AWARIA REPOZYTORIUM");
  //  }

  const rawSearchParams = await searchParams;

  const { criteria, warnings } =
    parseCatalogParams(rawSearchParams);

  const products = await getCatalogProducts(criteria);

  if (products.length === 0) {
    return (
      <main>
        <h1>Katalog produktów</h1>

        {warnings.length > 0 && (
          <div className="catalog-warning">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        )}

        <p>Brak produktów do wyświetlenia.</p>

        <Link href="/product-list">
          Wyczyść filtry
        </Link>
      </main>
    );
  }

  return (
    <main>
      <h1>Katalog produktów</h1>

      <form method="GET" className="catalog-filters">
  <div className="filter-field">
    <label htmlFor="type">Kategoria</label>

    <select
      id="type"
      name="type"
      defaultValue={criteria.type}
    >
      <option value="all">Wszystkie</option>
      <option value="cpu">Procesory</option>
      <option value="gpu">Karty graficzne</option>
      <option value="ram">Pamięć RAM</option>
      <option value="disk">Dyski</option>
    </select>
  </div>

  <div className="filter-field">
    <label htmlFor="stock">Dostępność</label>

    <select
      id="stock"
      name="stock"
      defaultValue={criteria.stock}
    >
      <option value="all">Wszystkie</option>
      <option value="available">Dostępne</option>
      <option value="unavailable">Niedostępne</option>
    </select>
  </div>

  <div className="filter-field">
    <label htmlFor="sort">Sortowanie</label>

    <select
      id="sort"
      name="sort"
      defaultValue={criteria.sort}
    >
      <option value="name">Nazwa</option>
      <option value="newest">Najnowsze</option>
    </select>
  </div>

  <div className="filter-actions">
    <button type="submit">
      Zastosuj
    </button>

    <Link href="/product-list" className="clear-filters">
      Wyczyść filtry
    </Link>
  </div>
</form>

      {warnings.length > 0 && (
        <div className="catalog-warning">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}

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

            <h2>
              <Link
                href={`/product-list/${product.id}`}
                className="product-name-link"
              >
                {product.name}
              </Link>
            </h2>

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