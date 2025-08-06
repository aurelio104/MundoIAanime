// ✅ FILE: src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 🛒 Provider global para el carrito
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🔄 Cargar carrito desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        setCartItems(JSON.parse(stored))
      } catch (e) {
        console.warn('⚠️ Error al cargar carrito:', e)
        localStorage.removeItem('cart')
      }
    }
  }, [])

  // 💾 Guardar carrito en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  // ➕ Agregar nuevo item (sin duplicados)
  const addItem = (item: CartItem) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      return exists ? prev : [...prev, item]
    })
  }

  // ➖ Quitar item por ID
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  // 🧹 Vaciar carrito completo
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  return (
    <CartContext.Provider value={{ cartItems, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

// 🧠 Hook para usar el carrito
export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>')
  }
  return context
}
