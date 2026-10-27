import Image from "next/image";
import Link from "next/link";

import CartItemActions from "@/components/CartItemActions";
import { getCurrentUserCart } from "@/lib/cart/queries";
import { getCurrentSession } from "@/lib/session";

function formatPrice(price: number) {
  return `${(price / 100).toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} zł`;
}

export default async function BasketPage() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <main>
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Koszyk
          </h1>

          <p className="mt-3 text-base text-slate-500">
            Zaloguj się, aby zobaczyć swój koszyk.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Wymagane logowanie
          </h2>

          <p className="mt-2 text-slate-500">
            Musisz się zalogować, aby korzystać z koszyka.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold !text-white no-underline transition hover:bg-blue-700"
          >
            Przejdź do logowania
          </Link>
        </div>
      </main>
    );
  }

  const cart = await getCurrentUserCart();

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Koszyk
        </h1>

        <p className="mt-3 text-base text-slate-500">
          Zalogowany jako{" "}
          <span className="font-semibold text-slate-700">
            {session.user.name}
          </span>
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-500">
            0
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Twój koszyk jest pusty
          </h2>

          <p className="mt-2 text-slate-500">
            Dodaj produkty z katalogu, aby pojawiły się tutaj.
          </p>

          <Link
            href="/product-list"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold !text-white no-underline transition hover:bg-blue-700"
          >
            Przejdź do produktów
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-xl bg-slate-50 p-4 sm:w-48">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={180}
                      height={140}
                      className="h-auto max-h-full w-auto max-w-full object-contain"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {item.product.name}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          Cena jednostkowa
                        </p>

                        <p className="text-lg font-bold text-slate-900">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm text-slate-500">
                          Wartość
                        </p>

                        <p className="text-xl font-bold text-slate-900">
                          {formatPrice(item.value)}
                        </p>
                      </div>
                    </div>

                    {item.quantity > item.product.amount && (
                      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                        Wybrana ilość przekracza aktualny stan magazynowy.
                        Zmniejsz ilość lub usuń produkt.
                      </div>
                    )}

                    <div className="mt-auto">
                      <CartItemActions
                        itemId={item.id}
                        quantity={item.quantity}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-slate-900">
              Podsumowanie
            </h2>

            <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-5">
              <span className="text-sm text-slate-500">
                Liczba pozycji
              </span>

              <span className="font-semibold text-slate-900">
                {cart.items.length}
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <span className="font-semibold text-slate-700">
                Razem
              </span>

              <span className="text-2xl font-bold text-slate-900">
                {formatPrice(cart.total)}
              </span>
            </div>

            <Link
              href="/product-list"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold !text-slate-600 no-underline transition hover:bg-slate-50 hover:!text-slate-900"
            >
              Kontynuuj zakupy
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}