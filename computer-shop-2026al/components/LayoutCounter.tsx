"use client";

import { useState } from "react";

export default function LayoutCounter() {
  const [count, setCount] = useState(0);

  return (
    <div className="layout-counter">
      <span>Licznik layoutu: {count}</span>

      <button
        type="button"
        onClick={() => setCount((current) => current + 1)}
      >
        +1
      </button>
    </div>
  );
}