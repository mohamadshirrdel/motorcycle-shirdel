'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'shirdel-cart-v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const price = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      const existing = prev.find((i) => i.slug === product.slug);
      const stock = Number(product.stock);
      const cap = Number.isFinite(stock) && stock > 0 ? stock : 1;
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, qty: Math.min(i.qty + qty, cap), stock: cap } : i
        );
      }
      return [
        ...prev,
        {
          id: String(product._id || product.slug),
          slug: product.slug,
          title: product.title,
          image: product.images?.[0] || '/images/hero.jpg',
          price,
          qty: Math.min(qty, cap),
          stock: cap,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((slug) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => {
            const cap = Number(i.stock) > 0 ? Number(i.stock) : 99;
            return i.slug === slug ? { ...i, qty: Math.min(Math.max(0, qty), cap) } : i;
          })
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, setQty, clearCart, count, total, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart باید داخل CartProvider استفاده شود');
  return ctx;
}
