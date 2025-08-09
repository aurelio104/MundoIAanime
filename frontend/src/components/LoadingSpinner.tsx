// ✅ FILE: src/components/LoadingSpinner.tsx — iOS 26 edition
import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface LoadingSpinnerProps {
  message?: string
  subtext?: string
  fullscreen?: boolean
  logoSrc?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Verificando sesión…',
  subtext,
  fullscreen = true,
  logoSrc = '/logo.png'
}) => {
  const prefersReducedMotion = useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.2,
      med: prefersReducedMotion ? 0 : 0.8,
      fast: prefersReducedMotion ? 0 : 0.5
    }),
    [prefersReducedMotion]
  )

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`relative ${fullscreen ? 'min-h-screen' : 'min-h-[280px]'} w-full grid place-items-center overflow-hidden text-white`}
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Auroras */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 -z-10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: D.med }}
        style={{
          background:
            'radial-gradient(40% 40% at 20% 20%, rgba(56,189,248,.28), transparent 60%), radial-gradient(45% 45% at 80% 15%, rgba(168,85,247,.24), transparent 60%), radial-gradient(40% 40% at 50% 85%, rgba(16,185,129,.24), transparent 60%)'
        }}
      />
      {/* Velo + frost */}
      <motion.div
        className="absolute inset-0 -z-10 bg-black/70"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: D.slow }}
      />
      <motion.div
        className="absolute inset-0 -z-10 bg-white/5 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: D.slow, delay: 0.15 }}
      />

      {/* Card glass */}
      <motion.div
        className="relative w-[92%] max-w-sm rounded-[28px] ring-1 ring-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_100px_-20px_rgba(0,0,0,.65)] px-8 py-10 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: D.med, ease: 'easeOut' }}
      >
        {/* Halo conic */}
        <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-35 blur-2xl
                        bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />

        {/* Logo */}
        <motion.img
          src={logoSrc}
          alt="MundoIAanime"
          className="relative mx-auto w-20 h-20 object-contain rounded-full"
          initial={{ scale: prefersReducedMotion ? 1 : 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: D.slow }}
        />

        {/* Spinner con conic-gradient */}
        <div className="relative mx-auto mt-6 w-12 h-12">
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={prefersReducedMotion ? {} : { repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{
              background:
                'conic-gradient(from 0deg, rgba(56,189,248,.95), rgba(168,85,247,.95), rgba(16,185,129,.95), rgba(56,189,248,.95))',
              WebkitMask: 'radial-gradient(farthest-side, #0000 calc(100% - 6px), #000 0)'
            }}
          />
          <div className="absolute inset-2 rounded-full bg-white/10 ring-1 ring-white/20" />
        </div>

        {/* Mensajes */}
        <p className="mt-4 text-sm text-white/80">{message}</p>
        {subtext && <p className="mt-1 text-xs text-white/60">{subtext}</p>}

        {/* Barra de pulso (skeleton shimmer) */}
        <div className="relative mx-auto mt-5 h-[3px] w-40 overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
          <motion.span
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/10 via-white/70 to-white/10"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default LoadingSpinner
