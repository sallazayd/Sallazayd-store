"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/products");
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center text-muted">
        جارٍ التحويل...
      </div>
    </ProtectedRoute>
  );
}
