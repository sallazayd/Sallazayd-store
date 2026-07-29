"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() } as Product);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">تعديل المنتج</h1>
        {loading ? (
          <p className="text-muted">جارٍ التحميل...</p>
        ) : product ? (
          <ProductForm existing={product} />
        ) : (
          <p className="text-muted">المنتج غير موجود.</p>
        )}
      </div>
    </ProtectedRoute>
  );
}
