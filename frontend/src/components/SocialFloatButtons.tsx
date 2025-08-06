// ✅ FILE: SocialFloatButtons.tsx — versión MundoIAanime

import React, { useState, useEffect } from 'react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaShoppingCart
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../types';


const SocialFloatButtons: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [animateBadge, setAnimateBadge] = useState<boolean>(false);

  const { cartItems, removeItem, clearCart } = useCart();

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  const handleAddMore = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      const catalog = document.getElementById('tulio-catalogo');
      if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      setAnimateBadge(true);
      const timeout = setTimeout(() => setAnimateBadge(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [cartItems.length]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {/* 🛒 Botón del carrito */}
        <button
          onClick={handleOpenCart}
          aria-label="Ver carrito"
          className="relative bg-black/80 text-white rounded-full p-2 hover:scale-105 transition-transform shadow"
        >
          <FaShoppingCart size={18} />
          <AnimatePresence>
            {cartItems.length > 0 && (
              <motion.span
                key={cartItems.length}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.4, 1] }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
              >
                {cartItems.length}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* 🔗 WhatsApp */}
        <a
          href="https://chat.whatsapp.com/EvPpSjqVgdj0ZW49xwKM05"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="bg-black/80 text-white rounded-full p-2 hover:scale-105 transition-transform shadow"
        >
          <FaWhatsapp size={18} />
        </a>

        {/* 🔗 TikTok (MundoIAanime) */}
        <a
          href="https://www.tiktok.com/@mundoiaanime"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="bg-black/80 text-white rounded-full p-2 hover:scale-105 transition-transform shadow"
        >
          <FaTiktok size={18} />
        </a>
      </div>


    </>
  );
};

export default SocialFloatButtons;
