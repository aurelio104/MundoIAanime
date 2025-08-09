// ✅ FILE: src/components/SocialFloatButtons.tsx — iOS 26 edition
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FaWhatsapp, FaInstagram, FaTiktok, FaShoppingCart, FaTrash } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import type { CartItem } from '../types'

const parseUSD = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.,-]/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

const itemTitle = (i: CartItem | any) =>
  i?.titulo ?? i?.title ?? i?.name ?? i?.cursoTitulo ?? 'Curso'

const itemUSD = (i: CartItem | any) =>
  parseUSD(i?.priceUSD ?? i?.price ?? i?.precio ?? i?.precioUSD)

const itemId = (i: CartItem | any) =>
  i?.id ?? i?._id ?? i?.sku ?? i?.slug ?? i?.titulo ?? i?.title

const SocialFloatButtons: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const { cartItems, removeItem, clearCart } = useCart()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [animateBadge, setAnimateBadge] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 0.6,
      med: prefersReducedMotion ? 0 : 0.4,
      fast: prefersReducedMotion ? 0 : 0.25
    }),
    [prefersReducedMotion]
  )

  // Badge “pop” cuando cambia el total de ítems
  useEffect(() => {
    if (cartItems.length > 0) {
      setAnimateBadge(true)
      const t = setTimeout(() => setAnimateBadge(false), 420)
      return () => clearTimeout(t)
    }
  }, [cartItems.length])

  // Bloqueo de scroll cuando el drawer está abierto + cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsCartOpen(false)
    window.addEventListener('keydown', onKey)
    const html = document.documentElement
    const prev = html.style.overflow
    if (isCartOpen) html.style.overflow = 'hidden'
    else html.style.overflow = prev || ''
    return () => {
      window.removeEventListener('keydown', onKey)
      html.style.overflow = prev || ''
    }
  }, [isCartOpen])

  const handleOpenCart = () => setIsCartOpen(true)
  const handleCloseCart = () => setIsCartOpen(false)

  const handleAddMore = () => {
    setIsCartOpen(false)
    setTimeout(() => document.getElementById('tulio-catalogo')?.scrollIntoView({ behavior: 'smooth' }), 200)
  }

  const totalUSD = useMemo(
    () => cartItems.reduce((acc, it: any) => acc + itemUSD(it), 0),
    [cartItems]
  )

  const finalizeWhatsApp = () => {
    const lines = cartItems.map((it: any, i) => `• ${i + 1}. ${itemTitle(it)} — $${itemUSD(it).toFixed(2)}`)
    const msg =
      `🧾 *Pedido MundoIAanime*\n\n` +
      `${lines.join('\n')}\n\n` +
      `*Total:* $${totalUSD.toFixed(2)}\n` +
      `\nQuiero finalizar mi compra.`
    const url = `https://wa.me/584244043150?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Floating dock */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)]">
        {/* 🛒 Carrito */}
        <button
          onClick={handleOpenCart}
          aria-label="Ver carrito"
          className="relative inline-flex items-center justify-center w-12 h-12 rounded-full
                     bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-xl
                     shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)]
                     hover:bg-white/16 transition will-change-transform"
        >
          <FaShoppingCart size={18} />
          <AnimatePresence>
            {cartItems.length > 0 && (
              <motion.span
                key={cartItems.length}
                initial={{ scale: 0 }}
                animate={{ scale: animateBadge ? [1, 1.25, 1] : 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: D.fast, ease: 'easeOut' }}
                className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-fuchsia-500 to-rose-500
                           text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center
                           ring-1 ring-white/40 shadow"
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
          className="inline-flex items-center justify-center w-12 h-12 rounded-full
                     bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-xl
                     shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)]
                     hover:bg-white/16 transition"
        >
          <FaWhatsapp size={18} />
        </a>

        {/* 🔗 TikTok */}
        <a
          href="https://www.tiktok.com/@mundoiaanime"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full
                     bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-xl
                     shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)]
                     hover:bg-white/16 transition"
        >
          <FaTiktok size={18} />
        </a>

        {/* 🔗 Instagram (opcional) */}
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="inline-flex items-center justify-center w-12 h-12 rounded-full
                     bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-xl
                     shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)]
                     hover:bg-white/16 transition"
        >
          <FaInstagram size={18} />
        </a>
      </div>

      {/* Drawer del carrito */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: D.med }}
              onClick={handleCloseCart}
            />
            {/* Panel */}
            <motion.aside
              key="panel"
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md sm:max-w-sm
                         bg-white/10 backdrop-blur-2xl ring-1 ring-white/20
                         shadow-[0_20px_100px_-20px_rgba(0,0,0,.75)]
                         text-white flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: prefersReducedMotion ? 300 : 140, damping: prefersReducedMotion ? 30 : 18 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <h3 className="text-lg font-semibold">Tu carrito</h3>
                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
                      title="Vaciar carrito"
                    >
                      <FaTrash size={12} />
                      <span className="text-sm">Vaciar</span>
                    </button>
                  )}
                  <button
                    ref={closeBtnRef}
                    onClick={handleCloseCart}
                    className="w-9 h-9 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15"
                    aria-label="Cerrar"
                    title="Cerrar"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto px-4 pb-24">
                {cartItems.length === 0 ? (
                  <div className="h-full grid place-items-center text-white/70">
                    Tu carrito está vacío.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {cartItems.map((it: any, idx: number) => (
                      <li
                        key={itemId(it) ?? idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/10 ring-1 ring-white/15"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{itemTitle(it)}</div>
                          <div className="text-xs text-white/70 mt-0.5">${itemUSD(it).toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => {
                            const id = itemId(it)
                            if (id) removeItem(id as any)
                          }}
                          className="px-3 h-9 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 text-sm"
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer acciones */}
              <div className="absolute left-0 right-0 bottom-0 p-4 bg-black/30 backdrop-blur-xl ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-sm">Total</span>
                  <span className="text-lg font-bold">${totalUSD.toFixed(2)}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleAddMore}
                    className="w-full h-11 rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15"
                  >
                    Agregar más
                  </button>
                  <button
                    onClick={finalizeWhatsApp}
                    disabled={cartItems.length === 0}
                    className="w-full h-11 rounded-full
                               bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                               hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                               text-black font-semibold tracking-wide
                               shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)]
                               disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Finalizar por WhatsApp
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default SocialFloatButtons
