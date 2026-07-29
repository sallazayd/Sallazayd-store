"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { IRAQ_GOVERNORATES } from "@/lib/types";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    governorate: "",
    address: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.governorate || !form.address) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }
    if (items.length === 0) {
      toast.error("عربة التسوق فارغة");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          productImage: i.image,
          selectedColor: i.selectedColor,
          price: i.price,
          quantity: i.quantity,
        })),
        totalPrice,
        customerName: form.fullName,
        phone: form.phone,
        governorate: form.governorate,
        address: form.address,
        notes: form.notes,
        status: "pending",
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      clearCart();
      router.push(`/order-success/${docRef.id}`);
    } catch (err) {
      console.error("Failed to submit order:", err);
      toast.error("حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="max-w-shell mx-auto px-5 md:px-8 py-24 text-center text-muted">
          عربة التسوق فارغة
          <div className="mt-4">
            <Link href="/" className="underline text-ink">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="max-w-shell mx-auto px-5 md:px-8 py-8 md:py-12">
        <h1 className="text-2xl font-bold mb-8">إتمام الطلب</h1>
        <div className="grid md:grid-cols-3 gap-10">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">
            <Field label="الاسم الكامل *">
              <input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="رقم الهاتف *">
              <input
                required
                type="tel"
                dir="ltr"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input text-right"
              />
            </Field>
            <Field label="المحافظة *">
              <select
                required
                value={form.governorate}
                onChange={(e) => update("governorate", e.target.value)}
                className="input"
              >
                <option value="">اختر المحافظة</option>
                {IRAQ_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="العنوان بالتفصيل *">
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="input resize-none"
              />
            </Field>
            <Field label="ملاحظات (اختياري)">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="input resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-ink text-white rounded-full px-10 py-4 font-medium hover:bg-black/85 transition-colors disabled:opacity-50 focus-ring"
            >
              {submitting ? "جارٍ الإرسال..." : "تأكيد الطلب"}
            </button>
          </form>

          <div className="md:col-span-1">
            <div className="border border-line rounded-2xl p-6 space-y-4 sticky top-28">
              <h2 className="font-bold">ملخص الطلب</h2>
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.selectedColor}`}
                    className="py-3 flex justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted mt-0.5">
                        {item.selectedColor && `${item.selectedColor} · `}
                        الكمية {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-line">
                <span>الإجمالي</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          background: #ffffff;
          transition: border-color 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #0a0a0a;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}
