import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import CartDrawer from "@/components/CartDrawer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سلة زايد",
  description: "سلة زايد — تسوق أونلاين بأناقة وبساطة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-arabic bg-paper text-ink antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#0a0a0a",
                  color: "#fff",
                  fontFamily: "var(--font-cairo)",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  fontSize: "14px",
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
