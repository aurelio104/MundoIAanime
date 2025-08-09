// ✅ FILE: src/components/Header.tsx — iOS 26 edition (TypeScript)
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring } from 'framer-motion'

type NavLink = { label: string; id: string }

const navLinks: NavLink[] = [
  { label: 'Inicio', id: '#inicio' },
  { label: 'Cursos', id: '#tulio-catalogo' },
  { label: 'Contacto', id: '#contacto' },
]

const Header: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string>('#inicio')
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  // Barra de progreso de scroll (suave)
  const { scrollYProgress } = useScroll()
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.25 })

  // Header shrink + sombra al hacer scroll
  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloquear scroll cuando el menú está abierto (mobile)
  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    if (isMobileMenuOpen) html.style.overflow = 'hidden'
    else html.style.overflow = prev || ''
    return () => { html.style.overflow = prev || '' }
  }, [isMobileMenuOpen])

  // Resaltar link activo según la sección visible
  useEffect(() => {
    const ids = navLinks.map(n => n.id.replace('#', ''))
    const sections = ids
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (sections.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
    )

    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 0.8,
      med: prefersReducedMotion ? 0 : 0.6,
      fast: prefersReducedMotion ? 0 : 0.35
    }),
    [prefersReducedMotion]
  )

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const smoothTo = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: D.med, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300
                  ${hasScrolled
                    ? 'backdrop-blur-2xl bg-black/45 ring-1 ring-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,.65)]'
                    : 'bg-transparent'}
                 `}
      style={{ WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Halo/auroras suaves detrás del header */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-40"
        style={{
          background:
            'radial-gradient(50% 60% at 0% 0%, rgba(56,189,248,.22), transparent 60%), radial-gradient(50% 60% at 100% 0%, rgba(168,85,247,.18), transparent 60%)'
        }}
      />

      {/* Progress bar */}
      <motion.div
        className="absolute left-0 top-0 h-[2px] w-full origin-left bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400"
        style={{ scaleX: progressX }}
      />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${hasScrolled ? 'py-3' : 'py-4'} flex justify-between items-center`}>
        {/* Brand */}
        <a href="#inicio" onClick={smoothTo('#inicio')} className="flex items-center gap-3 group">
          <motion.img
            src="/logo.png"
            alt="Logo MundoIAanime"
            className="w-10 h-10 rounded-full"
            initial={{ scale: prefersReducedMotion ? 1 : 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: D.slow }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          />
          <span
            className="text-[17px] font-semibold tracking-wide text-white
                       group-hover:text-white transition"
          >
            MundoIAanime
          </span>
        </a>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, id }) => {
            const isActive = activeId === id
            return (
              <a
                key={id}
                href={id}
                onClick={smoothTo(id)}
                className={`relative text-[12px] uppercase tracking-[0.18em]
                           ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}
                           transition`}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white/80 rounded-full"
                    transition={{ duration: D.fast }}
                  />
                )}
              </a>
            )
          })}

          <a
            href="/admin"
            className="inline-flex items-center justify-center h-10 px-4 rounded-full
                       bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                       hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                       text-black text-sm font-semibold tracking-wide
                       shadow-[0_10px_40px_-10px_rgba(56,189,248,.6)] transition"
          >
            Admin
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          ref={menuButtonRef}
          className="md:hidden text-white w-10 h-10 grid place-items-center rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
          onClick={() => setIsMobileMenuOpen(s => !s)}
          aria-label="Abrir menú móvil"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu-panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: D.med }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-6 py-5 bg-black/70 backdrop-blur-2xl ring-1 ring-white/10">
              <div className="flex flex-col gap-4">
                {navLinks.map(({ label, id }) => (
                  <a
                    key={id}
                    href={id}
                    onClick={smoothTo(id)}
                    className={`text-sm uppercase tracking-[0.18em] ${
                      activeId === id ? 'text-white' : 'text-white/80 hover:text-white'
                    } transition`}
                  >
                    {label}
                  </a>
                ))}
                <a
                  href="/admin"
                  className="mt-2 inline-flex items-center justify-center h-11 rounded-full
                             bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                             hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                             text-black font-semibold tracking-wide transition"
                >
                  Admin
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
