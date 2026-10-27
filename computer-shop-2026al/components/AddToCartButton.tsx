"use client";

import { useState, useTransition } from "react";

import { addProductAction } from "@/lib/cart/actions";

type AddToCartButtonProps = {
  productId: number;
  disabled?: boolean;
};

export default function AddToCartButton({
  productId,
  disabled = false,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await addProductAction(productId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage("Dodano do koszyka.");
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={handleAdd}
        className="flex h-11 w-full items-center justify-center rounded-lg border border-blue-600 bg-white text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
      >
        {isPending
          ? "Dodawanie..."
          : disabled
            ? "Produkt niedostępny"
            : "Dodaj do koszyka"}
      </button>

      {message && (
        <p className="mt-2 text-sm font-medium text-emerald-600">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}