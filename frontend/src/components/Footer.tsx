// ✅ FILE: src/components/Footer.tsx
import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const year = new Date().getFullYear()

const Footer: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.2,
      med: prefersReducedMotion ? 0 : 0.8,
      fast: prefersReducedMotion ? 0 : 0.5
    }),
    [prefersReducedMotion]
  )

  const smoothTo = (selector: string) => {
    const el = document.querySelector(selector)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <footer className="relative isolate overflow-hidden text-white pt-16 pb-8">
      {/* Auroras / glow de fondo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 -z-10 blur-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: D.med }}
        style={{
          background:
            'radial-gradient(40% 40% at 15% 20%, rgba(56,189,248,.22), transparent 60%), radial-gradient(45% 45% at 85% 15%, rgba(168,85,247,.2), transparent 60%), radial-gradient(40% 40% at 50% 85%, rgba(16,185,129,.2), transparent 60%)'
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[url('/hero.png')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 -z-10 bg-black/70" />

      {/* Card glass */}
      <motion.div
        className="max-w-6xl mx-auto px-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: D.med }}
      >
        <div className="relative rounded-[28px] ring-1 ring-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_100px_-20px_rgba(0,0,0,.65)] p-8 sm:p-10">
          {/* Halo conic suave */}
          <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-40 blur-2xl
                          bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />

          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Marca */}
            <div className="text-center md:text-left">
              <h2 className="text-[clamp(22px,3.2vw,28px)] font-bold tracking-wide text-white">
                MundoIAanime
              </h2>
              <p className="mt-2 text-sm text-white/75 max-w-md">
                Aprende a crear anime con inteligencia artificial. Cursos, comunidad y herramientas para potenciar tu creatividad visual.
              </p>

              {/* Social minimal (SVG inline, sin libs) */}
              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <a
                  href="https://www.tiktok.com/@mundoiaanime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur transition"
                  aria-label="TikTok"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90 group-hover:opacity-100 fill-white">
                    <path d="M16.1 3a6.2 6.2 0 0 0 .4 2.2 5.6 5.6 0 0 0 2 2.4 6.7 6.7 0 0 0 2.8.9v3a8.8 8.8 0 0 1-4.7-1.5v6.5a5.9 5.9 0 1 1-5.9-5.9c.4 0 .8 0 1.1.1v3.1a2.9 2.9 0 1 0 2.9 2.9V3h1.4Z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur transition"
                  aria-label="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90 group-hover:opacity-100 fill-white">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.8-3.3a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur transition"
                  aria-label="YouTube"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90 group-hover:opacity-100 fill-white">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.6 31.6 0 0 0 .6-5.8 31.6 31.6 0 0 0-.6-5.8ZM9.8 15.6V8.4l6.2 3.6-6.2 3.6Z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/584244043150"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur transition"
                  aria-label="WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90 group-hover:opacity-100 fill-white">
                    <path d="M20 4a10 10 0 0 0-16.9 9.6L2 22l8.6-1.9A10 10 0 1 0 20 4Zm-8 16a8 8 0 0 1-4-.9l-.3-.1-2.6.6.6-2.5-.2-.3A8 8 0 1 1 12 20Zm4.6-5.7c-.3-.1-1.8-.9-2-.9s-.4 0-.6.3-.7.9-.9 1-.3.2-.6.1a6.6 6.6 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.3 0-.4.2-.6l.3-.3c.2-.2.3-.3.3-.5s-.1-.4-.2-.6l-.7-1.7c-.2-.4-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3c-.2.2-.9.9-.9 2.2s.9 2.6 1 2.8a9.7 9.7 0 0 0 3.7 3.7 8.3 8.3 0 0 0 2.8 1c1.1.1 2.1-.3 2.4-.8s.3-1.1.2-1.2-.2-.2-.5-.3Z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Navegación */}
            <nav aria-label="Navegación principal" className="text-center">
              <h3 className="text-xs uppercase font-semibold tracking-wide mb-3 text-white/60">
                Secciones
              </h3>
              <ul className="space-y-2 text-sm text-white/75" role="list">
                <li>
                  <button
                    onClick={() => smoothTo('#inicio')}
                    className="hover:text-white transition"
                    aria-label="Ir a Inicio"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => smoothTo('#tulio-catalogo')}
                    className="hover:text-white transition"
                    aria-label="Ver cursos"
                  >
                    Cursos
                  </button>
                </li>
                <li>
                  <a
                    href="https://whatsapp.com/channel/0029Vb6FQccGZNCrqrneCE0G"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    Canal VIP
                  </a>
                </li>
              </ul>
            </nav>

            {/* Newsletter / contacto rápido */}
            <div className="text-center md:text-right">
              <h3 className="text-xs uppercase font-semibold tracking-wide mb-3 text-white/60">
                Novedades
              </h3>
              <p className="text-sm text-white/75">
                Recibe actualizaciones y lanzamientos de cursos.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const email = new FormData(e.currentTarget as HTMLFormElement).get('email') as string
                  // Aquí podrías disparar a tu API / lista
                  if (email) alert('¡Gracias! Te notificaremos pronto.')
                }}
                className="mt-3 flex items-center gap-2 justify-center md:justify-end"
              >
                <input
                  name="email"
                  type="email"
                  placeholder="Tu correo"
                  className="w-56 px-3 h-11 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 h-11 rounded-xl
                             bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                             hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                             text-black font-semibold tracking-wide
                             shadow-[0_10px_40px_-10px_rgba(56,189,248,.6)] transition-all"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>

          {/* Separador luminoso */}
          <div className="relative mt-10">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>

          {/* Copyright + extra */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/55">
            <div>&copy; {year} MundoIAanime. Todos los derechos reservados.</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition">Privacidad</a>
              <a href="#" className="hover:text-white transition">Términos</a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition"
                aria-label="Volver arriba"
              >
                ↑ Arriba
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}

export default Footer
