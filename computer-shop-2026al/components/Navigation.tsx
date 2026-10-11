import Link from "next/link";

export default function Navigation() {
  return (
    <nav aria-label="Główna nawigacja">
      <Link href="/">Strona główna</Link>
      <Link href="/product-list">Produkty</Link>
      <Link href="/basket">Koszyk</Link>
      <Link href="/order-history">Historia zamówień</Link>
      <Link href="/about">O projekcie</Link>
    </nav>
  );
}