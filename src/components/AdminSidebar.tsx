"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Package, ClipboardList, Settings, LogOut, Store } from "lucide-react";

const links = [
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 shrink-0 border-l border-line min-h-screen bg-surface hidden md:flex md:flex-col">
      <div className="h-20 flex items-center gap-2 px-6 border-b border-line">
        <Store size={20} />
        <span className="font-bold">لوحة تحكم سلة زايد</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-ink text-white"
                  : "text-ink/80 hover:bg-line/60"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-line">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink/80 hover:bg-line/60 transition-colors w-full"
        >
          <LogOut size={18} strokeWidth={1.75} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
