export default function Loading() {
  return (
    <main className="loading-page">
      <h1>Katalog produktów</h1>

      <p role="status" aria-live="polite">
        Ładowanie produktów...
      </p>
    </main>
  );
}