"use client";

import { useState, useTransition } from "react";

import {
  removeItemAction,
  updateItemQuantityAction,
} from "@/lib/cart/actions";

type CartItemActionsProps = {
  itemId: number;
  quantity: number;
};

export default function CartItemActions({
  itemId,
  quantity,
}: CartItemActionsProps) {
  const [value, setValue] = useState(String(quantity));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    const newQuantity = Number(value);

    setError(null);

    startTransition(async () => {
      const result = await updateItemQuantityAction(
        itemId,
        newQuantity,
      );

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  function handleRemove() {
    setError(null);

    startTransition(async () => {
      const result = await removeItemAction(itemId);

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`quantity-${itemId}`}
            className="text-sm font-semibold text-slate-700"
          >
            Ilość
          </label>

          <input
            id={`quantity-${itemId}`}
            type="number"
            min={1}
            max={99}
            step={1}
            value={value}
            disabled={isPending}
            onChange={(event) => setValue(event.target.value)}
            className="h-11 w-24 rounded-lg border border-slate-200 bg-white px-3 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          />

          {error && (
            <p className="max-w-xs text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleUpdate}
          className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isPending ? "Zapisywanie..." : "Zmień ilość"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleRemove}
          className="h-11 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Usuń
        </button>
      </div>
    </div>
  );
}