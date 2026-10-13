"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";

  const isProductsActive =
    pathname === "/product-list" ||
    pathname.startsWith("/product-list/");

  const isBasketActive = pathname === "/basket";

  const isOrderHistoryActive =
    pathname === "/order-history";

  const isAboutActive = pathname === "/about";

  return (
    <nav aria-label="Główna nawigacja">
      <Link
        href="/"
        className={isHomeActive ? "nav-active" : undefined}
        aria-current={isHomeActive ? "page" : undefined}
      >
        Strona główna
      </Link>

      <Link
        href="/product-list"
        className={isProductsActive ? "nav-active" : undefined}
        aria-current={isProductsActive ? "page" : undefined}
      >
        Produkty
      </Link>

      <Link
        href="/basket"
        className={isBasketActive ? "nav-active" : undefined}
        aria-current={isBasketActive ? "page" : undefined}
      >
        Koszyk
      </Link>

      <Link
        href="/order-history"
        className={isOrderHistoryActive ? "nav-active" : undefined}
        aria-current={isOrderHistoryActive ? "page" : undefined}
      >
        Historia zamówień
      </Link>

      <Link
        href="/about"
        className={isAboutActive ? "nav-active" : undefined}
        aria-current={isAboutActive ? "page" : undefined}
      >
        O projekcie
      </Link>
    </nav>
  );
}