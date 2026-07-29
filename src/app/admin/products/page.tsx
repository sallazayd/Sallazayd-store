"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setProducts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
        );
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-ink text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-black/85 transition-colors"
          >
            <Plus size={16} />
            إضافة منتج
          </Link>
        </div>

        {loading ? (
          <p className="text-muted">جارٍ التحميل...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-muted">
            لا توجد منتجات بعد. أضف أول منتج للمتجر.
          </div>
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="text-right font-medium px-4 py-3">المنتج</th>
                  <th className="text-right font-medium px-4 py-3">السعر</th>
                  <th className="text-right font-medium px-4 py-3">المخزون</th>
                  <th className="text-right font-medium px-4 py-3">
                    الأكثر مبيعاً
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-12 rounded-lg overflow-hidden bg-surface border border-line shrink-0">
                          {p.images[0] && (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{p.isBestSeller ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-left">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-sm underline"
                      >
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
