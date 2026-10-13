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

return (
  <main>
    {/* Nagłówek */}
    <div className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Katalog produktów
      </h1>

      <p className="mt-3 text-base text-slate-500">
        Przeglądaj produkty i dopasuj wyniki za pomocą filtrów.
      </p>
    </div>

    {/* Filtry */}
    <form
      method="GET"
      className="mb-8 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-end gap-5">
        {/* Kategoria */}
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <label
            htmlFor="type"
            className="text-sm font-semibold text-slate-700"
          >
            Kategoria
          </label>

          <div className="relative">
            <select
              id="type"
              name="type"
              defaultValue={criteria.type}
              className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-none outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Wszystkie</option>
              <option value="cpu">Procesory</option>
              <option value="gpu">Karty graficzne</option>
              <option value="ram">Pamięć RAM</option>
              <option value="disk">Dyski</option>
            </select>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              ▼
            </span>
          </div>
        </div>

        {/* Dostępność */}
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <label
            htmlFor="stock"
            className="text-sm font-semibold text-slate-700"
          >
            Dostępność
          </label>

          <div className="relative">
            <select
              id="stock"
              name="stock"
              defaultValue={criteria.stock}
              className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-none outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Wszystkie</option>
              <option value="available">Dostępne</option>
              <option value="unavailable">Niedostępne</option>
            </select>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              ▼
            </span>
          </div>
        </div>

        {/* Sortowanie */}
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <label
            htmlFor="sort"
            className="text-sm font-semibold text-slate-700"
          >
            Sortowanie
          </label>

          <div className="relative">
            <select
              id="sort"
              name="sort"
              defaultValue={criteria.sort}
              className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-none outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="name">Nazwa A–Z</option>
              <option value="newest">Najnowsze</option>
            </select>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              ▼
            </span>
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="h-11 rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Zastosuj
          </button>

          <Link
            href="/product-list"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold !text-slate-600 no-underline transition hover:border-slate-300 hover:bg-slate-50 hover:!text-slate-900"
          >
            Wyczyść
          </Link>
        </div>
      </div>
    </form>

    {/* Ostrzeżenia parametrów URL */}
    {warnings.length > 0 && (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
        {warnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    )}

    {/* Liczba produktów */}
    <div className="mb-6 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Znaleziono{" "}
        <span className="font-bold text-slate-900">
          {products.length}
        </span>{" "}
        produktów
      </p>
    </div>

    {/* Brak produktów */}
    {products.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-500">
          ×
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-900">
          Brak produktów
        </h2>

        <p className="mb-6 text-slate-500">
          Nie znaleziono produktów spełniających wybrane kryteria.
        </p>

        <Link
          href="/product-list"
          className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold !text-white no-underline transition hover:bg-blue-700"
        >
          Wyczyść filtry
        </Link>
      </div>
    ) : (
      /* Lista produktów */
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            {/* Zdjęcie */}
            <Link
              href={`/product-list/${product.id}`}
              className="flex h-56 items-center justify-center bg-slate-50 p-6"
            >
              <Image
                src={product.image}
                alt={`Zdjęcie produktu ${product.name}`}
                width={240}
                height={160}
                className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Informacje o produkcie */}
            <div className="flex flex-1 flex-col p-5">
              {/* Kategoria i dostępność */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {categoryNames[product.type]}
                </span>

                {product.amount > 0 ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Dostępny
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Brak
                  </span>
                )}
              </div>

              {/* Nazwa */}
              <h2 className="mb-4 text-lg font-bold leading-snug text-slate-900">
                <Link
                  href={`/product-list/${product.id}`}
                  className="no-underline transition hover:text-blue-600"
                >
                  {product.name}
                </Link>
              </h2>

              <div className="mt-auto">
                {/* Cena */}
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {(product.price / 100).toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-base font-semibold">
                    zł
                  </span>
                </p>

                {/* Stan magazynowy */}
                {product.amount > 0 ? (
                  <p className="mt-1 text-xs text-slate-400">
                    W magazynie: {product.amount} szt.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">
                    Produkt chwilowo niedostępny
                  </p>
                )}

                {/* Przycisk szczegółów */}
                <Link
                  href={`/product-list/${product.id}`}
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold !text-white no-underline transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  Zobacz produkt
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </main>
);
}