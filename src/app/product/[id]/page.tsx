"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Header from "@/components/Header";
import ColorPicker from "@/components/ColorPicker";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Product;
          setProduct(data);
          if (data.colors.length > 0) setSelectedColor(data.colors[0].id);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    if (product.colors.length > 0 && !selectedColor) {
      toast.error("الرجاء اختيار اللون");
      return;
    }
    const colorName =
      product.colors.find((c) => c.id === selectedColor)?.name || "";

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      selectedColor: colorName,
      quantity,
      maxStock: product.stock,
    });
    toast.success("تمت الإضافة إلى العربة");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="max-w-shell mx-auto px-5 md:px-8 py-12 grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-surface border border-line" />
          <div className="space-y-4">
            <div className="h-6 bg-surface rounded w-2/3" />
            <div className="h-4 bg-surface rounded w-1/4" />
            <div className="h-24 bg-surface rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-paper">
        <Header />
        <div className="max-w-shell mx-auto px-5 md:px-8 py-24 text-center text-muted">
          المنتج غير موجود.
          <div className="mt-4">
            <Link href="/" className="underline">
              العودة للرئيسية
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted hover:text-ink mb-6 focus-ring rounded"
        >
          <ChevronRight size={16} />
          رجوع
        </button>

        <div className="grid md:grid-cols-2 gap-8 md:gap-14">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-line">
              {product.images[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                  لا توجد صورة
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-20 shrink-0 rounded-xl overflow-hidden border transition-colors focus-ring ${
                      activeImage === i ? "border-ink" : "border-line"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <p className="text-xl mt-2 text-ink">
              {formatPrice(product.price)}
            </p>

            <p className="text-muted leading-relaxed mt-6 whitespace-pre-line">
              {product.description}
            </p>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <ColorPicker
                  colors={product.colors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              </div>
            )}

            <div className="mt-8">
              <p className="text-sm font-medium mb-3">الكمية</p>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.stock}
              />
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-xs text-muted mt-2">
                  متبقي {product.stock} فقط
                </p>
              )}
            </div>

            <div className="mt-10 flex-1 flex items-end">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-ink text-white rounded-full py-4 font-medium hover:bg-black/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
              >
                {product.stock === 0 ? "نفذت الكمية" : "أضف إلى العربة"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
