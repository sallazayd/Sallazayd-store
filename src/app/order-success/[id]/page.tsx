"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";

export default function OrderSuccessPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="max-w-shell mx-auto px-5 md:px-8 py-24 text-center">
        <CheckCircle2
          size={56}
          strokeWidth={1.5}
          className="mx-auto mb-6 text-ink"
        />
        <h1 className="text-2xl font-bold mb-3">تم استلام طلبك بنجاح</h1>
        <p className="text-muted mb-1">
          رقم الطلب:{" "}
          <span className="font-mono text-ink">{id.slice(0, 8)}</span>
        </p>
        <p className="text-muted max-w-md mx-auto mt-4">
          سيتم التواصل معك قريباً لتأكيد الطلب وترتيب التوصيل.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 bg-ink text-white rounded-full px-8 py-3.5 font-medium hover:bg-black/85 transition-colors"
        >
          متابعة التسوق
        </Link>
      </main>
    </div>
  );
}
