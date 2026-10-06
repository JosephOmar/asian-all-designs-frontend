"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string; productSlug: string; productName: string; variantName: string;
  image: string; price: number; quantity: number; stock: number;
};
type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  add: (item, quantity = 1) => set((state) => {
    const existing = state.items.find((entry) => entry.variantId === item.variantId);
    if (existing) return { items: state.items.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity: Math.min(entry.stock, entry.quantity + quantity) } : entry) };
    return { items: [...state.items, { ...item, quantity }] };
  }),
  update: (variantId, quantity) => set((state) => ({ items: state.items.map((item) => item.variantId === variantId ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item) })),
  remove: (variantId) => set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
  clear: () => set({ items: [] }),
}), { name: "aad-cart" }));
