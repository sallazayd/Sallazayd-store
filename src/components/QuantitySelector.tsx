"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  value,
  onChange,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  return (
    <div className="inline-flex items-center border border-line rounded-full">
      <button
        type="button"
        aria-label="إنقاص الكمية"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className={`${btnSize} flex items-center justify-center rounded-full disabled:opacity-30 hover:bg-surface transition-colors focus-ring`}
      >
        <Minus size={14} strokeWidth={2} />
      </button>
      <span className="w-8 text-center text-sm font-medium select-none">
        {value}
      </span>
      <button
        type="button"
        aria-label="زيادة الكمية"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnSize} flex items-center justify-center rounded-full disabled:opacity-30 hover:bg-surface transition-colors focus-ring`}
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
