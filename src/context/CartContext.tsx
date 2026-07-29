"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, selectedColor: string) => void;
  updateQuantity: (
    productId: string,
    selectedColor: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "sallazayd_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  function addToCart(newItem: CartItem) {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === newItem.productId &&
          i.selectedColor === newItem.selectedColor
      );
      if (existing) {
        return prev.map((i) =>
          i === existing
            ? {
                ...i,
                quantity: Math.min(
                  i.quantity + newItem.quantity,
                  i.maxStock
                ),
              }
            : i
        );
      }
      return [...prev, newItem];
    });
    setDrawerOpen(true);
  }

  function removeFromCart(productId: string, selectedColor: string) {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.selectedColor === selectedColor)
      )
    );
  }

  function updateQuantity(
    productId: string,
    selectedColor: string,
    quantity: number
  ) {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.selectedColor === selectedColor
          ? { ...i, quantity: Math.min(quantity, i.maxStock) }
          : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalPrice = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
