"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import Header from "@/components/Header";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="max-w-shell mx-auto px-5 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">عربة التسوق</h1>

        {items.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <p className="mb-4">عربة التسوق فارغة</p>
            <Link href="/" className="underline text-ink">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            <ul className="md:col-span-2 divide-y divide-line">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.selectedColor}`}
                  className="flex gap-4 py-6"
                >
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-surface border border-line shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.selectedColor && (
                          <p className="text-sm text-muted mt-1">
                            {item.selectedColor}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.productId, item.selectedColor)
                        }
                        aria-label="إزالة"
                        className="text-muted hover:text-ink transition-colors focus-ring rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <QuantitySelector
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) =>
                          updateQuantity(item.productId, item.selectedColor, q)
                        }
                      />
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="md:col-span-1">
              <div className="border border-line rounded-2xl p-6 space-y-5 sticky top-28">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full text-center bg-ink text-white rounded-full py-3.5 font-medium hover:bg-black/85 transition-colors focus-ring"
                >
                  إتمام الطلب
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
