"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block animate-fade-up focus-ring rounded-2xl"
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-line">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            لا توجد صورة
          </div>
        )}
        {product.isBestSeller && (
          <span className="absolute top-3 right-3 bg-ink text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            الأكثر مبيعاً
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-ink line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
