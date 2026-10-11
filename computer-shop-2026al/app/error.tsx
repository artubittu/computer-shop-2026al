"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="status-page">
      <h1>Wystąpił błąd</h1>

      <p>
        Nie udało się załadować strony. Spróbuj ponownie.
      </p>

      <button
        type="button"
        className="retry-button"
        onClick={() => reset()}
      >
        Spróbuj ponownie
      </button>
    </main>
  );
}