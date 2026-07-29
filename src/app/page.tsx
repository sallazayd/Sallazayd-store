"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import Header from "@/components/Header";
import BestSellers from "@/components/BestSellers";
import ProductGrid from "@/components/ProductGrid";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
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
    loadProducts();
  }, []);

  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller),
    [products]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  return (
    <div className="min-h-screen bg-paper">
      <Header onSearch={setSearch} />
      <main className="max-w-shell mx-auto px-5 md:px-8 py-8 md:py-12">
        {loading ? (
          <LoadingGrid />
        ) : (
          <>
            {!search && <BestSellers products={bestSellers} />}
            <ProductGrid products={filtered} />
          </>
        )}
      </main>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-surface border border-line" />
          <div className="h-3 bg-surface rounded mt-3 w-3/4" />
          <div className="h-3 bg-surface rounded mt-2 w-1/3" />
        </div>
      ))}
    </div>
  );
}
