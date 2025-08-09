// ✅ FILE: src/components/HeroLanding.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { API_URL } from '../utils/auth'

type BeforeInstallPromptEvent = Event & {
  prompt: () => void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const HeroLanding: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()

  // PWA install
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  // Modal TikTok
  const [showModal, setShowModal] = useState(false)
  const restoringFocusRef = useRef<HTMLButtonElement | null>(null)

  // Parallax (sutil)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window
    setMouse({
      x: (e.clientX / innerWidth - 0.5) * 2,
      y: (e.clientY / innerHeight - 0.5) * 2
    })
  }

  // ✅ Manejador PWA
  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', onBip as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', onBip as EventListener)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    try {
      await deferredPrompt.userChoice
    } finally {
      setDeferredPrompt(null)
      setCanInstall(false)
    }
  }

  // ✅ Registrar visita (una sola vez por sesión, sin disparar rate-limit)
  useEffect(() => {
    const KEY = 'visit-logged'
    if (sessionStorage.getItem(KEY)) return
    sessionStorage.setItem(KEY, '1')

    const body = JSON.stringify({ ts: Date.now() })
    if ('sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(`${API_URL}/api/visitas`, blob)
    } else {
      fetch(`${API_URL}/api/visitas`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true
      }).catch(() => {})
    }
  }, [])

  // ✅ Modal TikTok auto-abrir a los 3s (suave) — respeta reduce-motion
  useEffect(() => {
    const t = setTimeout(() => setShowModal(true), prefersReducedMotion ? 0 : 3000)
    return () => clearTimeout(t)
  }, [prefersReducedMotion])

  // ✅ Cargar/limpiar script de TikTok cuando el modal está abierto
  useEffect(() => {
    if (!showModal) return
    const id = 'tiktok-embed-sdk'
    const existing = document.getElementById(id) as HTMLScriptElement | null

    // bloquear scroll de fondo
    const originalOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    if (!existing) {
      const s = document.createElement('script')
      s.id = id
      s.src = 'https://www.tiktok.com/embed.js'
      s.async = true
      document.body.appendChild(s)
    } else if (typeof (window as any).tiktokEmbedLoad === 'function') {
      // si ya existe, refresca embebidos
      ;(window as any).tiktokEmbedLoad()
    }

    return () => {
      document.documentElement.style.overflow = originalOverflow
      // no removemos el script si ya estaba; sólo cerramos modal
    }
  }, [showModal])

  // ✅ Cerrar modal con Escape y restaurar foco
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Duraciones sensibles a reduce-motion
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.6,
      med: prefersReducedMotion ? 0 : 1.0,
      fast: prefersReducedMotion ? 0 : 0.6
    }),
    [prefersReducedMotion]
  )

  // Parallax transform
  const parallax = {
    x: mouse.x * 8,
    y: mouse.y * 8
  }

  return (
    <section
      id="inicio"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center justify-center text-center select-none overflow-hidden"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* === AURORAS / GLOW iOS 26 === */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 z-0 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: D.med, ease: 'easeOut' }}
        style={{
          background:
            'radial-gradient(40% 40% at 20% 20%, rgba(56,189,248,.35), transparent 60%), radial-gradient(45% 45% at 80% 20%, rgba(168,85,247,.28), transparent 60%), radial-gradient(45% 45% at 50% 80%, rgba(16,185,129,.28), transparent 60%)'
        }}
      />

      {/* Velo oscuro + Frosted layer */}
      <motion.div
        className="absolute inset-0 bg-black/60 z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: D.slow }}
      />
      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-2xl bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: D.slow, delay: 0.2 }}
      />

      {/* === MODAL TIKTOK === */}
      {showModal && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Video TikTok de MundoIAanime"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: D.fast }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div
            className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl
                       rounded-3xl bg-white/10 backdrop-blur-2xl
                       ring-1 ring-white/20 shadow-[0_10px_60px_-10px_rgba(0,0,0,.6)]
                       p-4 sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: D.med, ease: 'easeOut' }}
          >
            <button
              ref={restoringFocusRef}
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-white/80 hover:text-white text-2xl leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="w-full">
              <blockquote
                className="tiktok-embed w-full"
                cite="https://www.tiktok.com/@mundoiaanime/video/7522630469943315725"
                data-video-id="7522630469943315725"
                style={{ maxWidth: '100%', minWidth: '100%' }}
              >
                <section>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    title="@mundoiaanime"
                    href="https://www.tiktok.com/@mundoiaanime?refer=embed"
                  >
                    @mundoiaanime
                  </a>{' '}
                  Nezuko Kamado caminando entre las ruinas. 📌 Visual Art AI.
                </section>
              </blockquote>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* === CONTENIDO PRINCIPAL === */}
      <motion.div
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-8 sm:space-y-10"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.2 } } }}
      >
        {/* Logo + glow + parallax */}
        <motion.div
          style={{ translateX: parallax.x, translateY: parallax.y }}
          initial={{ scale: prefersReducedMotion ? 1 : 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: D.slow, ease: 'easeOut', delay: 0.2 }}
          className="relative"
        >
          <motion.img
            src="/logo.png"
            alt="Logo MundoIAanime"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain pointer-events-none select-none rounded-full"
            initial={{ rotate: 0 }}
            animate={{ rotate: prefersReducedMotion ? 0 : [0, 1.5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Halo */}
          <div className="absolute -inset-4 rounded-full blur-2xl opacity-70
                          bg-[radial-gradient(closest-side,rgba(255,255,255,.35),transparent)] pointer-events-none" />
        </motion.div>

        <motion.h1
          className="text-[clamp(22px,4vw,40px)] font-semibold tracking-wide text-white/95
                     drop-shadow-[0_6px_25px_rgba(0,0,0,.6)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med, delay: 0.4 }}
        >
          Aprende a crear contenido anime con Inteligencia Artificial
        </motion.h1>

        {/* Botonera iOS-pill */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 items-center"
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: D.med, delay: 0.65 }}
        >
          <a
            href="https://whatsapp.com/channel/0029Vb6FQccGZNCrqrneCE0G"
            className="inline-flex items-center justify-center w-60 h-12 rounded-full
                       bg-white/10 hover:bg-white/20 active:bg-white/25
                       backdrop-blur-xl ring-1 ring-white/20
                       shadow-[0_8px_30px_rgba(0,0,0,.35)]
                       transition-all text-white text-lg font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Únete al canal VIP
          </a>

          <button
            onClick={() => {
              const section = document.querySelector('#tulio-catalogo')
              section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="inline-flex items-center justify-center w-60 h-12 rounded-full
                       bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                       hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                       text-black font-semibold tracking-wide
                       shadow-[0_10px_40px_-10px_rgba(56,189,248,.6)]
                       transition-all"
          >
            Ver Cursos
          </button>

          {canInstall && (
            <button
              onClick={handleInstall}
              className="inline-flex items-center justify-center w-60 h-12 rounded-full
                         bg-white/90 hover:bg-white text-black font-semibold
                         ring-1 ring-black/10 shadow-[0_10px_40px_-10px_rgba(255,255,255,.5)]
                         transition-all"
            >
              Instalar App
            </button>
          )}
        </motion.div>

        {/* Microcopy */}
        <motion.p
          className="text-white/70 text-sm max-w-xl leading-relaxed px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: D.med, delay: 0.9 }}
        >
          Tutoriales, recursos y flujos de trabajo listos para crear arte y videos en estilo anime con IA.
        </motion.p>
      </motion.div>
    </section>
  )
}

export default HeroLanding
