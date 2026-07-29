"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function changeStatus(orderId: string, status: OrderStatus) {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast.success("تم تحديث حالة الطلب");
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("فشل تحديث الحالة");
    }
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        o.customerName.toLowerCase().includes(term) ||
        o.phone.includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">الطلبات</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-line rounded-xl px-4 py-2.5 text-sm focus-ring focus:border-ink"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
            className="border border-line rounded-xl px-4 py-2.5 text-sm focus-ring focus:border-ink"
          >
            <option value="all">كل الحالات</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-muted">جارٍ التحميل...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted">لا توجد طلبات.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const isOpen = expanded === order.id;
              return (
                <div
                  key={order.id}
                  className="border border-line rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">
                          {order.customerName}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1">
                        {order.governorate} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-medium shrink-0">
                      {formatPrice(order.totalPrice)}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-line px-5 py-5 bg-surface/50 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <Info label="الهاتف" value={order.phone} />
                        <Info label="المحافظة" value={order.governorate} />
                        <Info label="العنوان" value={order.address} />
                        <Info label="ملاحظات" value={order.notes || "—"} />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">المنتجات</p>
                        <ul className="divide-y divide-line border border-line rounded-xl overflow-hidden bg-paper">
                          {order.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex justify-between px-4 py-3 text-sm"
                            >
                              <span>
                                {item.productName}
                                {item.selectedColor &&
                                  ` — ${item.selectedColor}`}{" "}
                                × {item.quantity}
                              </span>
                              <span>
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">
                          تغيير الحالة
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            changeStatus(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                          className="border border-line rounded-xl px-4 py-2.5 text-sm focus-ring focus:border-ink"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
