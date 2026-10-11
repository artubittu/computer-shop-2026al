import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <h1>404 – Nie znaleziono strony</h1>

      <p>
        Strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>

      <Link href="/" className="status-link">
        Wróć na stronę główną
      </Link>
    </main>
  );
}