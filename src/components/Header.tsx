"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StoreSettings } from "@/lib/types";

export default function Header({
  onSearch,
}: {
  onSearch?: (term: string) => void;
}) {
  const { totalItems, openDrawer } = useCart();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "store"));
        if (snap.exists()) setSettings(snap.data() as StoreSettings);
      } catch {
        // silently fall back to defaults if not configured yet
      }
    }
    loadSettings();
  }, []);

  return (
    <>
      {settings?.announcementEnabled && settings.announcementBar && (
        <div className="bg-ink text-white text-center text-sm py-2 px-4">
          {settings.announcementBar}
        </div>
      )}
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-line">
        <div className="max-w-shell mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 focus-ring rounded-lg"
          >
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings?.storeName || "سلة زايد"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-white font-bold text-sm">
                سز
              </div>
            )}
            <span className="text-xl font-bold tracking-tight">
              {settings?.storeName || "سلة زايد"}
            </span>
          </Link>

          {onSearch && (
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar onSearch={onSearch} />
            </div>
          )}

          <button
            onClick={openDrawer}
            aria-label="عربة التسوق"
            className="relative flex items-center justify-center w-11 h-11 rounded-full border border-line hover:border-ink transition-colors focus-ring"
          >
            <ShoppingBag size={20} strokeWidth={1.75} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -left-1 bg-ink text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
        {onSearch && (
          <div className="md:hidden px-5 pb-4">
            <SearchBar onSearch={onSearch} />
          </div>
        )}
      </header>
    </>
  );
}
