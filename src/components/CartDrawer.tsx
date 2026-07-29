"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import QuantitySelector from "./QuantitySelector";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
    totalPrice,
  } = useCart();

  return (
    <>
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 bottom-0 left-0 w-full sm:w-[420px] bg-paper z-50 shadow-elevated flex flex-col transition-transform duration-500 ease-out-expo ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-line shrink-0">
          <h2 className="text-lg font-bold">عربة التسوق</h2>
          <button
            onClick={closeDrawer}
            aria-label="إغلاق"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted gap-2">
              <p>عربة التسوق فارغة</p>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.selectedColor}`}
                  className="flex gap-4"
                >
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-surface border border-line shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        onClick={() =>
                          removeFromCart(item.productId, item.selectedColor)
                        }
                        aria-label="إزالة"
                        className="text-muted hover:text-ink transition-colors shrink-0 focus-ring rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.selectedColor && (
                      <p className="text-xs text-muted mt-1">
                        {item.selectedColor}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <QuantitySelector
                        size="sm"
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) =>
                          updateQuantity(item.productId, item.selectedColor, q)
                        }
                      />
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 py-5 shrink-0 space-y-4">
            <div className="flex items-center justify-between text-base font-bold">
              <span>الإجمالي</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full text-center bg-ink text-white rounded-full py-3.5 font-medium hover:bg-black/85 transition-colors focus-ring"
            >
              إتمام الطلب
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
