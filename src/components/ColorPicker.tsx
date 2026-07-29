"use client";

import { ProductColor } from "@/lib/types";
import { Check } from "lucide-react";

export default function ColorPicker({
  colors,
  selected,
  onSelect,
}: {
  colors: ProductColor[];
  selected: string | null;
  onSelect: (colorId: string) => void;
}) {
  if (colors.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium mb-3">
        اللون{" "}
        {selected && (
          <span className="text-muted font-normal">
            — {colors.find((c) => c.id === selected)?.name}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selected === color.id;
          const isLight = isLightColor(color.hex);
          return (
            <button
              key={color.id}
              type="button"
              aria-label={color.name}
              onClick={() => onSelect(color.id)}
              className={`relative w-10 h-10 rounded-full border transition-all focus-ring ${
                isSelected
                  ? "border-ink ring-2 ring-offset-2 ring-ink"
                  : "border-line hover:border-ink"
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="absolute inset-0 m-auto"
                  color={isLight ? "#0a0a0a" : "#ffffff"}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}
