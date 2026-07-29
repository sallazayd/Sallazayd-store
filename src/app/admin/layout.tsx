"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import { Package, ClipboardList, Settings } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <main className="pb-24 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-paper border-t border-line flex items-center justify-around h-16 z-40">
        <MobileLink href="/admin/products" icon={Package} label="المنتجات" />
        <MobileLink href="/admin/orders" icon={ClipboardList} label="الطلبات" />
        <MobileLink href="/admin/settings" icon={Settings} label="الإعدادات" />
      </nav>
    </div>
  );
}

function MobileLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 text-[11px] ${
        active ? "text-ink font-medium" : "text-muted"
      }`}
    >
      <Icon size={20} strokeWidth={1.75} />
      {label}
    </Link>
  );
}
