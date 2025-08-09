// ✅ FILE: src/components/CTASection.tsx
import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const CTASection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.2,
      med: prefersReducedMotion ? 0 : 0.8,
      fast: prefersReducedMotion ? 0 : 0.5
    }),
    [prefersReducedMotion]
  )

  const scrollToCatalog = () => {
    const el = document.querySelector('#tulio-catalogo')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="contacto"
      className="relative isolate overflow-hidden text-white py-20 sm:py-24"
    >
      {/* Auroras iOS26 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 -z-10 blur-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.75 }}
        viewport={{ once: true }}
        transition={{ duration: D.med }}
        style={{
          background:
            'radial-gradient(40% 40% at 15% 20%, rgba(56,189,248,.28), transparent 60%), radial-gradient(45% 45% at 85% 15%, rgba(168,85,247,.24), transparent 60%), radial-gradient(40% 40% at 50% 85%, rgba(16,185,129,.24), transparent 60%)'
        }}
      />

      {/* Velo + Frosted */}
      <div className="absolute inset-0 -z-10 bg-[url('/hero.png')] bg-cover bg-center opacity-40" />
      <motion.div
        className="absolute inset-0 -z-10 bg-black/60"
        initial={{ opacity: 0.65 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: D.slow }}
      />
      <motion.div
        className="absolute inset-0 -z-10 bg-white/5 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.18 }}
        viewport={{ once: true }}
        transition={{ duration: D.slow, delay: 0.2 }}
      />

      {/* Card principal */}
      <motion.div
        className="mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: D.med }}
      >
        <div
          className="relative rounded-[28px] ring-1 ring-white/15 bg-white/10 backdrop-blur-2xl
                     shadow-[0_20px_100px_-20px_rgba(0,0,0,.6)] px-6 py-10 sm:px-10 sm:py-12"
        >
          {/* Halo suave */}
          <div className="pointer-events-none absolute -inset-1 rounded-[30px] opacity-40 blur-2xl
                          bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.25),transparent_30%,rgba(255,255,255,.2),transparent_70%)]" />

          <motion.h2
            className="relative text-[clamp(28px,5vw,48px)] font-bold leading-tight tracking-tight
                       bg-clip-text text-transparent
                       bg-gradient-to-r from-white via-white to-white/80 drop-shadow-[0_6px_25px_rgba(0,0,0,.65)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.fast, delay: 0.1 }}
          >
            ¿Listo para crear anime con Inteligencia Artificial?
          </motion.h2>

          <motion.p
            className="relative mt-4 text-white/80 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D.fast, delay: 0.25 }}
          >
            Comienza hoy mismo. Accede a cursos prácticos, recursos y una comunidad enfocada en llevar tus ideas a pantalla.
          </motion.p>

          {/* Chips de valor */}
          <motion.div
            className="relative mt-6 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D.fast, delay: 0.35 }}
          >
            {['Acceso inmediato', 'De principiante a avanzado', 'Proyectos reales', 'Actualizaciones constantes'].map((t) => (
              <span
                key={t}
                className="inline-flex items-center h-9 px-3 rounded-full text-sm
                           bg-black/50 ring-1 ring-white/15 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: D.med, delay: 0.45 }}
          >
            <button
              onClick={scrollToCatalog}
              className="inline-flex items-center justify-center w-full sm:w-auto px-7 h-12 rounded-full
                         bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                         hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                         text-black font-semibold tracking-wide
                         shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)] transition-all"
              aria-label="Ver todos los cursos"
            >
              Ver todos los cursos
            </button>

            <a
              href="https://whatsapp.com/channel/0029Vb6FQccGZNCrqrneCE0G"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto px-7 h-12 rounded-full
                         bg-white/10 hover:bg-white/15 text-white
                         ring-1 ring-white/20 backdrop-blur
                         shadow-[0_10px_40px_-10px_rgba(0,0,0,.55)] transition-all"
              aria-label="Unirme al canal VIP en WhatsApp"
            >
              Únete al canal VIP
            </a>
          </motion.div>

          {/* Microcopy confianza */}
          <motion.p
            className="relative mt-4 text-xs text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D.fast, delay: 0.6 }}
          >
            Sin requisitos previos. Aprende haciendo — desde la primera clase.
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}

export default CTASection
