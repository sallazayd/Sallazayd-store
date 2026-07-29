"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">إضافة منتج جديد</h1>
        <ProductForm />
      </div>
    </ProtectedRoute>
  );
}
