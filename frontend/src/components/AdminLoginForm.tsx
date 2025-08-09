// ✅ FILE: src/components/AdminLoginForm.tsx — iOS 26 edition
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { login, isAuthenticated } from '../utils/auth'
import LoadingSpinner from './LoadingSpinner'

const AdminLoginForm: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.2,
      med: prefersReducedMotion ? 0 : 0.8,
      fast: prefersReducedMotion ? 0 : 0.45
    }),
    [prefersReducedMotion]
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Autofocus email
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  // Verificar sesión activa al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const sesionActiva = await isAuthenticated() // si quieres forzar: isAuthenticated(true)
        if (sesionActiva) {
          navigate('/admin/dashboard')
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.warn('❌ Error al verificar sesión:', err)
        setLoading(false)
      }
    }
    verificarSesion()
  }, [navigate])

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        // Redirección real (Safari cookies)
        window.location.href = '/admin/dashboard'
      } else {
        setError('❌ Credenciales inválidas o error de conexión')
        errorRef.current?.focus()
        setSubmitting(false)
      }
    } catch (err) {
      console.error('❌ Error en login:', err)
      setError('❌ Error al intentar iniciar sesión')
      errorRef.current?.focus()
      setSubmitting(false)
    }
  }

  // Mostrar spinner mientras verifica sesión activa
  if (loading) {
    return <LoadingSpinner message="Verificando sesión activa..." />
  }

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* AURORAS iOS26 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 z-0 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: D.med }}
        style={{
          background:
            'radial-gradient(40% 40% at 20% 20%, rgba(56,189,248,.35), transparent 60%), radial-gradient(45% 45% at 80% 20%, rgba(168,85,247,.28), transparent 60%), radial-gradient(45% 45% at 50% 80%, rgba(16,185,129,.28), transparent 60%)'
        }}
      />

      {/* Velo + Frosted */}
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: D.slow }}
      />
      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-2xl bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
        transition={{ duration: D.slow, delay: 0.15 }}
      />

      {/* Tarjeta del formulario */}
      <motion.div
        className="relative z-20 w-full max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: D.med, ease: 'easeOut' }}
      >
        <div className="relative rounded-[28px] ring-1 ring-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_100px_-20px_rgba(0,0,0,.65)] px-6 py-8 sm:px-8 sm:py-10">
          {/* Halo conic */}
          <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-40 blur-2xl
                          bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />

          {/* Logo */}
          <motion.img
            src="/logo.png"
            alt="Logo MundoIAanime"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none select-none rounded-full mx-auto"
            initial={{ scale: prefersReducedMotion ? 1 : 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: D.slow, delay: 0.1 }}
          />

          <motion.h1
            className="mt-4 text-xl sm:text-2xl font-semibold text-white/95"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.fast, delay: 0.25 }}
          >
            Panel de administración
          </motion.h1>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 text-left"
            aria-label="Formulario de inicio de sesión"
            autoComplete="on"
          >
            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">Correo electrónico</label>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                <Mail size={18} />
              </div>
              <input
                id="email"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 text-white placeholder-white/60
                           ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/40
                           backdrop-blur"
                aria-label="Correo electrónico"
              />
            </div>

            {/* Contraseña */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                <Lock size={18} />
              </div>
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 text-white placeholder-white/60
                           ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/40
                           backdrop-blur"
                aria-label="Contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/80 hover:text-white"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full
                         bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                         hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                         text-black font-semibold tracking-wide
                         shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)]
                         disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Ingresando…' : 'Iniciar sesión'}
            </button>

            {/* Volver */}
            <div className="text-center">
              <a
                href="/"
                className="inline-block mt-2 text-sm text-white/70 hover:text-white transition"
              >
                ← Volver al inicio
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  )
}

export default AdminLoginForm
