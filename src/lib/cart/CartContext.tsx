'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  nameBn: string;
  nameEn: string;
  pricePerKg: number;
  quantity: number;
  minimumOrderQty: number;
  availableStock: number;
  unit: string;
  imageUrl?: string | null;
  farmerProfileId: string;
  farmerName: string;
  farmName: string;
  farmDistrictId: string;
  farmDistrictNameBn: string;
  farmDistrictNameEn: string;
  farmLatitude?: number;
  farmLongitude?: number;
  expectedHarvestDate?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  buyerDistrictId: string | null;
  setBuyerDistrictId: (distId: string) => void;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('krishi_cart');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [buyerDistrictId, setBuyerDistrictIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('krishi_buyer_district') || null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('krishi_cart', JSON.stringify(items));
  }, [items]);

  const setBuyerDistrictId = (distId: string) => {
    setBuyerDistrictIdState(distId);
    localStorage.setItem('krishi_buyer_district', distId);
  };

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId);
      if (existing) {
        const updatedQty = Math.min(
          existing.quantity + newItem.quantity,
          existing.availableStock
        );
        return prev.map((i) =>
          i.productId === newItem.productId ? { ...i, quantity: updatedQty } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          const clamped = Math.max(i.minimumOrderQty, Math.min(qty, i.availableStock));
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        buyerDistrictId,
        setBuyerDistrictId,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
