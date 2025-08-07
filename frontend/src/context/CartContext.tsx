import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipo para el item del carrito
export interface CartItem {
  id: string;
  titulo: string;
  precio: string;
  // Otros datos relevantes del curso
}

// Definir el tipo para el contexto del carrito
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

// Crear el contexto de carrito
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook para acceder al contexto del carrito
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Proveedor del contexto
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Función para agregar un curso al carrito
  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  // Función para eliminar un artículo del carrito
  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  // Función para limpiar el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
