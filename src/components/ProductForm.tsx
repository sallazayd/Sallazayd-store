"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { Product, ProductColor } from "@/lib/types";
import { slugifyId } from "@/lib/utils";
import { Plus, X, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  { name: "أسود", hex: "#0a0a0a" },
  { name: "أبيض", hex: "#ffffff" },
  { name: "أحمر", hex: "#dc2626" },
  { name: "أزرق", hex: "#2563eb" },
  { name: "أخضر", hex: "#16a34a" },
  { name: "بيج", hex: "#d4c5a9" },
  { name: "رمادي", hex: "#6b7280" },
  { name: "ذهبي", hex: "#c9a35c" },
];

export default function ProductForm({
  existing,
}: {
  existing?: Product;
}) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [price, setPrice] = useState(existing?.price?.toString() || "");
  const [stock, setStock] = useState(existing?.stock?.toString() || "10");
  const [isBestSeller, setIsBestSeller] = useState(
    existing?.isBestSeller || false
  );
  const [images, setImages] = useState<string[]>(existing?.images || []);
  const [colors, setColors] = useState<ProductColor[]>(existing?.colors || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const path = `products/${slugifyId()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("فشل رفع الصور");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
    // Best-effort deletion from storage; ignore failures (e.g. url not from our bucket)
    try {
      const storageRef = ref(storage, url);
      deleteObject(storageRef).catch(() => {});
    } catch {
      // ignore
    }
  }

  function addColor(preset: { name: string; hex: string }) {
    if (colors.some((c) => c.hex === preset.hex)) return;
    setColors((prev) => [
      ...prev,
      { id: slugifyId(), name: preset.name, hex: preset.hex },
    ]);
  }

  function addCustomColor() {
    const name = prompt("اسم اللون:");
    if (!name) return;
    const hex = prompt("كود اللون (مثال: #ff0000):", "#000000");
    if (!hex) return;
    setColors((prev) => [...prev, { id: slugifyId(), name, hex }]);
  }

  function removeColor(id: string) {
    setColors((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || images.length === 0) {
      toast.error("الرجاء تعبئة الاسم والسعر وإضافة صورة واحدة على الأقل");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        images,
        colors,
        isBestSeller,
        updatedAt: Date.now(),
      };

      if (existing) {
        await updateDoc(doc(db, "products", existing.id), payload);
        toast.success("تم تحديث المنتج");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: Date.now(),
        });
        toast.success("تم إضافة المنتج");
      }
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to save product:", err);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await deleteDoc(doc(db, "products", existing.id));
      toast.success("تم حذف المنتج");
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("فشل حذف المنتج");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-3">
          صور المنتج *
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img}
              className="relative w-24 h-28 rounded-xl overflow-hidden border border-line group"
            >
              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img)}
                className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <label className="w-24 h-28 rounded-xl border border-dashed border-line flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-ink transition-colors text-muted">
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                <span className="text-xs">إضافة</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            السعر (د.ع) *
          </label>
          <input
            required
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            الكمية المتوفرة
          </label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink"
          />
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium mb-3">الألوان</label>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {colors.map((color) => (
              <div key={color.id} className="relative">
                <div
                  className="w-10 h-10 rounded-full border border-line"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
                <button
                  type="button"
                  onClick={() => removeColor(color.id)}
                  className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => addColor(preset)}
              className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-ink transition-colors"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={addCustomColor}
            className="text-xs px-3 py-1.5 rounded-full border border-dashed border-line hover:border-ink transition-colors"
          >
            + لون مخصص
          </button>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={isBestSeller}
          onChange={(e) => setIsBestSeller(e.target.checked)}
          className="w-5 h-5 accent-black"
        />
        <span className="text-sm font-medium">
          🔥 إضافة إلى الأكثر مبيعاً
        </span>
      </label>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-white rounded-full px-8 py-3.5 font-medium hover:bg-black/85 transition-colors disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ..." : existing ? "حفظ التعديلات" : "إضافة المنتج"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 rounded-full px-6 py-3.5 font-medium border border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            حذف
          </button>
        )}
      </div>
    </form>
  );
}
