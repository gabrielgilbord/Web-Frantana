"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  type CartLine,
  type CartState,
} from "@/lib/shop/cart-types";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  currency: string;
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
  ready: boolean;
  bagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartState {
  if (typeof window === "undefined") return { lines: [], updatedAt: "" };
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { lines: [], updatedAt: "" };
    return JSON.parse(raw) as CartState;
  } catch {
    return { lines: [], updatedAt: "" };
  }
}

function writeStorage(state: CartState) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    setLines(readStorage().lines);
    setReady(true);
  }, []);

  const openBag = useCallback(() => setBagOpen(true), []);
  const closeBag = useCallback(() => setBagOpen(false), []);
  const toggleBag = useCallback(() => setBagOpen((v) => !v), []);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = Math.max(1, line.quantity ?? 1);
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.variantId === line.variantId);
        let next: CartLine[];
        if (idx >= 0) {
          next = prev.map((l, i) =>
            i === idx ? { ...l, quantity: l.quantity + qty } : l
          );
        } else {
          next = [...prev, { ...line, quantity: qty }];
        }
        writeStorage({ lines: next, updatedAt: new Date().toISOString() });
        return next;
      });
      setBagOpen(true);
    },
    []
  );

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((l) => l.variantId !== variantId)
          : prev.map((l) =>
              l.variantId === variantId ? { ...l, quantity } : l
            );
      writeStorage({ lines: next, updatedAt: new Date().toISOString() });
      return next;
    });
  }, []);

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.variantId !== variantId);
      writeStorage({ lines: next, updatedAt: new Date().toISOString() });
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    writeStorage({ lines: [], updatedAt: new Date().toISOString() });
  }, []);

  const currency = lines[0]?.currency ?? "EUR";
  const subtotalCents = lines.reduce(
    (sum, l) => sum + l.priceCents * l.quantity,
    0
  );
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotalCents,
      currency,
      addLine,
      setQuantity,
      removeLine,
      clear,
      ready,
      bagOpen,
      openBag,
      closeBag,
      toggleBag,
    }),
    [
      lines,
      count,
      subtotalCents,
      currency,
      addLine,
      setQuantity,
      removeLine,
      clear,
      ready,
      bagOpen,
      openBag,
      closeBag,
      toggleBag,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
