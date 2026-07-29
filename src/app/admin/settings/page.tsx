"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { StoreSettings } from "@/lib/types";
import { slugifyId } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const DEFAULTS: StoreSettings = {
  storeName: "سلة زايد",
  logoUrl: "",
  announcementBar: "",
  announcementEnabled: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) {
          setSettings({ ...DEFAULTS, ...(snap.data() as StoreSettings) });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogoUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `settings/logo-${slugifyId()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings((s) => ({ ...s, logoUrl: url }));
    } catch (err) {
      console.error("Logo upload failed:", err);
      toast.error("فشل رفع الشعار");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "store"), settings);
      toast.success("تم حفظ الإعدادات");
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto px-6 py-8 text-muted">
          جارٍ التحميل...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">الإعدادات</h1>
        <form onSubmit={handleSave} className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              اسم المتجر
            </label>
            <input
              value={settings.storeName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, storeName: e.target.value }))
              }
              className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">الشعار</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface border border-line relative flex items-center justify-center">
                {settings.logoUrl ? (
                  <Image
                    src={settings.logoUrl}
                    alt="الشعار"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted">لا يوجد</span>
                )}
              </div>
              <label className="text-sm px-4 py-2 rounded-full border border-line hover:border-ink cursor-pointer transition-colors">
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "تغيير الشعار"
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleLogoUpload(e.target.files?.[0] || null)
                  }
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 mb-3 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={settings.announcementEnabled}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    announcementEnabled: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-black"
              />
              <span className="text-sm font-medium">تفعيل شريط الإعلانات</span>
            </label>
            <input
              placeholder="نص شريط الإعلانات (مثال: شحن مجاني لجميع المحافظات)"
              value={settings.announcementBar}
              onChange={(e) =>
                setSettings((s) => ({ ...s, announcementBar: e.target.value }))
              }
              className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-white rounded-full px-8 py-3.5 font-medium hover:bg-black/85 transition-colors disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
